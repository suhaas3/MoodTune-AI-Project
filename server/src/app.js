import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import favouriteRoutes from './routes/favouriteRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

// 1. CORS Configuration for React Frontend with Cookies
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in development
    }
  },
  credentials: true, // Allow cookies to be sent and received
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 2. Body and Cookie Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Request Logger (Development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 4. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'MoodTune AI Core API'
  });
});

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/recommendations', recommendationRoutes);

// 6. Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;
