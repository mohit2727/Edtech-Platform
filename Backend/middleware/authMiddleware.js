const jwt = require('jsonwebtoken');
const admin = require('../config/firebase-admin');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// ─── Student Auth: JWT-based ─────────────────────────────────────────────────
// Requires a valid JWT token. Used for student-facing protected routes.
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(401);
            throw new Error('User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('JWT auth error:', error.message);
        res.status(401);
        throw new Error('Not authorized, invalid token');
    }
});

// ─── Optional Auth: Attach user if token present, but don't require it ───────
// Used for public routes where we want to know the user IF they are logged in
// (e.g., to check enrollment status, purchased quizzes, etc.)
const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user) {
                req.user = user;
            }
        } catch (error) {
            // Token invalid — that's fine, just continue as guest
            console.log('Optional auth: invalid token, continuing as guest');
        }
    }

    next();
});

// ─── Admin Auth: Firebase-based ──────────────────────────────────────────────
// Verifies Firebase ID token AND checks admin role. Used for admin panel routes.
const adminProtect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    try {
        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const firebaseUid = decodedToken.uid;

        // Find user in DB by Firebase UID
        const user = await User.findOne({ firebaseUid });

        if (!user) {
            res.status(401);
            throw new Error('Admin user not found in database');
        }

        if (user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized as an admin');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Firebase admin auth error:', error.message);
        if (!res.statusCode || res.statusCode === 200) res.status(401);
        throw new Error(error.message || 'Not authorized: Invalid token');
    }
});

// ─── Role Check: Admin only ─────────────────────────────────────────────────
const adminCheck = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { protect, optionalAuth, adminProtect, admin: adminCheck };
