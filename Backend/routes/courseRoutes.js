const express = require('express');
const router = express.Router();
const {
    getCourses,
    getCourseById,
    createCourse,
    updateCourseStatus,
    addLesson,
    deleteLesson,
    deleteCourse,
    updateCourse,
    updateLesson,
} = require('../controllers/courseController');
const { optionalAuth, adminProtect } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Public browsing (attach user if logged in for enrollment checks)
router.get('/', optionalAuth, cacheMiddleware(120), getCourses);
router.get('/:id', optionalAuth, cacheMiddleware(120), getCourseById);

// Admin routes (Firebase Auth)
router.post('/', adminProtect, createCourse);
router.put('/:id/status', adminProtect, updateCourseStatus);
router.post('/:id/lessons', adminProtect, addLesson);
router.delete('/:id/lessons/:lessonId', adminProtect, deleteLesson);
router.put('/:id/lessons/:lessonId', adminProtect, updateLesson);
router.delete('/:id', adminProtect, deleteCourse);
router.put('/:id', adminProtect, updateCourse);

module.exports = router;
