import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import documentRoutes from './routes/documents';
import flashcardRoutes from './routes/flashcards';
import quizRoutes from './routes/quizzes';
import studyRoutes from './routes/study';
import { errorHandler } from './middleware/errorHandler';
import { limiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/study', studyRoutes);

app.use(errorHandler);

app.
