'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, setAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Clock, ChevronLeft, ChevronRight, Send, HelpCircle, Target } from 'lucide-react';

export default function ActiveTestClient({ id }: { id: string }) {
    const { user, loading: authLoading } = useAuth();
    const [test, setTest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            alert('Please enter your details to take the test.');
            router.push(`/sign-in?redirect=/tests/${id}`);
            return;
        }
        const load = async () => {
            try {
                const data = await dataService.getTestById(id);
                setTest(data);
                setAnswers(new Array(data.questions.length).fill(null));
                setTimeLeft((data.duration || 20) * 60);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [id, authLoading, user, router]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSelect = (optionIdx: number) => {
        const newAnswers = [...answers];
        newAnswers[currentIdx] = optionIdx;
        setAnswers(newAnswers);
    };

    useEffect(() => {
        // Warn before leaving the page accidentally
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const handleSubmit = async () => {
        setShowSubmitConfirm(true);
    };

    const confirmSubmit = async () => {
        try {
            const totalTimeAllowed = (test.duration || 20) * 60;
            const timeSpent = totalTimeAllowed - timeLeft;

            // Format answers to match backend expectation: [{ questionId, selectedOption }]
            const formattedAnswers = answers.map((ans, idx) => ({
                questionId: test.questions[idx]._id,
                selectedOption: ans
            }));

            const response = await dataService.submitTest(id, formattedAnswers, timeSpent);

            // Save the exact answers to session storage for instant review on the next page
            sessionStorage.setItem(`test_answers_${id}`, JSON.stringify(formattedAnswers));

            // Pass the exact score and marks through query params to guarantee they load instantly on the results screen
            router.replace(`/tests/${id}/result?score=${response.score}&total=${response.totalMarks}`);
        } catch (e) {
            console.error('Submit test error:', e);
            alert('Failed to submit. Check connection.');
        } finally {
            setShowSubmitConfirm(false);
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center h-screen bg-gray-50">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!test || !test.questions || test.questions.length === 0) return (
        <div className="flex-1 flex flex-col items-center justify-center h-screen bg-gray-50 p-10 text-center">
            <HelpCircle size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest">No questions available in this test.</p>
            <button onClick={() => router.back()} className="mt-6 text-violet-600 font-bold text-sm">Go Back</button>
        </div>
    );

    const q = test.questions[currentIdx];
    const progress = ((currentIdx + 1) / test.questions.length) * 100;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-24">

            {/* Quiz Header */}
            <div className="grad-header pb-8 pt-14">
                <div className="flex items-center justify-between px-2 mb-4">
                    <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                        <ChevronLeft size={20} className="text-white" />
                    </button>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 shadow-lg">
                        <Clock size={16} className="text-yellow-300 animate-pulse" />
                        <span className="text-white font-black text-sm tracking-widest">{formatTime(timeLeft)}</span>
                    </div>
                    <button onClick={handleSubmit} className="bg-emerald-500 text-white px-5 py-2.5 rounded-2xl font-black text-[11px] shadow-lg shadow-emerald-500/30 flex items-center gap-2 tracking-widest uppercase transition-all active:scale-95">
                        DONE <Send size={12} strokeWidth={3} />
                    </button>
                </div>

                <div className="px-2">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-white text-[10px] font-black tracking-[0.2em] uppercase">Question {currentIdx + 1} of {test.questions.length}</p>
                        <p className="text-violet-200 text-[10px] font-black">{Math.round(progress)}% Complete</p>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="bg-white h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-4 relative z-20">
                {/* Question Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-white min-h-[500px] flex flex-col">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0">
                            <HelpCircle size={24} className="text-violet-500" />
                        </div>
                        <h2 className="text-lg font-black text-gray-800 leading-tight tracking-tight mt-1">{q.text}</h2>
                    </div>

                    <div className="space-y-3 flex-1">
                        {q.options.map((option: string, i: number) => {
                            const selected = answers[currentIdx] === i;
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleSelect(i)}
                                    className={`w-full p-5 rounded-3xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${selected ? 'border-violet-600 bg-violet-50 shadow-lg shadow-violet-100' : 'border-gray-50 bg-gray-50 hover:bg-white hover:border-violet-200 text-gray-700'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'border-violet-600 bg-violet-600' : 'border-gray-200'
                                        }`}>
                                        {selected && <div className="w-2 h-2 rounded-full bg-white shadow-lg" />}
                                    </div>
                                    <span className={`text-sm font-bold tracking-tight ${selected ? 'text-violet-900' : 'text-gray-600'}`}>{option}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-4 mt-10">
                        <button
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx(prev => prev - 1)}
                            className="flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            <ChevronLeft size={16} strokeWidth={3} /> PREV
                        </button>

                        {currentIdx === test.questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                SUBMIT <Send size={16} strokeWidth={3} />
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentIdx(prev => prev + 1)}
                                className="flex-1 bg-violet-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-violet-200 transition-all flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                NEXT <ChevronRight size={16} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-10 flex flex-col items-center gap-2">
                    <Target size={24} className="text-gray-200" />
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">Precision Learning</p>
                </div>
            </div>

            {/* Custom Premium Submit Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSubmitConfirm(false)} />
                    <div className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <HelpCircle size={120} />
                        </div>

                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                            <HelpCircle size={32} />
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Finish Test?</h3>
                        <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
                            Are you sure you want to submit your test? You won't be able to change your answers after this.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={confirmSubmit}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95 text-xs uppercase tracking-widest"
                            >
                                YES, SUBMIT NOW
                            </button>
                            <button
                                onClick={() => setShowSubmitConfirm(false)}
                                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-400 font-black py-5 rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-widest"
                            >
                                CONTINUE QUIZ
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
