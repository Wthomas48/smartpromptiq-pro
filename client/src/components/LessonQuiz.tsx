import React, { useState } from 'react';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}

interface LessonQuizProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, totalPoints: number) => void;
}

const LessonQuiz: React.FC<LessonQuizProps> = ({ questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const { playSound, setMuted, isMuted } = useAudioFeedback();

  const question = questions[currentQuestion];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  const handleAnswer = (answer: any) => {
    setAnswers({ ...answers, [question.id]: answer });
    setShowExplanation(true);

    // Play audio feedback based on correctness
    const correct = String(answer) === String(question.correctAnswer);
    playSound(correct ? 'success' : 'error');
  };

  const handleNext = () => {
    setShowExplanation(false);
    playSound('progress');
    if (isLastQuestion) {
      calculateResults();
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const calculateResults = () => {
    let score = 0;
    let totalPoints = 0;

    questions.forEach((q) => {
      totalPoints += q.points;
      const userAnswer = answers[q.id];
      const correct = String(userAnswer) === String(q.correctAnswer);
      if (correct) {
        score += q.points;
      }
    });

    // Play completion sound based on passing/failing
    const percentage = Math.round((score / totalPoints) * 100);
    playSound(percentage >= 70 ? 'achievement' : 'complete');

    setShowResults(true);
    if (onComplete) {
      onComplete(score, totalPoints);
    }
  };

  const isCorrect = () => {
    return String(answers[question.id]) === String(question.correctAnswer);
  };

  const getPercentage = () => {
    let score = 0;
    let totalPoints = 0;

    questions.forEach((q) => {
      totalPoints += q.points;
      const userAnswer = answers[q.id];
      const correct = String(userAnswer) === String(q.correctAnswer);
      if (correct) {
        score += q.points;
      }
    });

    return Math.round((score / totalPoints) * 100);
  };

  if (showResults) {
    const percentage = getPercentage();
    const passed = percentage >= 70;

    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-100">
        <div className="text-center">
          <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${
            passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-orange-400 to-red-500'
          }`}>
            <i className={`fas ${passed ? 'fa-trophy' : 'fa-chart-line'} text-white text-6xl`}></i>
          </div>
          <h3 className="text-4xl font-extrabold text-gray-900 mb-4">
            {passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}
          </h3>
          <div className="text-7xl font-black mb-6">
            <span className={passed ? 'text-green-600' : 'text-orange-600'}>{percentage}%</span>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            {passed
              ? "You've mastered this lesson! Ready for the next challenge?"
              : "Review the material and try again to score 70% or higher."}
          </p>

          {/* Question Breakdown */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Question Breakdown</h4>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const userAnswer = answers[q.id];
                const correct = String(userAnswer) === String(q.correctAnswer);
                return (
                  <div key={q.id} className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <span className="text-gray-700 font-medium">Question {idx + 1}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {correct ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                      <span className="text-gray-500 text-sm">{q.points} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentQuestion(0);
              setAnswers({});
              setShowResults(false);
              setShowExplanation(false);
            }}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
          >
            <i className="fas fa-redo mr-2"></i>
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-100">
      {/* Audio Control */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setMuted(!isMuted)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition"
          title={isMuted ? 'Unmute audio feedback' : 'Mute audio feedback'}
        >
          <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
          <span className="font-medium">{isMuted ? 'Muted' : 'Sound On'}</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-600">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <span className="text-sm font-bold text-purple-600">
            {question.points} points
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{question.question}</h3>

        {/* Multiple Choice */}
        {question.type === 'multiple-choice' && question.options && (
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showExplanation}
                className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                  answers[question.id] === idx
                    ? showExplanation
                      ? isCorrect()
                        ? 'bg-green-100 border-2 border-green-500 text-green-900'
                        : 'bg-red-100 border-2 border-red-500 text-red-900'
                      : 'bg-purple-100 border-2 border-purple-500 text-purple-900'
                    : 'bg-gray-50 border-2 border-gray-200 hover:border-purple-300 text-gray-700'
                } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-102'}`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold ${
                    answers[question.id] === idx
                      ? showExplanation
                        ? isCorrect()
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-purple-500 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{option}</span>
                  {showExplanation && idx === question.correctAnswer && (
                    <i className="fas fa-check-circle ml-auto text-green-500 text-xl"></i>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* True/False */}
        {question.type === 'true-false' && (
          <div className="grid grid-cols-2 gap-4">
            {['True', 'False'].map((option, idx) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={showExplanation}
                className={`p-6 rounded-xl font-bold text-lg transition-all ${
                  answers[question.id] === option
                    ? showExplanation
                      ? isCorrect()
                        ? 'bg-green-100 border-4 border-green-500 text-green-900'
                        : 'bg-red-100 border-4 border-red-500 text-red-900'
                      : 'bg-purple-100 border-4 border-purple-500 text-purple-900'
                    : 'bg-gray-50 border-4 border-gray-200 hover:border-purple-300 text-gray-700'
                } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
              >
                {option}
                {showExplanation && option === question.correctAnswer && (
                  <i className="fas fa-check-circle ml-2 text-green-500"></i>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Fill in the Blank */}
        {question.type === 'fill-blank' && (
          <div>
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
              disabled={showExplanation}
              placeholder="Type your answer here..."
              className={`w-full p-4 rounded-xl border-2 text-lg font-medium ${
                showExplanation
                  ? isCorrect()
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-red-500 bg-red-50 text-red-900'
                  : 'border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
              }`}
            />
            {!showExplanation && (
              <button
                onClick={() => handleAnswer(answers[question.id])}
                disabled={!answers[question.id]?.trim()}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className={`mb-8 p-6 rounded-2xl ${
          isCorrect() ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'
        }`}>
          <div className="flex items-start space-x-3">
            <i className={`fas ${isCorrect() ? 'fa-check-circle text-green-600' : 'fa-lightbulb text-orange-600'} text-2xl mt-1`}></i>
            <div className="flex-1">
              <h4 className={`font-bold text-lg mb-2 ${isCorrect() ? 'text-green-900' : 'text-orange-900'}`}>
                {isCorrect() ? 'Correct!' : 'Not quite!'}
              </h4>
              <p className={`${isCorrect() ? 'text-green-800' : 'text-orange-800'}`}>
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      {showExplanation && (
        <button
          onClick={handleNext}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-lg"
        >
          {isLastQuestion ? (
            <>
              <i className="fas fa-flag-checkered mr-2"></i>
              See Results
            </>
          ) : (
            <>
              Next Question
              <i className="fas fa-arrow-right ml-2"></i>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default LessonQuiz;
