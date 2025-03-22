'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, MapPin, CreditCard, User, Loader2 } from 'lucide-react';
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    setDoc,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import {
    signInAnonymously,
    signInWithCustomToken,
    signOut
} from 'firebase/auth';
import { auth, db } from '@/firebase';

export default function FarmerLogin() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        uniqueId: '',
        hasKCC: false,
        latitude: '',
        longitude: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locationFetching, setLocationFetching] = useState(false);

    // Check for existing login on mount
    useEffect(() => {
        const checkExistingLogin = async () => {
            const farmerId = localStorage.getItem('farmerId');
            if (farmerId) {
                // If they have a farmerId in localStorage, check if it's valid
                try {
                    const farmerDoc = doc(db, "farmers", farmerId);
                    const farmerSnapshot = await getDoc(farmerDoc);

                    if (farmerSnapshot.exists()) {
                        // Valid farmer ID, redirect to dashboard
                        router.push('/farmer-dashboard');
                    } else {
                        // Invalid farmer ID, clear localStorage
                        localStorage.removeItem('farmerId');
                    }
                } catch (error) {
                    console.error("Error checking existing login:", error);
                    localStorage.removeItem('farmerId');
                }
            }
        };

        checkExistingLogin();
    }, [router]);

    // Get current location
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            setLocationFetching(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString()
                    });
                    setLocationFetching(false);
                },
                (error) => {
                    console.error("Error getting location: ", error);
                    setError("Could not get your current location. Please enter it manually.");
                    setLocationFetching(false);
                }
            );
        } else {
            setError("Geolocation is not supported by your browser. Please enter your location manually.");
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate form data
            if (!formData.name || !formData.uniqueId || !formData.latitude || !formData.longitude) {
                throw new Error("Please fill in all required fields");
            }

            // Check if farmer with this uniqueId already exists
            const farmerDoc = doc(db, "farmers", formData.uniqueId);
            const farmerSnapshot = await getDoc(farmerDoc);

            let userId;

            // First sign out any existing anonymous user to avoid orphaned accounts
            if (auth.currentUser) {
                await signOut(auth);
            }

            // Sign in anonymously to get a new Firebase auth user
            const userCredential = await signInAnonymously(auth);
            userId = userCredential.user.uid;

            if (farmerSnapshot.exists()) {
                // If farmer exists, update their data
                const existingData = farmerSnapshot.data();

                // Update the existing farmer document
                await setDoc(farmerDoc, {
                    name: formData.name,
                    location: {
                        latitude: parseFloat(formData.latitude),
                        longitude: parseFloat(formData.longitude)
                    },
                    hasKCC: formData.hasKCC,
                    userId: userId, // Update with new anonymous user ID
                    lastLogin: new Date()
                }, { merge: true });

                console.log("Updated existing farmer with ID:", formData.uniqueId);
            } else {
                // Create new farmer document with uniqueId as the document ID
                await setDoc(farmerDoc, {
                    name: formData.name,
                    location: {
                        latitude: parseFloat(formData.latitude),
                        longitude: parseFloat(formData.longitude)
                    },
                    hasKCC: formData.hasKCC,
                    userId: userId,
                    createdAt: new Date(),
                    lastLogin: new Date()
                });

                console.log("Created new farmer with ID:", formData.uniqueId);
            }

            // Store the farmer ID in localStorage for future use
            localStorage.setItem('farmerId', formData.uniqueId);

            // Redirect to farmer dashboard
            router.push('/farmer-dashboard');

        } catch (error) {
            console.error("Error during login: ", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
            {/* Navigation */}
            <nav className="bg-white shadow-sm py-4">
                <div className="container mx-auto px-6">
                    <Link href="/" className="flex items-center">
                        <Leaf className="h-8 w-8 text-green-600" />
                        <span className="ml-2 text-2xl font-bold text-gray-800">Agrogami</span>
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                    <div className="text-center">
                        <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Farmer Login</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Welcome to Agrogami's alternative credit evaluation platform
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md space-y-5">
                            {/* Farmer Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                        <User className="h-5 w-5" />
                                    </span>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="focus:ring-green-500 focus:border-green-500 flex-1 block w-full rounded-none rounded-r-md text-gray-900 border-gray-300 px-3 py-2 border"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

                            {/* Unique ID */}
                            <div>
                                <label htmlFor="uniqueId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Unique ID (Aadhaar, Voter ID, etc.)
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                        <User className="h-5 w-5" />
                                    </span>
                                    <input
                                        type="text"
                                        id="uniqueId"
                                        name="uniqueId"
                                        value={formData.uniqueId}
                                        onChange={handleChange}
                                        required
                                        className="focus:ring-green-500 focus:border-green-500 flex-1 block w-full rounded-none rounded-r-md text-gray-900 border-gray-300 px-3 py-2 border"
                                        placeholder="Enter your unique identification number"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                        Your Current Location
                                    </label>
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        className="text-xs text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded-md"
                                    >
                                        {locationFetching ? (
                                            <span className="flex items-center">
                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                Getting location...
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                Use my current location
                                            </span>
                                        )}
                                    </button>
                                </div>
                                <div className="mt-1 grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="latitude" className="sr-only">Latitude</label>
                                        <input
                                            type="text"
                                            id="latitude"
                                            name="latitude"
                                            value={formData.latitude}
                                            onChange={handleChange}
                                            required
                                            className="focus:ring-green-500 focus:border-green-500 block w-full text-gray-900 border-gray-300 rounded-md px-3 py-2 border shadow-sm"
                                            placeholder="Latitude"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="longitude" className="sr-only">Longitude</label>
                                        <input
                                            type="text"
                                            id="longitude"
                                            name="longitude"
                                            value={formData.longitude}
                                            onChange={handleChange}
                                            required
                                            className="focus:ring-green-500 focus:border-green-500 block w-full text-gray-900 border-gray-300 rounded-md px-3 py-2 border shadow-sm"
                                            placeholder="Longitude"
                                        />
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Your location helps us assess local agricultural factors for credit evaluation
                                </p>
                            </div>

                            {/* KCC Checkbox */}
                            <div className="flex items-center py-2">
                                <input
                                    id="hasKCC"
                                    name="hasKCC"
                                    type="checkbox"
                                    checked={formData.hasKCC}
                                    onChange={handleChange}
                                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <label htmlFor="hasKCC" className="ml-3 block text-sm text-gray-700">
                                    I have a Kisan Credit Card (KCC)
                                </label>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed shadow-md"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Logging in...
                                    </span>
                                ) : (
                                    "Login / Register"
                                )}
                            </button>
                        </div>

                        <div className="text-center text-sm">
                            <Link href="/" className="font-medium text-green-600 hover:text-green-500">
                                Back to Home
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}