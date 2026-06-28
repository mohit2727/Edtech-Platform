'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, setAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ChevronLeft, BookOpen, Play, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function EnrolledVideosPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/sign-in?redirect=/profile/enrolled');
            return;
        }
        const load = async () => {
            try {
                const data = await dataService.getMyCourses();
                setCourses(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [authLoading, user, router]);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center h-screen bg-gray-50">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="flex flex-col min-h-full bg-gray-50 pb-10">
            {/* Gradient Header */}
            <div className="grad-header pb-12 pt-16">
                <button onClick={() => router.back()} className="absolute top-6 left-5 flex items-center gap-1 text-violet-200 hover:text-white transition-all">
                    <ChevronLeft size={20} /> <span className="text-sm font-bold uppercase">Back</span>
                </button>
                <div className="text-center relative z-10 px-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <BookOpen className="text-white" size={24} />
                    </div>
                    <h1 className="text-white text-xl font-black tracking-tight uppercase">ENROLLED VIDEOS</h1>
                    <p className="text-violet-200 text-[10px] font-black tracking-[0.2em] mt-1">YOUR PREMIUM LEARNING LIBRARY</p>
                </div>
            </div>

            <div className="px-5 -mt-6 relative z-20 space-y-4">
                {courses.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-white flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-3xl bg-violet-50 flex items-center justify-center mb-5">
                            <Sparkles size={32} className="text-violet-400" />
                        </div>
                        <p className="font-black text-gray-800 text-base uppercase tracking-tight">Library is Empty</p>
                        <p className="text-gray-500 text-xs mt-2 leading-relaxed font-semibold">You haven't enrolled in any courses yet. Start your journey today!</p>
                        <button onClick={() => router.push('/videos')} className="mt-8 bg-violet-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-violet-200 tracking-wider">
                            BROWSE VIDEOS
                        </button>
                    </div>
                ) : courses.map((course: any, i: number) => (
                    <Link key={course._id || i} href={`/videos/${course._id}`}
                        className="block bg-white rounded-[2rem] overflow-hidden shadow-xl border border-white card-hover relative group">
                        <div className="h-28 relative">
                            {course.image
                                ? <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                : <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center"><BookOpen size={40} className="text-white/20" /></div>
                            }
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute top-3 right-4">
                                <div className="bg-emerald-500 p-1.5 rounded-full shadow-lg shadow-emerald-200/50">
                                    <ShieldCheck size={14} className="text-white" strokeWidth={3} />
                                </div>
                            </div>
                            <div className="absolute bottom-3 left-4">
                                <div className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1.5">
                                    <Play size={10} className="text-white" fill="white" />
                                    <span className="text-white text-[9px] font-black uppercase tracking-widest">{course.lessons?.length || 0} VIDEOS</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 flex items-center justify-between">
                            <div className="flex-1">
                                <p className="font-black text-gray-800 text-sm tracking-tight uppercase group-hover:text-violet-600 transition-colors">{course.title}</p>
                                <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.1em] mt-1 italic">Exclusive Content</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-violet-50 group-hover:text-violet-600 transition-all">
                                <span className="font-black text-xl leading-none -mt-0.5">›</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
