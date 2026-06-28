'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Phone, MapPin, Calendar, Hash, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function SignInPage() {
    const { isLoggedIn, login, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/dashboard';

    const [form, setForm] = useState({
        mobile: '',
        name: '',
        age: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && isLoggedIn) {
            router.push(redirectUrl);
        }
    }, [isLoggedIn, loading, router, redirectUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const normalizedMobile = form.mobile.replace(/\D/g, '');
        if (normalizedMobile.length !== 10) {
            return setError('Please enter a valid 10-digit mobile number.');
        }

        if (!form.name.trim()) {
            return setError('Please enter your full name.');
        }

        setIsProcessing(true);
        try {
            await login({
                ...form,
                mobile: normalizedMobile,
                name: form.name.trim()
            });
            router.push(redirectUrl);
        } catch (err: any) {
            console.error('Sign-in Error:', err);
            setError(err.message || 'Failed to sign in. Please check your network and try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
            {/* Left side styling - Brand Graphic */}
            <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[100px]"></div>
                </div>
                <div className="relative z-10 flex flex-col items-center max-w-md text-center">
                    <div className="w-32 h-32 relative mb-8 rounded-full bg-white/10 p-4 ring-1 ring-white/30 backdrop-blur-sm">
                        <Image src="/logo.png" alt="Logo" fill sizes="128px" className="object-contain p-2" priority />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Physical Education <br />with Ravina</h1>
                    <p className="text-indigo-100 text-lg">Enter your details to access premium courses, interactive tests, and track your progress instantly.</p>
                </div>
            </div>

            {/* Right side styling - Sign In / Details Form */}
            <div className="flex flex-col justify-center p-6 sm:p-10 md:p-12 lg:p-16 w-full max-w-xl mx-auto md:max-w-none">
                <div className="flex flex-col items-start w-full">
                    <div className="w-12 h-12 relative mb-6 rounded-lg bg-indigo-600 md:hidden overflow-hidden">
                        <Image src="/logo.png" alt="Logo" fill sizes="48px" className="object-cover" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Welcome to the Platform</h2>
                    <p className="text-slate-500 mb-6 font-medium">Please enter your details to continue.</p>

                    {error && (
                        <div className="w-full bg-red-50 text-red-600 text-sm py-3 px-4 rounded-xl border border-red-100 mb-6 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        {/* Mobile Number & Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="mobile" className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Mobile Number</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400 font-bold">+91</span>
                                    <input
                                        id="mobile"
                                        type="tel"
                                        placeholder="9876543210"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-bold outline-none"
                                        value={form.mobile}
                                        onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
                                        maxLength={10}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Full Name</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400"><User size={18} /></span>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Enter your name"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-bold outline-none"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Age & Pincode */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="age" className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Age</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400"><Calendar size={18} /></span>
                                    <input
                                        id="age"
                                        type="number"
                                        placeholder="Age"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-bold outline-none"
                                        value={form.age}
                                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="pincode" className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Pincode</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400"><Hash size={18} /></span>
                                    <input
                                        id="pincode"
                                        type="text"
                                        placeholder="Pincode"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-bold outline-none"
                                        value={form.pincode}
                                        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* City & State */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="city" className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">City</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400"><MapPin size={18} /></span>
                                    <input
                                        id="city"
                                        type="text"
                                        placeholder="City"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-bold outline-none"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="state" className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">State</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400"><MapPin size={18} /></span>
                                    <input
                                        id="state"
                                        type="text"
                                        placeholder="State"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-bold outline-none"
                                        value={form.state}
                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isProcessing || form.mobile.length < 10 || !form.name}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center uppercase tracking-wider text-sm mt-2"
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </span>
                            ) : 'Start Learning'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
