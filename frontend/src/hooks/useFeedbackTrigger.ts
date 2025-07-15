import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export function useFeedbackTrigger() {
  const [showFeedback, setShowFeedback] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check if user has already given feedback recently
    const lastFeedback = localStorage.getItem('lastFeedbackDate');
    const feedbackCount = parseInt(localStorage.getItem('feedbackCount') || '0');
    
    // Don't show feedback popup more than once per week
    if (lastFeedback) {
      const lastDate = new Date(lastFeedback);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      if (lastDate > weekAgo) {
        return;
      }
    }

    // Trigger feedback popup based on user activity
    const sessionCount = parseInt(sessionStorage.getItem('sessionCount') || '0') + 1;
    sessionStorage.setItem('sessionCount', sessionCount.toString());

    // Show feedback after:
    // - 3rd session for new users
    // - Every 10th session for returning users
    // - After 5 minutes of activity in current session
    const shouldShowAfterSessions = feedbackCount === 0 ? 3 : 10;
    
    if (sessionCount >= shouldShowAfterSessions) {
      // Delay showing feedback by 5 minutes to let user engage with the app
      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(timer);
    }

    // Also trigger after successful prompt generation
    const handlePromptSuccess = () => {
      const successCount = parseInt(sessionStorage.getItem('promptSuccessCount') || '0') + 1;
      sessionStorage.setItem('promptSuccessCount', successCount.toString());
      
      // Show feedback after every 5th successful prompt generation
      if (successCount % 5 === 0) {
        setTimeout(() => setShowFeedback(true), 2000); // Show after 2 seconds
      }
    };

    // Listen for prompt generation events
    window.addEventListener('promptGenerated', handlePromptSuccess);
    
    return () => {
      window.removeEventListener('promptGenerated', handlePromptSuccess);
    };
  }, [isAuthenticated]);

  const closeFeedback = () => {
    setShowFeedback(false);
    // Record that feedback was shown
    localStorage.setItem('lastFeedbackDate', new Date().toISOString());
    const currentCount = parseInt(localStorage.getItem('feedbackCount') || '0');
    localStorage.setItem('feedbackCount', (currentCount + 1).toString());
  };

  const triggerFeedback = () => {
    setShowFeedback(true);
  };

  return {
    showFeedback,
    closeFeedback,
    triggerFeedback
  };
}