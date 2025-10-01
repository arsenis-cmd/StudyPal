# 🧠 StudyPal - AI-Powered Study Companion

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

An intelligent learning platform that transforms study materials into interactive flashcards and adaptive quizzes using natural language processing. StudyPal helps students learn more efficiently with AI-powered content analysis, spaced repetition algorithms, and personalized difficulty adjustment.

## Key Features

### Document Processing
- **Multi-format Support** - Upload PDF, DOCX, or TXT files
- **Intelligent Text Extraction** - Parses complex documents with high accuracy
- **AI Content Analysis** - Automatically identifies key concepts, topics, and difficulty level
- **Smart Summarization** - Generates concise summaries using extractive NLP

### Flashcard System
- **Auto-generation** - Creates flashcards from uploaded documents using NLP
- **Spaced Repetition (SM-2)** - Optimizes review timing based on performance
- **Manual Editing** - Customize AI-generated cards to your preferences
- **Progress Tracking** - Monitor mastery levels for each card

### Adaptive Quizzes
- **Multiple Question Types** - Multiple choice, true/false, fill-in-the-blank
- **Difficulty Adaptation** - Adjusts based on user performance
- **Instant Feedback** - Detailed explanations for each answer
- **Performance Analytics** - Identifies strengths and knowledge gaps

### Learning Analytics
- **Study Session Tracking** - Records time, cards reviewed, and accuracy
- **Streak Monitoring** - Gamified daily study streaks
- **Progress Dashboard** - Visual insights into learning patterns
- **AI Recommendations** - Personalized study suggestions

## Architecture

```
┌────────────────────────────────┐
│   React Frontend (TypeScript)  │
│  - Document Upload Interface   │
│  - Flashcard Review System     │
│  - Quiz Taking Platform        │
│  - Analytics Dashboard         │
└───────────┬────────────────────┘
            │ REST API
┌───────────▼────────────────────┐
│  Node.js + Express Backend     │
│  - Authentication (JWT)        │
│  - Document Management         │
│  - Spaced Repetition Logic     │
│  - Study Session Tracking      │
└──┬─────────────────────┬───────┘
   │                     │
   ▼                     ▼
┌──────────┐      ┌─────────────────────┐
│ MongoDB  │      │  Python NLP Service │
│          │      │    (FastAPI)        │
│ - Users  │      │  - PDF Parsing      │
│ - Docs   │      │  - Text Analysis    │
│ - Cards  │      │  - Summarization    │
│ - Quizzes│      │  - Flashcard Gen    │
│ - Sessions│     │  - Quiz Generation  │
└──────────┘      └─────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API requests
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads

### NLP/AI Service
- **Python 3.10+** with FastAPI
- **spaCy** for NLP tasks
- **PyPDF2** for PDF parsing
- **python-docx** for Word documents
- **scikit-learn** for ML algorithms

### Algorithms
- **SM-2 Spaced Repetition** - Optimizes flashcard review intervals
- **Extractive Summarization** - Sentence scoring and ranking
- **Keyword Extraction** - TF-IDF and noun phrase analysis
- **Difficulty Estimation** - Multi-factor text complexity analysis

## Getting Started

### Prerequisites
```bash
node >= 18.0.0
python >= 3.10
mongodb >= 5.0
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/studypal.git
cd studypal
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure MongoDB URI and NLP API URL
npm run dev
```

3. **NLP Service Setup**
```bash
cd nlp_service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload
```

4. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/studypal
JWT_SECRET=your-secret-key
NLP_API_URL=http://localhost:8000
PORT=3000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:3000/api
```

## 📚 API Documentation

### Documents
- `POST /api/documents/upload` - Upload and process document
- `GET /api/documents` - List user's documents
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document

### Flashcards
- `POST /api/flashcards/generate` - Generate flashcards from document
- `GET /api/flashcards/due` - Get cards due for review
- `POST /api/flashcards/:id/review` - Submit flashcard review
- `GET /api/flashcards` - List all flashcards
- `PUT /api/flashcards/:id` - Update flashcard
- `DELETE /api/flashcards/:id` - Delete flashcard

### Quizzes
- `POST /api/quizzes/generate` - Generate quiz from document
- `GET /api/quizzes` - List available quizzes
- `GET /api/quizzes/:id` - Get quiz details
- `POST /api/quizzes/:id/start` - Start quiz attempt
- `POST /api/quizzes/attempts/:id/submit` - Submit quiz answers

### Study Analytics
- `POST /api/study/session/start` - Start study session
- `POST /api/study/session/:id/end` - End study session
- `GET /api/study/analytics` - Get study statistics

### NLP Endpoints
- `POST /nlp/parse-document` - Extract text from file
- `POST /nlp/analyze` - Analyze content
- `POST /nlp/generate-flashcards` - Create flashcards
- `POST /nlp/generate-quiz` - Create quiz questions
- `POST /nlp/summarize` - Generate summary

## Spaced Repetition Algorithm (SM-2)

StudyPal implements the SuperMemo 2 (SM-2) algorithm for optimal review scheduling:

```python
# Quality rating: 0-5 (0=blackout, 5=perfect)
new_EF = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

if quality < 3:  # Incorrect
    interval = 1 day
    repetitions = 0
else:  # Correct
    if repetitions == 0:
        interval = 1 day
    elif repetitions == 1:
        interval = 6 days
    else:
        interval = previous_interval * EF
```

**Benefits:**
- Cards you know well appear less frequently
- Struggling cards appear more often
- Review timing adapts to individual retention patterns
- Maximizes long-term memory retention

## Screenshots

### Dashboard
![Dashboard showing study stats, recent documents, and due flashcards]

### Flashcard Review
![Interactive flashcard with flip animation and quality rating]

### Quiz Interface
![Multiple choice quiz with instant feedback]

### Document Upload
![Drag-and-drop upload with AI analysis progress]

## NLP Features Explained

### Text Extraction
- **PDF**: Uses PyPDF2 to extract text from all pages
- **DOCX**: Parses Word documents with python-docx
- **TXT**: Direct UTF-8 text reading

### Content Analysis
1. **Named Entity Recognition** - Identifies people, places, concepts
2. **Noun Phrase Extraction** - Finds key terms and topics
3. **Difficulty Estimation** - Analyzes sentence complexity, vocabulary diversity
4. **Topic Modeling** - Extracts main themes using frequency analysis

### Flashcard Generation Strategies
1. **Definition Detection** - Finds "X is Y" patterns
2. **Important Sentence Selection** - Scores based on keywords and length
3. **Key Term Extraction** - Creates term-definition pairs

### Quiz Generation
- **Multiple Choice**: Blanks out key terms, generates distractors
- **True/False**: Modifies statements to create false versions
- **Adaptive Difficulty**: Adjusts question complexity based on user level

## Database Schema Highlights

### Flashcard Model
```javascript
{
  front: String,
  back: String,
  spaced_repetition: {
    easiness_factor: Number,
    interval: Number,
    repetitions: Number,
    next_review_date: Date
  },
  review_history: [{
    quality: Number,
    response_time: Number
  }]
}
```

### Quiz Attempt Model
```javascript
{
  quiz_id: ObjectId,
  answers: [{
    question_id: ObjectId,
    user_answer: String,
    is_correct: Boolean
  }],
  score: Number,
  performance_analysis: {
    strengths: [String],
    weaknesses: [String]
  }
}
```

## Development Roadmap

### Phase 1: Core Features 
- [x] Document upload and parsing
- [x] Flashcard generation
- [x] Spaced repetition system
- [x] Quiz generation
- [x] Basic analytics

### Phase 2: Enhanced Learning (4 weeks)
- [ ] Voice-to-text for flashcard answers
- [ ] Image occlusion for diagrams
- [ ] Collaborative study sets
- [ ] Mobile app (React Native)

### Phase 3: Advanced AI (6 weeks)
- [ ] GPT integration for better content generation
- [ ] Personalized learning paths
- [ ] Predictive performance modeling
- [ ] Natural language quiz answers (not just multiple choice)

### Phase 4: Social Features (4 weeks)
- [ ] Study groups and leaderboards
- [ ] Shared flashcard decks
- [ ] Peer tutoring matching
- [ ] Study challenges and competitions

## Testing

```bash
# Backend tests
cd backend
npm test

# NLP service tests
cd nlp_service
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📈 Performance Metrics

- **Document Processing**: <5 seconds for typical PDF
- **Flashcard Generation**: ~10 cards per second
- **Spaced Repetition Calculation**: <10ms per card
- **Quiz Generation**: <3 seconds for 10 questions
- **API Response Time**: <100ms for most endpoints

## Security Features

- **Authentication**: JWT tokens with secure httpOnly cookies
- **File Validation**: Type and size checks before processing
- **Input Sanitization**: Prevents XSS and injection attacks
- **Rate Limiting**: Prevents API abuse
- **Data Privacy**: User data encrypted at rest

## What I Learned

Through building StudyPal, I gained expertise in:
- Natural language processing with spaCy
- Complex algorithm implementation (SM-2)
- File parsing and text extraction
- MongoDB schema design for flexible data
- Microservices architecture
- Educational technology best practices

## Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Author

**Your Name**

- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)

---

**Built with ❤️ to help students learn more effectively through AI-powered study tools**
