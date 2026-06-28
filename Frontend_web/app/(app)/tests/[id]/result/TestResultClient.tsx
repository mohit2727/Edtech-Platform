'use client';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, setAuthToken } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trophy, Home, RotateCcw, Award, Star, ShieldCheck, CheckCircle2, XCircle, CircleHelp } from 'lucide-react';

function TestResultContent({ id }: { id: string }) {
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const [result, setResult] = useState<any>(null);
    const [test, setTest] = useState<any>(null);
    const [userAnswers, setUserAnswers] = useState<any[]>([]);
    const scoreParam = searchParams.get('score');
    const totalParam = searchParams.get('total');

    // If we have params, we don't need to block the initial render with a loading spinner
    const [loading, setLoading] = useState(scoreParam === null || totalParam === null);
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push(`/sign-in?redirect=/tests/${id}/result`);
            return;
        }

        if (scoreParam !== null && totalParam !== null) {
            setResult({
                score: Number(scoreParam),
                totalMarks: Number(totalParam)
            });
        }

        const loadContent = async () => {
            try {
                // 1. Fetch test details to know the correct answers
                const testData = await dataService.getTestById(id);
                setTest(testData);

                // 2. Load user's selected answers from session storage
                const storedAnswers = sessionStorage.getItem(`test_answers_${id}`);
                if (storedAnswers) {
                    setUserAnswers(JSON.parse(storedAnswers));
                }

                // 3. If no query params exist, try to grab the attempt from the backend
                if (scoreParam === null || totalParam === null) {
                    const attempts = await dataService.getMyTests();
                    const latestAttempt = attempts.find((a: any) => a.testId === id || a.quiz?._id === id);
                    if (latestAttempt) setResult(latestAttempt);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [id, authLoading, user, searchParams, scoreParam, totalParam, router]);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center h-screen bg-gray-50">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const totalQuestions = test?.questions?.length || 0;
    const backendTotal = result?.totalMarks || 0;
    const displayedTotal = backendTotal > 0 ? backendTotal : (totalQuestions > 0 ? totalQuestions : 1);
    const pct = Math.round(((result?.score || 0) / displayedTotal) * 100);
    const passed = pct >= 60;

    return (
        <div className="flex flex-col min-h-screen bg-white">

            {/* Celebration Header */}
            <div className={`grad-header pb-24 pt-20 relative overflow-hidden transition-all duration-1000 ${passed ? 'from-emerald-500 to-teal-600' : 'from-rose-500 to-orange-600'}`}>
                {/* Animated BG elements */}
                <div className="absolute top-0 right-0 p-10 opacity-20"><Trophy size={200} className="text-white rotate-12" /></div>

                <div className="flex flex-col items-center relative z-10">
                    <div className="relative mb-6">
                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl animate-bounce">
                            {passed ? (
                                <Award size={48} className="text-emerald-500" strokeWidth={2.5} />
                            ) : (
                                <Star size={48} className="text-rose-500" strokeWidth={2.5} />
                            )}
                        </div>
                        {passed && (
                            <div className="absolute -top-3 -right-3 bg-yellow-400 p-2 rounded-full border-4 border-white shadow-lg">
                                <Trophy size={16} className="text-white" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-white text-3xl font-black tracking-tight uppercase">
                        {passed ? 'WELL DONE!' : 'KEEP TRYING!'}
                    </h1>
                    <p className="text-white/80 text-[10px] font-black tracking-[0.3em] mt-1 italic">
                        {passed ? 'YOU HAVE PASSED THE TEST' : 'YOU NEED MORE PRACTICE'}
                    </p>
                </div>
            </div>

            <div className="px-6 -mt-16 pb-12 relative z-20">
                {/* Score Board Card */}
                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-50 flex flex-col items-center text-center">
                    <span className="text-[10px] text-gray-300 font-extrabold uppercase tracking-[0.4em] mb-4">Final Grade</span>

                    <div className="relative mb-8">
                        <svg className="w-40 h-40 transform -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-50" />
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                                className={passed ? 'text-emerald-500' : 'text-rose-500'}
                                strokeDasharray={440}
                                strokeDashoffset={440 - (440 * pct) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-black text-gray-800 leading-none">{pct}%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100">
                            <p className="text-2xl font-black text-gray-800">{result?.score || 0}</p>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Gained Marks</p>
                        </div>
                        <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100">
                            <p className="text-2xl font-black text-gray-800">{result?.totalMarks || 0}</p>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Total Marks</p>
                        </div>
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-2 bg-emerald-50 px-6 py-2.5 rounded-full border border-emerald-100">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <p className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest">RECORDED IN LEADERBOARD</p>
                    </div>
                </div>

                {/* Answers Review Section */}
                {test && test.questions && userAnswers.length > 0 && (
                    <div className="mt-8 bg-white rounded-[3rem] p-8 shadow-2xl border border-gray-50 flex flex-col">
                        <span className="text-[10px] text-gray-300 font-extrabold uppercase tracking-[0.4em] mb-6 text-center">Quiz Review</span>

                        <div className="space-y-6">
                            {test.questions.map((q: any, i: number) => {
                                const userAnswerEntry = userAnswers.find(ua => ua.questionId === q._id);
                                const selectedIdx = userAnswerEntry ? userAnswerEntry.selectedOption : null;
                                const isSkipped = selectedIdx === null || selectedIdx === undefined;
                                const isCorrect = !isSkipped && (selectedIdx === q.correctOption);

                                return (
                                    <div key={q._id} className={`p-5 rounded-3xl border-2 ${isSkipped ? 'border-slate-100 bg-slate-50/50' : isCorrect ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="mt-0.5">
                                                {isSkipped ? (
                                                    <CircleHelp size={20} className="text-slate-400" />
                                                ) : isCorrect ? (
                                                    <CheckCircle2 size={20} className="text-emerald-500" />
                                                ) : (
                                                    <XCircle size={20} className="text-rose-500" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-800 leading-tight">
                                                    {i + 1}. {q.text || q.question}
                                                </p>
                                                {isSkipped && (
                                                    <span className="inline-block mt-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-md">
                                                        Question Skipped
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2 pl-8">
                                            {q.options.map((opt: string, optIdx: number) => {
                                                const isThisCorrect = optIdx === q.correctOption;
                                                const isThisSelected = optIdx === selectedIdx;

                                                let style = "bg-white border-gray-100 text-gray-500";
                                                if (isThisCorrect) style = "bg-emerald-100 border-emerald-500 text-emerald-800 font-bold";
                                                else if (isThisSelected && !isCorrect) style = "bg-rose-100 border-rose-500 text-rose-800 font-bold line-through opacity-70";
                                                else if (isSkipped) style = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";

                                                return (
                                                    <div key={optIdx} className={`px-4 py-3 rounded-2xl border ${style} flex justify-between items-center`}>
                                                        <span className="text-xs">{opt}</span>
                                                        {isThisCorrect && <CheckCircle2 size={14} className="text-emerald-600" />}
                                                        {isThisSelected && !isCorrect && <XCircle size={14} className="text-rose-600" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                    <button onClick={() => router.push('/tests')}
                        className="bg-gray-800 text-white rounded-2xl py-5 shadow-xl shadow-gray-200 flex flex-col items-center justify-center gap-1 group card-hover">
                        <RotateCcw size={20} className="group-hover:rotate-[-45deg] transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Retake Quiz</span>
                    </button>
                    <button onClick={() => router.push('/dashboard')}
                        className="bg-violet-600 text-white rounded-2xl py-5 shadow-xl shadow-violet-200 flex flex-col items-center justify-center gap-1 group card-hover">
                        <Home size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                    </button>
                </div>
            </div>

        </div>
    );
}

export default function TestResultClient({ id }: { id: string }) {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center h-screen bg-gray-50">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <TestResultContent id={id} />
        </Suspense>
    );
}
