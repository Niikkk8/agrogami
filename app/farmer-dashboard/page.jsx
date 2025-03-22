'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, FileText, PlusCircle, LogOut, ArrowRight, Loader2, ClipboardList } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { auth, db } from '@/firebase';

export default function FarmerDashboard() {
    const router = useRouter();
    const [farmer, setFarmer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFarmerData = async () => {
            try {
                // Get the farmer ID from localStorage
                const farmerId = localStorage.getItem('farmerId');

                if (!farmerId) {
                    router.replace('/farmer-login');
                    return;
                }

                // Fetch farmer data from Firestore
                const farmerDoc = doc(db, "farmers", farmerId);
                const farmerSnapshot = await getDoc(farmerDoc);

                if (farmerSnapshot.exists()) {
                    setFarmer({ id: farmerSnapshot.id, ...farmerSnapshot.data() });
                } else {
                    throw new Error("Farmer data not found");
                }
            } catch (error) {
                console.error("Error fetching farmer data: ", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFarmerData();
    }, [router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('farmerId');
            router.replace('/');
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    const handleCheckApplications = () => {
        router.push('/farmer-applications');
    };

    const handleNewApplication = () => {
        router.push('/farmer-new-application');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
                <p className="mt-4 text-gray-600">Loading your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/farmer-login"
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                        Return to Login
                    </Link>
                </div>
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
            <div className="flex-1 container mx-auto px-6 py-10">
                {/* Welcome Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Welcome, {farmer?.name}</h1>
                            <p className="text-gray-600 mt-1">Welcome to your Agrogami Dashboard</p>
                        </div>
                        <div className="bg-green-100 px-4 py-2 rounded-full">
                            <p className="text-sm font-medium text-green-800">
                                {farmer?.hasKCC ? 'KCC Holder' : 'Non-KCC Holder'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Check Existing Applications */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <FileText className="h-8 w-8 text-green-600" />
                                <h2 className="text-xl font-bold text-gray-800 ml-3">Check Applications</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                View the status of your existing loan applications and check their progress.
                            </p>
                            <button
                                onClick={handleCheckApplications}
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                View Applications
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Apply for New Loan */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <PlusCircle className="h-8 w-8 text-green-600" />
                                <h2 className="text-xl font-bold text-gray-800 ml-3">New Loan Application</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Apply for a new agricultural loan based on our alternative credit evaluation system.
                            </p>
                            <button
                                onClick={handleNewApplication}
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Start New Application
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                    <div className="flex items-start">
                        <ClipboardList className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">How Our Alternative Credit Evaluation Works</h3>
                            <p className="mt-2 text-gray-600">
                                Agrogami considers agricultural factors like land quality, weather patterns, soil health, and crop yield potential
                                alongside traditional metrics. This helps us provide fair credit assessments for farmers like you, even if you
                                don't have an extensive credit history.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}