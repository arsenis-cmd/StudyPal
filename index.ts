// src/index.ts - StudyPal Express Server
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

app.listen(PORT, () => {
  console.log(`StudyPal API running on port ${PORT}`);
});

// src/routes/documents.ts - Document Management Routes
import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import Document from '../models/Document';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', authenticate, upload.single('file'), async (req: any, res) => {
  try {
    const file = req.file;
    const { title, description, tags } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Send to NLP service for processing
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), file.originalname);

    const nlpResponse = await axios.post(
      `${process.env.NLP_API_URL}/parse-document`,
      formData,
      { headers: formData.getHeaders() }
    );

    const { text, metadata } = nlpResponse.data;

    // Analyze content
    const analysisResponse = await axios.post(
      `${process.env.NLP_API_URL}/analyze`,
      { text, title }
    );

    // Create document record
    const document = new Document({
      user_id: req.userId,
      title: title || file.originalname,
      description,
      file_url: file.path,
      file_type: file.mimetype,
      file_size: file.size,
      content_text: text,
      processing_status: 'completed',
      metadata: metadata,
      ai_analysis: analysisResponse.data,
      tags: tags ? tags.split(',') : []
    });

    await document.save();

    // Clean up temp file
    fs.unlinkSync(file.path);

    res.status(201).json(document);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

router.get('/', authenticate, async (req: any, res) => {
  try {
    const documents = await Document.find({ user_id: req.userId })
      .sort({ created_at: -1 })
      .select('-content_text'); // Don't send full text in list

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user_id: req.userId
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      user_id: req.userId
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete associated file
    if (fs.existsSync(document.file_url)) {
      fs.unlinkSync(document.file_url);
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;

// src/routes/flashcards.ts - Flashcard Routes
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import Flashcard from '../models/Flashcard';
import Document from '../models/Document';
import axios from 'axios';

const router = Router();

router.post('/generate', authenticate, async (req: any, res) => {
  try {
    const { document_id, count = 10, difficulty = 'medium' } = req.body;

    const document = await Document.findOne({
      _id: document_id,
      user_id: req.userId
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Generate flashcards using NLP service
    const response = await axios.post(`${process.env.NLP_API_URL}/generate-flashcards`, {
      text: document.content_text,
      count,
      difficulty
    });

    const { flashcards } = response.data;

    // Save flashcards to database
    const savedCards = await Promise.all(
      flashcards.map(async (card: any) => {
        const flashcard = new Flashcard({
          user_id: req.userId,
          document_id: document_id,
          front: card.front,
          back: card.back,
          context: card.context,
          difficulty: card.difficulty,
          spaced_repetition: {
            easiness_factor: 2.5,
            interval: 1,
            repetitions: 0,
            next_review_date: new Date(),
            last_reviewed: null
          }
        });
        return await flashcard.save();
      })
    );

    res.status(201).json({
      flashcards: savedCards,
      total_generated: savedCards.length
    });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

router.get('/due', authenticate, async (req: any, res) => {
  try {
    const now = new Date();
    
    const dueCards = await Flashcard.find({
      user_id: req.userId,
      is_archived: false,
      'spaced_repetition.next_review_date': { $lte: now }
    }).limit(50);

    res.json(dueCards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch due cards' });
  }
});

router.post('/:id/review', authenticate, async (req: any, res) => {
  try {
    const { quality, response_time } = req.body; // quality: 0-5
    const cardId = req.params.id;

    const flashcard = await Flashcard.findOne({
      _id: cardId,
      user_id: req.userId
    });

    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    // Update spaced repetition using SM-2 algorithm
    const sr = flashcard.spaced_repetition;
    let newEF = sr.easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEF < 1.3) newEF = 1.3;

    let newInterval, newRepetitions;
    
    if (quality < 3) {
      newRepetitions = 0;
      newInterval = 1;
    } else {
      if (sr.repetitions === 0) {
        newInterval = 1;
      } else if (sr.repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(sr.interval * newEF);
      }
      newRepetitions = sr.repetitions + 1;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    // Update flashcard
    flashcard.spaced_repetition = {
      easiness_factor: newEF,
      interval: newInterval,
      repetitions: newRepetitions,
      next_review_date: nextReviewDate,
      last_reviewed: new Date()
    };

    flashcard.review_history.push({
      reviewed_at: new Date(),
      quality,
      response_time,
      was_correct: quality >= 3
    });

    flashcard.times_reviewed += 1;
    if (quality >= 3) {
      flashcard.times_correct += 1;
    } else {
      flashcard.times_incorrect += 1;
    }

    await flashcard.save();

    res.json({
      flashcard,
      next_review: nextReviewDate,
      message: quality >= 3 ? 'Great job!' : 'Keep practicing!'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

router.get('/', authenticate, async (req: any, res) => {
  try {
    const { document_id } = req.query;
    
    const query: any = { user_id: req.userId, is_archived: false };
    if (document_id) query.document_id = document_id;

    const flashcards = await Flashcard.find(query)
      .sort({ created_at: -1 })
      .limit(100);

    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

router.put('/:id', authenticate, async (req: any, res) => {
  try {
    const { front, back, difficulty, is_starred } = req.body;
    
    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { front, back, difficulty, is_starred },
      { new: true }
    );

    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
});

router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    await Flashcard.findOneAndDelete({
      _id: req.params.id,
      user_id: req.userId
    });

    res.json({ message: 'Flashcard deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

export default router;

// src/routes/quizzes.ts - Quiz Routes
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import Quiz from '../models/Quiz';
import QuizAttempt from '../models/QuizAttempt';
import Document from '../models/Document';
import axios from 'axios';

const router = Router();

router.post('/generate', authenticate, async (req: any, res) => {
  try {
    const { document_id, question_count = 10, quiz_type = 'multiple_choice' } = req.body;

    const document = await Document.findOne({
      _id: document_id,
      user_id: req.userId
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Generate quiz using NLP service
    const response = await axios.post(`${process.env.NLP_API_URL}/generate-quiz`, {
      text: document.content_text,
      question_count,
      quiz_type
    });

    const { questions, total_points } = response.data;

    // Create quiz
    const quiz = new Quiz({
      user_id: req.userId,
      document_id,
      title: `Quiz: ${document.title}`,
      quiz_type,
      questions,
      total_questions: questions.length,
      total_points,
      time_limit: null,
      passing_score: 70
    });

    await quiz.save();

    res.status(201).json(quiz);
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

router.get('/', authenticate, async (req: any, res) => {
  try {
    const quizzes = await Quiz.find({
      user_id: req.userId,
      is_active: true
    }).sort({ created_at: -1 });

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user_id: req.userId
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

router.post('/:id/start', authenticate, async (req: any, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user_id: req.userId
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const attempt = new QuizAttempt({
      user_id: req.userId,
      quiz_id: quiz._id,
      started_at: new Date(),
      status: 'in_progress',
      answers: []
    });

    await attempt.save();

    res.json({
      attempt_id: attempt._id,
      quiz: quiz,
      started_at: attempt.started_at
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start quiz' });
  }
});

router.post('/attempts/:id/submit', authenticate, async (req: any, res) => {
  try {
    const { answers } = req.body; // Array of {question_id, user_answer, time_spent}
    
    const attempt = await QuizAttempt.findOne({
      _id: req.params.id,
      user_id: req.userId
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Quiz attempt not found' });
    }

    const quiz = await Quiz.findById(attempt.quiz_id);

    // Grade the quiz
    let correctCount = 0;
    let totalPoints = 0;

    const gradedAnswers = answers.map((ans: any) => {
      const question = quiz.questions.find(q => q.question_id.toString() === ans.question_id);
      const isCorrect = question && question.correct_answer === ans.user_answer;
      
      if (isCorrect) {
        correctCount++;
        totalPoints += question.points;
      }

      return {
        question_id: ans.question_id,
        user_answer: ans.user_answer,
        is_correct: isCorrect,
        time_spent: ans.time_spent,
        answered_at: new Date()
      };
    });

    const score = (correctCount / quiz.total_questions) * 100;
    const totalTime = gradedAnswers.reduce((sum: number, ans: any) => sum + ans.time_spent, 0);

    // Analyze performance
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    gradedAnswers.forEach((ans: any) => {
      const question = quiz.questions.find(q => q.question_id.toString() === ans.question_id);
      if (question) {
        if (ans.is_correct) {
          if (question.difficulty === 'hard') strengths.push('Complex concepts');
        } else {
          weaknesses.push(question.difficulty + ' questions');
        }
      }
    });

    attempt.answers = gradedAnswers;
    attempt.score = score;
    attempt.points_earned = totalPoints;
    attempt.total_time = totalTime;
    attempt.completed_at = new Date();
    attempt.status = 'completed';
    attempt.performance_analysis = {
      strengths: [...new Set(strengths)],
      weaknesses: [...new Set(weaknesses)],
      recommended_study_materials: [quiz.document_id]
    };

    await attempt.save();

    res.json({
      score,
      points_earned: totalPoints,
      total_points: quiz.total_points,
      correct_answers: correctCount,
      total_questions: quiz.total_questions,
      passed: score >= quiz.passing_score,
      performance_analysis: attempt.performance_analysis,
      time_spent: totalTime
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

export default router;

// src/routes/study.ts - Study Session & Analytics Routes
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import StudySession from '../models/StudySession';
import Flashcard from '../models/Flashcard';
import QuizAttempt from '../models/QuizAttempt';

const router = Router();

router.post('/session/start', authenticate, async (req: any, res) => {
  try {
    const { session_type, document_ids } = req.body;

    const session = new StudySession({
      user_id: req.userId,
      session_type,
      documents_studied: document_ids || [],
      started_at: new Date(),
      flashcards_reviewed: [],
      quizzes_taken: []
    });

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start session' });
  }
});

router.post('/session/:id/end', authenticate, async (req: any, res) => {
  try {
    const { cards_reviewed, cards_correct } = req.body;

    const session = await StudySession.findOne({
      _id: req.params.id,
      user_id: req.userId
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.ended_at = new Date();
    session.duration = Math.round((session.ended_at.getTime() - session.started_at.getTime()) / 60000);
    session.cards_reviewed = cards_reviewed;
    session.cards_correct = cards_correct;
    session.focus_score = cards_reviewed > 0 ? (cards_correct / cards_reviewed) * 100 : 0;

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to end session' });
  }
});

router.get('/analytics', authenticate, async (req: any, res) => {
  try {
    const userId = req.userId;

    // Get study statistics
    const sessions = await StudySession.find({ user_id: userId });
    const flashcards = await Flashcard.find({ user_id: userId });
    const quizAttempts = await QuizAttempt.find({ user_id: userId, status: 'completed' });

    const totalStudyTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalFlashcards = flashcards.length;
    const reviewedFlashcards = flashcards.filter(f => f.times_reviewed > 0).length;
    const averageQuizScore = quizAttempts.length > 0
      ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length
      : 0;

    // Get recent activity
    const recentSessions = sessions.sort((a, b) => 
      b.started_at.getTime() - a.started_at.getTime()
    ).slice(0, 7);

    res.json({
      total_study_time: totalStudyTime,
      total_flashcards: totalFlashcards,
      flashcards_reviewed: reviewedFlashcards,
      quizzes_completed: quizAttempts.length,
      average_quiz_score: Math.round(averageQuizScore),
      recent_sessions: recentSessions,
      study_streak: calculateStreak(sessions)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

function calculateStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;

  const sortedSessions = sessions.sort((a, b) => 
    b.started_at.getTime() - a.started_at.getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const session of sortedSessions) {
    const sessionDate = new Date(session.started_at);
    sessionDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDiff === streak) {
      streak++;
      currentDate = sessionDate;
    } else if (dayDiff > streak) {
      break;
    }
  }

  return streak;
}

export default router;
