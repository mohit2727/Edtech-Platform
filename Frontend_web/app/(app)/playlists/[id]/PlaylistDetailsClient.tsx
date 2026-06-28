'use client';
import { useAuth } from '@/context/AuthContext';
import { dataService, paymentService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ChevronLeft, PlayCircle, Lock, Unlock, Clock, HelpCircle, ShieldCheck, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import useSWR from 'swr';

export default function PlaylistDetailsClient({ id }: { id: string }) {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [isPurchasing, setIsPurchasing] = useState(false);

    // Always refresh user profile on load — picks up admin-granted access
    useEffect(() => {
        if (user) refreshUser();
    }, [id]);

    const { data: playlist, isLoading } = useSWR(
        `playlist-${id}`,
        () => dataService.getPlaylistById(id),
        { revalidateOnFocus: true, dedupingInterval: 2000 }
    );

    const isOwned = user?.purchasedPlaylists?.some((p: any) => p.toString() === id) || user?.role === 'admin';
    const isFree = playlist?.price === 0;
    const canAccess = isOwned || isFree;

    const handleBuyNow = async () => {
        if (!playlist) return;
        if (!user) {
            alert('Please sign in or enter your details to buy this playlist.');
            router.push(`/sign-in?redirect=/playlists/${id}`);
            return;
        }
        setIsPurchasing(true);
        try {
            // Step 1: Get Razorpay key from server
            const dashboard = await dataService.getDashboard();
            const rzpKey = dashboard?.razorpayKeyId;
            if (!rzpKey) {
                throw new Error('Payment gateway is not configured. Please contact support.');
            }

            // Step 2: Create order on backend
            const order = await paymentService.createOrder(playlist._id, 'QuizPlaylist');

            // Step 3: Open Razorpay checkout
            const options = {
                key: rzpKey,
                amount: order.amount,
                currency: order.currency || 'INR',
                name: "Learning App",
                description: `Purchase ${playlist.title}`,
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        await paymentService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        alert('Payment Successful! Playlist unlocked.');
                        await refreshUser();
                    } catch (err: any) {
                        console.error('Verification error:', err);
                        alert('Payment was received but verification failed. Do not pay again — contact support with your payment ID: ' + response.razorpay_payment_id);
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

    const handleQuizClick = (quiz: any) => {
        if (!canAccess) {
            alert('Please purchase this playlist to access the quizzes.');
            return;
        }
        if (quiz.isLocked) {
            alert('This quiz is locked by the admin.');
            return;
        }
        router.push(`/tests/${quiz._id}`);
    };

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!playlist) return (
        <div className="flex-1 p-8 text-center bg-gray-50 h-screen">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <HelpCircle size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-bold">Playlist not found.</p>
            <button onClick={() => router.back()} className="mt-6 bg-violet-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-violet-100">
                Go Back
            </button>
        </div>
    );

    return (
        <div className="flex flex-col min-h-full bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 px-5 pt-8 pb-10 rounded-b-[2.5rem] shadow-lg relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

                <div className="relative z-10">
                    <button onClick={() => router.back()} className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all mb-6">
                        <ChevronLeft size={24} className="text-white" />
                    </button>

                    <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block backdrop-blur-sm">
                        PREMIUM PLAYLIST
                    </span>
                    <h1 className="text-white text-3xl font-black tracking-tight leading-tight mb-2">
                        {playlist.title}
                    </h1>
                    <p className="text-violet-100/80 text-sm font-medium leading-relaxed max-w-sm line-clamp-3">
                        {playlist.description}
                    </p>
                </div>
            </div>

            {/* Quizzes List or Purchase CTA */}
            <div className="px-5 space-y-4 relative z-20">
                {!canAccess && playlist.price > 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-violet-100 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center mb-6">
                            <Lock size={40} className="text-violet-600" />
                        </div>
                        <h2 className="text-gray-900 font-black text-xl leading-tight mb-2">Unlock {playlist.title}</h2>
                        <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                            This is a premium playlist. Purchase it to get full access to all included quizzes and track your progress in the leaderboard.
                        </p>

                        <div className="w-full bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Price to Unlock</p>
                            <p className="text-gray-900 font-black text-3xl">₹{playlist.price}</p>
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
                            {isPurchasing ? 'Processing...' : 'Buy Now'}
                        </button>

                        <div className="mt-6 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Secure Payment by Razorpay</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6 bg-violet-600 rounded-full" />
                            <h2 className="text-gray-800 font-black text-sm uppercase tracking-widest">Included Quizzes {playlist.quizzes ? `(${playlist.quizzes.length})` : ''}</h2>
                        </div>

                        {!playlist.quizzes || playlist.quizzes.length === 0 ? (
                            <div className="bg-white rounded-3xl p-10 text-center shadow-lg border border-gray-100 flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                    <HelpCircle size={32} className="text-gray-300" />
                                </div>
                                <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">No quizzes found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {playlist.quizzes.map((quiz: any, index: number) => (
                                    <button
                                        key={quiz._id}
                                        onClick={() => handleQuizClick(quiz)}
                                        className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 text-left hover:shadow-md hover:border-violet-100 transition-all group"
                                    >
                                        <div className="w-14 h-14 bg-gray-50 group-hover:bg-violet-50 rounded-2xl flex items-center justify-center shrink-0 transition-colors">
                                            <span className="text-gray-400 group-hover:text-violet-500 font-black text-lg">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-gray-800 font-bold text-base leading-tight group-hover:text-violet-700 transition-colors line-clamp-1">
                                                {quiz.title}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                    <HelpCircle size={12} strokeWidth={3} />
                                                    <span className="text-[10px] uppercase font-bold tracking-wider">{quiz.totalQuestions || 0} Qs</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                    <Clock size={12} strokeWidth={3} />
                                                    <span className="text-[10px] uppercase font-bold tracking-wider">{quiz.duration || 0} Mins</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 group-hover:bg-violet-600 group-hover:text-white text-gray-400 transition-all">
                                            {quiz.isLocked ? <Lock size={18} /> : <PlayCircle size={18} className="ml-0.5" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
