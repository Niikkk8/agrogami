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
        ArrowLeft,
        PlusCircle
    } from 'lucide-react';
    import { auth, db } from '@/firebase';
    import {
        collection,
        query,
        where,
        getDocs,
        getDoc,
        doc,
        orderBy
    } from 'firebase/firestore';

    export default function FarmerApplications() {
        const router = useRouter();
        const [applications, setApplications] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [farmer, setFarmer] = useState(null);
        const [selectedApplication, setSelectedApplication] = useState(null);
        const [filterStatus, setFilterStatus] = useState('all');
        const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest first
        const [searchTerm, setSearchTerm] = useState('');

        // Load farmer data and applications on component mount
        useEffect(() => {
            const fetchFarmerData = async () => {
                try {
                    const farmerId = localStorage.getItem('farmerId');

                    if (!farmerId) {
                        router.replace('/farmer-login');
                        return;
                    }

                    const farmerDoc = doc(db, "farmers", farmerId);
                    const farmerSnapshot = await getDoc(farmerDoc);

                    if (!farmerSnapshot.exists()) {
                        setError("Farmer data not found. Please login again.");
                        router.replace('/farmer-login');
                        return;
                    }

                    const farmerData = farmerSnapshot.data();
                    setFarmer({
                        id: farmerSnapshot.id,
                        ...farmerData
                    });

                    // Fetch applications for this farmer
                    await fetchApplications(farmerSnapshot.id);
                } catch (error) {
                    console.error("Error fetching farmer data:", error);
                    setError("Error loading your profile. Please try again later.");
                    setLoading(false);
                }
            };

            fetchFarmerData();
        }, [router]);

        // Fetch applications for the farmer
        const fetchApplications = async (farmerId) => {
            try {
                let applicationsQuery = query(
                    collection(db, "loanApplications"),
                    where("farmerId", "==", farmerId),
                    orderBy("createdAt", sortOrder)
                );

                const querySnapshot = await getDocs(applicationsQuery);
                const applicationsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date(),
                    updatedAt: doc.data().updatedAt?.toDate() || new Date()
                }));

                setApplications(applicationsData);
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
                await auth.signOut();
                localStorage.removeItem('farmerId');
                router.replace('/');
            } catch (error) {
                console.error("Error logging out:", error);
            }
        };

        // Handle changing sort order
        const handleSortChange = () => {
            const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
            setSortOrder(newOrder);

            // Re-fetch applications with new sort order
            if (farmer) {
                setLoading(true);
                fetchApplications(farmer.id);
            }
        };

        // Handle filter change
        const handleFilterChange = (e) => {
            setFilterStatus(e.target.value);
        };

        // Handle search input
        const handleSearchChange = (e) => {
            setSearchTerm(e.target.value);
        };

        // Filter and search applications
        const filteredApplications = applications.filter(application => {
            // Filter by status if not 'all'
            if (filterStatus !== 'all' && application.status !== filterStatus) {
                return false;
            }

            // Search by crop type or purpose
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();

                // Search in crop patterns
                const hasCropMatch = application.croppingPatterns?.some(
                    pattern => pattern.crop.toLowerCase().includes(searchLower)
                );

                // Search in allied activities
                const hasActivityMatch = application.alliedActivities?.some(
                    activity => activity.activity.toLowerCase().includes(searchLower)
                );

                return hasCropMatch || hasActivityMatch;
            }

            return true;
        });

        // View application details
        const viewApplicationDetails = (application) => {
            setSelectedApplication(application);
        };

        // Close application details modal
        const closeApplicationDetails = () => {
            setSelectedApplication(null);
        };

        // Format date function
        const formatDate = (date) => {
            if (!date) return "N/A";
            return new Date(date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
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

        // Status details based on application status
        const getStatusDetails = (application) => {
            switch (application.status) {
                case 'pending':
                    return (
                        <div className="mt-2 text-sm text-gray-600">
                            <p>Your application is being processed. We'll update you once the initial review is complete.</p>
                            <p className="mt-1">Submitted on: {formatDate(application.createdAt)}</p>
                        </div>
                    );
                case 'reviewing':
                    return (
                        <div className="mt-2 text-sm text-gray-600">
                            <p>Your application is under review by our credit team. This process typically takes 2-3 business days.</p>
                            <p className="mt-1">Review started on: {formatDate(application.reviewStartedAt)}</p>
                        </div>
                    );
                case 'site_visit':
                    return (
                        <div className="mt-2 text-sm text-gray-600">
                            <p>An onsite review has been scheduled. Our field officer will visit your farm to verify the details.</p>
                            {application.siteVisitDate && (
                                <p className="mt-1">Scheduled on: {formatDate(application.siteVisitDate)}</p>
                            )}
                        </div>
                    );
                case 'approved':
                    return (
                        <div className="mt-2 text-sm text-green-700">
                            <p className="font-medium">Congratulations! Your loan application has been approved.</p>
                            <p className="mt-1">Approved on: {formatDate(application.approvedAt)}</p>
                            {application.loanAmount && (
                                <p className="mt-1">Approved amount: ₹{application.loanAmount.toLocaleString()}</p>
                            )}
                            <div className="mt-3">
                                <button className="text-white bg-green-600 hover:bg-green-700 py-1 px-3 rounded-md text-sm inline-flex items-center">
                                    <ArrowRight className="mr-1 h-4 w-4" />
                                    View Loan Details
                                </button>
                            </div>
                        </div>
                    );
                case 'rejected':
                    return (
                        <div className="mt-2 text-sm text-red-700">
                            <p className="font-medium">We regret to inform you that your loan application was not approved at this time.</p>
                            <p className="mt-1">Date: {formatDate(application.rejectedAt)}</p>
                            {application.rejectionReason && (
                                <div className="mt-1">
                                    <p className="font-medium">Reason:</p>
                                    <p className="mt-1">{application.rejectionReason}</p>
                                </div>
                            )}
                            <div className="mt-3">
                                <button className="text-green-700 bg-green-50 hover:bg-green-100 py-1 px-3 rounded-md text-sm inline-flex items-center border border-green-200">
                                    <PlusCircle className="mr-1 h-4 w-4" />
                                    Apply Again
                                </button>
                            </div>
                        </div>
                    );
                default:
                    return (
                        <div className="mt-2 text-sm text-gray-600">
                            <p>Your application status is being updated. Please check back later.</p>
                            <p className="mt-1">Submitted on: {formatDate(application.createdAt)}</p>
                        </div>
                    );
            }
        };

        if (loading) {
            return (
                <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
                    <p className="mt-4 text-gray-600">Loading your applications...</p>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
                {/* Navigation */}
                <nav className="bg-white shadow-sm py-4">
                    <div className="container mx-auto px-6 flex justify-between items-center">
                        <Link href="/" className="flex items-center">
                            <Leaf className="h-8 w-8 text-green-600" />
                            <span className="ml-2 text-2xl font-bold text-gray-800">Agrogami</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-6 flex items-center">
                        <Link href="/farmer-dashboard" className="mr-4 text-gray-600 hover:text-green-600">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">My Loan Applications</h1>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                            {error}
                        </div>
                    )}

                    {/* Actions & Filters */}
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-4 md:mb-0">
                                <Link
                                    href="/farmer-application-form"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm"
                                >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    New Application
                                </Link>
                            </div>
                            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                                {/* Search */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search crops or activities"
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 block w-full text-sm"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={filterStatus}
                                    onChange={handleFilterChange}
                                    className="block w-full sm:w-auto pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="reviewing">Under Review</option>
                                    <option value="site_visit">Onsite Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>

                                {/* Sort Button */}
                                <button
                                    onClick={handleSortChange}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                        </div>
                    </div>

                    {/* Application List */}
                    {applications.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-10 text-center">
                            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
                            <p className="mt-2 text-gray-500">
                                You haven't submitted any loan applications. Start your first application today.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/farmer-application-form"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Start New Application
                                </Link>
                            </div>
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
                        <div className="space-y-6">
                            {filteredApplications.map(application => (
                                <div
                                    key={application.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                                            <div className="mb-2 sm:mb-0">
                                                <div className="flex items-center">
                                                    <ClipboardList className="h-5 w-5 text-gray-500 mr-2" />
                                                    <h3 className="text-lg font-medium text-gray-900">Application #{application.id.slice(-6)}</h3>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">Submitted on {formatDate(application.createdAt)}</p>
                                            </div>
                                            <StatusBadge status={application.status} />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Land Size</p>
                                                <p className="font-medium">{application.landHolding} acres</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Crops</p>
                                                <p className="font-medium">
                                                    {application.croppingPatterns && application.croppingPatterns.length > 0
                                                        ? application.croppingPatterns.map(p => p.crop).join(", ")
                                                        : "None specified"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Scale of Finance</p>
                                                <p className="font-medium">₹{application.scaleOfFinance?.toLocaleString() || "0"}</p>
                                            </div>
                                        </div>

                                        {/* Application Status Details */}
                                        <div className="mt-4 border-t border-gray-100 pt-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Status Details</h4>
                                            {getStatusDetails(application)}
                                        </div>

                                        <div className="mt-4 text-right">
                                            <button
                                                onClick={() => viewApplicationDetails(application)}
                                                className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-800"
                                            >
                                                View Full Details
                                                <ArrowRight className="ml-1 h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Application Details Modal */}
                {selectedApplication && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto">
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
                                    onClick={closeApplicationDetails}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6 border-b">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Application Timeline</h3>
                                <div className="relative pb-12">
                                    <div className="absolute h-full w-0.5 bg-gray-200 left-3"></div>

                                    {/* Submission */}
                                    <div className="relative flex items-start mb-6">
                                        <div className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center z-10">
                                            <Check className="h-4 w-4" />
                                        </div>
                                        <div className="ml-6">
                                            <h4 className="text-sm font-medium text-gray-900">Application Submitted</h4>
                                            <p className="text-xs text-gray-500 mt-1">{formatDate(selectedApplication.createdAt)}</p>
                                            <p className="text-sm text-gray-600 mt-1">Your loan application was received.</p>
                                        </div>
                                    </div>

                                    {/* Review */}
                                    {(selectedApplication.status !== 'pending' || selectedApplication.reviewStartedAt) && (
                                        <div className="relative flex items-start mb-6">
                                            <div className={`h-6 w-6 rounded-full ${['reviewing', 'site_visit', 'approved', 'rejected'].includes(selectedApplication.status) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center z-10`}>
                                                {['reviewing', 'site_visit', 'approved', 'rejected'].includes(selectedApplication.status)
                                                    ? <Check className="h-4 w-4" />
                                                    : <Clock className="h-4 w-4" />}
                                            </div>
                                            <div className="ml-6">
                                                <h4 className="text-sm font-medium text-gray-900">Initial Review</h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {selectedApplication.reviewStartedAt ? formatDate(selectedApplication.reviewStartedAt) : "Pending"}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {['reviewing', 'site_visit', 'approved', 'rejected'].includes(selectedApplication.status)
                                                        ? "Your application was reviewed by our credit team."
                                                        : "Waiting for initial review."}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Site Visit */}
                                    {(selectedApplication.status === 'site_visit' || selectedApplication.siteVisitDate || selectedApplication.status === 'approved' || selectedApplication.status === 'rejected') && (
                                        <div className="relative flex items-start mb-6">
                                            <div className={`h-6 w-6 rounded-full ${['approved', 'rejected'].includes(selectedApplication.status) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center z-10`}>
                                                {['approved', 'rejected'].includes(selectedApplication.status)
                                                    ? <Check className="h-4 w-4" />
                                                    : <Clock className="h-4 w-4" />}
                                            </div>
                                            <div className="ml-6">
                                                <h4 className="text-sm font-medium text-gray-900">Onsite Review</h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {selectedApplication.siteVisitDate ? formatDate(selectedApplication.siteVisitDate) : "Scheduled"}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {selectedApplication.status === 'site_visit'
                                                        ? "A field officer will visit your farm for verification."
                                                        : ['approved', 'rejected'].includes(selectedApplication.status)
                                                            ? "Site visit completed."
                                                            : "Waiting for site visit scheduling."}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Final Decision */}
                                    <div className="relative flex items-start">
                                        <div className={`h-6 w-6 rounded-full ${selectedApplication.status === 'approved' ? 'bg-green-600 text-white' : selectedApplication.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center z-10`}>
                                            {selectedApplication.status === 'approved'
                                                ? <Check className="h-4 w-4" />
                                                : selectedApplication.status === 'rejected'
                                                    ? <X className="h-4 w-4" />
                                                    : <Clock className="h-4 w-4" />}
                                        </div>
                                        <div className="ml-6">
                                            <h4 className="text-sm font-medium text-gray-900">Final Decision</h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {selectedApplication.status === 'approved'
                                                    ? formatDate(selectedApplication.approvedAt)
                                                    : selectedApplication.status === 'rejected'
                                                        ? formatDate(selectedApplication.rejectedAt)
                                                        : "Pending"}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {selectedApplication.status === 'approved'
                                                    ? "Your loan application has been approved."
                                                    : selectedApplication.status === 'rejected'
                                                        ? "Your application was not approved at this time."
                                                        : "Awaiting final decision."}
                                            </p>
                                            {selectedApplication.status === 'rejected' && selectedApplication.rejectionReason && (
                                                <div className="mt-2 p-3 bg-red-50 rounded-md">
                                                    <p className="text-sm text-red-700 font-medium">Reason for rejection:</p>
                                                    <p className="text-sm text-red-700">{selectedApplication.rejectionReason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                                <p className="text-xs text-gray-500">District</p>
                                                <p className="font-medium">{selectedApplication.nearestDistrict || "Not specified"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Details</h4>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <div className="mb-3">
                                                <p className="text-xs text-gray-500">Scale of Finance</p>
                                                <p className="font-medium">₹{selectedApplication.scaleOfFinance?.toLocaleString() || "0"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Allied Activities Investment</p>
                                                <p className="font-medium">₹{selectedApplication.totalInvestment?.toLocaleString() || "0"}</p>
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
                                                        // Calculate finance value based on district and crop
                                                        const financePerAcre = selectedApplication.scaleOfFinance && pattern.acres
                                                            ? Math.round(selectedApplication.scaleOfFinance / selectedApplication.croppingPatterns.reduce((total, p) => total + p.acres, 0))
                                                            : 0;

                                                        return (
                                                            <tr key={index}>
                                                                <td className="px-4 py-2 text-sm text-gray-900">{pattern.crop}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-900">{pattern.acres}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-900">₹{financePerAcre.toLocaleString()}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-900">₹{(financePerAcre * pattern.acres).toLocaleString()}</td>
                                                            </tr>
                                                        );
                                                    })}
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
                                                            <td className="px-4 py-2 text-sm text-gray-900">₹{activity.cost.toLocaleString()}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-900">₹{(activity.frequency * activity.cost).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No allied activities specified.</p>
                                    )}
                                </div>
                            </div>

                            {/* Credit Score Section */}
                            {selectedApplication.creditScore && (
                                <div className="p-6 border-b">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Assessment</h3>
                                    <div className="bg-gray-50 p-5 rounded-lg">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                            <div className="mb-4 md:mb-0">
                                                <h4 className="text-sm font-medium text-gray-700">Agro-Credit Score</h4>
                                                <div className="flex items-center mt-1">
                                                    <span className="text-2xl font-bold mr-2">
                                                        {selectedApplication.creditScore}
                                                    </span>
                                                    <div>
                                                        <div className="text-xs text-gray-500">out of 850</div>
                                                        <div className={`text-xs font-medium ${selectedApplication.creditScore >= 700 ? 'text-green-600' :
                                                                selectedApplication.creditScore >= 600 ? 'text-yellow-600' :
                                                                    'text-red-600'
                                                            }`}>
                                                            {selectedApplication.creditScore >= 700 ? 'Excellent' :
                                                                selectedApplication.creditScore >= 600 ? 'Good' :
                                                                    selectedApplication.creditScore >= 500 ? 'Fair' :
                                                                        'Needs Improvement'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-2/3">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>Poor</span>
                                                    <span>Fair</span>
                                                    <span>Good</span>
                                                    <span>Excellent</span>
                                                </div>
                                                <div className="relative">
                                                    <div className="h-2 bg-gray-200 rounded-full">
                                                        <div
                                                            className={`absolute h-2 rounded-full ${selectedApplication.creditScore >= 700 ? 'bg-green-600' :
                                                                    selectedApplication.creditScore >= 600 ? 'bg-yellow-500' :
                                                                        selectedApplication.creditScore >= 500 ? 'bg-orange-500' :
                                                                            'bg-red-600'
                                                                }`}
                                                            style={{ width: `${(selectedApplication.creditScore / 850) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                        <span>300</span>
                                                        <span>500</span>
                                                        <span>600</span>
                                                        <span>700</span>
                                                        <span>850</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Credit Factors */}
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Positive Factors</h5>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {selectedApplication.hasOwnProperty('landHolding') && selectedApplication.landHolding > 2 && (
                                                        <li className="flex items-start">
                                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                                                            <span>Land holding of {selectedApplication.landHolding} acres</span>
                                                        </li>
                                                    )}
                                                    {selectedApplication.hasOwnProperty('croppingPatterns') && selectedApplication.croppingPatterns.length > 1 && (
                                                        <li className="flex items-start">
                                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                                                            <span>Diverse cropping pattern with {selectedApplication.croppingPatterns.length} crops</span>
                                                        </li>
                                                    )}
                                                    {farmer && farmer.hasKCC && (
                                                        <li className="flex items-start">
                                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                                                            <span>Active Kisan Credit Card holder</span>
                                                        </li>
                                                    )}
                                                    <li className="flex items-start">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                                                        <span>Crops suitable for local agro-climatic conditions</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Improvement Areas</h5>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {(!selectedApplication.hasOwnProperty('alliedActivities') || selectedApplication.alliedActivities.length === 0) && (
                                                        <li className="flex items-start">
                                                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2" />
                                                            <span>Add allied agricultural activities for income diversification</span>
                                                        </li>
                                                    )}
                                                    {selectedApplication.hasOwnProperty('landHolding') && selectedApplication.landHolding < 2 && (
                                                        <li className="flex items-start">
                                                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2" />
                                                            <span>Small land holding may limit scale of operations</span>
                                                        </li>
                                                    )}
                                                    {(!farmer || !farmer.hasKCC) && (
                                                        <li className="flex items-start">
                                                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2" />
                                                            <span>Consider applying for a Kisan Credit Card</span>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-6 flex justify-between">
                                <button
                                    onClick={closeApplicationDetails}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Close
                                </button>

                                {selectedApplication.status === 'rejected' && (
                                    <Link
                                        href="/farmer-application-form"
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Apply Again
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }