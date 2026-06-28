const express = require('express');
const router = express.Router();
const {
    getTests,
    getTestById,
    createTest,
    updateTestStatus,
    updateLeaderboardStatus,
    updateTestLockStatus,
    updateTest,
    submitTest,
    deleteTest,
    getTestLeaderboardAdmin,
    getMergedTestLeaderboardsAdmin,
    updateQuestion,
    deleteQuestion
} = require('../controllers/testController');
const { protect, optionalAuth, adminProtect } = require('../middleware/authMiddleware');

// Public browsing (attach user if logged in for access checks)
router.get('/', optionalAuth, getTests);
router.get('/:id', optionalAuth, getTestById);

// Student must be logged in to submit
router.post('/submit', protect, submitTest);

// Admin routes (Firebase Auth)
router.post('/', adminProtect, createTest);
router.put('/:id', adminProtect, updateTest);
router.put('/:id/status', adminProtect, updateTestStatus);
router.put('/:id/lock', adminProtect, updateTestLockStatus);
router.put('/:id/leaderboard', adminProtect, updateLeaderboardStatus);
router.get('/:id/leaderboard', adminProtect, getTestLeaderboardAdmin);
router.post('/merged-leaderboard', adminProtect, getMergedTestLeaderboardsAdmin);
router.put('/:id/questions/:questionId', adminProtect, updateQuestion);
router.delete('/:id/questions/:questionId', adminProtect, deleteQuestion);
router.delete('/:id', adminProtect, deleteTest);

module.exports = router;
