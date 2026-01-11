/**
 * Global Visual Feedback Component
 *
 * Provides highly visible feedback for errors, success, loading states throughout the app.
 * This component renders at the top of the viewport with maximum z-index.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Feedback types
type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface Feedback {
  id: string;
  type: FeedbackType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = permanent until dismissed
  dismissible?: boolean;
}

interface FeedbackContextType {
  showFeedback: (feedback: Omit<Feedback, 'id'>) => string;
  dismissFeedback: (id: string) => void;
  clearAll: () => void;
  // Convenience methods
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  loading: (title: string, message?: string) => string;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

// Icon mapping
const FeedbackIcon: React.FC<{ type: FeedbackType; className?: string }> = ({ type, className }) => {
  const baseClass = cn("w-6 h-6", className);

  switch (type) {
    case 'success':
      return <CheckCircle className={cn(baseClass, "text-green-400")} />;
    case 'error':
      return <AlertCircle className={cn(baseClass, "text-red-400")} />;
    case 'warning':
      return <AlertTriangle className={cn(baseClass, "text-amber-400")} />;
    case 'info':
      return <Info className={cn(baseClass, "text-blue-400")} />;
    case 'loading':
      return <Loader2 className={cn(baseClass, "text-purple-400 animate-spin")} />;
  }
};

// Color mapping for backgrounds
const typeStyles: Record<FeedbackType, string> = {
  success: 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-400 shadow-green-500/30',
  error: 'bg-gradient-to-r from-red-600 to-rose-600 border-red-400 shadow-red-500/30',
  warning: 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-400 shadow-amber-500/30',
  info: 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-400 shadow-blue-500/30',
  loading: 'bg-gradient-to-r from-purple-600 to-violet-600 border-purple-400 shadow-purple-500/30',
};

// Individual feedback item
const FeedbackItem: React.FC<{
  feedback: Feedback;
  onDismiss: () => void;
}> = ({ feedback, onDismiss }) => {
  // Auto-dismiss after duration
  useEffect(() => {
    if (feedback.duration && feedback.duration > 0) {
      const timer = setTimeout(onDismiss, feedback.duration);
      return () => clearTimeout(timer);
    }
  }, [feedback.duration, onDismiss]);

  return (
    <div
      className={cn(
        // Base styles
        "relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 shadow-xl",
        "animate-in slide-in-from-top-4 fade-in-0 duration-300",
        "text-white font-medium",
        // Type-specific styles
        typeStyles[feedback.type]
      )}
    >
      {/* Icon */}
      <FeedbackIcon type={feedback.type} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-base">{feedback.title}</div>
        {feedback.message && (
          <div className="text-sm opacity-90 mt-0.5">{feedback.message}</div>
        )}
      </div>

      {/* Dismiss button */}
      {feedback.dismissible !== false && feedback.type !== 'loading' && (
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Progress bar for timed dismissal */}
      {feedback.duration && feedback.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-white/40 animate-shrink-width"
            style={{
              animationDuration: `${feedback.duration}ms`,
            }}
          />
        </div>
      )}
    </div>
  );
};

// Provider component
export const GlobalFeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // Generate unique ID
  const generateId = () => `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Show feedback
  const showFeedback = useCallback((feedback: Omit<Feedback, 'id'>): string => {
    const id = generateId();
    const newFeedback: Feedback = {
      ...feedback,
      id,
      duration: feedback.duration ?? (feedback.type === 'loading' ? 0 : 5000),
      dismissible: feedback.dismissible ?? true,
    };

    setFeedbacks(prev => {
      // Limit to 5 feedbacks max
      const updated = [newFeedback, ...prev].slice(0, 5);
      return updated;
    });

    return id;
  }, []);

  // Dismiss feedback
  const dismissFeedback = useCallback((id: string) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setFeedbacks([]);
  }, []);

  // Convenience methods
  const success = useCallback((title: string, message?: string) =>
    showFeedback({ type: 'success', title, message }), [showFeedback]);

  const error = useCallback((title: string, message?: string) =>
    showFeedback({ type: 'error', title, message, duration: 8000 }), [showFeedback]); // Errors stay longer

  const warning = useCallback((title: string, message?: string) =>
    showFeedback({ type: 'warning', title, message }), [showFeedback]);

  const info = useCallback((title: string, message?: string) =>
    showFeedback({ type: 'info', title, message }), [showFeedback]);

  const loading = useCallback((title: string, message?: string) =>
    showFeedback({ type: 'loading', title, message, duration: 0, dismissible: false }), [showFeedback]);

  const contextValue: FeedbackContextType = {
    showFeedback,
    dismissFeedback,
    clearAll,
    success,
    error,
    warning,
    info,
    loading,
  };

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}

      {/* Feedback container - MAXIMUM VISIBILITY */}
      {feedbacks.length > 0 && (
        <div
          className={cn(
            // Fixed position at very top center
            "fixed top-4 left-1/2 -translate-x-1/2",
            // Maximum z-index to be above everything
            "z-[999999]",
            // Container styling
            "flex flex-col gap-2 w-full max-w-lg px-4",
            // Pointer events
            "pointer-events-none [&>*]:pointer-events-auto"
          )}
        >
          {feedbacks.map(feedback => (
            <FeedbackItem
              key={feedback.id}
              feedback={feedback}
              onDismiss={() => dismissFeedback(feedback.id)}
            />
          ))}
        </div>
      )}

      {/* CSS for progress bar animation */}
      <style>{`
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink-width {
          animation: shrink-width linear forwards;
        }
      `}</style>
    </FeedbackContext.Provider>
  );
};

// Hook to use feedback
export const useGlobalFeedback = (): FeedbackContextType => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useGlobalFeedback must be used within GlobalFeedbackProvider');
  }
  return context;
};

// Export for direct imports
export default GlobalFeedbackProvider;
