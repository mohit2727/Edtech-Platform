const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        firebaseUid: {
            type: String,
            required: false,
            unique: true,
            sparse: true, // Allows multiple null/missing UIDs while enforcing uniqueness for non-null values
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: false,
            unique: true,
            sparse: true, // Allow multiple users without email
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
        },
        age: {
            type: String,
            default: '',
        },
        city: {
            type: String,
            default: '',
        },
        state: {
            type: String,
            default: '',
        },
        pincode: {
            type: String,
            default: '',
        },
        role: {
            type: String,
            required: true,
            enum: ['student', 'admin'],
            default: 'student',
        },
        totalScore: {
            type: Number,
            default: 0,
        },
        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],
        purchasedQuizzes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Test',
            },
        ],
        purchasedPlaylists: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'QuizPlaylist',
            },
        ],
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
