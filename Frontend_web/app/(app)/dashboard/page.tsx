'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, setAuthToken } from '@/lib/api';
import Link from 'next/link';
import { TrendingUp, Target, Sparkles, MessageCircle, Send, Award } from 'lucide-react';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [dashboard, setDashboard] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [quizPlaylists, setQuizPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (authLoading) return;
        const load = async () => {
            try {
                const [d, a, q] = await Promise.all([
                    dataService.getDashboard(), 
                    dataService.getAnnouncements(),
                    dataService.getQuizPlaylists()
                ]);
                setDashboard(d);
                setAnnouncements(a);
                setQuizPlaylists(q);
            } catch (e) { 
                console.error(e); 
            } finally { 
                setLoading(false); 
            }
        };
        load();
    }, [authLoading]);

    useEffect(() => {
        if (!announcements.length) return;
        const t = setInterval(() => setCurrent(c => (c + 1) % announcements.length), 4000);
        return () => clearInterval(t);
    }, [announcements.length]);

    const displayName = user?.name || 'Student';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'S';

    if (loading || authLoading) return (
        <div className="flex-1 flex items-center justify-center h-screen bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm font-medium">Loading Dashboard...</p>
            </div>
        </div>
    );

    const ann = announcements[current];

    return (
        <div className="flex flex-col bg-gray-50 min-h-full">

            {/* Gradient Header */}
            <div className="grad-header mb-2 pb-8">
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div>
                        <p className="text-violet-200 text-xs font-black tracking-[0.2em] uppercase opacity-80">Welcome back</p>
                        <h1 className="text-white text-2xl font-black mt-1 tracking-tight">{displayName}</h1>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shadow-lg backdrop-blur-md">
                        <span className="text-white font-black text-lg">{initials}</span>
                    </div>
                </div>

                {/* Stats row inside header */}
                <div className="grid grid-cols-3 gap-2 relative z-10">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col items-center justify-center">
                        <p className="text-white font-black text-xl leading-none">{dashboard?.stats?.totalPlaylists || 0}</p>
                        <p className="text-violet-200 text-[8px] font-black uppercase tracking-widest mt-1.5 opacity-70">Playlists</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex flex-col items-center justify-center">
                        <p className="text-white font-black text-xl leading-none">{dashboard?.stats?.enrolled || 0}</p>
                        <p className="text-violet-200 text-[8px] font-black uppercase tracking-widest mt-1.5 opacity-70">Enrolled</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex flex-col items-center justify-center">
                        <p className="text-white font-black text-xl leading-none">{dashboard?.stats?.quizzesTaken || 0}</p>
                        <p className="text-violet-200 text-[8px] font-black uppercase tracking-widest mt-1.5 opacity-70">Quizzes</p>
                    </div>
                </div>
            </div>

            {/* Announcement Banner */}
            {ann && (
                <div className="mx-4 mb-6 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50 bg-white border border-gray-100">
                    {ann.image ? (
                        <div className="relative h-40">
                            <img src={ann.image} alt={ann.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end">
                                <span className="text-[10px] text-white/70 font-black uppercase tracking-[0.2em] mb-1">Official News</span>
                                <p className="text-white font-black text-lg truncate leading-tight">{ann.title}</p>
                                <p className="text-white/80 text-xs font-medium line-clamp-1">{ann.body}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6">
                            <span className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] mb-1">Update</span>
                            <p className="text-white font-black text-lg leading-tight">{ann.title}</p>
                            <p className="text-violet-100/80 text-xs font-semibold mt-1 line-clamp-2">{ann.body}</p>
                        </div>
                    )}
                    {announcements.length > 1 && (
                        <div className="flex gap-1.5 justify-center py-2 bg-white">
                            {announcements.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-violet-600' : 'w-1.5 bg-gray-200'}`} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="px-4 space-y-8 pb-10">
                {/* Latest Content (Hybrid) */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-gray-800 font-black text-[10px] uppercase tracking-[0.15em] opacity-60">Latest Content</h2>
                        <Link href="/playlists" className="text-violet-600 text-[10px] font-black uppercase tracking-widest">See all →</Link>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                        {/* Video Playlists (from dashboard.newestCourses) */}
                        {dashboard?.newestCourses?.map((c: any) => (
                            <Link key={c._id} href={`/videos/${c._id}`}
                                className="shrink-0 w-52 bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 card-hover group transition-all">
                                <div className="h-32 relative">
                                    {c.image ? <img src={c.image} className="w-full h-full object-cover" alt={c.title} /> : 
                                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-3xl opacity-20">📺</div>}
                                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl">
                                        <span className="text-white text-[8px] font-black uppercase tracking-widest">Premium</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-gray-800 font-black text-xs uppercase tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors leading-relaxed">{c.title}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="p-1 bg-indigo-50 rounded-lg">
                                            <TrendingUp size={12} className="text-indigo-500" />
                                        </div>
                                        <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest">{c.lessons?.length || 0} Video Lessons</span>
                                    </div>
                                    <div className="mt-4 bg-indigo-50/50 group-hover:bg-indigo-600 rounded-2xl py-2.5 flex items-center justify-center gap-2 border border-indigo-100/50 transition-all">
                                        <span className="text-indigo-600 group-hover:text-white text-[9px] font-black uppercase tracking-widest">Watch Now</span>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Quiz Playlists */}
                        {quizPlaylists?.map((p: any) => (
                            <Link key={p._id} href={`/playlists/${p._id}`}
                                className="shrink-0 w-52 bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 card-hover group transition-all">
                                <div className="h-32 relative">
                                    {p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.title} /> : 
                                    <div className="w-full h-full bg-amber-50 flex items-center justify-center text-3xl opacity-20">📝</div>}
                                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl">
                                        <span className="text-white text-[8px] font-black uppercase tracking-widest">Explore</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-gray-800 font-black text-xs uppercase tracking-tight line-clamp-1 group-hover:text-amber-600 transition-colors leading-relaxed">{p.title}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="p-1 bg-amber-50 rounded-lg">
                                            <Target size={12} className="text-amber-500" />
                                        </div>
                                        <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest">{p.quizzes?.length || 0} Quizzes</span>
                                    </div>
                                    <div className="mt-4 bg-amber-50/50 group-hover:bg-amber-600 rounded-2xl py-2.5 flex items-center justify-center gap-2 border border-amber-100/50 transition-all">
                                        <span className="text-amber-600 group-hover:text-white text-[9px] font-black uppercase tracking-widest">Start Now</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Quick Access Grid */}
                <div>
                    <h2 className="text-gray-800 font-black text-[10px] uppercase tracking-[0.15em] mb-4 px-1 opacity-60">Your Toolbox</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/playlists"
                            className="bg-indigo-50/30 border border-white rounded-[2.5rem] p-8 flex flex-col items-center shadow-lg shadow-indigo-100/50 card-hover transition-all">
                            <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-indigo-50">
                                <TrendingUp className="text-indigo-600" size={28} />
                            </div>
                            <span className="text-gray-800 font-black text-[10px] tracking-[0.2em] uppercase text-center">Video<br/>Playlists</span>
                        </Link>
                        <Link href="/tests"
                            className="bg-amber-50/30 border border-white rounded-[2.5rem] p-8 flex flex-col items-center shadow-lg shadow-amber-100/50 card-hover transition-all">
                            <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-amber-50">
                                <Target className="text-amber-600" size={28} />
                            </div>
                            <span className="text-gray-800 font-black text-[10px] tracking-[0.2em] uppercase text-center">Quiz<br/>Library</span>
                        </Link>
                        <Link href="/leaderboard"
                            className="bg-emerald-50/30 border border-white rounded-[2.5rem] p-8 flex flex-col items-center shadow-lg shadow-emerald-100/50 card-hover transition-all">
                            <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-emerald-50">
                                <Award className="text-emerald-600" size={28} />
                            </div>
                            <span className="text-gray-800 font-black text-[10px] tracking-[0.2em] uppercase text-center">Leader<br/>Ranks</span>
                        </Link>
                        <Link href="/profile"
                            className="bg-rose-50/30 border border-white rounded-[2.5rem] p-8 flex flex-col items-center shadow-lg shadow-rose-100/50 card-hover transition-all">
                            <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-rose-50">
                                <Sparkles className="text-rose-600" size={28} />
                            </div>
                            <span className="text-gray-800 font-black text-[10px] tracking-[0.2em] uppercase text-center">Personal<br/>Profile</span>
                        </Link>
                    </div>
                </div>

                {/* Community Section */}
                <div>
                    <h2 className="text-gray-800 font-black text-[10px] uppercase tracking-[0.15em] mb-4 px-1 opacity-60">Join the Community</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <a href="https://chat.whatsapp.com/IFdWKamfnWNCAd4y0KSTv4?mode=gi_t" target="_blank" rel="noreferrer"
                            className="bg-emerald-500 hover:bg-emerald-600 rounded-[2rem] py-5 flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 transition-all transform active:scale-95 group">
                            <MessageCircle size={20} className="text-white group-hover:scale-110 transition-transform" />
                            <span className="text-white font-black text-[11px] uppercase tracking-widest">WhatsApp</span>
                        </a>
                        <a href="https://t.me/+zYMb_hNz96IxZDg1" target="_blank" rel="noreferrer"
                            className="bg-sky-500 hover:bg-sky-600 rounded-[2rem] py-5 flex items-center justify-center gap-3 shadow-xl shadow-sky-200 transition-all transform active:scale-95 group">
                            <Send size={20} className="text-white group-hover:scale-110 transition-transform" />
                            <span className="text-white font-black text-[11px] uppercase tracking-widest">Telegram</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
