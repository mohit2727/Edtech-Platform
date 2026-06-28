const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadAndGenerateQuiz } = require('../controllers/uploadController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

// Configure Multer
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /pdf|docx|csv/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname) {
            return cb(null, true);
        } else {
            cb('Error: PDF, DOCX, or CSV files only!');
        }
    },
});

const uploadImage = multer({
    storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpg|jpeg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    },
});

router.post('/quiz', adminProtect, upload.single('file'), uploadAndGenerateQuiz);

router.post('/image', protect, uploadImage.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No image uploaded');
    }
    res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

module.exports = router;
