'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, setAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ClipboardList, Target, Award, Star, Eye } from 'lucide-react';

export default function MyTestsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/sign-in?redirect=/profile/my-tests');
            return;
        }
        const load = async () => {
            try {
                const data = await dataService.getMyTests();
                setAttempts(data);
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
                        <ClipboardList className="text-white" size={24} />
                    </div>
                    <h1 className="text-white text-xl font-black tracking-tight uppercase">TEST ATTEMPTS</h1>
                    <p className="text-violet-200 text-[10px] font-black tracking-[0.2em] mt-1">YOUR QUIZ PERFORMANCE HISTORY</p>
                </div>
            </div>

            <div className="px-5 -mt-6 relative z-20 space-y-4">
                {attempts.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-white flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-3xl bg-violet-50 flex items-center justify-center mb-5">
                            <Target size={32} className="text-violet-400" />
                        </div>
                        <p className="font-black text-gray-800 text-base uppercase tracking-tight">Zero Attempts Found</p>
                        <p className="text-gray-500 text-xs mt-2 leading-relaxed font-semibold">You haven't attempted any quizzes yet. Challenge yourself today!</p>
                        <button onClick={() => router.push('/tests')} className="mt-8 bg-violet-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-violet-200 tracking-wider">
                            VIEW ALL QUIZZES
                        </button>
                    </div>
                ) : attempts.map((attempt: any, i: number) => {
                    const pct = attempt.totalMarks > 0 ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0;
                    const passed = pct >= 60;
                    return (
                        <div key={attempt._id || i} className="bg-white rounded-[1.75rem] p-4 shadow-lg border border-white card-hover">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Star size={12} className={passed ? 'text-amber-500 fill-amber-500' : 'text-gray-300'} />
                                        <p className="font-black text-gray-800 text-xs uppercase tracking-tight line-clamp-1">{attempt.testTitle || attempt.quiz?.title || 'Quiz'}</p>
                                    </div>
                                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1">
                                        {attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                    </p>
                                </div>
                                <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${passed ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                                    {passed ? <Award size={10} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                                    <span className="text-[9px] font-black uppercase tracking-widest">{passed ? 'Passed' : 'Needed Work'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                                <div className="flex flex-col items-center shrink-0 min-w-[50px]">
                                    <p className="text-xl font-black text-violet-700 leading-none">{attempt.score.toFixed(2)}<span className="text-[10px] text-gray-300 ml-0.5">/{attempt.totalMarks || '?'}</span></p>
                                    <p className="text-[8px] text-gray-400 font-black uppercase mt-1 tracking-tighter">SCORE</p>
                                </div>

                                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                                    <div className={`h-full rounded-full transition-all duration-700 ${passed ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-rose-400 to-orange-400'}`} style={{ width: `${pct}%` }} />
                                </div>

                                <div className="text-right">
                                    <p className={`text-sm font-black ${passed ? 'text-emerald-600' : 'text-rose-500'}`}>{pct}%</p>
                                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">GRADE</p>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push(`/profile/my-tests/${attempt._id}`)}
                                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-violet-50 text-violet-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all group"
                            >
                                <Eye size={14} className="group-hover:scale-110 transition-transform" />
                                REVIEW ATTEMPT
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
