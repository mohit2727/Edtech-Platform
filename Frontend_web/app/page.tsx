'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
    const { isLoggedIn, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && isLoggedIn) {
            router.push('/dashboard');
        }
    }, [isLoggedIn, loading, router]);

    if (loading) return null;

    return (
        <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 relative overflow-hidden">
            {/* Animated gradient blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600 rounded-full blur-[140px] opacity-30 pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] bg-indigo-500 rounded-full blur-[140px] opacity-25 pointer-events-none" />
            <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-purple-400 rounded-full blur-[100px] opacity-20 pointer-events-none" />

            {/* Announcement Banner */}
            <div className="relative z-10 w-full bg-gradient-to-r from-violet-500/40 to-indigo-500/40 backdrop-blur-sm border-b border-white/10 py-2.5 px-4 text-center">
                <p className="text-white/90 text-xs font-bold uppercase tracking-widest">
                    🎓 Learn Physical Education with Expert Guidance — Enroll Today!
                </p>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                <div className="flex flex-col items-center text-center max-w-sm w-full gap-8">
                    {/* Logo */}
                    <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 ring-2 ring-white/20">
                        <Image
                            src="/logo.png"
                            alt="Physical Education with Ravina"
                            width={112}
                            height={112}
                            className="w-full h-full object-cover"
                            priority
                        />
                    </div>

                    {/* Text */}
                    <div className="space-y-3">
                        <h1 className="text-4xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                            Physical Education
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300">
                                with Ravina
                            </span>
                        </h1>
                        <p className="text-white/60 text-base font-medium leading-relaxed max-w-xs mx-auto">
                            Learn, practice, and excel with interactive courses and quizzes.
                        </p>
                    </div>

                    {/* Get Started Button */}
                    <Link
                        href="/dashboard"
                        className="w-full bg-white hover:bg-violet-50 text-violet-700 font-black text-sm uppercase tracking-widest py-4 px-8 rounded-2xl shadow-2xl shadow-black/30 transition-all hover:-translate-y-0.5 active:scale-95 text-center"
                    >
                        Get Started
                    </Link>

                    <p className="text-white/30 text-xs font-medium">
                        © {new Date().getFullYear()} Physical Education with Ravina
                    </p>
                </div>
            </div>
        </div>
    );
}
