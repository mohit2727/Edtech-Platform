'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, setAuthToken } from '@/lib/api';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

export default function LeaderboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [board, setBoard] = useState<{ quizTitle: string, rankings: any[], currentUserRank?: any }>({ quizTitle: 'Leaderboard', rankings: [] });
    const [loading, setLoading] = useState(true);

    const load = async () => {
        if (authLoading) return;
        setLoading(true);
        try {
            const data = await dataService.getLeaderboard();
            setBoard(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [authLoading, user]);

    const top3 = board.rankings.slice(0, 3);
    const others = board.rankings.slice(3);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center h-screen bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm font-medium italic">Ranking students...</p>
            </div>
        </div>
    );

    if (board.quizTitle === 'Currently no leaderboards active') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] bg-gray-50 px-6 text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                    <Trophy size={48} className="text-slate-300" strokeWidth={1.5} />
                </div>
                <h2 className="font-black text-slate-800 text-2xl tracking-tight mb-2">Currently no leaderboards active</h2>
                <p className="text-slate-500 font-medium text-sm max-w-[280px]">
                    The administrators haven't activated any quiz rankings yet. Check back later to see where you stand!
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            {/* Gradient Header with Podium */}
            <div className="grad-header pb-12 pt-16">
                <div className="text-center mb-8 relative z-10">
                    <h1 className="text-white text-2xl font-black tracking-tight flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center gap-2">
                            <Trophy size={24} className="text-yellow-400" /> Leaderboard
                        </div>
                        <span className="text-yellow-300 text-[10px] font-black uppercase tracking-[0.3em] bg-white/10 px-3 py-1 rounded-full border border-white/20">{board.quizTitle}</span>
                    </h1>
                </div>

                {/* Podium */}
                {top3.length > 0 && (
                    <div className="flex items-end justify-center px-4 relative z-10">
                        {/* 2nd Place */}
                        {top3[1] && (
                            <div className="flex flex-col items-center w-[30%] -mr-1">
                                <div className="relative mb-2">
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-lg">{top3[1].name.charAt(0)}</span>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-300 rounded-full border-2 border-white flex items-center justify-center">
                                        <span className="text-gray-700 text-[10px] font-black">2</span>
                                    </div>
                                </div>
                                <p className="text-white text-[10px] font-black truncate w-full text-center mb-1">{top3[1].name.split(' ')[0]}</p>
                                <div className="h-14 w-full bg-white/10 backdrop-blur-md rounded-t-xl border-x border-t border-white/20 flex flex-col items-center justify-center">
                                    <span className="text-white font-black text-xs">{top3[1].totalScore ?? top3[1].score}</span>
                                    <span className="text-violet-200 text-[7px] font-bold uppercase tracking-wider">PTS</span>
                                </div>
                            </div>
                        )}

                        {/* 1st Place */}
                        <div className="flex flex-col items-center w-[35%] relative z-20">
                            <div className="relative mb-3 scale-110">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
                                    <Crown className="text-yellow-400 fill-yellow-400" size={24} />
                                </div>
                                <div className="w-16 h-16 rounded-3xl bg-white border-2 border-yellow-400 flex items-center justify-center shadow-2xl shadow-yellow-500/40">
                                    <span className="text-violet-600 font-black text-xl">{top3[0].name.charAt(0)}</span>
                                </div>
                                <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                                    <span className="text-white text-xs font-black">1</span>
                                </div>
                            </div>
                            <p className="text-white text-xs font-black truncate w-full text-center mb-1">{top3[0].name.split(' ')[0]}</p>
                            <div className="h-24 w-full bg-white/20 backdrop-blur-md rounded-t-2xl border-x border-t border-white/30 flex flex-col items-center justify-center shadow-2xl">
                                <span className="text-white font-black text-sm">{top3[0].totalScore || top3[0].score || 0}</span>
                                <span className="text-violet-200 text-[8px] font-bold uppercase tracking-widest">POINTS</span>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        {top3[2] && (
                            <div className="flex flex-col items-center w-[30%] -ml-1">
                                <div className="relative mb-2">
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-lg">{top3[2].name.charAt(0)}</span>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-600 rounded-full border-2 border-white flex items-center justify-center">
                                        <span className="text-white text-[10px] font-black">3</span>
                                    </div>
                                </div>
                                <p className="text-white text-[10px] font-black truncate w-full text-center mb-1">{top3[2].name.split(' ')[0]}</p>
                                <div className="h-10 w-full bg-white/5 backdrop-blur-sm rounded-t-xl border-x border-t border-white/10 flex flex-col items-center justify-center">
                                    <span className="text-white font-black text-[10px]">{top3[2].totalScore ?? top3[2].score}</span>
                                    <span className="text-violet-300 text-[6px] font-bold uppercase tracking-wider">PTS</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Others List - Scrollable */}
            <div className="mx-4 -mt-5 bg-white rounded-t-[2rem] rounded-b-2xl p-5 shadow-2xl relative z-30 space-y-3 pb-8 max-h-[60vh] overflow-y-auto no-scrollbar">
                {others.length === 0 && top3.length > 0 && (
                    <p className="text-center text-gray-400 text-[10px] font-bold py-4 italic">STAY TUNED FOR DAILY UPDATES</p>
                )}

                {others.length > 0 ? others.map((student, i) => {
                    const rank = i + 4;
                    return (
                        <div key={student._id || i}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 card-hover">

                            <div className="w-6 text-center">
                                <span className="text-sm font-black text-gray-400">#{rank}</span>
                            </div>

                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                <span className="text-violet-600 font-bold text-sm tracking-tight">{student.name.charAt(0).toUpperCase()}</span>
                            </div>

                            <div className="flex-1">
                                <p className="font-extrabold text-gray-800 text-xs tracking-tight">{student.name}</p>
                                <div className="mt-0.5 w-full bg-gray-200 rounded-full h-1">
                                    <div className="bg-violet-300 h-1 rounded-full" style={{ width: `${Math.min(100, ((student.totalScore ?? student.score) / ((top3[0]?.totalScore ?? top3[0]?.score) || 1) * 100))}%` }} />
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="font-black text-xs text-violet-700">{student.totalScore || student.score || 0}</p>
                                <p className="text-[7px] text-gray-400 font-black uppercase tracking-widest">PTS</p>
                            </div>
                        </div>
                    )
                }) : top3.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Award size={32} className="text-gray-200" />
                        </div>
                        <p className="font-black text-gray-400 text-sm uppercase">Competition starting soon!</p>
                    </div>
                )}
            </div>

            {/* Footer note */}
            <div className="p-8 pb-32 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Rankings updated in real-time</p>
            </div>

            {/* Sticky Personal Rank Footer */}
            {board.currentUserRank && (
                <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto z-40 px-4 pb-2 animate-in slide-in-from-bottom duration-500">
                    <div className="bg-violet-600 rounded-2xl p-4 shadow-xl shadow-violet-600/30 border border-violet-500 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0">
                            <span className="text-white font-black text-lg">{board.currentUserRank.name.charAt(0).toUpperCase()}</span>
                        </div>
                        
                        <div className="flex-1">
                            <p className="text-violet-200 text-[10px] font-black uppercase tracking-widest mb-0.5">Your Current Rank</p>
                            <div className="flex items-end gap-2">
                                <span className="text-white font-black text-2xl leading-none">#{board.currentUserRank.rank}</span>
                                <span className="text-violet-200 font-bold text-sm mb-0.5 truncate max-w-[120px]">{board.currentUserRank.name}</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="font-black text-xl text-white">{board.currentUserRank.score || 0}</p>
                            <p className="text-[8px] text-violet-300 font-black uppercase tracking-widest">PTS</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
