import React, { useState } from 'react';
import { useLocation } from 'wouter';
import {
  GraduationCap, BookOpen, Lightbulb, ArrowRight,
  Play, Clock, Star, ChevronRight, X, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AcademyLearningIndicatorProps {
  topic: string;
  description?: string;
  courseSlug?: string;
  lessonId?: string;
  variant?: 'inline' | 'banner' | 'tooltip' | 'card' | 'floating';
  position?: 'left' | 'right' | 'center';
  showDismiss?: boolean;
  className?: string;
}

// Mapping of topics to Academy courses
const topicToCourse: Record<string, { title: string; slug: string; duration: string; level: string }> = {
  'app-types': { title: 'Understanding App Types', slug: 'app-development-basics', duration: '15 min', level: 'Beginner' },
  'ai-agents': { title: 'AI Agents Masterclass', slug: 'ai-agents-fundamentals', duration: '30 min', level: 'Intermediate' },
  'prompts': { title: 'Prompt Engineering 101', slug: 'prompt-writing-101', duration: '25 min', level: 'Beginner' },
  'blueprints': { title: 'App Blueprints Guide', slug: 'blueprints-deep-dive', duration: '20 min', level: 'Beginner' },
  'authentication': { title: 'Auth & Security Basics', slug: 'authentication-security', duration: '35 min', level: 'Intermediate' },
  'payments': { title: 'Payment Integration', slug: 'payment-systems', duration: '40 min', level: 'Advanced' },
  'voice': { title: 'Voice-Enabled Apps', slug: 'voice-integration', duration: '25 min', level: 'Intermediate' },
  'templates': { title: 'Using Templates Effectively', slug: 'template-mastery', duration: '20 min', level: 'Beginner' },
  'deployment': { title: 'Deploying Your App', slug: 'deployment-guide', duration: '45 min', level: 'Advanced' },
  'general': { title: 'BuilderIQ Quick Start', slug: 'builderiq-quickstart', duration: '10 min', level: 'Beginner' },
};

const AcademyLearningIndicator: React.FC<AcademyLearningIndicatorProps> = ({
  topic,
  description,
  courseSlug,
  lessonId,
  variant = 'inline',
  position = 'left',
  showDismiss = false,
  className,
}) => {
  const [, navigate] = useLocation();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const courseInfo = topicToCourse[topic] || topicToCourse['general'];
  const targetSlug = courseSlug || courseInfo.slug;

  if (isDismissed) return null;

  const handleNavigate = () => {
    if (lessonId) {
      navigate(`/academy/lesson/${lessonId}`);
    } else {
      navigate(`/academy/course/${targetSlug}`);
    }
  };

  // Inline variant - small link style
  if (variant === 'inline') {
    return (
      <button
        onClick={handleNavigate}
        className={cn(
          "inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 text-sm transition-colors group",
          className
        )}
      >
        <GraduationCap className="w-3.5 h-3.5" />
        <span className="underline-offset-2 group-hover:underline">
          {description || `Learn about ${topic}`}
        </span>
        <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
      </button>
    );
  }

  // Banner variant - full width notification
  if (variant === 'banner') {
    return (
      <div
        className={cn(
          "relative bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl p-4",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-white flex items-center gap-2">
                {description || `New to ${topic}?`}
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </h4>
              <p className="text-sm text-gray-400">
                Take our free {courseInfo.title} course • {courseInfo.duration} • {courseInfo.level}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleNavigate}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Learning
            </Button>
            {showDismiss && (
              <button
                onClick={() => setIsDismissed(true)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tooltip variant - hover popup
  if (variant === 'tooltip') {
    return (
      <div
        className={cn("relative inline-block", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button className="text-purple-400 hover:text-purple-300 transition-colors">
          <Lightbulb className="w-4 h-4" />
        </button>

        {isHovered && (
          <div
            className={cn(
              "absolute z-50 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl",
              "animate-in fade-in slide-in-from-bottom-2 duration-200",
              position === 'left' && "left-0 top-full mt-2",
              position === 'right' && "right-0 top-full mt-2",
              position === 'center' && "left-1/2 -translate-x-1/2 top-full mt-2"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">{courseInfo.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{courseInfo.duration} • {courseInfo.level}</p>
                <button
                  onClick={handleNavigate}
                  className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  Learn more <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Card variant - for sidebar or sections
  if (variant === 'card') {
    return (
      <div
        className={cn(
          "bg-gradient-to-br from-slate-800/80 to-purple-900/30 border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-colors cursor-pointer group",
          className
        )}
        onClick={handleNavigate}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs text-purple-400 font-medium">ACADEMY</span>
            <h4 className="text-white font-semibold">{courseInfo.title}</h4>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-3">
          {description || `Master ${topic} with our free interactive course.`}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {courseInfo.duration}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              4.8
            </span>
          </div>
          <span className="text-purple-400 group-hover:text-purple-300 flex items-center gap-1 text-sm">
            Start <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    );
  }

  // Floating variant - fixed position helper
  if (variant === 'floating') {
    return (
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300",
          className
        )}
      >
        <div className="bg-slate-800 border border-purple-500/30 rounded-2xl shadow-2xl p-4 max-w-xs">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-400 font-medium">NEED HELP?</span>
                {showDismiss && (
                  <button
                    onClick={() => setIsDismissed(true)}
                    className="text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h4 className="text-white font-semibold mt-1">{courseInfo.title}</h4>
              <p className="text-xs text-gray-400 mt-1">
                {description || `Learn the basics in just ${courseInfo.duration}`}
              </p>
              <Button
                size="sm"
                onClick={handleNavigate}
                className="mt-3 w-full bg-purple-500 hover:bg-purple-600"
              >
                <Play className="w-3 h-3 mr-1" />
                Start Free Course
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Quick help button with Academy link
export const AcademyHelpButton: React.FC<{
  topic: string;
  className?: string;
}> = ({ topic, className }) => {
  const [, navigate] = useLocation();
  const courseInfo = topicToCourse[topic] || topicToCourse['general'];

  return (
    <button
      onClick={() => navigate(`/academy/course/${courseInfo.slug}`)}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs hover:bg-purple-500/30 transition-colors",
        className
      )}
    >
      <GraduationCap className="w-3 h-3" />
      Help
    </button>
  );
};

// Progress indicator showing Academy completion
export const AcademyProgressIndicator: React.FC<{
  completedLessons: number;
  totalLessons: number;
  className?: string;
}> = ({ completedLessons, totalLessons, className }) => {
  const [, navigate] = useLocation();
  const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <button
      onClick={() => navigate('/academy/dashboard')}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 transition-colors group",
        className
      )}
    >
      <GraduationCap className="w-4 h-4 text-purple-400" />
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 group-hover:text-purple-400 transition-colors">
          {completedLessons}/{totalLessons}
        </span>
      </div>
    </button>
  );
};

export default AcademyLearningIndicator;
