import React, { useState } from 'react';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';
import { apiRequest } from '@/config/api';

interface LessonRatingFeedbackProps {
  lessonId: string;
  lessonTitle: string;
  initialRating?: number;
  initialFeedback?: string;
}

const LessonRatingFeedback: React.FC<LessonRatingFeedbackProps> = ({
  lessonId,
  lessonTitle,
  initialRating,
  initialFeedback
}) => {
  const [rating, setRating] = useState<number>(initialRating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(initialFeedback || '');
  const [submitted, setSubmitted] = useState<boolean>(!!initialRating);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  const { playSound } = useAudioFeedback();

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
    playSound('click');
    // Auto-open feedback form if rating is 3 or below
    if (starRating <= 3) {
      setShowFeedbackForm(true);
    }
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest('POST', `/api/academy/lesson/${lessonId}/rating`, {
        rating,
        feedback: feedback.trim() || undefined
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        playSound('achievement');
        // Show success message
        setTimeout(() => {
          alert(`Thank you for rating this lesson ${rating} stars! Your feedback helps us improve.`);
        }, 100);
      } else {
        alert('Failed to submit rating. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('An error occurred while submitting your rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setSubmitted(false);
    setShowFeedbackForm(true);
  };

  const getRatingMessage = (stars: number) => {
    const messages = {
      1: 'Poor - Needs Improvement',
      2: 'Fair - Could Be Better',
      3: 'Good - Satisfactory',
      4: 'Very Good - Exceeded Expectations',
      5: 'Excellent - Outstanding!'
    };
    return messages[stars as keyof typeof messages] || 'Select a rating';
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl shadow-lg p-8 border-2 border-yellow-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
            <i className="fas fa-star text-white text-xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900">Rate This Lesson</h3>
            <p className="text-gray-600">Help us improve your learning experience</p>
          </div>
        </div>
        {submitted && (
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">
            <i className="fas fa-check-circle mr-1"></i>
            Submitted
          </span>
        )}
      </div>

      {/* Star Rating */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => !submitted && handleStarClick(star)}
              onMouseEnter={() => !submitted && handleStarHover(star)}
              onMouseLeave={() => !submitted && setHoveredRating(0)}
              disabled={submitted}
              className={`transition-all duration-200 ${
                submitted ? 'cursor-default' : 'cursor-pointer hover:scale-125'
              }`}
              aria-label={`Rate ${star} stars`}
            >
              <i
                className={`fas fa-star text-5xl ${
                  star <= displayRating
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } ${!submitted && 'hover:text-yellow-400'}`}
              ></i>
            </button>
          ))}
        </div>

        {/* Rating Message */}
        <div className="text-center">
          <p className={`text-lg font-bold ${
            displayRating > 0 ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {displayRating > 0 ? getRatingMessage(displayRating) : 'Click a star to rate'}
          </p>
          {rating > 0 && !submitted && (
            <p className="text-sm text-gray-600 mt-1">
              You selected {rating} {rating === 1 ? 'star' : 'stars'}
            </p>
          )}
        </div>
      </div>

      {/* Feedback Section */}
      {(showFeedbackForm || feedback) && !submitted && (
        <div className="mb-6">
          <div className="bg-white rounded-xl p-6 border-2 border-yellow-300">
            <label className="block mb-3">
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-comment-dots text-yellow-600"></i>
                <span className="font-bold text-gray-900">
                  Share Your Feedback {rating <= 3 && <span className="text-sm text-gray-600">(Optional but encouraged)</span>}
                </span>
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What did you like? What could be improved? Your feedback helps us create better content..."
                rows={4}
                maxLength={1000}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all resize-none text-gray-800"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  {feedback.length}/1000 characters
                </span>
                {feedback.length >= 50 && (
                  <span className="text-sm text-green-600 font-medium">
                    <i className="fas fa-check-circle mr-1"></i>
                    Thanks for the detailed feedback!
                  </span>
                )}
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Quick Feedback Tags (Optional Enhancement) */}
      {!submitted && rating > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            <i className="fas fa-tags mr-1"></i>
            Quick Tags (Optional):
          </p>
          <div className="flex flex-wrap gap-2">
            {rating >= 4 ? (
              // Positive tags
              ['Clear & Concise', 'Great Examples', 'Well Structured', 'Practical', 'Engaging'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (feedback.includes(tag)) {
                      setFeedback(feedback.replace(tag + ', ', '').replace(tag, ''));
                    } else {
                      setFeedback(feedback ? `${feedback}, ${tag}` : tag);
                    }
                    playSound('click');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    feedback.includes(tag)
                      ? 'bg-green-500 text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-500'
                  }`}
                >
                  {feedback.includes(tag) && <i className="fas fa-check mr-1"></i>}
                  {tag}
                </button>
              ))
            ) : (
              // Improvement tags
              ['Too Short', 'Needs Examples', 'Unclear Instructions', 'Too Advanced', 'Too Basic'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (feedback.includes(tag)) {
                      setFeedback(feedback.replace(tag + ', ', '').replace(tag, ''));
                    } else {
                      setFeedback(feedback ? `${feedback}, ${tag}` : tag);
                    }
                    playSound('click');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    feedback.includes(tag)
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-500'
                  }`}
                >
                  {feedback.includes(tag) && <i className="fas fa-check mr-1"></i>}
                  {tag}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {!submitted ? (
          <>
            {!showFeedbackForm && rating > 3 && (
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="flex-1 px-6 py-3 bg-white border-2 border-yellow-400 text-yellow-700 rounded-xl font-bold hover:bg-yellow-50 transition-all"
              >
                <i className="fas fa-comment mr-2"></i>
                Add Feedback
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Submit Rating
                </>
              )}
            </button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-between bg-green-50 border-2 border-green-300 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-white"></i>
              </div>
              <div>
                <p className="font-bold text-green-900">Thank You!</p>
                <p className="text-sm text-green-700">Your feedback has been submitted</p>
              </div>
            </div>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-white border-2 border-green-300 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-all"
            >
              <i className="fas fa-edit mr-1"></i>
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Info Text */}
      <div className="mt-6 pt-6 border-t border-yellow-200">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <i className="fas fa-info-circle text-yellow-600 mt-0.5"></i>
          <p>
            Your rating helps us understand what's working and what needs improvement. All feedback is reviewed by our content team to enhance future lessons.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LessonRatingFeedback;
