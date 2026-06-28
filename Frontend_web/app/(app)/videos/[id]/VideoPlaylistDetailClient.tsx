'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, paymentService, setAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Play, ChevronLeft, Clock, BookOpen, Info, ShieldCheck, Lock, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function VideoPlaylistDetailClient({ id }: { id: string }) {
    const { user, refreshUser, loading: authLoading } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        const load = async () => {
            try {
                const data = await dataService.getVideoPlaylistById(id);
                setCourse(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [id, authLoading]);

    const isEnrolled = course?.isEnrolled || user?.role === 'admin';
    const isFree = course?.price === 0;
    const canAccess = isEnrolled || isFree;

    const handleBuyNow = async () => {
        if (!course) return;
        if (!user) {
            alert('Please sign in or enter your details to enroll.');
            router.push(`/sign-in?redirect=/videos/${id}`);
            return;
        }
        setIsPurchasing(true);
        try {
            // Step 1: Get Razorpay key from server FIRST
            const dashboard = await dataService.getDashboard();
            const rzpKey = dashboard?.razorpayKeyId;
            if (!rzpKey) {
                throw new Error('Payment gateway is not configured. Please contact support.');
            }

            // Step 2: Create order
            const order = await paymentService.createOrder(course._id, 'Course');
            
            // Step 3: Open checkout
            const options = {
                key: rzpKey,
                amount: order.amount,
                currency: order.currency || 'INR',
                name: "Learning App",
                description: `Enroll in ${course.title}`,
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        await paymentService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        alert('Payment Successful! Course unlocked.');
                        await refreshUser();
                        // Refresh course data to update isEnrolled
                        const data = await dataService.getVideoPlaylistById(id);
                        setCourse(data);
                    } catch (err: any) {
                        alert(err.message || 'Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.mobile
                },
                theme: { color: "#7c3aed" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err: any) {
            alert(err.message || 'Failed to initiate payment');
        } finally {
            setIsPurchasing(false);
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center h-screen bg-gray-50">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            {/* Gradient Header */}
            <div className="grad-header pb-12">
                <button onClick={() => router.back()} className="flex items-center gap-1 text-violet-200 mb-6 hover:text-white transition-all relative z-10">
                    <ChevronLeft size={20} /> <span className="text-sm font-bold">BACK</span>
                </button>
                <div className="flex flex-col items-center relative z-10 text-center px-4">
                    {course?.image ? (
                        <div className="w-24 h-24 rounded-3xl overflow-hidden mb-4 border-2 border-white/30 shadow-2xl">
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mb-4 border border-white/20">
                            <BookOpen size={40} className="text-white/40" />
                        </div>
                    )}
                    <h1 className="text-white text-xl font-black tracking-tight leading-tight uppercase">{course?.title}</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                            <Play size={10} className="text-violet-200" fill="currentColor" />
                            <span className="text-white text-[10px] font-black uppercase tracking-widest">{course?.lessons?.length || 0} Lessons</span>
                        </div>
                        {canAccess ? (
                            <div className="bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                                <ShieldCheck size={10} className="text-emerald-400" />
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">
                                    {isFree ? 'FREE ACCESS' : 'ENROLLED'}
                                </span>
                            </div>
                        ) : (
                            <div className="bg-amber-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
                                <Lock size={10} className="text-amber-400" />
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">PREMIUM</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lesson List or Purchase CTA */}
            <div className="px-5 -mt-6 pb-20 relative z-20 space-y-6">
                {!canAccess && course?.price > 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-violet-100 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center mb-6">
                            <Lock size={40} className="text-violet-600" />
                        </div>
                        <h2 className="text-gray-900 font-black text-xl leading-tight mb-2">Enroll in {course.title}</h2>
                        <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                            This course contains premium video lessons. Enroll now to get full access to all lectures and learning materials.
                        </p>
                        
                        <div className="w-full bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Enrollment Fee</p>
                            <p className="text-gray-900 font-black text-3xl">₹{course.price}</p>
                        </div>

                        <button 
                            onClick={handleBuyNow}
                            disabled={isPurchasing}
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-violet-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isPurchasing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <CreditCard size={18} />
                            )}
                            {isPurchasing ? 'Processing...' : 'Enroll Now'}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Course Info Card */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-white">
                            <h3 className="font-extrabold text-gray-800 text-sm tracking-tight mb-3 flex items-center gap-2">
                                <Info size={16} className="text-violet-600" /> ABOUT THIS COURSE
                            </h3>
                            <p className="text-gray-500 text-xs leading-relaxed font-medium">
                                {course?.description || 'Deep dive into specialized topics with professional guidance.'}
                            </p>
                        </div>

                        {/* Lesson List */}
                        <div className="space-y-3">
                            <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] ml-2">Course syllabus</h4>
                            {course?.lessons?.map((lesson: any, i: number) => (
                                <Link key={lesson._id || i} href={`/videos/${id}/video?v=${lesson.videoUrl}`}
                                    className="card p-3 flex items-center gap-4 card-hover border border-gray-50">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-violet-600 font-black text-sm">{i + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-extrabold text-gray-800 text-xs tracking-tight line-clamp-1 truncate uppercase">{lesson.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Clock size={10} className="text-gray-300" />
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Video Lesson</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200 shrink-0">
                                        <Play size={12} fill="white" className="text-white" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Play All Button (Sticky) */}
                        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-8">
                            <button onClick={() => { if (course?.lessons?.[0]) router.push(`/videos/${id}/video?v=${course.lessons[0].videoUrl}`) }}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl py-4 font-black shadow-2xl flex items-center justify-center gap-3 card-hover tracking-[0.1em]">
                                <Play size={18} fill="white" /> START WATCHING NOW
                            </button>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
}
