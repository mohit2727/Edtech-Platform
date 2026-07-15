const express = require('express');
const router = express.Router();
const {
    loginOrRegister,
    adminLogin,
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
    createUserAdmin
} = require('../controllers/userController');
const { protect, optionalAuth, adminProtect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginOrRegister);
router.post('/admin-login', adminLogin);
router.get('/leaderboard', optionalAuth, getLeaderboard);


// Student protected routes (JWT)
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.get('/my-courses', protect, getMyCourses);
router.get('/my-attempts', protect, getMyAttempts);
router.get('/my-attempts/:id', protect, getAttemptById);

// Admin protected routes (Firebase Auth)
router.get('/dashboard-stats', adminProtect, getDashboardStats);

router.route('/')
    .get(adminProtect, getUsers)
    .post(adminProtect, createUserAdmin);

router.route('/:id')
    .get(adminProtect, getUserById)
    .put(adminProtect, updateUserAdmin)
    .delete(adminProtect, deleteUser);

router.put('/:id/access', adminProtect, grantUserAccess);
router.delete('/:id/access', adminProtect, revokeUserAccess);

module.exports = router;
