const express = require('express');
const router = express.Router();
const {
    getAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} = require('../controllers/announcementController');
const { adminProtect } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

router.get('/', cacheMiddleware(120), getAnnouncements); // Public
router.get('/all', adminProtect, getAllAnnouncements);
router.post('/', adminProtect, createAnnouncement);
router.put('/:id', adminProtect, updateAnnouncement);
router.delete('/:id', adminProtect, deleteAnnouncement);

module.exports = router;
