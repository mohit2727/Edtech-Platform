const asyncHandler = require('express-async-handler');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const QuizPlaylist = require('../models/quizPlaylistModel');
const TestAttempt = require('../models/testAttemptModel');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Public (optionalAuth — personalized if logged in)
const getDashboardStats = asyncHandler(async (req, res) => {
    let totalEnrolled = 0;
    let quizzesTakenCount = 0;

    // If user is logged in, show personalized stats
    if (req.user) {
        const user = await User.findById(req.user._id);
        if (user) {
            const enrolledCoursesCount = user.enrolledCourses?.length || 0;
            const purchasedPlaylistsCount = user.purchasedQuizzes?.length || 0;
            totalEnrolled = enrolledCoursesCount + purchasedPlaylistsCount;

            const uniqueTests = await TestAttempt.distinct('test', { user: req.user._id });
            quizzesTakenCount = uniqueTests.length;
        }
    }

    // Public stats (always available)
    const activeCoursesCount = await Course.countDocuments({ isActive: true });
    const activeQuizPlaylistsCount = await QuizPlaylist.countDocuments({ isActive: true });
    const totalPlaylistsAvailable = activeCoursesCount + activeQuizPlaylistsCount;

    // Latest Content
    const newestCourses = await Course.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();
    
    const newestQuizPlaylists = await QuizPlaylist.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

    const coursesMapped = newestCourses.map(c => ({ ...c, contentType: 'video' }));
    const quizPlaylistsMapped = newestQuizPlaylists.map(q => ({ ...q, contentType: 'quiz' }));

    const latestContent = [...coursesMapped, ...quizPlaylistsMapped]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

    res.json({
        stats: {
            totalPlaylists: totalPlaylistsAvailable,
            enrolled: totalEnrolled,
            quizzesTaken: quizzesTakenCount,
        },
        latestContent,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
});

module.exports = {
    getDashboardStats,
};
