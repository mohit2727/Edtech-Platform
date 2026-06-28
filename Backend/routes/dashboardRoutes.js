const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Dashboard stats — works for logged-in users (shows personalized data)
// and guests (shows generic stats)
router.get('/', optionalAuth, getDashboardStats);

module.exports = router;
