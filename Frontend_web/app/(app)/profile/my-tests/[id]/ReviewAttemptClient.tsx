'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, setAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trophy, Award, Star, ShieldCheck, CheckCircle2, XCircle, CircleHelp, Clock, Target } from 'lucide-react';

export default function ReviewAttemptClient({ id }: { id: string }) {
    const { user, loading: authLoading } = useAuth();
    const [attempt, setAttempt] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push(`/sign-in?redirect=/profile/my-tests/${id}`);
            return;
        }
        const load = async () => {
            try {
                const data = await dataService.getAttemptById(id);
                setAttempt(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, authLoading, user, router]);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center h-screen bg-gray-50">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!attempt || !attempt.test) return (
        <div className="flex-1 flex flex-col items-center justify-center h-screen bg-gray-50 p-10 text-center">
            <CircleHelp size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest">Attempt details not found.</p>
            <button onClick={() => router.back()} className="mt-6 text-violet-600 font-bold text-sm">Go Back</button>
        </div>
    );

    const test = attempt.test;
    const userAnswers = attempt.answers || [];
    const pct = Math.round(((attempt.score || 0) / (attempt.totalMarks || 1)) * 100);
    const passed = pct >= 60;

    return (
        <div className="flex flex-col min-h-screen bg-white pb-20">
            {/* Header */}
            <div className={`grad-header pb-24 pt-16 relative overflow-hidden ${passed ? 'from-emerald-500 to-teal-600' : 'from-rose-500 to-orange-600'}`}>
                <button onClick={() => router.back()} className="absolute top-6 left-5 flex items-center gap-1 text-white/80 hover:text-white transition-all z-30">
                    <ChevronLeft size={20} /> <span className="text-sm font-bold uppercase transition-all">Back</span>
                </button>

                <div className="flex flex-col items-center relative z-10">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl mb-4 animate-in zoom-in duration-500">
                        {passed ? (
                            <Award size={40} className="text-emerald-500" strokeWidth={2.5} />
                        ) : (
                            <Star size={40} className="text-rose-500" strokeWidth={2.5} />
                        )}
                    </div>
                    <h1 className="text-white text-2xl font-black tracking-tight uppercase leading-tight text-center px-6">
                        {test.title}
                    </h1>
                    <p className="text-white/70 text-[9px] font-black tracking-[0.3em] mt-2 uppercase">
                        Attempt Review • {new Date(attempt.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="px-6 -mt-12 relative z-20 space-y-6">
                {/* Score Summary */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-50">
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-left">
                            <p className="text-[40px] font-black text-gray-800 leading-none">{pct}%</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Accuracy</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-gray-800 leading-none">{attempt.score}<span className="text-sm text-gray-300 ml-1">/{attempt.totalMarks}</span></p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Total Score</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center">
                            <Clock size={16} className="text-violet-400 mb-1" />
                            <p className="text-sm font-black text-gray-700">{Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s</p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase">Time Taken</p>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center">
                            <ShieldCheck size={16} className="text-emerald-400 mb-1" />
                            <p className="text-sm font-black text-gray-700">{passed ? 'PASSED' : 'RETRY'}</p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase">Status</p>
                        </div>
                    </div>
                </div>

                {/* Questions Review */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] pl-2 mb-2">Detailed Analysis</h3>

                    {test.questions.map((q: any, i: number) => {
                        const userAnswerEntry = userAnswers.find((ua: any) => ua.questionId === q._id);
                        const selectedIdx = userAnswerEntry ? userAnswerEntry.selectedOption : null;
                        const isSkipped = selectedIdx === null || selectedIdx === undefined;
                        const isCorrect = !isSkipped && (selectedIdx === q.correctOption);

                        return (
                            <div key={q._id} className={`bg-white rounded-[2rem] p-6 shadow-xl border-2 transition-all ${isSkipped ? 'border-slate-100' : isCorrect ? 'border-emerald-100 bg-emerald-50/20' : 'border-rose-100 bg-rose-50/20'}`}>
                                <div className="flex items-start gap-4 mb-5">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSkipped ? 'bg-slate-100 text-slate-400' : isCorrect ? 'bg-emerald-100 text-emerald-500' : 'bg-rose-100 text-rose-500'}`}>
                                        {isSkipped ? <CircleHelp size={16} /> : isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-gray-800 leading-snug">
                                            {i + 1}. {q.text}
                                        </p>
                                        {isSkipped && (
                                            <span className="inline-block mt-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-[8px] font-black uppercase tracking-widest rounded-md">
                                                NOT ANSWERED
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    {q.options.map((opt: string, optIdx: number) => {
                                        const isThisCorrect = optIdx === q.correctOption;
                                        const isThisSelected = optIdx === selectedIdx;

                                        let style = "bg-gray-50 border-gray-100 text-gray-500";
                                        if (isThisCorrect) style = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-sm";
                                        else if (isThisSelected && !isCorrect) style = "bg-rose-50 border-rose-400 text-rose-900 font-bold opacity-80";

                                        return (
                                            <div key={optIdx} className={`px-4 py-3.5 rounded-2xl border-2 transition-all duration-300 text-xs flex justify-between items-center ${style}`}>
                                                <span>{opt}</span>
                                                {isThisCorrect && <CheckCircle2 size={14} className="text-emerald-500" />}
                                                {isThisSelected && !isCorrect && <XCircle size={14} className="text-rose-500" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="pt-6 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
                        <Target size={24} className="text-violet-300" />
                    </div>
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em]">Review Completed</p>
                </div>
            </div>
        </div>
    );
}
