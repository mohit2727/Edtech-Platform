const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { cacheMiddleware } = require('./middleware/cacheMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// ─── Security & Parsing ─────────────────────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// ─── CORS ────────────────────────────────────────────────────────────────────
// Set ALLOWED_ORIGINS in .env (comma-separated)
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl)
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
app.set('trust proxy', 1); // Trust Render's proxy to get real client IP
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 500, // Increased from 150 to allow more headroom
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ─── Routes ──────────────────────────────────────────────────────────────────
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const testRoutes = require('./routes/testRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const quizPlaylistRoutes = require('./routes/quizPlaylistRoutes');

// Public cached routes (2 min TTL applied at route level)
app.use('/api/courses', courseRoutes);
app.use('/api/announcements', announcementRoutes);
// Leaderboard cached 30s
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/quiz-playlists', quizPlaylistRoutes);

const __dirname_path = path.resolve();
app.use('/uploads', express.static(path.join(__dirname_path, '/uploads')));

app.get('/', (req, res) => {
    res.json({ message: 'Physical Education API is running', status: 'ok' });
});

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
