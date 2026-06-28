'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ChevronLeft, Info, Play, ShieldAlert, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/api';

function VideoContent({ courseId }: { courseId: string }) {
    const searchParams = useSearchParams();
    const videoUrl = searchParams.get('v');
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        const load = async () => {
            try {
                const data = await dataService.getVideoPlaylistById(courseId);
                setCourse(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [courseId, authLoading]);

    const isEnrolled = course?.isEnrolled || user?.role === 'admin';
    const isFree = course?.price === 0;
    const canAccess = isEnrolled || isFree;

    if (loading || authLoading) return (
        <div className="h-screen bg-gray-950 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!canAccess) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-10 text-center">
            <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mb-6 border border-rose-500/20">
                <Lock size={40} className="text-rose-500" />
            </div>
            <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-3">Access Denied</h2>
            <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                You need to enroll in this course to watch the video lessons.
            </p>
            <button 
                onClick={() => router.push(`/videos/${courseId}`)}
                className="mt-8 bg-violet-600 hover:bg-violet-700 text-white px-10 py-4 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/20 transition-all"
            >
                Enroll Now
            </button>
        </div>
    );

    if (!videoUrl) return (
        <div className="p-10 text-center bg-gray-950 min-h-screen flex flex-col items-center justify-center">
            <ShieldAlert size={48} className="mx-auto text-rose-500 mb-4" />
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Invalid Link</h2>
            <p className="text-gray-500 text-sm mt-2">This video doesn't exist or was removed.</p>
            <button onClick={() => router.back()} className="mt-6 bg-violet-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Go Back</button>
        </div>
    );

    const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop();

    return (
        <div className="flex flex-col min-h-screen bg-gray-950">

            {/* Video Sticky Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
                <button onClick={() => router.back()} className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2">
                    <ChevronLeft size={20} /> <span className="text-xs font-black uppercase tracking-widest">BACK</span>
                </button>
                <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl">
                    <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Info size={14} /> EXCLUSIVE ACCESS
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-[800px] aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl shadow-violet-500/10 border border-white/10 relative bg-black">
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                        title="Video Player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>

                <div className="w-full max-w-[800px] mt-10 p-10 bg-white/5 border border-white/5 rounded-[3rem] backdrop-blur-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Play size={24} fill="white" className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-lg tracking-tight uppercase">Now Playing</h3>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest italic">Physical Education Premiere</p>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed font-medium mt-6 border-l-2 border-violet-500 pl-6">
                        Please watch the full video to understand the concepts thoroughly. Use the settings icon in the player to adjust quality and speed as needed.
                    </p>
                </div>
            </div>

            <div className="p-10 text-center">
                <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.5em]">End of Lesson</p>
            </div>

        </div>
    );
}

export default function VideoPlayerClient({ id }: { id: string }) {
    return (
        <Suspense fallback={
            <div className="h-screen bg-gray-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <VideoContent courseId={id} />
        </Suspense>
    );
}
