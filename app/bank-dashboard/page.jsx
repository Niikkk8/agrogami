'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, LogOut, Search, Filter, Check, X, Clock, AlertCircle, ChevronDown, User, Loader2 } from 'lucide-react';
import { auth, db } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, getDocs, getDoc, doc, where, orderBy, updateDoc } from 'firebase/firestore';

export default function BankDashboard() {
    const router = useRouter();
    const [employee, setEmployee] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [processingAction, setProcessingAction] = useState(false);

    // Status badge colors
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        reviewing: 'bg-blue-100 text-blue-800'
    };

    // Status icons
    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'approved':
                return <Check className="h-4 w-4 text-green-600" />;
            case 'rejected':
                return <X className="h-4 w-4 text-red-600" />;
            case 'reviewing':
                return <AlertCircle className="h-4 w-4 text-blue-600" />;
            default:
                return null;
        }
    };

    useEffect(() => {
        // Check if user is authenticated
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    // Get employee data
                    const employeeDoc = await getDoc(doc(db, "bankEmployees", user.uid));

                    if (employeeDoc.exists()) {
                        setEmployee({ id: user.uid, ...employeeDoc.data() });
                        // Fetch loan applications
                        fetchLoanApplications();
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

    // Fetch loan applications
    const fetchLoanApplications = async () => {
        try {
            setLoading(true);

            // Create a query against the loan applications collection
            let q = query(collection(db, "loanApplications"), orderBy("createdAt", "desc"));

            // Apply status filter if not 'all'
            if (filterStatus !== 'all') {
                q = query(collection(db, "loanApplications"), where("status", "==", filterStatus), orderBy("createdAt", "desc"));
            }

            const querySnapshot = await getDocs(q);

            // Process application data and fetch farmer details
            const applicationsData = [];
            for (const docSnapshot of querySnapshot.docs) {
                const applicationData = { id: docSnapshot.id, ...docSnapshot.data() };

                // Fetch farmer details
                try {
                    const farmerDoc = await getDoc(doc(db, "farmers", applicationData.farmerId));
                    if (farmerDoc.exists()) {
                        applicationData.farmer = farmerDoc.data();
                    }
                } catch (error) {
                    console.error("Error fetching farmer data: ", error);
                    applicationData.farmer = { name: "Unknown Farmer" };
                }

                applicationsData.push(applicationData);
            }

            setApplications(applicationsData);
        } catch (error) {
            console.error("Error fetching loan applications: ", error);
            setError("Failed to load loan applications. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace('/');
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle filter change
    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
        // Refetch applications with the new filter
        fetchLoanApplications();
    };

    // View application details
    const viewApplicationDetails = (application) => {
        setSelectedApplication(application);
    };

    // Close application details modal
    const closeApplicationDetails = () => {
        setSelectedApplication(null);
    };

    // Approve loan application
    const approveApplication = async (applicationId) => {
        try {
            setProcessingAction(true);

            // Update application status in Firestore
            await updateDoc(doc(db, "loanApplications", applicationId), {
                status: 'approved',
                approvedBy: employee.id,
                approvedAt: new Date(),
                updatedAt: new Date()
            });

            // Refresh applications list
            await fetchLoanApplications();

            // Update selected application if open
            if (selectedApplication && selectedApplication.id === applicationId) {
                setSelectedApplication({
                    ...selectedApplication,
                    status: 'approved',
                    approvedBy: employee.id,
                    approvedAt: new Date(),
                    updatedAt: new Date()
                });
            }

            setProcessingAction(false);
        } catch (error) {
            console.error("Error approving application: ", error);
            setError("Failed to approve application. Please try again.");
            setProcessingAction(false);
        }
    };

    // Reject loan application
    const rejectApplication = async (applicationId) => {
        try {
            setProcessingAction(true);

            // Update application status in Firestore
            await updateDoc(doc(db, "loanApplications", applicationId), {
                status: 'rejected',
                rejectedBy: employee.id,
                rejectedAt: new Date(),
                updatedAt: new Date()
            });

            // Refresh applications list
            await fetchLoanApplications();

            // Update selected application if open
            if (selectedApplication && selectedApplication.id === applicationId) {
                setSelectedApplication({
                    ...selectedApplication,
                    status: 'rejected',
                    rejectedBy: employee.id,
                    rejectedAt: new Date(),
                    updatedAt: new Date()
                });
            }

            setProcessingAction(false);
        } catch (error) {
            console.error("Error rejecting application: ", error);
            setError("Failed to reject application. Please try again.");
            setProcessingAction(false);
        }
    };

    // Mark application as under review
    const reviewApplication = async (applicationId) => {
        try {
            setProcessingAction(true);

            // Update application status in Firestore
            await updateDoc(doc(db, "loanApplications", applicationId), {
                status: 'reviewing',
                reviewedBy: employee.id,
                reviewStartedAt: new Date(),
                updatedAt: new Date()
            });

            // Refresh applications list
            await fetchLoanApplications();

            // Update selected application if open
            if (selectedApplication && selectedApplication.id === applicationId) {
                setSelectedApplication({
                    ...selectedApplication,
                    status: 'reviewing',
                    reviewedBy: employee.id,
                    reviewStartedAt: new Date(),
                    updatedAt: new Date()
                });
            }

            setProcessingAction(false);
        } catch (error) {
            console.error("Error marking application for review: ", error);
            setError("Failed to mark application for review. Please try again.");
            setProcessingAction(false);
        }
    };

    // Filter applications based on search term
    const filteredApplications = applications.filter(application => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (application.farmer?.name && application.farmer.name.toLowerCase().includes(searchLower)) ||
            (application.loanPurpose && application.loanPurpose.toLowerCase().includes(searchLower)) ||
            (application.id && application.id.toLowerCase().includes(searchLower))
        );
    });

    if (loading && !employee) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
                <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navigation */}
            <nav className="bg-white shadow-sm py-4">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center">
                        <Leaf className="h-8 w-8 text-green-600" />
                        <span className="ml-2 text-2xl font-bold text-gray-800">Agrogami</span>
                    </Link>

                    {employee && (
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{employee.fullName}</p>
                                <p className="text-xs text-gray-500">Bank Employee</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 container mx-auto px-6 py-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Loan Applications Dashboard</h1>
                        <p className="text-gray-600">Manage and review farmer loan applications</p>
                    </div>

                    <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                        {/* Search Box */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search applications"
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 block w-full"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                className="pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 block w-full appearance-none"
                                value={filterStatus}
                                onChange={handleFilterChange}
                            >
                                <option value="all">All Applications</option>
                                <option value="pending">Pending</option>
                                <option value="reviewing">Under Review</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={() => fetchLoanApplications()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                        {error}
                    </div>
                )}

                {/* Applications Table */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="p-8 flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 text-green-600 animate-spin mb-4" />
                            <p className="text-gray-600">Loading applications...</p>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-600">No loan applications found.</p>
                            {searchTerm && (
                                <p className="text-gray-500 text-sm mt-2">
                                    Try a different search term or clear filters.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Farmer
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loan Details
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date Applied
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Credit Score
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredApplications.map((application) => (
                                        <tr key={application.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{application.farmer?.name || "Unknown Farmer"}</div>
                                                        <div className="text-sm text-gray-500">{application.farmer?.hasKCC ? "KCC Holder" : "Non-KCC Holder"}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{application.loanPurpose || "General Purpose"}</div>
                                                <div className="text-sm text-gray-500">₹{application.loanAmount?.toLocaleString() || "Amount not specified"}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[application.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    <StatusIcon status={application.status} />
                                                    <span className="ml-1">
                                                        {application.status === 'pending' ? 'Pending' :
                                                            application.status === 'reviewing' ? 'Under Review' :
                                                                application.status === 'approved' ? 'Approved' :
                                                                    application.status === 'rejected' ? 'Rejected' : 'Unknown'}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {application.createdAt ? new Date(application.createdAt.toDate()).toLocaleDateString() : "Unknown date"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{application.creditScore || "Pending"}</div>
                                                {application.creditScore && (
                                                    <div className="w-24 bg-gray-200 rounded-full h-2.5 mt-1">
                                                        <div
                                                            className={`h-2.5 rounded-full ${application.creditScore >= 700 ? 'bg-green-600' :
                                                                    application.creditScore >= 600 ? 'bg-yellow-400' : 'bg-red-600'
                                                                }`}
                                                            style={{ width: `${application.creditScore / 10}%` }}
                                                        ></div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => viewApplicationDetails(application)}
                                                    className="text-green-600 hover:text-green-900 mr-4"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Application Details Modal */}
            {selectedApplication && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                        <div className="p-6 flex justify-between items-start border-b">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Loan Application Details
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Application ID: {selectedApplication.id}
                                </p>
                            </div>
                            <button
                                onClick={closeApplicationDetails}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Farmer Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{selectedApplication.farmer?.name || "Unknown"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">KCC Status</p>
                                    <p className="font-medium">{selectedApplication.farmer?.hasKCC ? "KCC Holder" : "Non-KCC Holder"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Farmer ID</p>
                                    <p className="font-medium">{selectedApplication.farmerId || "Unknown"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-medium">
                                        {selectedApplication.farmer?.location ?
                                            `${selectedApplication.farmer.location.latitude.toFixed(4)}, ${selectedApplication.farmer.location.longitude.toFixed(4)}` :
                                            "Location not available"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Loan Amount</p>
                                    <p className="font-medium">₹{selectedApplication.loanAmount?.toLocaleString() || "Not specified"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Loan Purpose</p>
                                    <p className="font-medium">{selectedApplication.loanPurpose || "General purpose"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Requested Term</p>
                                    <p className="font-medium">{selectedApplication.loanTerm || "Not specified"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Application Date</p>
                                    <p className="font-medium">
                                        {selectedApplication.createdAt ?
                                            new Date(selectedApplication.createdAt.toDate()).toLocaleDateString() :
                                            "Unknown date"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Evaluation</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Alternative Credit Score</p>
                                    <div className="flex items-center">
                                        <p className="font-medium mr-3">
                                            {selectedApplication.creditScore || "Pending"}
                                        </p>
                                        {selectedApplication.creditScore && (
                                            <div className="w-32 bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${selectedApplication.creditScore >= 700 ? 'bg-green-600' :
                                                            selectedApplication.creditScore >= 600 ? 'bg-yellow-400' : 'bg-red-600'
                                                        }`}
                                                    style={{ width: `${selectedApplication.creditScore / 10}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Repayment Capacity</p>
                                    <p className="font-medium">{selectedApplication.repaymentCapacity || "Not evaluated"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Land Quality Assessment</p>
                                    <p className="font-medium">{selectedApplication.landQualityRating || "Not evaluated"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Crop Yield Prediction</p>
                                    <p className="font-medium">{selectedApplication.cropYieldPrediction || "Not evaluated"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Application Status</h3>
                            <div>
                                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusColors[selectedApplication.status] || 'bg-gray-100 text-gray-800'}`}>
                                    <StatusIcon status={selectedApplication.status} />
                                    <span className="ml-1">
                                        {selectedApplication.status === 'pending' ? 'Pending' :
                                            selectedApplication.status === 'reviewing' ? 'Under Review' :
                                                selectedApplication.status === 'approved' ? 'Approved' :
                                                    selectedApplication.status === 'rejected' ? 'Rejected' : 'Unknown'}
                                    </span>
                                </span>

                                {selectedApplication.status === 'approved' && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        Approved on {selectedApplication.approvedAt ? new Date(selectedApplication.approvedAt.toDate()).toLocaleDateString() : "Unknown date"}
                                    </p>
                                )}

                                {selectedApplication.status === 'rejected' && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        Rejected on {selectedApplication.rejectedAt ? new Date(selectedApplication.rejectedAt.toDate()).toLocaleDateString() : "Unknown date"}
                                    </p>
                                )}

                                {selectedApplication.status === 'reviewing' && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        Under review since {selectedApplication.reviewStartedAt ? new Date(selectedApplication.reviewStartedAt.toDate()).toLocaleDateString() : "Unknown date"}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="p-6 flex flex-wrap justify-end space-x-2">
                            {selectedApplication.status === 'pending' && (
                                <button
                                    onClick={() => reviewApplication(selectedApplication.id)}
                                    disabled={processingAction}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                >
                                    {processingAction ? (
                                        <span className="flex items-center">
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </span>
                                    ) : (
                                        'Mark as Under Review'
                                    )}
                                </button>
                            )}

                            {['pending', 'reviewing'].includes(selectedApplication.status) && (
                                <>
                                    <button
                                        onClick={() => approveApplication(selectedApplication.id)}
                                        disabled={processingAction}
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed"
                                    >
                                        {processingAction ? (
                                            <span className="flex items-center">
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (
                                            'Approve Application'
                                        )}
                                    </button>

                                    <button
                                        onClick={() => rejectApplication(selectedApplication.id)}
                                        disabled={processingAction}
                                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
                                    >
                                        {processingAction ? (
                                            <span className="flex items-center">
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (
                                            'Reject Application'
                                        )}
                                    </button>
                                </>
                            )}

                            <button
                                onClick={closeApplicationDetails}
                                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
