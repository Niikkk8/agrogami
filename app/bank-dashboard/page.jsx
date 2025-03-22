'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Leaf,
    LogOut,
    ClipboardList,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    ArrowRight,
    Calendar,
    BarChart2,
    Users,
    AlertCircle,
    Search,
    ChevronDown,
    ChevronUp,
    Filter,
    FileText,
    Home,
    Layers,
    DollarSign,
    User,
    Inbox,
    ExternalLink,
    Bell,
    MapPin
} from 'lucide-react';
import { auth, db } from '@/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    orderBy,
    updateDoc,
    Timestamp
} from 'firebase/firestore';

export default function BankDashboard() {
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [employee, setEmployee] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest first
    const [searchTerm, setSearchTerm] = useState('');
    const [processingAction, setProcessingAction] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        reviewing: 0,
        site_visit: 0,
        approved: 0,
        rejected: 0
    });
    const [selectedTab, setSelectedTab] = useState('all');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectingApplicationId, setRejectingApplicationId] = useState(null);

    // Check authentication and load employee data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Get employee data
                    const employeeDoc = await getDoc(doc(db, "bankEmployees", user.uid));

                    if (employeeDoc.exists()) {
                        setEmployee({ id: user.uid, ...employeeDoc.data() });
                        // Fetch loan applications
                        await fetchApplications();
                    } else {
                        // If not a bank employee, sign out and redirect
                        await signOut(auth);
                        router.replace('/bank-login');
                    }
                } catch (error) {
                    console.error("Error fetching employee data: ", error);
                    setError("Failed to load employee data. Please try again.");
                    setLoading(false);
                }
            } else {
                // Not logged in, redirect to login
                router.replace('/bank-login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Fetch applications
    const fetchApplications = async () => {
        try {
            setLoading(true);

            let applicationsQuery = query(
                collection(db, "loanApplications"),
                orderBy("createdAt", sortOrder)
            );

            if (filterStatus !== 'all') {
                applicationsQuery = query(
                    collection(db, "loanApplications"),
                    where("status", "==", filterStatus),
                    orderBy("createdAt", sortOrder)
                );
            }

            const querySnapshot = await getDocs(applicationsQuery);

            // Process application data and fetch farmer details
            const applicationsData = [];
            for (const docSnapshot of querySnapshot.docs) {
                const applicationData = {
                    id: docSnapshot.id,
                    ...docSnapshot.data(),
                    createdAt: docSnapshot.data().createdAt?.toDate() || new Date(),
                    updatedAt: docSnapshot.data().updatedAt?.toDate() || new Date(),
                    approvedAt: docSnapshot.data().approvedAt?.toDate(),
                    rejectedAt: docSnapshot.data().rejectedAt?.toDate(),
                    reviewStartedAt: docSnapshot.data().reviewStartedAt?.toDate(),
                    siteVisitDate: docSnapshot.data().siteVisitDate?.toDate()
                };

                // Fetch farmer details if not already included
                if (applicationData.farmerId && !applicationData.farmer) {
                    try {
                        const farmerDoc = await getDoc(doc(db, "farmers", applicationData.farmerId));
                        if (farmerDoc.exists()) {
                            applicationData.farmer = farmerDoc.data();
                            // Use farmer name from application or farmer document
                            if (!applicationData.farmerName) {
                                applicationData.farmerName = farmerDoc.data().name || farmerDoc.data().fullName;
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching farmer data: ", error);
                    }
                }

                applicationsData.push(applicationData);
            }

            setApplications(applicationsData);

            // Calculate stats
            const newStats = {
                total: applicationsData.length,
                pending: applicationsData.filter(app => app.status === 'pending').length,
                reviewing: applicationsData.filter(app => app.status === 'reviewing').length,
                site_visit: applicationsData.filter(app => app.status === 'site_visit').length,
                approved: applicationsData.filter(app => app.status === 'approved').length,
                rejected: applicationsData.filter(app => app.status === 'rejected').length
            };
            setStats(newStats);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching applications:", error);
            setError("Failed to load applications. Please try again.");
            setLoading(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace('/bank-login');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    // Handle changing sort order
    const handleSortChange = () => {
        const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        setSortOrder(newOrder);
        setLoading(true);
        setTimeout(() => {
            fetchApplications();
        }, 300);
    };

    // Handle filter change
    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
        setLoading(true);
        setTimeout(() => {
            fetchApplications();
        }, 300);
    };

    // Handle tab change
    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        if (tab !== 'all') {
            setFilterStatus(tab);
            setLoading(true);
            setTimeout(() => {
                fetchApplications();
            }, 300);
        } else {
            setFilterStatus('all');
            setLoading(true);
            setTimeout(() => {
                fetchApplications();
            }, 300);
        }
    };

    // Handle search input
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Open rejection modal
    const openRejectionModal = (applicationId) => {
        setRejectingApplicationId(applicationId);
        setRejectionReason('');
        setShowRejectionModal(true);
    };

    // Close rejection modal
    const closeRejectionModal = () => {
        setShowRejectionModal(false);
        setRejectingApplicationId(null);
        setRejectionReason('');
    };

    // Submit rejection with reason
    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        await updateApplicationStatus(rejectingApplicationId, 'rejected', rejectionReason);
        closeRejectionModal();
    };

    // Update application status
    const updateApplicationStatus = async (applicationId, newStatus, rejectionReason = null) => {
        try {
            setProcessingAction(true);

            const applicationRef = doc(db, "loanApplications", applicationId);

            const updateData = {
                status: newStatus,
                updatedAt: Timestamp.now()
            };

            // Add status-specific timestamp fields and data
            if (newStatus === 'reviewing') {
                updateData.reviewStartedAt = Timestamp.now();
                updateData.reviewedBy = employee.id;
            } else if (newStatus === 'site_visit') {
                updateData.siteVisitScheduled = true;
            } else if (newStatus === 'approved') {
                updateData.approvedAt = Timestamp.now();
                updateData.approvedBy = employee.id;
            } else if (newStatus === 'rejected') {
                updateData.rejectedAt = Timestamp.now();
                updateData.rejectedBy = employee.id;
                if (rejectionReason) {
                    updateData.rejectionReason = rejectionReason;
                }
            }

            await updateDoc(applicationRef, updateData);

            // Refresh the applications list
            await fetchApplications();

            // Update the selected application if it's the one being modified
            if (selectedApplication && selectedApplication.id === applicationId) {
                setSelectedApplication({
                    ...selectedApplication,
                    status: newStatus,
                    updatedAt: new Date(),
                    ...(newStatus === 'reviewing' && { reviewStartedAt: new Date(), reviewedBy: employee.id }),
                    ...(newStatus === 'site_visit' && { siteVisitScheduled: true }),
                    ...(newStatus === 'approved' && { approvedAt: new Date(), approvedBy: employee.id }),
                    ...(newStatus === 'rejected' && {
                        rejectedAt: new Date(),
                        rejectedBy: employee.id,
                        ...(rejectionReason && { rejectionReason })
                    })
                });
            }

            setProcessingAction(false);
        } catch (error) {
            console.error("Error updating application status:", error);
            setError("Failed to update application status. Please try again.");
            setProcessingAction(false);
        }
    };

    // Schedule site visit
    const scheduleVisit = (applicationId) => {
        // First update status to site_visit
        updateApplicationStatus(applicationId, 'site_visit');

        // Then navigate to the site visit scheduling page
        router.push(`/admin/site-visit/${applicationId}`);
    };

    // Filter and search applications
    const filteredApplications = applications.filter(application => {
        // Filter by tab/status if not 'all'
        if (selectedTab !== 'all' && application.status !== selectedTab) {
            return false;
        }

        // Search by multiple criteria
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();

            // Search in application ID
            const idMatch = application.id.toLowerCase().includes(searchLower);

            // Search in farmer name
            const farmerNameMatch = (application.farmerName || application.farmer?.name || application.farmer?.fullName || "")
                .toLowerCase().includes(searchLower);

            // Search in crop patterns
            const hasCropMatch = application.croppingPatterns?.some(
                pattern => pattern.crop.toLowerCase().includes(searchLower)
            );

            // Search in district
            const districtMatch = (application.nearestDistrict || "").toLowerCase().includes(searchLower);

            // Search in allied activities
            const hasActivityMatch = application.alliedActivities?.some(
                activity => activity.activity.toLowerCase().includes(searchLower)
            );

            return idMatch || farmerNameMatch || hasCropMatch || districtMatch || hasActivityMatch;
        }

        return true;
    });

    // Format date function
    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format amount function
    const formatAmount = (amount) => {
        if (!amount) return "₹0";
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    // Calculate days since function
    const calculateDaysSince = (date) => {
        if (!date) return 0;
        const now = new Date();
        const diffTime = Math.abs(now - new Date(date));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        let badgeClass = '';
        let icon = null;
        let text = '';

        switch (status) {
            case 'pending':
                badgeClass = 'bg-yellow-100 text-yellow-800';
                icon = <Clock className="h-4 w-4 mr-1" />;
                text = 'Pending';
                break;
            case 'reviewing':
                badgeClass = 'bg-blue-100 text-blue-800';
                icon = <AlertCircle className="h-4 w-4 mr-1" />;
                text = 'Under Review';
                break;
            case 'site_visit':
                badgeClass = 'bg-purple-100 text-purple-800';
                icon = <Users className="h-4 w-4 mr-1" />;
                text = 'Onsite Review';
                break;
            case 'approved':
                badgeClass = 'bg-green-100 text-green-800';
                icon = <CheckCircle className="h-4 w-4 mr-1" />;
                text = 'Approved';
                break;
            case 'rejected':
                badgeClass = 'bg-red-100 text-red-800';
                icon = <XCircle className="h-4 w-4 mr-1" />;
                text = 'Rejected';
                break;
            default:
                badgeClass = 'bg-gray-100 text-gray-800';
                icon = <Clock className="h-4 w-4 mr-1" />;
                text = 'Processing';
        }

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${badgeClass}`}>
                {icon}
                {text}
            </span>
        );
    };

    // Available actions based on application status
    const getAvailableActions = (application) => {
        switch (application.status) {
            case 'pending':
                return (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => updateApplicationStatus(application.id, 'reviewing')}
                            disabled={processingAction}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {processingAction ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                                <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            Start Review
                        </button>
                    </div>
                );
            case 'reviewing':
                return (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => scheduleVisit(application.id)}
                            disabled={processingAction}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 inline-flex items-center disabled:bg-purple-300 disabled:cursor-not-allowed"
                        >
                            {processingAction ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                                <Calendar className="h-3 w-3 mr-1" />
                            )}
                            Site Visit
                        </button>
                        <button
                            onClick={() => openRejectionModal(application.id)}
                            disabled={processingAction}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 inline-flex items-center disabled:bg-red-300 disabled:cursor-not-allowed"
                        >
                            {processingAction ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                            )}
                            Reject
                        </button>
                    </div>
                );
            case 'site_visit':
                return (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => scheduleVisit(application.id)}
                            disabled={processingAction}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 inline-flex items-center disabled:bg-purple-300 disabled:cursor-not-allowed"
                        >
                            {processingAction ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                                <ExternalLink className="h-3 w-3 mr-1" />
                            )}
                            Record Visit
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading && !employee) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
                <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
                <div className="h-16 border-b flex items-center px-6">
                    <Leaf className="h-8 w-8 text-green-600" />
                    <span className="ml-2 text-xl font-bold text-gray-800">Agrogami</span>
                </div>
                <div className="p-4">
                    <div className="mb-6">
                        <p className="text-xs text-gray-500 uppercase mb-2">Main Menu</p>
                        <ul className="space-y-1">
                            <li>
                                <Link href="/admin-dashboard" className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg font-medium">
                                    <Home className="h-4 w-4 mr-3" />
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/applications" className="flex items-center text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg">
                                    <ClipboardList className="h-4 w-4 mr-3" />
                                    Applications
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/farmers" className="flex items-center text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg">
                                    <User className="h-4 w-4 mr-3" />
                                    Farmers
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/loans" className="flex items-center text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg">
                                    <DollarSign className="h-4 w-4 mr-3" />
                                    Loans
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/reports" className="flex items-center text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg">
                                    <BarChart2 className="h-4 w-4 mr-3" />
                                    Reports
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase mb-2">Settings</p>
                        <ul className="space-y-1">
                            <li>
                                <Link href="/admin/profile" className="flex items-center text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg">
                                    <User className="h-4 w-4 mr-3" />
                                    My Profile
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg"
                                >
                                    <LogOut className="h-4 w-4 mr-3" />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
                    <button className="md:hidden mr-4">
                        <Layers className="h-6 w-6 text-gray-500" />
                    </button>
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search applications, farmers, crops..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="flex items-center ml-auto">
                        <button className="mr-4 relative">
                            <Bell className="h-5 w-5 text-gray-500" />
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                        </button>
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                                {employee?.fullName ? employee.fullName.charAt(0) : 'E'}
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                                {employee?.fullName || 'Bank Employee'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-auto p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Bank Admin Dashboard</h1>
                        <p className="text-gray-600">Manage loan applications and approve site visits</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                            {error}
                        </div>
                    )}

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <div
                            className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all duration-200 ${selectedTab === 'all' ? 'ring-2 ring-green-500' : 'hover:shadow-md'}`}
                            onClick={() => handleTabChange('all')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="text-gray-500 text-sm">Total Applications</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                    <Inbox className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                        <div
                            className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all duration-200 ${selectedTab === 'pending' ? 'ring-2 ring-green-500' : 'hover:shadow-md'}`}
                            onClick={() => handleTabChange('pending')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="text-gray-500 text-sm">Pending</p>
                                    <p className="text-2xl font-bold">{stats.pending}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                        <div
                            className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all duration-200 ${selectedTab === 'reviewing' ? 'ring-2 ring-green-500' : 'hover:shadow-md'}`}
                            onClick={() => handleTabChange('reviewing')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="text-gray-500 text-sm">Under Review</p>
                                    <p className="text-2xl font-bold">{stats.reviewing}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <FileText className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                        <div
                            className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all duration-200 ${selectedTab === 'site_visit' ? 'ring-2 ring-green-500' : 'hover:shadow-md'}`}
                            onClick={() => handleTabChange('site_visit')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="text-gray-500 text-sm">Site Visits</p>
                                    <p className="text-2xl font-bold">{stats.site_visit}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="text-gray-500 text-sm">Approved Rate</p>
                                    <p className="text-2xl font-bold">{stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions & Filters */}
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-800">Loan Applications</h2>
                        </div>
                        <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Filter:</span>
                                <select
                                    value={filterStatus}
                                    onChange={handleFilterChange}
                                    className="pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="reviewing">Under Review</option>
                                    <option value="site_visit">Onsite Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>

                                <button
                                    onClick={handleSortChange}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    {sortOrder === 'desc' ? (
                                        <>
                                            <ChevronDown className="h-4 w-4 mr-1" />
                                            Newest First
                                        </>
                                    ) : (
                                        <>
                                            <ChevronUp className="h-4 w-4 mr-1" />
                                            Oldest First
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by ID, name, crops..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 w-full md:w-auto"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>

                            <button
                                onClick={() => fetchApplications()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Application List */}
                    {applications.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-10 text-center">
                            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
                            <p className="mt-2 text-gray-500">
                                There are no loan applications in the system yet.
                            </p>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <Search className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No matching applications</h3>
                            <p className="mt-2 text-gray-500">
                                No applications match your current filters. Try changing your search or filter criteria.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Application ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Farmer
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Land Size
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                District
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Finance Amount
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Submitted
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredApplications.map((application) => (
                                            <tr key={application.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <FileText className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            #{application.id.slice(-6)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {application.farmerName || application.farmer?.name || application.farmer?.fullName || "Farmer ID: " + application.farmerId?.slice(-6)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {application.croppingPatterns?.map(p => p.crop).join(", ").slice(0, 30)}
                                                                {application.croppingPatterns?.map(p => p.crop).join(", ").length > 30 ? "..." : ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{application.landHolding} acres</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{application.nearestDistrict || "N/A"}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatAmount(application.scaleOfFinance)}
                                                    </div>
                                                    {application.totalInvestment > 0 && (
                                                        <div className="text-xs text-gray-500">
                                                            +{formatAmount(application.totalInvestment)} (Allied)
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{formatDate(application.createdAt)}</div>
                                                    <div className="text-xs text-gray-500">{calculateDaysSince(application.createdAt)} days ago</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={application.status} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    {getAvailableActions(application)}
                                                    {!getAvailableActions(application) && (
                                                        <button
                                                            onClick={() => setSelectedApplication(application)}
                                                            className="px-3 py-1 text-green-600 text-xs rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 inline-flex items-center"
                                                        >
                                                            <ArrowRight className="h-3 w-3 mr-1" />
                                                            View Details
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination (simplified) */}
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredApplications.length}</span> of{' '}
                                            <span className="font-medium">{filteredApplications.length}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <a
                                                href="#"
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </a>
                                            <a
                                                href="#"
                                                aria-current="page"
                                                className="z-10 bg-green-50 border-green-500 text-green-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                                            >
                                                1
                                            </a>
                                            <a
                                                href="#"
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                            >
                                                <span className="sr-only">Next</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </a>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Application Details Modal */}
            {selectedApplication && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                        <div className="p-6 flex justify-between items-start border-b">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Application Details
                                </h2>
                                <div className="flex items-center mt-1">
                                    <p className="text-sm text-gray-600 mr-3">
                                        ID: #{selectedApplication.id.slice(-8)}
                                    </p>
                                    <StatusBadge status={selectedApplication.status} />
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedApplication(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Farmer Info */}
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Farmer Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Personal Details</h4>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <div className="mb-3">
                                            <p className="text-xs text-gray-500">Farmer ID</p>
                                            <p className="font-medium">{selectedApplication.farmerId}</p>
                                        </div>
                                        <div className="mb-3">
                                            <p className="text-xs text-gray-500">Name</p>
                                            <p className="font-medium">
                                                {selectedApplication.farmerName ||
                                                    selectedApplication.farmer?.name ||
                                                    selectedApplication.farmer?.fullName ||
                                                    "Not available"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">KCC Status</p>
                                            <p className="font-medium">{selectedApplication.farmer?.hasKCC ? "KCC Holder" : "Non-KCC Holder"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Location Information</h4>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <div className="mb-3">
                                            <p className="text-xs text-gray-500">District</p>
                                            <p className="font-medium">{selectedApplication.nearestDistrict || "Not specified"}</p>
                                        </div>
                                        <div className="mb-3">
                                            <p className="text-xs text-gray-500">Location</p>
                                            <p className="font-medium flex items-center">
                                                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                                                {selectedApplication.farmerLocation ?
                                                    `${selectedApplication.farmerLocation.latitude.toFixed(4)}, ${selectedApplication.farmerLocation.longitude.toFixed(4)}` :
                                                    "Not available"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Application Date</p>
                                            <p className="font-medium">{formatDate(selectedApplication.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Land & Crop Details */}
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Land & Crop Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Land Information</h4>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <div className="mb-3">
                                            <p className="text-xs text-gray-500">Total Land Holding</p>
                                            <p className="font-medium">{selectedApplication.landHolding} acres</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Used for Cropping</p>
                                            <p className="font-medium">
                                                {selectedApplication.croppingPatterns?.reduce((total, p) => total + p.acres, 0).toFixed(2)} acres
                                                <span className="text-xs text-gray-500 ml-2">
                                                    ({((selectedApplication.croppingPatterns?.reduce((total, p) => total + p.acres, 0) / selectedApplication.landHolding) * 100).toFixed(1)}% of total)
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Details</h4>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <div className="mb-3">
                                            <p className="text-xs text-gray-500">Scale of Finance</p>
                                            <p className="font-medium">{formatAmount(selectedApplication.scaleOfFinance)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Allied Activities Investment</p>
                                            <p className="font-medium">{formatAmount(selectedApplication.totalInvestment)}</p>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-500">Total Financing</p>
                                            <p className="text-lg font-semibold text-green-600">
                                                {formatAmount(
                                                    (selectedApplication.scaleOfFinance || 0) +
                                                    (selectedApplication.totalInvestment || 0)
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cropping Patterns */}
                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Cropping Pattern</h4>
                                {selectedApplication.croppingPatterns && selectedApplication.croppingPatterns.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area (acres)</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Finance per Acre</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Finance</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedApplication.croppingPatterns.map((pattern, index) => {
                                                    // Calculate finance per acre
                                                    const financePerAcre = selectedApplication.scaleOfFinance && selectedApplication.croppingPatterns.length > 0
                                                        ? Math.round(selectedApplication.scaleOfFinance / selectedApplication.croppingPatterns.reduce((total, p) => total + p.acres, 0))
                                                        : 0;

                                                    return (
                                                        <tr key={index}>
                                                            <td className="px-4 py-2 text-sm text-gray-900">{pattern.crop}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-900">{pattern.acres}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-900">{formatAmount(financePerAcre)}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-900">{formatAmount(financePerAcre * pattern.acres)}</td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr className="bg-gray-50">
                                                    <td colSpan="3" className="px-4 py-2 text-sm font-medium text-gray-900 text-right">Total:</td>
                                                    <td className="px-4 py-2 text-sm font-medium text-green-600">{formatAmount(selectedApplication.scaleOfFinance)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No cropping patterns specified.</p>
                                )}
                            </div>

                            {/* Allied Activities */}
                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Allied Activities</h4>
                                {selectedApplication.alliedActivities && selectedApplication.alliedActivities.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost per Time</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedApplication.alliedActivities.map((activity, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{activity.activity}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{activity.frequency} times</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{formatAmount(activity.cost)}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{formatAmount(activity.frequency * activity.cost)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-gray-50">
                                                    <td colSpan="3" className="px-4 py-2 text-sm font-medium text-gray-900 text-right">Total:</td>
                                                    <td className="px-4 py-2 text-sm font-medium text-green-600">{formatAmount(selectedApplication.totalInvestment)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No allied activities specified.</p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 flex flex-wrap gap-3 justify-between">
                            <button
                                onClick={() => setSelectedApplication(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Close
                            </button>

                            <div className="flex flex-wrap gap-3">
                                {selectedApplication.status === 'pending' && (
                                    <button
                                        onClick={() => {
                                            updateApplicationStatus(selectedApplication.id, 'reviewing');
                                            setSelectedApplication(null);
                                        }}
                                        disabled={processingAction}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                    >
                                        {processingAction ? (
                                            <span className="flex items-center">
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (
                                            "Start Review"
                                        )}
                                    </button>
                                )}

                                {selectedApplication.status === 'reviewing' && (
                                    <>
                                        <button
                                            onClick={() => scheduleVisit(selectedApplication.id)}
                                            disabled={processingAction}
                                            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300 disabled:cursor-not-allowed"
                                        >
                                            {processingAction ? (
                                                <span className="flex items-center">
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Processing...
                                                </span>
                                            ) : (
                                                "Schedule Site Visit"
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                openRejectionModal(selectedApplication.id);
                                                setSelectedApplication(null);
                                            }}
                                            disabled={processingAction}
                                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
                                        >
                                            {processingAction ? (
                                                <span className="flex items-center">
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Processing...
                                                </span>
                                            ) : (
                                                "Reject Application"
                                            )}
                                        </button>
                                    </>
                                )}

                                {selectedApplication.status === 'site_visit' && (
                                    <button
                                        onClick={() => scheduleVisit(selectedApplication.id)}
                                        disabled={processingAction}
                                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300 disabled:cursor-not-allowed"
                                    >
                                        {processingAction ? (
                                            <span className="flex items-center">
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (
                                            "Record Site Visit"
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {showRejectionModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium text-gray-900">Reject Application</h3>
                            <p className="text-sm text-gray-500 mt-1">Please provide a reason for rejection.</p>
                        </div>
                        <div className="p-6">
                            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason
                            </label>
                            <textarea
                                id="rejectionReason"
                                rows="4"
                                className="shadow-sm block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border border-gray-300 rounded-md p-2"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Explain why this application is being rejected..."
                                required
                            ></textarea>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                            <button
                                type="button"
                                onClick={closeRejectionModal}
                                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleRejectSubmit}
                                disabled={!rejectionReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
                            >
                                {processingAction ? (
                                    <span className="flex items-center">
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    "Reject Application"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}