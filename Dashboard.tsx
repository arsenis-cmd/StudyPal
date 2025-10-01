import React, { useState } from 'react';
import { BookOpen, Brain, FileText, Award, TrendingUp, Clock, Target, Zap } from 'lucide-react';

const StudyPalDashboard = () => {
  const [stats, setStats] = useState({
    totalStudyTime: 847,
    documentsUploaded: 12,
    flashcardsReviewed: 342,
    quizzesCompleted: 18,
    averageQuizScore: 87,
    currentStreak: 7
  });

  const [recentDocuments, setRecentDocuments] = useState([
    { id: 1, title: 'Biology Chapter 5', cards: 45, mastered: 32, difficulty: 'medium' },
    { id: 2, title: 'Machine Learning Notes', cards: 67, mastered: 45, difficulty: 'hard' },
    { id: 3, title: 'Spanish Vocabulary', cards: 89, mastered: 78, difficulty: 'easy' },
    { id: 4, title: 'Chemistry Formulas', cards: 34, mastered: 20, difficulty: 'hard' }
  ]);

  const [dueForReview, setDueForReview] = useState([
    { id: 1, front: 'What is photosynthesis?', difficulty: 'easy', nextReview: 'Today' },
    { id: 2, front: 'Define gradient descent', difficulty: 'hard', nextReview: 'Today' },
    { id: 3, front: 'Conjugate "hablar" in preterite', difficulty: 'medium', nextReview: 'Today' }
  ]);

  const [studyActivity, setStudyActivity] = useState([
    { day: 'Mon', minutes: 45, cards: 23 },
    { day: 'Tue', minutes: 67, cards: 34 },
    { day: 'Wed', minutes: 89, cards: 45 },
    { day: 'Thu', minutes: 52, cards: 28 },
    { day: 'Fri', minutes: 78, cards: 38 },
    { day: 'Sat', minutes: 95, cards: 52 },
    { day: 'Sun', minutes: 72, cards: 41 }
  ]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const maxActivity = Math.max(...studyActivity.map(a => a.minutes));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-indigo-600" />
            StudyPal Dashboard
          </h1>
          <p className="text-gray-600">AI-powered learning companion tracking your progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{formatTime(stats.totalStudyTime)}</div>
            <div className="text-xs text-gray-500 mt-1">Study Time</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-gray-500">Docs</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.documentsUploaded}</div>
            <div className="text-xs text-gray-500 mt-1">Documents</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-pink-500">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-pink-500" />
              <span className="text-xs text-gray-500">Cards</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.flashcardsReviewed}</div>
            <div className="text-xs text-gray-500 mt-1">Reviewed</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-gray-500">Quizzes</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.quizzesCompleted}</div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-green-500" />
              <span className="text-xs text-gray-500">Average</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.averageQuizScore}%</div>
            <div className="text-xs text-gray-500 mt-1">Quiz Score</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-gray-500">Days</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.currentStreak} 🔥</div>
            <div className="text-xs text-gray-500 mt-1">Study Streak</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Study Documents */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Your Study Materials
            </h2>
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{doc.cards} flashcards</span>
                        <span className="text-green-600">{doc.mastered} mastered</span>
                        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(doc.difficulty)}`}>
                          {doc.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {Math.round((doc.mastered / doc.cards) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(doc.mastered / doc.cards) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-colors">
                + Upload New Document
              </button>
            </div>
          </div>

          {/* Due for Review */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-pink-600" />
              Due for Review
            </h2>
            <div className="space-y-3">
              {dueForReview.map((card) => (
                <div key={card.id} className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-800">{card.front}</p>
                    <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(card.difficulty)}`}>
                      {card.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{card.nextReview}</span>
                    <button className="text-xs bg-indigo-500 text-white px-3 py-1 rounded-full hover:bg-indigo-600 transition-colors">
                      Review
                    </button>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-colors">
                Start Review Session
              </button>
            </div>
          </div>
        </div>

        {/* Study Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Weekly Activity
            </h2>
            <div className="space-y-4">
              {studyActivity.map((activity, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 w-12">{activity.day}</span>
                    <span className="text-gray-500">{activity.minutes} min</span>
                    <span className="text-indigo-600">{activity.cards} cards</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-400 to-purple-400 h-2 rounded-full"
                        style={{ width: `${(activity.minutes / maxActivity) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full"
                        style={{ width: `${(activity.cards / 52) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-800 font-medium">
                🎯 You're on track! Keep studying to maintain your {stats.currentStreak}-day streak.
              </p>
            </div>
          </div>

          {/* Quick Actions & AI Insights */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              AI Insights & Actions
            </h2>
            
            <div className="space-y-4">
              {/* AI Recommendations */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Adaptive Learning Insight</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      You're excelling at easy cards! Consider increasing difficulty to maximize learning efficiency.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Strong Performance</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Your retention rate for Biology is 92%! Time to move to advanced topics.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Focus Recommendation</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Chemistry formulas need attention. Review 15 more cards to improve mastery.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors">
                  Generate Quiz
                </button>
                <button className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-indigo-600 transition-colors">
                  Study Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Ready to boost your learning?</h3>
          <p className="mb-4 opacity-90">Upload your study materials and let AI create personalized flashcards and quizzes</p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
            Upload Your First Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyPalDashboard;
