const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Test = require('../models/testModel');
const Announcement = require('../models/announcementModel');
const QuizPlaylist = require('../models/quizPlaylistModel');
const TestAttempt = require('../models/testAttemptModel');

// ─── Helper: Generate JWT ────────────────────────────────────────────────────
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Login or Register a student by mobile number
// @route   POST /api/users/login
// @access  Public
const loginOrRegister = asyncHandler(async (req, res) => {
    const { mobile, name, age, city, state, pincode } = req.body;

    if (!mobile || !name) {
        res.status(400);
        throw new Error('Mobile number and name are required');
    }

    // Normalize mobile: strip spaces, ensure 10 digits
    const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);
    if (normalizedMobile.length !== 10) {
        res.status(400);
        throw new Error('Please enter a valid 10-digit mobile number');
    }

    // Try to find existing user by mobile
    let user = await User.findOne({ mobile: normalizedMobile });

    if (user) {
        // Returning user — update their profile details if provided
        if (name) user.name = name;
        if (age) user.age = age;
        if (city) user.city = city;
        if (state) user.state = state;
        if (pincode) user.pincode = pincode;
        await user.save();
    } else {
        // New user — create account
        user = await User.create({
            mobile: normalizedMobile,
            name,
            age: age || '',
            city: city || '',
            state: state || '',
            pincode: pincode || '',
            role: 'student',
        });
    }

    // Generate JWT and return
    const token = generateToken(user._id);

    res.json({
        token,
        user: {
            _id: user._id,
            name: user.name,
            mobile: user.mobile,
            age: user.age,
            city: user.city,
            state: user.state,
            pincode: user.pincode,
            role: user.role,
            enrolledCourses: user.enrolledCourses || [],
            purchasedQuizzes: user.purchasedQuizzes || [],
            purchasedPlaylists: user.purchasedPlaylists || [],
        },
    });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            age: user.age,
            city: user.city,
            state: user.state,
            pincode: user.pincode,
            role: user.role,
            enrolledCourses: user.enrolledCourses || [],
            purchasedQuizzes: user.purchasedQuizzes || [],
            purchasedPlaylists: user.purchasedPlaylists || [],
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name ?? user.name;
        user.mobile = req.body.mobile ?? user.mobile;
        user.age = req.body.age ?? user.age;
        user.city = req.body.city ?? user.city;
        user.state = req.body.state ?? user.state;
        user.pincode = req.body.pincode ?? user.pincode;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            age: updatedUser.age,
            city: updatedUser.city,
            state: updatedUser.state,
            pincode: updatedUser.pincode,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get leaderboard (top students for the currently active quiz)
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = asyncHandler(async (req, res) => {
    // 1. Find all tests marked "isLeaderboardActive"
    const activeTests = await Test.find({ isLeaderboardActive: true });

    if (!activeTests || activeTests.length === 0) {
        return res.json({ quizTitle: 'Currently no leaderboards active', rankings: [] });
    }

    const testIds = activeTests.map(t => t._id);

    // Combine titles
    const combinedTitle = activeTests.map(t => t.title).join(' / ');

    // 2. Fetch Attempts for all active tests
    const attempts = await TestAttempt.find({ test: { $in: testIds } })
        .populate('user', 'name email role')
        .sort({ createdAt: 1 });

    // 3. Process attempts
    const studentAttemptsMap = {};

    for (const attempt of attempts) {
        if (attempt.user && attempt.user.role === 'student') {
            const userIdStr = attempt.user._id.toString();

            if (!studentAttemptsMap[userIdStr]) {
                studentAttemptsMap[userIdStr] = {
                    user: attempt.user,
                    score: attempt.score || 0,
                    timeSpent: attempt.timeSpent || 0,
                    submittedAt: attempt.createdAt,
                    testMap: { [attempt.test.toString()]: true }
                };
            } else {
                const testIdStr = attempt.test.toString();
                if (!studentAttemptsMap[userIdStr].testMap[testIdStr]) {
                    studentAttemptsMap[userIdStr].score += attempt.score || 0;
                    studentAttemptsMap[userIdStr].timeSpent += attempt.timeSpent || 0;
                    studentAttemptsMap[userIdStr].testMap[testIdStr] = true;
                }
            }
        }
    }

    // 4. Calculate rankings
    const allRankings = [];
    for (const [userIdStr, data] of Object.entries(studentAttemptsMap)) {
        allRankings.push({
            _id: userIdStr,
            name: data.user.name,
            score: Math.round(data.score * 100) / 100,
            timeSpent: data.timeSpent
        });
    }

    // 5. Sort Rankings: Highest Score -> Lowest Time Spent
    allRankings.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.timeSpent - b.timeSpent;
    });
    
    // 6. Find current user's rank
    let currentUserRank = null;
    if (req.user) {
        const userIndex = allRankings.findIndex(r => r._id.toString() === req.user._id.toString());
        if (userIndex !== -1) {
            currentUserRank = {
                ...allRankings[userIndex],
                rank: userIndex + 1
            };
        }
    }

    res.json({
        quizTitle: combinedTitle,
        rankings: allRankings.slice(0, 50),
        currentUserRank: currentUserRank
    });
});

// @desc    Get admin dashboard stats
// @route   GET /api/users/dashboard-stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const studentCount = await User.countDocuments({ role: 'student' });
    
    const paidUserCount = await User.countDocuments({ 
        role: 'student', 
        $or: [
            { 'enrolledCourses.0': { $exists: true } },
            { 'purchasedQuizzes.0': { $exists: true } },
            { 'purchasedPlaylists.0': { $exists: true } }
        ]
    });

    const activeCourseCount = await Course.countDocuments({ isActive: true });
    const activeQuizPlaylistCount = await QuizPlaylist.countDocuments({ isActive: true });
    const quizCount = await Test.countDocuments({});

    const [recentQuizzes, recentCourses, recentAnnouncements] = await Promise.all([
        Test.find().sort({ createdAt: -1 }).limit(5).select('title createdAt'),
        Course.find().sort({ createdAt: -1 }).limit(5).select('title createdAt'),
        Announcement.find().sort({ createdAt: -1 }).limit(5).select('title createdAt')
    ]);

    const activities = [
        ...recentQuizzes.map(q => ({
            title: `Quiz Generated: "${q.title}"`,
            time: q.createdAt,
            type: 'quiz',
            color: 'bg-purple-500'
        })),
        ...recentCourses.map(c => ({
            title: `Course Uploaded: "${c.title}"`,
            time: c.createdAt,
            type: 'course',
            color: 'bg-amber-500'
        })),
        ...recentAnnouncements.map(a => ({
            title: `Announcement Posted: "${a.title}"`,
            time: a.createdAt,
            type: 'announcement',
            color: 'bg-blue-500'
        }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

    res.json({
        students: studentCount,
        paidUsers: paidUserCount,
        courses: activeCourseCount,
        playlists: activeCourseCount + activeQuizPlaylistCount,
        quizzes: quizCount,
        recentActivities: activities,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
});

// @desc    Get user's enrolled courses
// @route   GET /api/users/my-courses
// @access  Private
const getMyCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find({ isActive: true })
        .populate('instructor', 'name');
    res.json(courses);
});

// @desc    Get user's test attempts
// @route   GET /api/users/my-attempts
// @access  Private
const getMyAttempts = asyncHandler(async (req, res) => {
    const attempts = await TestAttempt.find({ user: req.user._id })
        .populate('test', 'title duration')
        .sort({ createdAt: -1 });
    res.json(attempts);
});

// @desc    Get specific test attempt with questions
// @route   GET /api/users/my-attempts/:id
// @access  Private
const getAttemptById = asyncHandler(async (req, res) => {
    const attempt = await TestAttempt.findOne({ _id: req.params.id, user: req.user._id })
        .populate({
            path: 'test',
            select: 'title questions totalMarks duration'
        });

    if (attempt) {
        res.json(attempt);
    } else {
        res.status(404);
        throw new Error('Attempt not found');
    }
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'student' })
        .sort({ createdAt: -1 });
    res.json(users);
});

// @desc    Get detailed user info for admin
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .populate('enrolledCourses', 'title')
        .populate('purchasedQuizzes', 'title')
        .populate('purchasedPlaylists', 'title');

    if (user) {
        const allAttempts = await TestAttempt.find({ user: user._id })
            .populate('test', 'title totalMarks')
            .sort({ createdAt: 1 });

        const firstAttemptsMap = new Map();
        for (const attempt of allAttempts) {
            if (attempt.test && !firstAttemptsMap.has(attempt.test._id.toString())) {
                firstAttemptsMap.set(attempt.test._id.toString(), attempt);
            }
        }
        
        const attempts = Array.from(firstAttemptsMap.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const isPaid = (user.purchasedQuizzes && user.purchasedQuizzes.length > 0) || 
                       (user.purchasedPlaylists && user.purchasedPlaylists.length > 0) ||
                       (user.enrolledCourses && user.enrolledCourses.length > 0);

        res.json({
            ...user._doc,
            isPaid,
            attempts
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update any user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserAdmin = asyncHandler(async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    name: req.body.name,
                    mobile: req.body.mobile,
                    email: req.body.email,
                    age: req.body.age,
                    city: req.body.city,
                    state: req.body.state,
                    pincode: req.body.pincode,
                    role: req.body.role,
                }
            },
            { new: true, runValidators: true }
        );

        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(error.name === 'ValidationError' ? 400 : 500);
        throw new Error(error.message);
    }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await TestAttempt.deleteMany({ user: user._id });
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Grant access to a specific item (Course/Quiz/Playlist)
// @route   PUT /api/users/:id/access
// @access  Private/Admin
const grantUserAccess = asyncHandler(async (req, res) => {
    const { itemId, type } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (type === 'course') {
        if (!user.enrolledCourses.includes(itemId)) {
            user.enrolledCourses.push(itemId);
        }
    } else if (type === 'quiz') {
        if (!user.purchasedQuizzes.includes(itemId)) {
            user.purchasedQuizzes.push(itemId);
        }
    } else if (type === 'playlist') {
        if (!user.purchasedPlaylists.includes(itemId)) {
            user.purchasedPlaylists.push(itemId);
        }
    } else {
        res.status(400);
        throw new Error('Invalid item type specified');
    }

    const updatedUser = await user.save();
    
    const populatedUser = await User.findById(updatedUser._id)
        .populate('enrolledCourses', 'title')
        .populate('purchasedQuizzes', 'title')
        .populate('purchasedPlaylists', 'title');

    res.json(populatedUser);
});

// @desc    Revoke access from a specific item (Course/Quiz/Playlist)
// @route   DELETE /api/users/:id/access
// @access  Private/Admin
const revokeUserAccess = asyncHandler(async (req, res) => {
    const { itemId, type } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (type === 'course') {
        user.enrolledCourses = user.enrolledCourses.filter(id => id.toString() !== itemId);
    } else if (type === 'quiz') {
        user.purchasedQuizzes = user.purchasedQuizzes.filter(id => id.toString() !== itemId);
    } else if (type === 'playlist') {
        user.purchasedPlaylists = user.purchasedPlaylists.filter(id => id.toString() !== itemId);
    } else {
        res.status(400);
        throw new Error('Invalid item type specified');
    }

    const updatedUser = await user.save();
    
    const populatedUser = await User.findById(updatedUser._id)
        .populate('enrolledCourses', 'title')
        .populate('purchasedQuizzes', 'title')
        .populate('purchasedPlaylists', 'title');

    res.json(populatedUser);
});

// @desc    Admin manually create a user
// @route   POST /api/users
// @access  Private/Admin
const createUserAdmin = asyncHandler(async (req, res) => {
    const { name, email, mobile, role } = req.body;

    if (!name || !mobile) {
        res.status(400);
        throw new Error('Name and Mobile are required');
    }

    const userExists = await User.findOne({ mobile });

    if (userExists) {
        res.status(400);
        throw new Error('User with this mobile already exists');
    }

    const user = await User.create({
        name,
        email: email || undefined,
        mobile,
        role: role || 'student',
    });

    if (user) {
        res.status(201).json(user);
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

module.exports = {
    loginOrRegister,
    getUserProfile,
    getLeaderboard,
    getDashboardStats,
    updateUserProfile,
    getMyCourses,
    getMyAttempts,
    getAttemptById,
    getUsers,
    getUserById,
    updateUserAdmin,
    deleteUser,
    grantUserAccess,
    revokeUserAccess,
    createUserAdmin,
};
