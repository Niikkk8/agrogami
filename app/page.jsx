'use client'

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Leaf,
    BarChart2,
    Cloud,
    Map,
    Droplet,
    Sun,
    Users,
    ShieldCheck,
    TrendingUp,
    ChevronRight,
    User,
    Briefcase,
    Menu,
    X,
    ArrowRight,
    Moon,
    CircleUser,
    CircleUserRound,
    Building2,
    GraduationCap
} from 'lucide-react';

export default function Home() {
    // Create refs for each section
    const featuresRef = useRef(null);
    const howItWorksRef = useRef(null);
    const benefitsRef = useRef(null);
    const aboutRef = useRef(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Add a state to handle hydration
    const [isClient, setIsClient] = useState(false);

    // Scroll to section function
    const scrollToSection = (ref, sectionName) => {
        if (ref && ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(sectionName);
            setMobileMenuOpen(false);
        }
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        // Make sure we're explicitly adding or removing the class
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        localStorage.setItem('darkMode', newMode ? 'true' : 'false');
    };

    // Initialize dark mode and scroll handler
    useEffect(() => {
        // Mark that we're now on the client
        setIsClient(true);

        // Check for dark mode preference
        const savedDarkMode = localStorage.getItem('darkMode');

        // If we have a saved preference, use it
        if (savedDarkMode !== null) {
            const isDark = savedDarkMode === 'true';
            setIsDarkMode(isDark);

            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
        // If no saved preference, check system preference (optional)
        else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        }

        // Scroll handler and other initialization code
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100;

            if (featuresRef.current && scrollPosition >= featuresRef.current.offsetTop &&
                scrollPosition < howItWorksRef.current.offsetTop) {
                setActiveSection('features');
            } else if (howItWorksRef.current && scrollPosition >= howItWorksRef.current.offsetTop &&
                scrollPosition < benefitsRef.current.offsetTop) {
                setActiveSection('howItWorks');
            } else if (benefitsRef.current && scrollPosition >= benefitsRef.current.offsetTop &&
                scrollPosition < aboutRef.current.offsetTop) {
                setActiveSection('benefits');
            } else if (aboutRef.current && scrollPosition >= aboutRef.current.offsetTop) {
                setActiveSection('about');
            } else {
                setActiveSection('');
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Initialize AOS animation library
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // AOS is loaded from CDN in layout.jsx
            if (window.AOS) {
                window.AOS.init({
                    duration: 800,
                    easing: 'ease-out',
                    once: true,
                });
            }
        }
    }, [isClient]); // Only run after client-side hydration

    // If we're rendering on the server or during first client render, return a simplified version
    // This helps avoid hydration mismatch
    if (!isClient) {
        return <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Loading state or simplified initial UI */}
            <div className="flex items-center justify-center h-screen">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold text-green-800 dark:text-green-400">Agrogami</span>
            </div>
        </div>;
    }

    return (
        <div className="min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 dark:text-white transition-colors duration-300">
            {/* Navigation - sticky */}
            <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md border-b border-blue-100 dark:border-gray-700 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center" data-aos="fade-right">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                                <Leaf className="h-6 w-6 text-white" />
                            </div>
                            <span className="ml-3 text-2xl font-bold text-green-800 dark:text-green-400">Agrogami</span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8" data-aos="fade-left">
                            <button
                                onClick={() => scrollToSection(featuresRef, 'features')}
                                className={`${activeSection === 'features' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'} hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer`}
                                suppressHydrationWarning
                            >
                                Features
                            </button>
                            <button
                                onClick={() => scrollToSection(howItWorksRef, 'howItWorks')}
                                className={`${activeSection === 'howItWorks' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'} hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer`}
                                suppressHydrationWarning
                            >
                                How It Works
                            </button>
                            <button
                                onClick={() => scrollToSection(benefitsRef, 'benefits')}
                                className={`${activeSection === 'benefits' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'} hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer`}
                                suppressHydrationWarning
                            >
                                Benefits
                            </button>
                            <button
                                onClick={() => scrollToSection(aboutRef, 'about')}
                                className={`${activeSection === 'about' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'} hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer`}
                                suppressHydrationWarning
                            >
                                About Us
                            </button>

                            {/* Theme toggle button */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                suppressHydrationWarning
                            >
                                {isDarkMode ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </button>

                            <Link
                                href="/farmer-login"
                                className="px-5 py-2 bg-green-600 dark:bg-green-700 text-white font-medium rounded-full hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-md flex items-center"
                            >
                                <User className="mr-2 h-4 w-4" />
                                Login
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center space-x-4">
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                suppressHydrationWarning
                            >
                                {isDarkMode ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </button>

                            <button
                                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 focus:outline-none"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                suppressHydrationWarning
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden pt-4 pb-3 border-t border-blue-100 dark:border-gray-700 mt-2">
                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={() => scrollToSection(featuresRef, 'features')}
                                    className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer py-2"
                                    suppressHydrationWarning
                                >
                                    Features
                                </button>
                                <button
                                    onClick={() => scrollToSection(howItWorksRef, 'howItWorks')}
                                    className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer py-2"
                                    suppressHydrationWarning
                                >
                                    How It Works
                                </button>
                                <button
                                    onClick={() => scrollToSection(benefitsRef, 'benefits')}
                                    className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer py-2"
                                    suppressHydrationWarning
                                >
                                    Benefits
                                </button>
                                <button
                                    onClick={() => scrollToSection(aboutRef, 'about')}
                                    className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer py-2"
                                    suppressHydrationWarning
                                >
                                    About Us
                                </button>
                                <div className="pt-2 flex space-x-3">
                                    <Link
                                        href="/farmer-login"
                                        className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white font-medium rounded-full text-center hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-sm"
                                    >
                                        Farmer Login
                                    </Link>
                                    <Link
                                        href="/bank-login"
                                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-medium rounded-full text-center hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Bank Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b border-blue-200 dark:border-gray-700 transition-colors duration-300">
                <div className="absolute right-0 top-0 -mt-20 -mr-20 w-64 h-64 rounded-full bg-green-300 dark:bg-green-900 opacity-20"></div>
                <div className="absolute left-0 bottom-0 -mb-20 -ml-20 w-80 h-80 rounded-full bg-blue-400 dark:bg-blue-900 opacity-10"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-12 md:mb-0" data-aos="fade-right" data-aos-delay="100">
                            <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-sm font-medium mb-6">
                                Reimagining Rural Finance
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-gray-900 dark:text-white">
                                Smart Credit for <span className="text-green-600 dark:text-green-400 relative">Farmers <span className="absolute bottom-0 left-0 w-full h-1 bg-green-400 dark:bg-green-700 opacity-50"></span></span> Based on Agricultural Potential
                            </h1>
                            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                                Agrogami uses land, soil, weather and crop analytics to create fairer credit assessments for farmers, unlocking financial opportunities beyond traditional credit scores.
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4" data-aos="fade-up" data-aos-delay="200">
                                <Link
                                    href="/farmer-login"
                                    className="px-6 py-3 bg-green-600 dark:bg-green-700 text-white font-medium rounded-full hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-md flex items-center justify-center"
                                >
                                    <CircleUserRound className="mr-2 h-5 w-5" />
                                    Login as Farmer
                                </Link>
                                <Link
                                    href="/bank-login"
                                    className="px-6 py-3 bg-white dark:bg-gray-800 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-medium rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                                >
                                    <Building2 className="mr-2 h-5 w-5" />
                                    Login as Bank Employee
                                </Link>
                            </div>
                        </div>
                        <div className="md:w-1/2 flex justify-center" data-aos="fade-left" data-aos-delay="300">
                            <div className="relative w-full max-w-lg h-80 md:h-96">
                                {/* Background decorative elements */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300 dark:bg-blue-800 rounded-full opacity-10"></div>
                                <div className="absolute top-10 right-10 w-16 h-16 bg-green-400 dark:bg-green-800 rounded-full opacity-20"></div>
                                <div className="absolute bottom-10 left-10 w-24 h-24 bg-green-500 dark:bg-green-900 rounded-full opacity-10"></div>

                                {/* Credit Score Card */}
                                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform rotate-3 border border-blue-200 dark:border-gray-700"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-blue-500 dark:from-green-700 dark:to-blue-800 rounded-2xl shadow-xl">
                                    <div className="p-8 h-full flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-white text-2xl font-bold">Agro-Credit Score</h3>
                                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                                    <Leaf className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="bg-white/20 h-1 w-3/4 rounded-full mb-6"></div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                                    <Map className="h-6 w-6 text-white mb-2" />
                                                    <p className="text-white font-medium">Land Quality</p>
                                                    <div className="w-full bg-white/20 h-1 rounded-full mt-2">
                                                        <div className="bg-white h-1 rounded-full" style={{ width: '85%' }}></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                                    <Cloud className="h-6 w-6 text-white mb-2" />
                                                    <p className="text-white font-medium">Weather Score</p>
                                                    <div className="w-full bg-white/20 h-1 rounded-full mt-2">
                                                        <div className="bg-white h-1 rounded-full" style={{ width: '78%' }}></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                                    <Droplet className="h-6 w-6 text-white mb-2" />
                                                    <p className="text-white font-medium">Soil Health</p>
                                                    <div className="w-full bg-white/20 h-1 rounded-full mt-2">
                                                        <div className="bg-white h-1 rounded-full" style={{ width: '70%' }}></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                                    <Sun className="h-6 w-6 text-white mb-2" />
                                                    <p className="text-white font-medium">Yield Potential</p>
                                                    <div className="w-full bg-white/20 h-1 rounded-full mt-2">
                                                        <div className="bg-white h-1 rounded-full" style={{ width: '92%' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm mt-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white font-medium">Overall Credit Score</span>
                                                <div className="flex items-center">
                                                    <span className="text-white font-bold text-2xl">735</span>
                                                    <span className="text-white/70 ml-1 text-sm">/ 850</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-white/20 h-2 rounded-full mt-3">
                                                <div className="bg-white h-2 rounded-full" style={{ width: '86.5%' }}></div>
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                <span className="text-white/70 text-xs">Excellent</span>
                                                <span className="text-white/70 text-xs">Eligible for ₹2,50,000 loan</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section ref={featuresRef} className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16" data-aos="fade-up">
                        <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium mb-3">
                            Our Approach
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Redefining Agricultural Finance</h2>
                        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                            Agrogami integrates multiple data sources to create a comprehensive view of farming potential
                            beyond traditional credit metrics.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-blue-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" data-aos="zoom-in" data-aos-delay="100">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mb-6">
                                <Map className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">GIS Data Integration</h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                Analyzes land quality, location factors, and geographical advantages to assess actual farming potential.
                            </p>
                            <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                                <span>Learn more</span>
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-blue-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" data-aos="zoom-in" data-aos-delay="200">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mb-6">
                                <Cloud className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Weather Intelligence</h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                Incorporates historical patterns and forecasts to predict yield stability and climate resilience.
                            </p>
                            <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                                <span>Learn more</span>
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-green-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" data-aos="zoom-in" data-aos-delay="300">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mb-6">
                                <Droplet className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Soil Health Metrics</h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                Evaluates soil composition, nutrient levels, and sustainability practices for long-term productivity.
                            </p>
                            <div className="mt-4 flex items-center text-green-600 dark:text-green-400 font-medium">
                                <span>Learn more</span>
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-green-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" data-aos="zoom-in" data-aos-delay="400">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mb-6">
                                <BarChart2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Yield Potential Analysis</h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                Assesses historical yields, farming techniques, and crop selection to project future performance.
                            </p>
                            <div className="mt-4 flex items-center text-green-600 dark:text-green-400 font-medium">
                                <span>Learn more</span>
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section ref={howItWorksRef} className="py-20 bg-blue-50 dark:bg-gray-800 relative transition-colors duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-300 dark:bg-green-900 rounded-full opacity-20 transform -translate-x-1/3 translate-y-1/3"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16" data-aos="fade-up">
                        <div className="inline-block px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium mb-3">
                            Process
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">How Agrogami Works</h2>
                        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                            Our platform creates a bridge between farmers and financial institutions through agricultural intelligence.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting line */}
                        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-2 h-full bg-gradient-to-b from-green-200 to-blue-200 dark:from-green-900 dark:to-blue-900 rounded-full hidden md:block" style={{ zIndex: 0 }}></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg md:transform md:translate-x-12 relative z-10" data-aos="fade-right" data-aos-delay="100">
                                <div className="absolute top-8 right-0 transform translate-x-1/2 w-16 h-16 bg-green-600 dark:bg-green-700 text-white rounded-full font-bold text-xl flex items-center justify-center z-20">1</div>
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mb-4">
                                        <CircleUserRound className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Farmer Registration</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Farmers provide basic information about their farm location and primary crops. Our system then begins collecting environmental data.
                                    </p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl">
                                    <p className="text-green-800 dark:text-green-300 text-sm italic">
                                        "Minimal documentation required - we focus on your land's potential, not paperwork."
                                    </p>
                                </div>
                            </div>

                            <div className="md:h-64"></div>

                            <div className="md:h-64"></div>

                            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg md:transform md:-translate-x-12 relative z-10" data-aos="fade-left" data-aos-delay="200">
                                <div className="absolute top-8 left-0 transform -translate-x-1/2 w-16 h-16 bg-blue-600 dark:bg-blue-700 text-white rounded-full font-bold text-xl flex items-center justify-center z-20">2</div>
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mb-4">
                                        <Map className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Data Collection & Analysis</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Our system automatically gathers GIS data, weather patterns, soil health metrics, and crop history to build a comprehensive profile.
                                    </p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl">
                                    <p className="text-blue-800 dark:text-blue-300 text-sm italic">
                                        "Advanced agricultural data science working behind the scenes."
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg md:transform md:translate-x-12 relative z-10" data-aos="fade-right" data-aos-delay="300">
                                <div className="absolute top-8 right-0 transform translate-x-1/2 w-16 h-16 bg-green-600 dark:bg-green-700 text-white rounded-full font-bold text-xl flex items-center justify-center z-20">3</div>
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mb-4">
                                        <BarChart2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Credit Score Generation</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Our AI analyzes traditional financial metrics alongside agricultural factors to create a holistic credit score that reflects true potential.
                                    </p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl">
                                    <p className="text-green-800 dark:text-green-300 text-sm italic">
                                        "Your farm's potential becomes visible to lenders through our scoring system."
                                    </p>
                                </div>
                            </div>

                            <div className="md:h-64"></div>

                            <div className="md:h-64"></div>

                            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg md:transform md:-translate-x-12 relative z-10" data-aos="fade-left" data-aos-delay="400">
                                <div className="absolute top-8 left-0 transform -translate-x-1/2 w-16 h-16 bg-blue-600 dark:bg-blue-700 text-white rounded-full font-bold text-xl flex items-center justify-center z-20">4</div>
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mb-4">
                                        <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tailored Financial Solutions</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Financial institutions receive detailed assessments enabling them to offer customized loan products that match with seasonal cash flows.
                                    </p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl">
                                    <p className="text-blue-800 dark:text-blue-300 text-sm italic">
                                        "Loans designed for farmers, respecting the natural cycles of agriculture."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section ref={benefitsRef} className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16" data-aos="fade-up">
                        <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium mb-3">
                            Advantages
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Benefits for All Stakeholders</h2>
                        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                            Agrogami creates value across the agricultural financing ecosystem.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-green-100 dark:border-gray-700 shadow-lg relative overflow-hidden" data-aos="fade-right" data-aos-delay="200">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 dark:bg-green-900 rounded-full opacity-20 transform translate-x-1/3 -translate-y-1/3"></div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mr-4">
                                    <CircleUserRound className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                For Farmers
                            </h3>

                            <ul className="space-y-5 relative z-10">
                                <li className="flex" data-aos="fade-up" data-aos-delay="250">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mr-3">
                                        <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">Fair Credit Assessment</span>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">Access to credit based on your farm's actual potential rather than just financial history</p>
                                    </div>
                                </li>

                                <li className="flex" data-aos="fade-up" data-aos-delay="300">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mr-3">
                                        <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">Seasonal-Friendly Repayment</span>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">Loan structures that align with your harvest cycles and seasonal cash flow patterns</p>
                                    </div>
                                </li>

                                <li className="flex" data-aos="fade-up" data-aos-delay="350">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mr-3">
                                        <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">Minimal Documentation</span>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">Simplified application process that focuses on your farm rather than extensive paperwork</p>
                                    </div>
                                </li>

                                <li className="flex" data-aos="fade-up" data-aos-delay="400">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mr-3">
                                        <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">Agricultural Insights</span>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">Gain valuable data about your land quality, soil health, and potential improvements</p>
                                    </div>
                                </li>
                            </ul>

                            <div className="mt-8 text-center">
                                <Link
                                    href="/farmer-signup"
                                    className="inline-block px-6 py-3 bg-green-600 dark:bg-green-700 text-white font-medium rounded-full hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-md"
                                >
                                    Sign Up as a Farmer
                                </Link>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg relative overflow-hidden" data-aos="fade-left" data-aos-delay="200">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 transform -translate-x-1/3 -translate-y-1/3"></div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mr-4">
                                    <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                For Financial Institutions
                            </h3>

                            <ul className="space-y-5 relative z-10">
                                <li className="flex" data-aos="fade-up" data-aos-delay="250">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                                        <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">Superior Risk Assessment</span>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">Make lending decisions based on comprehensive agricultural data and true repayment potential</p>
                                    </div>
                                </li>

                                <li className="flex" data-aos="fade-up" data-aos-delay="300">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                                        <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">Reduced Default Rates</span>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">Improve portfolio performance with loans matched to actual farming potential and cash flows</p>
                                    </div>
                                </li>

                                <li className="flex" data-aos="fade-up" data-aos-delay="350">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                                        <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">Rural Market Expansion</span>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">Confidently serve underbanked rural populations with data-backed lending decisions</p>
                                    </div>
                                </li>

                                <li className="flex" data-aos="fade-up" data-aos-delay="400">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                                        <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">ESG Compliance</span>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">Support sustainable agriculture while meeting regulatory requirements for inclusive lending</p>
                                    </div>
                                </li>
                            </ul>

                            <div className="mt-8 text-center">
                                <Link
                                    href="/bank-signup"
                                    className="inline-block px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md"
                                >
                                    Partner with Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Indicators */}
            <section className="py-16 bg-blue-50 dark:bg-gray-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm text-center" data-aos="fade-up" data-aos-delay="100">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">10,000+</h3>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">Farmers Empowered</p>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">Across 150 villages in 8 states</p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm text-center" data-aos="fade-up" data-aos-delay="200">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">100%</h3>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">Regulatory Compliant</p>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">Adhering to RBI and NABARD guidelines</p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm text-center" data-aos="fade-up" data-aos-delay="300">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">30%</h3>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">Increased Credit Access</p>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">Average improvement in loan eligibility</p>
                        </div>
                    </div>
                </div>
            </section>
            {/* CTA Section */}
            <section className="relative py-20 overflow-hidden transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-700 dark:from-green-900 dark:to-blue-900"></div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full opacity-10 transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full opacity-10 transform -translate-x-1/3 translate-y-1/3"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="bg-white/10 backdrop-blur-sm p-12 rounded-3xl border border-white/20">
                        <div className="text-center" data-aos="fade-up">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Agricultural Finance?</h2>
                            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                                Join Agrogami today and be part of the movement towards fair and sustainable farm financing.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6" data-aos="fade-up" data-aos-delay="200">
                                <Link
                                    href="/farmer-signup"
                                    className="px-8 py-4 bg-white text-green-600 dark:text-green-700 font-medium rounded-full hover:bg-green-50 transition-colors shadow-md"
                                >
                                    Join as a Farmer
                                </Link>
                                <Link
                                    href="/bank-signup"
                                    className="px-8 py-4 bg-blue-800 dark:bg-blue-900 text-white font-medium rounded-full hover:bg-blue-900 dark:hover:bg-blue-800 transition-colors shadow-md border border-white/20"
                                >
                                    Partner as a Bank
                                </Link>
                            </div>
                            <p className="text-white/80 mt-6">No obligation. Start with a free account and explore the platform.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section ref={aboutRef} className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16" data-aos="fade-up">
                        <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium mb-3">
                            Our Story
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">About Us</h2>
                        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                            We're on a mission to revolutionize agricultural financing by bridging technology and farming traditions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-sm" data-aos="fade-right" data-aos-delay="200">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Agrogami was founded by a team of innovators who recognized the gap between traditional credit assessment methods and the unique realities of farming.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Our platform combines cutting-edge technology with deep agricultural knowledge to create a more inclusive financial ecosystem that recognizes the true value and potential of farmers' work.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                By bridging the information gap between farmers and financial institutions, we're working to ensure that every farmer has access to the capital they need to thrive, regardless of their formal credit history.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-green-100 dark:border-gray-700 shadow-sm" data-aos="fade-left" data-aos-delay="200">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                We envision a future where every farmer has fair access to financial resources based on their true potential rather than just documentation and historical records.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                We believe that by properly valuing agricultural assets, skills, and environmental factors, we can unlock rural prosperity and support sustainable farming practices across India.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                Agrogami aims to be the bridge between traditional banking and modern agricultural science, creating opportunities for millions of farmers to access appropriate financial services.
                            </p>
                        </div>
                    </div>

                    {/* Hackathon Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-sm mb-16 relative overflow-hidden" data-aos="fade-up" data-aos-delay="300">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 dark:bg-blue-900 rounded-full opacity-30 transform translate-x-1/3 -translate-y-1/3"></div>

                        <div className="flex flex-col md:flex-row items-center justify-between mb-6 relative z-10">
                            <div>
                                <div className="flex items-center">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ingenium 6.0</h3>
                                    <span className="ml-4 px-4 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded-full text-sm font-medium">Hackathon Project</span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mt-1">A hackathon organised by Ahmedabad University</p>
                            </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 relative z-10">
                            Agrogami was developed as a solution for the Alternative Credit Evaluation Tool challenge, addressing the unique needs of farmers who are often underserved by traditional credit scoring systems.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 relative z-10">
                            Our team combined expertise in agricultural science, data analytics, and financial technology to create a platform that can transform how rural credit is assessed and distributed.
                        </p>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-sm" data-aos="fade-up" data-aos-delay="400">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Our Team</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                            <div className="flex flex-col items-center text-center" data-aos="fade-up" data-aos-delay="100">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-600 dark:from-green-600 dark:to-blue-800 rounded-xl flex items-center justify-center text-white mb-4 shadow-md">
                                    <span className="text-2xl font-bold">{`CP`}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Chinmay Patel</h4>
                                <p className="text-green-600 dark:text-green-400 font-medium">Team Lead</p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Agricultural Data Science</p>
                            </div>

                            <div className="flex flex-col items-center text-center" data-aos="fade-up" data-aos-delay="200">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-600 dark:from-green-600 dark:to-blue-800 rounded-xl flex items-center justify-center text-white mb-4 shadow-md">
                                    <span className="text-2xl font-bold">{`MG`}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Maitry Gajjar</h4>
                                <p className="text-blue-600 dark:text-blue-400 font-medium">Financial Technology</p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Backend Developer</p>
                            </div>

                            <div className="flex flex-col items-center text-center" data-aos="fade-up" data-aos-delay="300">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-600 dark:from-green-600 dark:to-blue-800 rounded-xl flex items-center justify-center text-white mb-4 shadow-md">
                                    <span className="text-2xl font-bold">{`PJ`}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Prem Joshi</h4>
                                <p className="text-green-600 dark:text-green-400 font-medium">Machine Learning</p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Data Scientist</p>
                            </div>

                            <div className="flex flex-col items-center text-center" data-aos="fade-up" data-aos-delay="400">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-600 dark:from-green-600 dark:to-blue-800 rounded-xl flex items-center justify-center text-white mb-4 shadow-md">
                                    <span className="text-2xl font-bold">{`DM`}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Dev Mehta</h4>
                                <p className="text-blue-600 dark:text-blue-400 font-medium">GIS & Spatial Analysis</p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Data Engineer</p>
                            </div>

                            <div className="flex flex-col items-center text-center" data-aos="fade-up" data-aos-delay="500">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-600 dark:from-green-600 dark:to-blue-800 rounded-xl flex items-center justify-center text-white mb-4 shadow-md">
                                    <span className="text-2xl font-bold">{`NS`}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Niket Shah</h4>
                                <p className="text-green-600 dark:text-green-400 font-medium">UI/UX Design</p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Frontend Developer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Footer */}
            <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16 transition-colors duration-300" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                        <div data-aos="fade-right">
                            <div className="flex items-center mb-6">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                                    <Leaf className="h-6 w-6 text-white" />
                                </div>
                                <span className="ml-3 text-2xl font-bold text-white">Agrogami</span>
                            </div>
                            <p className="text-gray-400 mb-6">
                                Reimagining rural credit for a sustainable future through agricultural intelligence.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-colors">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-colors">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-colors">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-colors">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                </a>
                            </div>
                        </div>

                        <div data-aos="fade-up">
                            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                            <ul className="space-y-3">
                                <li>
                                    <button
                                        onClick={() => scrollToSection(featuresRef, 'features')}
                                        className="text-gray-400 hover:text-green-500 transition-colors cursor-pointer"
                                        suppressHydrationWarning
                                    >
                                        Features
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => scrollToSection(howItWorksRef, 'howItWorks')}
                                        className="text-gray-400 hover:text-green-500 transition-colors cursor-pointer"
                                        suppressHydrationWarning
                                    >
                                        How It Works
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => scrollToSection(benefitsRef, 'benefits')}
                                        className="text-gray-400 hover:text-green-500 transition-colors cursor-pointer"
                                        suppressHydrationWarning
                                    >
                                        Benefits
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => scrollToSection(aboutRef, 'about')}
                                        className="text-gray-400 hover:text-green-500 transition-colors cursor-pointer"
                                        suppressHydrationWarning
                                    >
                                        About Us
                                    </button>
                                </li>
                                <li>
                                    <Link href="/blog" className="text-gray-400 hover:text-green-500 transition-colors">
                                        Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/careers" className="text-gray-400 hover:text-green-500 transition-colors">
                                        Careers
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div data-aos="fade-left">
                            <h4 className="text-lg font-bold mb-6">Contact Us</h4>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 w-5 h-5 text-green-500 mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <span className="ml-3 text-gray-400">
                                        Ahmedabad University<br />
                                        GICT Building, Central Campus<br />
                                        Navrangpura, Ahmedabad 380009
                                    </span>
                                </li>
                                <li className="flex items-center">
                                    <div className="flex-shrink-0 w-5 h-5 text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <a href="mailto:contact@agrogami.in" className="ml-3 text-gray-400 hover:text-green-500 transition-colors">
                                        contact@agrogami.in
                                    </a>
                                </li>
                                <li className="flex items-center">
                                    <div className="flex-shrink-0 w-5 h-5 text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <a href="tel:+911234567890" className="ml-3 text-gray-400 hover:text-green-500 transition-colors">
                                        +91 123 456 7890
                                    </a>
                                </li>
                            </ul>

                            <div className="mt-8">
                                <h5 className="font-medium text-gray-300 mb-4">Subscribe to our newsletter</h5>
                                <div className="flex">
                                    <input
                                        type="email"
                                        placeholder="Your email"
                                        className="px-4 py-2 bg-gray-800 dark:bg-gray-950 text-gray-300 rounded-l-full w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                        suppressHydrationWarning
                                    />
                                    <button
                                        className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-r-full hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                                        suppressHydrationWarning
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 mt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-500">
                            <p>© {new Date().getFullYear()} Agrogami. All rights reserved.</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-6">
                            <Link href="/privacy" className="text-gray-500 hover:text-green-500 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-gray-500 hover:text-green-500 transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="/contact" className="text-gray-500 hover:text-green-500 transition-colors">
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}