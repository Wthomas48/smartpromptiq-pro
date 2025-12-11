import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Zap,
  Target,
  Users,
  Clock,
  Lightbulb,
  TrendingUp,
  Award,
  Send,
  X,
  CheckCircle
} from "lucide-react";

interface RatingCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  rating: number;
  color: string;
}

interface RatingData {
  category: string;
  feature: string;
  rating: number;
  feedback: string;
  context: any;
  timestamp: Date;
  userId?: string;
}

interface RatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: {
    type: 'feature_use' | 'session_end' | 'error_recovery' | 'milestone' | 'manual';
    context: any;
    feature?: string;
    category?: string;
  };
  onRatingComplete?: (rating: RatingData) => void;
}

const defaultCategories: RatingCategory[] = [
  {
    id: 'usability',
    name: 'User Experience',
    description: 'How easy and intuitive is the interface?',
    icon: <Users className="w-5 h-5" />,
    rating: 0,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'How fast and responsive is the application?',
    icon: <Zap className="w-5 h-5" />,
    rating: 0,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'accuracy',
    name: 'AI Accuracy',
    description: 'How accurate and helpful are the AI suggestions?',
    icon: <Target className="w-5 h-5" />,
    rating: 0,
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'features',
    name: 'Feature Quality',
    description: 'How useful are the available features?',
    icon: <Award className="w-5 h-5" />,
    rating: 0,
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'innovation',
    name: 'Innovation',
    description: 'How innovative and cutting-edge is the platform?',
    icon: <Lightbulb className="w-5 h-5" />,
    rating: 0,
    color: 'bg-orange-100 text-orange-800'
  }
];

export default function RatingPopup({ isOpen, onClose, trigger, onRatingComplete }: RatingPopupProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<'overall' | 'detailed' | 'feedback' | 'complete'>('overall');
  const [overallRating, setOverallRating] = useState(0);
  const [categories, setCategories] = useState<RatingCategory[]>(defaultCategories);
  const [feedback, setFeedback] = useState('');
  const [isPositive, setIsPositive] = useState<boolean | null>(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('overall');
      setOverallRating(0);
      setCategories(defaultCategories.map(cat => ({ ...cat, rating: 0 })));
      setFeedback('');
      setIsPositive(null);
      setHoveredStar(0);
      setHoveredCategory(null);
    }
  }, [isOpen]);

  // Submit rating mutation
  const submitRatingMutation = useMutation({
    mutationFn: async (ratingData: RatingData) => {
      const response = await apiRequest("POST", "/api/feedback/rating", ratingData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      setCurrentStep('complete');
      onRatingComplete?.(data);

      toast({
        title: "Thank You!",
        description: "Your feedback helps us improve SmartPromptIQ Pro",
      });

      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    },
  });

  const handleStarClick = (rating: number, categoryId?: string) => {
    if (categoryId) {
      setCategories(prev => prev.map(cat =>
        cat.id === categoryId ? { ...cat, rating } : cat
      ));
    } else {
      setOverallRating(rating);
      setIsPositive(rating >= 4);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'overall' && overallRating > 0) {
      setCurrentStep('detailed');
    } else if (currentStep === 'detailed') {
      setCurrentStep('feedback');
    }
  };

  const handleSubmit = () => {
    const ratingData: RatingData = {
      category: trigger.category || 'general',
      feature: trigger.feature || 'overall',
      rating: overallRating,
      feedback: feedback,
      context: {
        ...trigger.context,
        triggerType: trigger.type,
        categoryRatings: categories.reduce((acc, cat) => ({
          ...acc,
          [cat.id]: cat.rating
        }), {}),
        isPositive,
        step: currentStep
      },
      timestamp: new Date()
    };

    submitRatingMutation.mutate(ratingData);
  };

  // Memoize renderStars to prevent recreation on every render
  const renderStars = useCallback((rating: number, onRate: (rating: number) => void, hover?: number) => {
    return (
      <div className="flex items-center justify-center space-x-1 sm:space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="transition-transform hover:scale-110 active:scale-95 focus:outline-none touch-manipulation"
          >
            <Star
              className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                star <= (hover || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  }, []); // Empty deps - only needs to be created once

  // Memoize progress calculation
  const stepProgress = useMemo(() => {
    switch (currentStep) {
      case 'overall': return 25;
      case 'detailed': return 50;
      case 'feedback': return 75;
      case 'complete': return 100;
      default: return 0;
    }
  }, [currentStep]);

  // Memoize trigger title
  const triggerTitle = useMemo(() => {
    switch (trigger.type) {
      case 'feature_use': return `How was your experience with ${trigger.feature || 'this feature'}?`;
      case 'session_end': return 'How was your session today?';
      case 'error_recovery': return 'We\'ve fixed the issue - how did we do?';
      case 'milestone': return 'Congratulations! How are we doing so far?';
      case 'manual': return 'We\'d love your feedback!';
      default: return 'Rate Your Experience';
    }
  }, [trigger.type, trigger.feature]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
              <span className="line-clamp-2">{triggerTitle}</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={stepProgress} className="h-2" />
          <div className="hidden sm:flex justify-between text-xs text-gray-500">
            <span>Overall Rating</span>
            <span>Category Details</span>
            <span>Feedback</span>
            <span>Complete</span>
          </div>
          <div className="flex sm:hidden justify-between text-xs text-gray-500">
            <span>Overall</span>
            <span>Details</span>
            <span>Feedback</span>
            <span>Done</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Overall Rating Step */}
          {currentStep === 'overall' && (
            <div className="text-center space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Overall Experience</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">How would you rate SmartPromptIQ Pro overall?</p>

                <div className="flex justify-center">
                  {renderStars(overallRating, (rating) => handleStarClick(rating), hoveredStar)}
                </div>

                {overallRating > 0 && (
                  <div className="mt-4">
                    <Badge className={`${
                      overallRating >= 4 ? 'bg-green-100 text-green-800' :
                      overallRating >= 3 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {overallRating === 5 ? 'Excellent!' :
                       overallRating === 4 ? 'Great!' :
                       overallRating === 3 ? 'Good' :
                       overallRating === 2 ? 'Fair' : 'Needs Improvement'}
                    </Badge>
                  </div>
                )}
              </div>

              {overallRating > 0 && (
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 sm:space-x-3">
                  <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                    Skip Details
                  </Button>
                  <Button onClick={handleNextStep} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                    Continue with Details
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Detailed Category Ratings */}
          {currentStep === 'detailed' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center px-2">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Help Us Improve</h3>
                <p className="text-sm sm:text-base text-gray-600">Rate specific areas to help us focus our improvements</p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-3 sm:p-4 border rounded-lg transition-colors ${
                      hoveredCategory === category.id ? 'bg-gray-50' : ''
                    }`}
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className={`p-1.5 sm:p-2 rounded-lg ${category.color} flex-shrink-0`}>
                          {category.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">{category.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{category.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-0.5 sm:space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleStarClick(star, category.id)}
                            className="transition-transform hover:scale-110 active:scale-95 focus:outline-none touch-manipulation"
                          >
                            <Star
                              className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                                star <= category.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300 hover:text-yellow-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      {category.rating > 0 && (
                        <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                          {category.rating}/5
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-0 sm:space-x-3">
                <Button variant="outline" onClick={() => setCurrentStep('overall')} className="w-full sm:w-auto">
                  Back
                </Button>
                <Button onClick={handleNextStep} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  Continue to Feedback
                </Button>
              </div>
            </div>
          )}

          {/* Feedback Step */}
          {currentStep === 'feedback' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center px-2">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Share Your Thoughts</h3>
                <p className="text-sm sm:text-base text-gray-600">Your detailed feedback helps us build better features</p>
              </div>

              {/* Quick Sentiment */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-0 sm:space-x-4">
                <button
                  onClick={() => setIsPositive(true)}
                  className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg border transition-colors touch-manipulation ${
                    isPositive === true
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Positive Experience</span>
                </button>
                <button
                  onClick={() => setIsPositive(false)}
                  className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg border transition-colors touch-manipulation ${
                    isPositive === false
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Needs Improvement</span>
                </button>
              </div>

              <Separator />

              {/* Feedback Textarea */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Tell us more (optional)</span>
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    isPositive === true
                      ? "What did you love most? Any specific features that stood out?"
                      : isPositive === false
                      ? "What could we improve? Any specific issues or suggestions?"
                      : "Share your thoughts, suggestions, or any issues you encountered..."
                  }
                  rows={4}
                  className="resize-none text-sm sm:text-base"
                />
                <div className="text-xs text-gray-500">
                  Your feedback is invaluable for improving SmartPromptIQ Pro
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-0 sm:space-x-3">
                <Button variant="outline" onClick={() => setCurrentStep('detailed')} className="w-full sm:w-auto">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitRatingMutation.isPending}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  {submitRatingMutation.isPending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm sm:text-base">Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Send className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Submit Feedback</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && (
            <div className="text-center space-y-4 sm:space-y-6 py-6 sm:py-8 px-2">
              <div className="flex justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Thank You!</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Your feedback has been submitted successfully. We really appreciate you taking the time to help us improve SmartPromptIQ Pro.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 flex-shrink-0" />
                    <span>Overall: {overallRating}/5</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4 flex-shrink-0" />
                    <span>Detailed ratings provided</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}