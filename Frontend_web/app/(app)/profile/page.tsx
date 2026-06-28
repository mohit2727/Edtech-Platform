'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, setAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { UserCircle, Phone, MapPin, ChevronRight, LogOut, ShieldCheck, Star, Zap, BookOpen, Receipt, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, logout, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', mobile: '', age: '', city: '', state: '', pincode: '' });

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/sign-in?redirect=/profile');
            return;
        }
        const load = async () => {
            try {
                const p = await dataService.getProfile();
                setProfile(p);
                setForm({ name: p.name || '', mobile: p.mobile || '', age: p.age || '', city: p.city || '', state: p.state || '', pincode: p.pincode || '' });
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [authLoading, user, router]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const updated = await dataService.updateProfile(form);
            await refreshUser();
            setProfile(updated);
            setForm({ name: updated.name || '', mobile: updated.mobile || '', age: updated.age || '', city: updated.city || '', state: updated.state || '', pincode: updated.pincode || '' });
            setShowEdit(false);
        } catch { alert('Failed to update profile.'); }
        finally { setSaving(false); }
    };

    const displayName = user?.name || profile?.name || 'Student';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'S';

    if (loading && !user) return (
        <div className="flex-1 flex items-center justify-center h-screen bg-gray-50">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const activeProfile = profile || user;

    return (
        <div className="flex flex-col min-h-full bg-gray-50">

            {/* Header Profile Section */}
            <div className="grad-header pb-12">
                <div className="flex flex-col items-center relative z-10">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-[30%] bg-white p-1.5 shadow-2xl shadow-black/20 rotate-3">
                            <div className="w-full h-full rounded-[25%] bg-violet-100 flex items-center justify-center -rotate-3">
                                <span className="text-violet-600 font-black text-2xl">{initials}</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-7 h-7 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                            <ShieldCheck size={14} className="text-white" strokeWidth={3} />
                        </div>
                    </div>

                    <h1 className="text-white text-xl font-black tracking-tight uppercase">{displayName}</h1>
                </div>
            </div>

            <div className="px-5 -mt-6 pb-8 space-y-6 relative z-20">

                {/* Personal Details Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-white">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-black text-gray-800 text-sm tracking-tight flex items-center gap-2">
                            <UserCircle size={18} className="text-violet-600" /> PERSONAL INFO
                        </h3>
                        <button
                            onClick={() => setShowEdit(true)}
                            className="text-violet-600 bg-violet-50 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider card-hover"
                        >
                            Edit Details
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mobile</span>
                            <div className="flex items-center gap-2">
                                <Phone size={12} className="text-violet-400" />
                                <span className="text-xs font-black text-gray-800">{activeProfile?.mobile || 'No Data'}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Age</span>
                            <div className="flex items-center gap-2">
                                <Zap size={12} className="text-violet-400" />
                                <span className="text-xs font-black text-gray-800">{activeProfile?.age || '--'}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Location</span>
                            <div className="flex items-center gap-2">
                                <MapPin size={12} className="text-violet-400" />
                                <span className="text-xs font-black text-gray-800 line-clamp-1">
                                    {activeProfile?.city ? `${activeProfile.city}, ${activeProfile.state}` : 'Not provided'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action List Section */}
                <div className="space-y-3">
                    <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] ml-2">Learning Progress</h4>
                    <div className="bg-white rounded-[2rem] shadow-lg border border-gray-50 overflow-hidden p-2">
                        <Link href="/profile/my-tests"
                            className="w-full h-14 bg-white hover:bg-violet-50/50 rounded-2xl flex items-center px-4 gap-4 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                <Star size={18} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-extrabold text-gray-800 text-xs tracking-tight uppercase">Test Attempts</p>
                                <p className="text-[9px] text-gray-400 font-bold">Review your past performance</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-violet-600 transition-colors" />
                        </Link>

                        <div className="h-px bg-gray-50 mx-4" />

                        <Link href="/profile/enrolled"
                            className="w-full h-14 bg-white hover:bg-violet-50/50 rounded-2xl flex items-center px-4 gap-4 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                <BookOpen size={18} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-extrabold text-gray-800 text-xs tracking-tight uppercase">Enrolled Videos</p>
                                <p className="text-[9px] text-gray-400 font-bold">Continue your learning journey</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-violet-600 transition-colors" />
                        </Link>

                        <div className="h-px bg-gray-50 mx-4" />

                        <Link href="/profile/orders"
                            className="w-full h-14 bg-white hover:bg-violet-50/50 rounded-2xl flex items-center px-4 gap-4 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <Receipt size={18} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-extrabold text-gray-800 text-xs tracking-tight uppercase">Order History</p>
                                <p className="text-[9px] text-gray-400 font-bold">View receipts and transactions</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-violet-600 transition-colors" />
                        </Link>
                    </div>

                    <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] ml-2 mt-4">Support & Feedback</h4>
                    <div className="bg-white rounded-[2rem] shadow-lg border border-gray-50 overflow-hidden p-2">
                        <Link href="/help"
                            className="w-full h-14 bg-white hover:bg-violet-50/50 rounded-2xl flex items-center px-4 gap-4 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                <HelpCircle size={18} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-extrabold text-gray-800 text-xs tracking-tight uppercase">Help & Support</p>
                                <p className="text-[9px] text-gray-400 font-bold">FAQs and Contact Support</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-violet-600 transition-colors" />
                        </Link>
                    </div>

                    <button onClick={() => { if (confirm('Are you sure you want to logout?')) { logout(); router.push('/sign-in'); } }}
                        className="w-full h-14 bg-rose-50 rounded-2xl flex items-center px-4 border border-rose-100 mt-6 group card-hover">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                            <LogOut size={18} />
                        </div>
                        <p className="flex-1 text-left font-black text-rose-600 text-[11px] tracking-[0.1em] uppercase ml-4">Logout Session</p>
                    </button>
                </div>
            </div>

            {/* Modern Edit Modal */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end backdrop-blur-sm">
                    <div className="bg-white w-full rounded-t-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Update Profile</h2>
                            <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">✕</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Full Name', key: 'name', type: 'text', full: true },
                                { label: 'Mobile Number', key: 'mobile', type: 'tel', full: true },
                                { label: 'Age', key: 'age', type: 'number' },
                                { label: 'Pincode', key: 'pincode', type: 'text' },
                                { label: 'City', key: 'city', type: 'text' },
                                { label: 'State', key: 'state', type: 'text' },
                            ].map(({ label, key, type, full }) => (
                                <div key={key} className={`${full ? 'col-span-2' : 'col-span-1'}`}>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{label}</label>
                                    <input
                                        type={type}
                                        value={(form as any)[key]}
                                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-4 text-xs font-bold text-gray-800 focus:outline-none focus:border-violet-300 focus:bg-white transition-all shadow-inner"
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl py-4 font-black transition-all mt-8 mb-4 shadow-xl shadow-violet-200 disabled:opacity-50"
                        >
                            {saving ? 'UPDATING...' : 'SAVE CHANGES'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
