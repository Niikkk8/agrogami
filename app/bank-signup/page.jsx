'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, User, Mail, Lock, Briefcase, Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

export default function BankEmployeeSignup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        employeeId: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate form data
            if (!formData.fullName || !formData.employeeId || !formData.email || !formData.password) {
                throw new Error("Please fill in all required fields");
            }

            // Validate password match
            if (formData.password !== formData.confirmPassword) {
                throw new Error("Passwords do not match");
            }

            // Create new user with email and password
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const user = userCredential.user;

            // Save additional user data to Firestore
            await setDoc(doc(db, "bankEmployees", user.uid), {
                fullName: formData.fullName,
                employeeId: formData.employeeId,
                email: formData.email,
                role: 'bank_employee',
                createdAt: new Date()
            });

            // Redirect to bank dashboard
            router.push('/bank-dashboard');

        } catch (error) {
            console.error("Error during signup: ", error);

            // Handle Firebase specific errors
            if (error.code === 'auth/email-already-in-use') {
                setError("This email is already in use. Please try another email or login instead.");
            } else if (error.code === 'auth/weak-password') {
                setError("Password is too weak. Please use a stronger password.");
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
            {/* Navigation */}
            <nav className="bg-white shadow-sm py-4">
                <div className="container mx-auto px-6">
                    <Link href="/" className="flex items-center">
                        <Leaf className="h-8 w-8 text-blue-600" />
                        <span className="ml-2 text-2xl font-bold text-gray-800">Agrogami</span>
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                    <div className="text-center">
                        <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Bank Employee Signup</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Create an account to manage loan applications
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md space-y-5">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                        <User className="h-5 w-5" />
                                    </span>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md text-gray-900 border-gray-300 px-3 py-2 border"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

                            {/* Employee ID */}
                            <div>
                                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Employee ID
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                        <Briefcase className="h-5 w-5" />
                                    </span>
                                    <input
                                        type="text"
                                        id="employeeId"
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md text-gray-900 border-gray-300 px-3 py-2 border"
                                        placeholder="Enter your employee ID"
                                    />
                                </div>
                            </div>

                            {/* Email Address */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                        <Mail className="h-5 w-5" />
                                    </span>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md text-gray-900 border-gray-300 px-3 py-2 border"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                        <Lock className="h-5 w-5" />
                                    </span>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md text-gray-900 border-gray-300 px-3 py-2 border"
                                        placeholder="Create a password"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                        <Lock className="h-5 w-5" />
                                    </span>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md text-gray-900 border-gray-300 px-3 py-2 border"
                                        placeholder="Confirm your password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed shadow-md"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating account...
                                    </span>
                                ) : (
                                    "Sign Up"
                                )}
                            </button>
                        </div>

                        <div className="text-center text-sm text-gray-950">
                            Already have an account?{' '}
                            <Link href="/bank-login" className="font-medium text-blue-600 hover:text-blue-500">
                                Login here
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}