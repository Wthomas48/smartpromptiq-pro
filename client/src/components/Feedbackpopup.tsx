import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, X, MessageSquare, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackPopup({ isOpen, onClose }: FeedbackPopupProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      // Add shake animation to star container
      const starContainer = document.querySelector('.star-rating-container');
      if (starContainer) {
        starContainer.classList.add('animate-bounce');
        setTimeout(() => starContainer.classList.remove('animate-bounce'), 1000);
      }
      
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/feedback", {
        rating,
        email: email.trim(),
        feedback: feedback.trim(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        page: window.location.pathname
      });

      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully.",
      });

      // Reset form
      setRating(0);
      setEmail("");
      setFeedback("");
      onClose();

    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Rate your experience";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>How was your experience?</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Your feedback helps us improve Smart PromptIQ for everyone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="text-center space-y-2">
            <Label className="text-gray-700 dark:text-gray-300 block text-sm font-medium">
              Rate your experience *
            </Label>
            <div className="flex justify-center space-x-1 p-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-200 hover:border-yellow-400 star-rating-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all duration-150 hover:scale-110 transform focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                        : "text-gray-300 dark:text-gray-600 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="min-h-[20px]">
              <p className={`text-sm font-medium transition-colors duration-200 ${
                rating > 0 
                  ? "text-yellow-600 dark:text-yellow-400" 
                  : "text-gray-500 dark:text-gray-400"
              }`}>
                {getRatingText(hoveredRating || rating)}
              </p>
            </div>
            {rating === 0 && (
              <p className="text-xs text-red-500 dark:text-red-400 animate-pulse">
                Please select a rating to continue
              </p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <Label htmlFor="feedback-email" className="text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email (optional)</span>
            </Label>
            <Input
              id="feedback-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              We'll only use this to follow up on your feedback if needed.
            </p>
          </div>

          {/* Feedback Text */}
          <div>
            <Label htmlFor="feedback-text" className="text-gray-700 dark:text-gray-300">
              What can we improve? (optional)
            </Label>
            <Textarea
              id="feedback-text"
              placeholder="Tell us about your experience or suggest improvements..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Maybe Later
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 text-white transition-all duration-200 ${
                rating === 0 
                  ? "bg-gray-400 hover:bg-red-500 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700"
              } ${isSubmitting ? "opacity-50" : ""}`}
            >
              {isSubmitting ? "Submitting..." : rating === 0 ? "Select Rating First" : "Submit Feedback"}
            </Button>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Your privacy is important to us. We'll never share your email or feedback with third parties.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}