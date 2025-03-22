'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Leaf,
    LogOut,
    MapPin,
    Loader2,
    PlusCircle,
    Trash2,
    Save,
    Check,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import { auth, db } from '@/firebase';
import {
    doc,
    getDoc,
    addDoc,
    collection,
    serverTimestamp
} from 'firebase/firestore';
import districtData from '../../public/districts.json';

export default function FarmerApplicationForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [farmer, setFarmer] = useState(null);
    const [nearestDistrict, setNearestDistrict] = useState(null);
    const [availableCrops, setAvailableCrops] = useState([]);
    const [totalAreaError, setTotalAreaError] = useState(false); // Error state for total area validation

    // Form data
    const [landHolding, setLandHolding] = useState("");
    const [croppingPatterns, setCroppingPatterns] = useState([
        { id: 1, crop: "", acres: "" }
    ]);
    const [alliedActivities, setAlliedActivities] = useState([
        { id: 1, activity: "", frequency: "", cost: "" }
    ]);
    const [totalScaleOfFinance, setTotalScaleOfFinance] = useState(0);
    const [totalInvestment, setTotalInvestment] = useState(0);
    const [totalCroppingArea, setTotalCroppingArea] = useState(0); // Track total area for validation

    // Set of known districts in Gujarat
    const districts = Object.keys(districtData.districts);

    // Load farmer data on component mount
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

                // Find nearest district based on latitude/longitude
                if (farmerData.location) {
                    const nearest = findNearestDistrict(
                        farmerData.location.latitude,
                        farmerData.location.longitude
                    );
                    setNearestDistrict(nearest);

                    // Set available crops from the nearest district
                    if (districtData.districts[nearest]) {
                        const crops = Object.keys(districtData.districts[nearest]);
                        setAvailableCrops(crops);
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching farmer data:", error);
                setError("Error loading your profile. Please try again later.");
                setLoading(false);
            }
        };

        fetchFarmerData();
    }, [router]);

    // Find nearest district based on lat/long
    const findNearestDistrict = (latitude, longitude) => {
        const districtCoordinates = {
            "Valsad": { lat: 20.5, lng: 73.0 },
            "Dang-Ahva": { lat: 20.8, lng: 73.7 },
            "Navsari": { lat: 20.9, lng: 72.9 },
            "Ahmedabad": { lat: 23.0, lng: 72.6 },
            "Kheda": { lat: 22.7, lng: 72.7 },
            "Anand": { lat: 22.6, lng: 73.0 }
        };

        // Calculate distance between points (using Euclidean distance for simplicity)
        const calculateDistance = (lat1, lng1, lat2, lng2) => {
            return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
        };

        let nearestDistrict = districts[0];
        let minDistance = Infinity;

        districts.forEach(district => {
            const coords = districtCoordinates[district];
            if (coords) {
                const distance = calculateDistance(latitude, longitude, coords.lat, coords.lng);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestDistrict = district;
                }
            }
        });

        return nearestDistrict;
    };

    // Handle land holding change and validate cropping patterns
    const handleLandHoldingChange = (value) => {
        setLandHolding(value);
        // Validate total cropping area against new land holding
        validateTotalCroppingArea(value, croppingPatterns);
    };

    // Handle adding a new cropping pattern row
    const addCroppingPattern = () => {
        const newId = croppingPatterns.length > 0
            ? Math.max(...croppingPatterns.map(p => p.id)) + 1
            : 1;

        const newPatterns = [
            ...croppingPatterns,
            { id: newId, crop: "", acres: "" }
        ];

        setCroppingPatterns(newPatterns);
    };

    // Handle removing a cropping pattern row
    const removeCroppingPattern = (id) => {
        const newPatterns = croppingPatterns.filter(pattern => pattern.id !== id);
        setCroppingPatterns(newPatterns);

        // Recalculate total area after removing a pattern
        const newTotalArea = calculateTotalCroppingArea(newPatterns);
        setTotalCroppingArea(newTotalArea);
        validateTotalCroppingArea(landHolding, newPatterns);
    };

    // Handle adding a new allied activity row
    const addAlliedActivity = () => {
        const newId = alliedActivities.length > 0
            ? Math.max(...alliedActivities.map(a => a.id)) + 1
            : 1;

        setAlliedActivities([
            ...alliedActivities,
            { id: newId, activity: "", frequency: "", cost: "" }
        ]);
    };

    // Handle removing an allied activity row
    const removeAlliedActivity = (id) => {
        setAlliedActivities(alliedActivities.filter(activity => activity.id !== id));
    };

    // Calculate total cropping area from patterns
    const calculateTotalCroppingArea = (patterns) => {
        return patterns.reduce((total, pattern) => {
            const acres = pattern.acres && !isNaN(pattern.acres)
                ? parseFloat(pattern.acres)
                : 0;
            return total + acres;
        }, 0);
    };

    // Validate total cropping area against land holding
    const validateTotalCroppingArea = (landValue, patterns) => {
        if (!landValue || isNaN(landValue) || parseFloat(landValue) <= 0) {
            setTotalAreaError(false);
            return;
        }

        const totalArea = calculateTotalCroppingArea(patterns);
        const landHoldingValue = parseFloat(landValue);

        setTotalAreaError(totalArea > landHoldingValue);
        return totalArea <= landHoldingValue;
    };

    // Handle form input changes for cropping patterns
    const handleCroppingPatternChange = (id, field, value) => {
        const updatedPatterns = croppingPatterns.map(pattern => {
            if (pattern.id === id) {
                return { ...pattern, [field]: value };
            }
            return pattern;
        });

        setCroppingPatterns(updatedPatterns);

        // If updating acres, validate total area against land holding
        if (field === 'acres') {
            const newTotalArea = calculateTotalCroppingArea(updatedPatterns);
            setTotalCroppingArea(newTotalArea);
            validateTotalCroppingArea(landHolding, updatedPatterns);
        }
    };

    // Handle form input changes for allied activities
    const handleAlliedActivityChange = (id, field, value) => {
        const updatedActivities = alliedActivities.map(activity => {
            if (activity.id === id) {
                return { ...activity, [field]: value };
            }
            return activity;
        });

        setAlliedActivities(updatedActivities);
    };

    // Calculate scale of finance based on cropping patterns
    useEffect(() => {
        if (nearestDistrict && croppingPatterns.length > 0) {
            let total = 0;

            croppingPatterns.forEach(pattern => {
                if (pattern.crop && pattern.acres && !isNaN(pattern.acres)) {
                    const cropFinance = districtData.districts[nearestDistrict][pattern.crop] || 0;
                    total += cropFinance * parseFloat(pattern.acres);
                }
            });

            setTotalScaleOfFinance(total);
        }
    }, [croppingPatterns, nearestDistrict]);

    // Calculate total investment from allied activities
    useEffect(() => {
        if (alliedActivities.length > 0) {
            let total = 0;

            alliedActivities.forEach(activity => {
                if (
                    activity.activity &&
                    activity.frequency &&
                    activity.cost &&
                    !isNaN(activity.frequency) &&
                    !isNaN(activity.cost)
                ) {
                    total += parseFloat(activity.frequency) * parseFloat(activity.cost);
                }
            });

            setTotalInvestment(total);
        }
    }, [alliedActivities]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // Basic validation
            if (!landHolding || isNaN(landHolding) || parseFloat(landHolding) <= 0) {
                throw new Error("Please enter a valid land holding in acres.");
            }

            if (croppingPatterns.length === 0) {
                throw new Error("Please add at least one cropping pattern.");
            }

            // Validate cropping patterns
            for (const pattern of croppingPatterns) {
                if (!pattern.crop || !pattern.acres || isNaN(pattern.acres) || parseFloat(pattern.acres) <= 0) {
                    throw new Error("Please complete all cropping pattern fields with valid information.");
                }
            }

            // Validate total cropping area against land holding
            if (!validateTotalCroppingArea(landHolding, croppingPatterns)) {
                throw new Error("Total cropping area cannot exceed your total land holding.");
            }

            // Validate allied activities if any are added
            for (const activity of alliedActivities) {
                if (activity.activity || activity.frequency || activity.cost) {
                    if (!activity.activity || !activity.frequency || !activity.cost ||
                        isNaN(activity.frequency) || isNaN(activity.cost) ||
                        parseFloat(activity.frequency) <= 0 || parseFloat(activity.cost) <= 0) {
                        throw new Error("Please complete all allied activity fields with valid information.");
                    }
                }
            }

            // Prepare data for submission
            const applicationData = {
                farmerId: farmer.id,
                farmerName: farmer.name,
                farmerLocation: farmer.location,
                landHolding: parseFloat(landHolding),
                croppingPatterns: croppingPatterns.map(pattern => ({
                    crop: pattern.crop,
                    acres: parseFloat(pattern.acres)
                })),
                alliedActivities: alliedActivities
                    .filter(a => a.activity && a.frequency && a.cost) // Only include complete entries
                    .map(activity => ({
                        activity: activity.activity,
                        frequency: parseFloat(activity.frequency),
                        cost: parseFloat(activity.cost)
                    })),
                nearestDistrict,
                scaleOfFinance: totalScaleOfFinance,
                totalInvestment: totalInvestment,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),   
            };

            // Add the application to Firestore
            const applicationRef = await addDoc(collection(db, "loanApplications"), applicationData);

            console.log("Application submitted with ID:", applicationRef.id);
            setSuccess(true);

            // Reset form or redirect
            setTimeout(() => {
                router.push('/farmer-dashboard');
            }, 2000);

        } catch (error) {
            console.error("Error submitting application:", error);
            setError(error.message);
        } finally {
            setSubmitting(false);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
                <p className="mt-4 text-gray-600">Loading your application form...</p>
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
                    <button
                        onClick={() => router.back()}
                        className="mr-4 text-gray-600 hover:text-green-600"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">New Loan Application</h1>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6">
                        <div className="flex items-center">
                            <Check className="h-5 w-5 mr-2" />
                            <span>Application submitted successfully! Redirecting to dashboard...</span>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Farmer Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{farmer?.name || "Not available"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">KCC Status</p>
                            <p className="font-medium">{farmer?.hasKCC ? "KCC Holder" : "Non-KCC Holder"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium flex items-center">
                                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                                {farmer?.location ?
                                    `${farmer.location.latitude.toFixed(4)}, ${farmer.location.longitude.toFixed(4)}` :
                                    "Not available"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Nearest District</p>
                            <p className="font-medium">{nearestDistrict || "Not determined"}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Land Details</h2>
                        <div className="mb-4">
                            <label htmlFor="landHolding" className="block text-sm font-medium text-gray-700 mb-1">
                                Total Land Holding (in acres)
                            </label>
                            <input
                                type="number"
                                id="landHolding"
                                value={landHolding}
                                onChange={(e) => handleLandHoldingChange(e.target.value)}
                                step="0.01"
                                min="0"
                                className="focus:ring-green-500 focus:border-green-500 block w-full sm:max-w-xs text-gray-900 border-gray-300 rounded-md px-3 py-2 border shadow-sm"
                                placeholder="e.g., 2.5"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Cropping Pattern</h2>
                            <button
                                type="button"
                                onClick={addCroppingPattern}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Crop
                            </button>
                        </div>

                        {/* Area usage indicator */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Land Usage:</span>
                                <span className={`text-sm font-medium ${totalAreaError ? 'text-red-600' : 'text-green-600'}`}>
                                    {totalCroppingArea.toFixed(2)} / {landHolding || 0} acres
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div
                                    className={`h-2.5 rounded-full ${totalAreaError ? 'bg-red-600' : 'bg-green-600'}`}
                                    style={{
                                        width: landHolding && parseFloat(landHolding) > 0
                                            ? `${Math.min(100, (totalCroppingArea / parseFloat(landHolding)) * 100)}%`
                                            : '0%'
                                    }}
                                ></div>
                            </div>
                            {totalAreaError && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Total cropping area cannot exceed your total land holding.
                                </p>
                            )}
                        </div>

                        {croppingPatterns.map((pattern, index) => (
                            <div key={pattern.id} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50 relative">
                                <div className="absolute top-3 right-3">
                                    {croppingPatterns.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeCroppingPattern(pattern.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Crop Type
                                        </label>
                                        <select
                                            value={pattern.crop}
                                            onChange={(e) => handleCroppingPatternChange(pattern.id, 'crop', e.target.value)}
                                            className="focus:ring-green-500 focus:border-green-500 block w-full text-gray-900 border-gray-300 rounded-md px-3 py-2 border shadow-sm"
                                            required
                                        >
                                            <option value="">Select a crop</option>
                                            {availableCrops.map((crop) => (
                                                <option key={crop} value={crop}>
                                                    {crop}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Area (in acres)
                                        </label>
                                        <input
                                            type="number"
                                            value={pattern.acres}
                                            onChange={(e) => handleCroppingPatternChange(pattern.id, 'acres', e.target.value)}
                                            step="0.01"
                                            min="0"
                                            className={`focus:ring-green-500 focus:border-green-500 block w-full text-gray-900 border-gray-300 rounded-md px-3 py-2 border shadow-sm ${totalAreaError ? 'border-red-300' : ''
                                                }`}
                                            placeholder="e.g., 1.5"
                                            required
                                        />
                                    </div>
                                </div>
                                {pattern.crop && pattern.acres && !isNaN(pattern.acres) && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        Financing for {pattern.crop}: ₹{(districtData.districts[nearestDistrict]?.[pattern.crop] || 0).toLocaleString()} per acre × {parseFloat(pattern.acres)} acres =
                                        <span className="font-semibold text-green-600"> ₹{((districtData.districts[nearestDistrict]?.[pattern.crop] || 0) * parseFloat(pattern.acres)).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="mt-4 p-3 bg-green-50 rounded-md">
                            <p className="text-gray-700">Scale of Finance + Crop Insurance: <span className="font-semibold text-green-600">₹{totalScaleOfFinance.toLocaleString()}</span></p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Allied Activities & Investments</h2>
                            <button
                                type="button"
                                onClick={addAlliedActivity}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Activity
                            </button>
                        </div>

                        {alliedActivities.map((activity, index) => (
                            <div key={activity.id} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50 relative">
                                <div className="absolute top-3 right-3">
                                    {alliedActivities.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAlliedActivity(activity.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Activity Name
                                        </label>
                                        <input
                                            type="text"
                                            value={activity.activity}
                                            onChange={(e) => handleAlliedActivityChange(activity.id, 'activity', e.target.value)}
                                            className="focus:ring-green-500 focus:border-green-500 block w-full text-gray-900 border-gray-300 rounded-md px-3 py-2 border shadow-sm"
                                            placeholder="e.g., Fertilizer Application"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Frequency (times per year)
                                        </label>
                                        <input
                                            type="number"
                                            value={activity.frequency}
                                            onChange={(e) => handleAlliedActivityChange(activity.id, 'frequency', e.target.value)}
                                            min="0"
                                            className="focus:ring-green-500 focus:border-green-500 block w-full text-gray-900 border-gray-300 rounded-md px-3 py-2 border shadow-sm"
                                            placeholder="e.g., 3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cost per Time (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={activity.cost}
                                            onChange={(e) => handleAlliedActivityChange(activity.id, 'cost', e.target.value)}
                                            min="0"
                                            className="focus:ring-green-500 focus:border-green-500 block w-full text-gray-900 border-gray-300 rounded-md px-3 py-2 border shadow-sm"
                                            placeholder="e.g., 5000"
                                        />
                                    </div>
                                </div>
                                {activity.activity && activity.frequency && activity.cost &&
                                    !isNaN(activity.frequency) && !isNaN(activity.cost) && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            Cost for {activity.activity}: ₹{parseFloat(activity.cost).toLocaleString()} × {parseFloat(activity.frequency)} times =
                                            <span className="font-semibold text-green-600"> ₹{(parseFloat(activity.cost) * parseFloat(activity.frequency)).toLocaleString()}</span>
                                        </div>
                                    )}
                            </div>
                        ))}

                        <div className="mt-4 p-3 bg-green-50 rounded-md">
                            <p className="text-gray-700">Total Investment: <span className="font-semibold text-green-600">₹{totalInvestment.toLocaleString()}</span></p>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-4"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || totalAreaError}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <span className="flex items-center">
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <Save className="h-4 w-4 mr-2" />
                                    Submit Application
                                </span>
                            )}
                        </button>
                    </div>
                </form>

                {/* Summary section */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Application Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Total Land Holding</p>
                            <p className="font-medium">{landHolding ? `${landHolding} acres` : "Not specified"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Land Used for Cropping</p>
                            <p className="font-medium">{totalCroppingArea.toFixed(2)} acres
                                <span className="text-xs text-gray-500 ml-2">
                                    ({landHolding && parseFloat(landHolding) > 0
                                        ? `${Math.min(100, ((totalCroppingArea / parseFloat(landHolding)) * 100).toFixed(1))}%`
                                        : '0%'} of total)
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Scale of Finance + Crop Insurance</p>
                            <p className="font-medium text-green-600">₹{totalScaleOfFinance.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Allied Activities Investment</p>
                            <p className="font-medium text-green-600">₹{totalInvestment.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}