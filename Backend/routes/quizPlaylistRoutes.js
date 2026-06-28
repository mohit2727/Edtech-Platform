const express = require('express');
const router = express.Router();
const {
    getPlaylists,
    getPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
} = require('../controllers/quizPlaylistController');
const { optionalAuth, adminProtect } = require('../middleware/authMiddleware');

// Public browsing
router.get('/', optionalAuth, getPlaylists);
router.get('/:id', optionalAuth, getPlaylistById);

// Admin routes (Firebase Auth)
router.post('/', adminProtect, createPlaylist);
router.put('/:id', adminProtect, updatePlaylist);
router.delete('/:id', adminProtect, deletePlaylist);

module.exports = router;
