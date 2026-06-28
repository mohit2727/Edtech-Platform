'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video,
    Plus,
    Trash2,
    MoreVertical,
    Loader2,
    Youtube,
    CheckCircle2,
    XCircle,
    GripVertical,
    ArrowLeft,
    Upload
} from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailClient() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<any>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const fetchCourse = async () => {
        if (!id || authLoading || !user) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/courses/${id}`);
            setCourse(data);
        } catch (err) {
            console.error('Failed to fetch course');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && !authLoading && user) fetchCourse();
    }, [id, authLoading, user]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await api.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setImage(data);
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/courses/${id}/lessons`, { title, videoUrl, content, image });
            setShowAddModal(false);
            fetchCourse();
            setTitle('');
            setVideoUrl('');
            setContent('');
            setImage('');
        } catch (err) {
            alert('Failed to add video');
        }
    };

    const handleUpdateVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLesson) return;
        try {
            await api.put(`/courses/${id}/lessons/${selectedLesson._id}`, { title, videoUrl, content, image });
            setShowEditModal(false);
            fetchCourse();
            setTitle('');
            setVideoUrl('');
            setContent('');
            setImage('');
            setSelectedLesson(null);
        } catch (err) {
            alert('Failed to update video');
        }
    };

    const openEditModal = (lesson: any) => {
        setSelectedLesson(lesson);
        setTitle(lesson.title);
        setVideoUrl(lesson.videoUrl);
        setContent(lesson.content || '');
        setImage(lesson.image || '');
        setShowEditModal(true);
    };

    const handleDeleteVideo = async (lessonId: string) => {
        if (!window.confirm("Are you sure you want to delete this video?")) return;
        try {
            await api.delete(`/courses/${id}/lessons/${lessonId}`);
            fetchCourse();
        } catch (err) {
            alert('Failed to delete video');
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mb-10">
                <Link
                    href="/dashboard/courses"
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all mb-4 group text-xs font-black uppercase tracking-widest"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    Back to Playlists
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{course?.title}</h1>
                        <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-tight">Manage the instructional videos and curriculum for this playlist.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 text-sm active:scale-95"
                    >
                        <Plus className="w-5 h-5" strokeWidth={3} />
                        Add Video
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm min-h-[400px]">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="bg-blue-600 w-1.5 h-5 rounded-full" />
                        Curriculum Content
                    </h2>
                    <span className="bg-slate-50 text-slate-400 font-black px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest border border-slate-100">
                        {course?.lessons?.length || 0} Lessons
                    </span>
                </div>

                <div className="space-y-3">
                    {course?.lessons?.length > 0 ? (
                        course.lessons.map((lesson: any, index: number) => (
                            <motion.div
                                key={lesson._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-5 group hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="text-slate-300 group-hover:text-slate-400 transition-colors">
                                    <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center">
                                    {lesson.image ? (
                                        <img src={lesson.image.startsWith('http') ? lesson.image : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL || ''}${lesson.image}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Youtube className="w-6 h-6 text-red-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-0.5">
                                        <h4 className="font-black text-sm text-slate-900 truncate">{lesson.title}</h4>
                                        <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md tracking-widest border ${lesson.isActive ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                                            {lesson.isActive ? 'VISIBLE' : 'HIDDEN'}
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-[10px] font-bold truncate max-w-sm uppercase tracking-tight">{lesson.videoUrl}</p>
                                </div>
                                <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                    <button
                                        onClick={() => openEditModal(lesson)}
                                        className="p-2 bg-white text-slate-400 hover:text-blue-600 rounded-lg border border-slate-200 hover:border-blue-200 shadow-sm transition-all"
                                        title="Edit Video"
                                    >
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteVideo(lesson._id)}
                                        className="p-2 bg-white text-slate-400 hover:text-red-500 rounded-lg border border-slate-200 hover:border-red-200 shadow-sm transition-all"
                                        title="Delete Video"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-24 flex flex-col items-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                            <Video className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Content Found</h3>
                            <p className="text-slate-400 mt-1 text-xs font-bold">Start building your course by adding the first video.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Video Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 w-full max-w-md rounded-[1.5rem] p-7 shadow-2xl relative z-10"
                        >
                            <h2 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Add New Video</h2>
                            <p className="text-slate-400 mb-6 text-xs font-bold uppercase tracking-widest">Connect a YouTube resource to this playlist.</p>

                            <form onSubmit={handleAddVideo} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Video Title</label>
                                    <input
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                        placeholder="e.g., Lesson 1: Introduction"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Thumbnail URL</label>
                                        <input
                                            type="text"
                                            value={image}
                                            onChange={(e) => setImage(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Or Upload</label>
                                        <label className="flex items-center justify-center gap-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer">
                                            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                            {image ? 'Change' : 'Pick File'}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                        </label>
                                    </div>
                                </div>

                                {image && (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                                        <img src={image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL || ''}${image}`} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setImage('')} className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-600 p-1.5 rounded-lg border border-slate-100 shadow-sm">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">YouTube Video URL</label>
                                    <div className="relative">
                                        <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                                        <input
                                            required
                                            type="url"
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                            placeholder="https://youtube.com/watch?v=..."
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tight">Unlisted YouTube links are recommended.</p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-xl transition-all font-bold text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[1.5] bg-slate-900 hover:bg-slate-800 text-white font-black text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-200 active:scale-95"
                                    >
                                        Add to Playlist
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Video Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEditModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 w-full max-w-md rounded-[1.5rem] p-7 shadow-2xl relative z-10"
                        >
                            <h2 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Edit Video</h2>
                            <p className="text-slate-400 mb-6 text-xs font-bold uppercase tracking-widest">Update video details and accessibility.</p>

                            <form onSubmit={handleUpdateVideo} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Video Title</label>
                                    <input
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Thumbnail URL</label>
                                        <input
                                            type="text"
                                            value={image}
                                            onChange={(e) => setImage(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Or Upload</label>
                                        <label className="flex items-center justify-center gap-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer">
                                            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                            Update File
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                        </label>
                                    </div>
                                </div>

                                {image && (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                                        <img src={image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL || ''}${image}`} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setImage('')} className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-600 p-1.5 rounded-lg border border-slate-100 shadow-sm">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">YouTube Video URL</label>
                                    <div className="relative">
                                        <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                                        <input
                                            required
                                            type="url"
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedLesson(null);
                                        }}
                                        className="flex-1 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-xl transition-all font-bold text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[1.5] bg-slate-900 hover:bg-slate-800 text-white font-black text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-200 active:scale-95"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
