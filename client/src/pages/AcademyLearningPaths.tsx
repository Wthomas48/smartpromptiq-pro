import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import {
  GraduationCap, BookOpen, Star, Clock, Users,
  CheckCircle, Lock, ChevronRight, Trophy, Target,
  Zap, Brain, Rocket, Award, Play, ArrowRight,
  Sparkles, TrendingUp, Shield, Code, Palette,
  MessageSquare, BarChart3, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Learning Path Types
interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: string;
  coursesCount: number;
  lessonsCount: number;
  enrolledCount: number;
  courses: PathCourse[];
  skills: string[];
  certification: string;
  prerequisites?: string[];
}

interface PathCourse {
  id: string;
  title: string;
  slug: string;
  lessonsCount: number;
  duration: string;
  isCompleted?: boolean;
  isLocked?: boolean;
  order: number;
}

// Learning Paths Data
const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'prompt-fundamentals',
    title: 'Prompt Engineering Fundamentals',
    description: 'Master the basics of AI prompt engineering. Perfect for beginners who want to communicate effectively with AI systems.',
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
    difficulty: 'beginner',
    duration: '4-6 hours',
    coursesCount: 5,
    lessonsCount: 35,
    enrolledCount: 12500,
    skills: ['Basic Prompting', 'Context Setting', 'Clear Instructions', 'Output Formatting'],
    certification: 'Prompt Engineering Fundamentals Certificate',
    courses: [
      { id: 'c1', title: 'Introduction to AI & Prompts', slug: 'intro-to-ai', lessonsCount: 6, duration: '45 min', order: 1 },
      { id: 'c2', title: 'Writing Clear Instructions', slug: 'clear-instructions', lessonsCount: 8, duration: '1 hr', order: 2 },
      { id: 'c3', title: 'Context & Role Setting', slug: 'context-roles', lessonsCount: 7, duration: '50 min', order: 3 },
      { id: 'c4', title: 'Output Formatting Basics', slug: 'output-formatting', lessonsCount: 6, duration: '40 min', order: 4 },
      { id: 'c5', title: 'Common Mistakes & How to Fix Them', slug: 'common-mistakes', lessonsCount: 8, duration: '1 hr', order: 5 },
    ],
  },
  {
    id: 'business-prompts',
    title: 'Business & Marketing Prompts',
    description: 'Learn to create powerful prompts for marketing, sales, and business operations. Drive results with AI-powered content.',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    difficulty: 'intermediate',
    duration: '8-10 hours',
    coursesCount: 6,
    lessonsCount: 48,
    enrolledCount: 8900,
    skills: ['Marketing Copy', 'Sales Sequences', 'Business Analysis', 'Content Strategy'],
    certification: 'Business Prompt Specialist Certificate',
    prerequisites: ['Prompt Engineering Fundamentals'],
    courses: [
      { id: 'b1', title: 'Marketing Copy that Converts', slug: 'marketing-copy', lessonsCount: 10, duration: '1.5 hr', order: 1 },
      { id: 'b2', title: 'Sales Email Sequences', slug: 'sales-emails', lessonsCount: 8, duration: '1 hr', order: 2 },
      { id: 'b3', title: 'Social Media Content Creation', slug: 'social-media', lessonsCount: 8, duration: '1 hr', order: 3 },
      { id: 'b4', title: 'Business Analysis Prompts', slug: 'business-analysis', lessonsCount: 7, duration: '1 hr', order: 4 },
      { id: 'b5', title: 'Customer Service Automation', slug: 'customer-service', lessonsCount: 8, duration: '1 hr', order: 5 },
      { id: 'b6', title: 'Content Strategy & Planning', slug: 'content-strategy', lessonsCount: 7, duration: '1 hr', order: 6 },
    ],
  },
  {
    id: 'technical-prompts',
    title: 'Technical & Development Prompts',
    description: 'Master prompts for code generation, debugging, documentation, and technical writing. Essential for developers.',
    icon: <Code className="w-6 h-6" />,
    color: 'from-purple-500 to-violet-500',
    difficulty: 'intermediate',
    duration: '10-12 hours',
    coursesCount: 7,
    lessonsCount: 56,
    enrolledCount: 6700,
    skills: ['Code Generation', 'Debugging', 'Documentation', 'Code Review', 'Architecture'],
    certification: 'Technical Prompt Engineer Certificate',
    prerequisites: ['Prompt Engineering Fundamentals'],
    courses: [
      { id: 't1', title: 'Code Generation Basics', slug: 'code-generation', lessonsCount: 8, duration: '1.5 hr', order: 1 },
      { id: 't2', title: 'Debugging with AI', slug: 'ai-debugging', lessonsCount: 8, duration: '1.5 hr', order: 2 },
      { id: 't3', title: 'Technical Documentation', slug: 'tech-docs', lessonsCount: 7, duration: '1 hr', order: 3 },
      { id: 't4', title: 'Code Review Automation', slug: 'code-review', lessonsCount: 8, duration: '1.5 hr', order: 4 },
      { id: 't5', title: 'API & Integration Prompts', slug: 'api-prompts', lessonsCount: 8, duration: '1.5 hr', order: 5 },
      { id: 't6', title: 'Architecture & Design Patterns', slug: 'architecture', lessonsCount: 9, duration: '2 hr', order: 6 },
      { id: 't7', title: 'DevOps & Automation', slug: 'devops', lessonsCount: 8, duration: '1.5 hr', order: 7 },
    ],
  },
  {
    id: 'creative-prompts',
    title: 'Creative Writing & Storytelling',
    description: 'Unleash your creativity with advanced prompting techniques for fiction, copywriting, and creative content.',
    icon: <Palette className="w-6 h-6" />,
    color: 'from-pink-500 to-rose-500',
    difficulty: 'intermediate',
    duration: '6-8 hours',
    coursesCount: 5,
    lessonsCount: 40,
    enrolledCount: 5400,
    skills: ['Storytelling', 'Character Development', 'Tone & Voice', 'Creative Copywriting'],
    certification: 'Creative Prompt Artist Certificate',
    prerequisites: ['Prompt Engineering Fundamentals'],
    courses: [
      { id: 'cr1', title: 'Storytelling Fundamentals', slug: 'storytelling', lessonsCount: 8, duration: '1 hr', order: 1 },
      { id: 'cr2', title: 'Character & World Building', slug: 'character-building', lessonsCount: 9, duration: '1.5 hr', order: 2 },
      { id: 'cr3', title: 'Tone, Voice & Style', slug: 'tone-voice', lessonsCount: 7, duration: '1 hr', order: 3 },
      { id: 'cr4', title: 'Creative Copywriting', slug: 'creative-copy', lessonsCount: 8, duration: '1 hr', order: 4 },
      { id: 'cr5', title: 'Multi-Format Content', slug: 'multi-format', lessonsCount: 8, duration: '1 hr', order: 5 },
    ],
  },
  {
    id: 'advanced-techniques',
    title: 'Advanced Prompt Engineering',
    description: 'Master advanced techniques like chain-of-thought, few-shot learning, and prompt optimization. For experienced users.',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-orange-500 to-amber-500',
    difficulty: 'advanced',
    duration: '12-15 hours',
    coursesCount: 6,
    lessonsCount: 52,
    enrolledCount: 3200,
    skills: ['Chain-of-Thought', 'Few-Shot Learning', 'Prompt Optimization', 'System Prompts', 'RAG'],
    certification: 'Advanced Prompt Engineer Certificate',
    prerequisites: ['Prompt Engineering Fundamentals', 'Any Intermediate Path'],
    courses: [
      { id: 'a1', title: 'Chain-of-Thought Prompting', slug: 'chain-of-thought', lessonsCount: 9, duration: '2 hr', order: 1 },
      { id: 'a2', title: 'Few-Shot & Zero-Shot Learning', slug: 'few-shot', lessonsCount: 8, duration: '1.5 hr', order: 2 },
      { id: 'a3', title: 'System Prompts & Personas', slug: 'system-prompts', lessonsCount: 9, duration: '2 hr', order: 3 },
      { id: 'a4', title: 'Prompt Optimization & Testing', slug: 'optimization', lessonsCount: 9, duration: '2 hr', order: 4 },
      { id: 'a5', title: 'RAG & Knowledge Integration', slug: 'rag', lessonsCount: 8, duration: '2 hr', order: 5 },
      { id: 'a6', title: 'Multi-Model Strategies', slug: 'multi-model', lessonsCount: 9, duration: '2 hr', order: 6 },
    ],
  },
  {
    id: 'ai-agents',
    title: 'AI Agents & Automation',
    description: 'Build intelligent AI agents and automate complex workflows. The cutting edge of prompt engineering.',
    icon: <Rocket className="w-6 h-6" />,
    color: 'from-cyan-500 to-teal-500',
    difficulty: 'expert',
    duration: '15-20 hours',
    coursesCount: 7,
    lessonsCount: 60,
    enrolledCount: 1800,
    skills: ['Agent Design', 'Tool Use', 'Memory Systems', 'Workflow Automation', 'Orchestration'],
    certification: 'AI Agent Architect Certificate',
    prerequisites: ['Advanced Prompt Engineering'],
    courses: [
      { id: 'ag1', title: 'Introduction to AI Agents', slug: 'intro-agents', lessonsCount: 8, duration: '1.5 hr', order: 1 },
      { id: 'ag2', title: 'Agent Architecture & Design', slug: 'agent-architecture', lessonsCount: 9, duration: '2 hr', order: 2 },
      { id: 'ag3', title: 'Tool Use & Function Calling', slug: 'tool-use', lessonsCount: 9, duration: '2 hr', order: 3 },
      { id: 'ag4', title: 'Memory & Context Management', slug: 'memory-systems', lessonsCount: 8, duration: '2 hr', order: 4 },
      { id: 'ag5', title: 'Multi-Agent Systems', slug: 'multi-agent', lessonsCount: 9, duration: '2.5 hr', order: 5 },
      { id: 'ag6', title: 'Workflow Orchestration', slug: 'orchestration', lessonsCount: 9, duration: '2.5 hr', order: 6 },
      { id: 'ag7', title: 'Production Deployment', slug: 'production', lessonsCount: 8, duration: '2 hr', order: 7 },
    ],
  },
];

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-300 border-green-500/30',
  intermediate: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  advanced: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  expert: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const AcademyLearningPaths: React.FC = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { awardXP, checkAndAwardBadge } = useGamification();
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [enrolledPaths, setEnrolledPaths] = useState<string[]>([]);

  // Mock progress data
  const pathProgress: Record<string, number> = {
    'prompt-fundamentals': 65,
    'business-prompts': 20,
  };

  const handleEnroll = (pathId: string) => {
    if (!enrolledPaths.includes(pathId)) {
      setEnrolledPaths(prev => [...prev, pathId]);
      awardXP(25, 'Enrolled in learning path', 'academy');
    }
  };

  const renderPathCard = (path: LearningPath) => {
    const isEnrolled = enrolledPaths.includes(path.id);
    const progress = pathProgress[path.id] || 0;

    return (
      <Card
        key={path.id}
        className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer group overflow-hidden"
        onClick={() => setSelectedPath(path)}
      >
        {/* Color Bar */}
        <div className={cn("h-2 bg-gradient-to-r", path.color)} />

        <CardHeader>
          <div className="flex items-start justify-between">
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br text-white", path.color)}>
              {path.icon}
            </div>
            <Badge className={difficultyColors[path.difficulty]}>
              {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
            </Badge>
          </div>

          <CardTitle className="text-white group-hover:text-purple-300 transition-colors mt-4">
            {path.title}
          </CardTitle>
          <CardDescription className="text-gray-400 line-clamp-2">
            {path.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {path.coursesCount} courses
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {path.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {path.enrolledCount.toLocaleString()}
            </span>
          </div>

          {/* Skills Preview */}
          <div className="flex flex-wrap gap-1">
            {path.skills.slice(0, 3).map((skill, i) => (
              <Badge key={i} variant="outline" className="text-xs border-slate-600 text-gray-400">
                {skill}
              </Badge>
            ))}
            {path.skills.length > 3 && (
              <Badge variant="outline" className="text-xs border-slate-600 text-gray-400">
                +{path.skills.length - 3}
              </Badge>
            )}
          </div>

          {/* Progress or Enroll */}
          {isEnrolled || progress > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-purple-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : (
            <Button
              className={cn("w-full bg-gradient-to-r hover:opacity-90", path.color)}
              onClick={(e) => {
                e.stopPropagation();
                handleEnroll(path.id);
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Learning Path
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <BackButton />

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Learning Paths
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Structured learning journeys from beginner to expert.
              Follow a path, earn certificates, and master prompt engineering.
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center gap-6 mt-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{LEARNING_PATHS.length}</p>
                <p className="text-gray-400">Learning Paths</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {LEARNING_PATHS.reduce((acc, p) => acc + p.coursesCount, 0)}
                </p>
                <p className="text-gray-400">Total Courses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {LEARNING_PATHS.reduce((acc, p) => acc + p.lessonsCount, 0)}
                </p>
                <p className="text-gray-400">Total Lessons</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{LEARNING_PATHS.length}</p>
                <p className="text-gray-400">Certifications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Path Progression Map */}
        <Card className="bg-slate-800/30 border-slate-700 mb-12 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Recommended Learning Journey
          </h2>
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {LEARNING_PATHS.slice(0, 4).map((path, index) => (
              <React.Fragment key={path.id}>
                <div
                  className="flex flex-col items-center min-w-[120px] cursor-pointer group"
                  onClick={() => setSelectedPath(path)}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br text-white transition-transform group-hover:scale-110",
                    path.color
                  )}>
                    {path.icon}
                  </div>
                  <p className="text-sm text-gray-400 mt-2 text-center">{path.title.split(' ').slice(0, 2).join(' ')}</p>
                  <Badge className={cn("mt-1", difficultyColors[path.difficulty])}>
                    {path.difficulty}
                  </Badge>
                </div>
                {index < 3 && (
                  <div className="flex-1 mx-4">
                    <div className="h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 relative">
                      <ChevronRight className="w-5 h-5 text-purple-400 absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>

        {/* Learning Paths Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {LEARNING_PATHS.map(renderPathCard)}
        </div>

        {/* Certification CTA */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="py-8 text-center">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Earn Industry Certifications</h3>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Complete learning paths to earn verified certificates you can share on LinkedIn
              and showcase your prompt engineering expertise.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Award className="w-4 h-4 mr-2" />
              View All Certifications
            </Button>
          </CardContent>
        </Card>

        {/* Path Detail Modal */}
        {selectedPath && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPath(null)}
          >
            <div
              className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={cn("h-3 bg-gradient-to-r", selectedPath.color)} />
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br text-white", selectedPath.color)}>
                      {selectedPath.icon}
                    </div>
                    <div>
                      <Badge className={cn("mb-2", difficultyColors[selectedPath.difficulty])}>
                        {selectedPath.difficulty.charAt(0).toUpperCase() + selectedPath.difficulty.slice(1)}
                      </Badge>
                      <h2 className="text-2xl font-bold text-white">{selectedPath.title}</h2>
                      <p className="text-gray-400 mt-1">{selectedPath.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedPath(null)}>
                    Close
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{selectedPath.coursesCount}</p>
                    <p className="text-xs text-gray-400">Courses</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <Target className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{selectedPath.lessonsCount}</p>
                    <p className="text-xs text-gray-400">Lessons</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <Clock className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{selectedPath.duration}</p>
                    <p className="text-xs text-gray-400">Duration</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <Users className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{selectedPath.enrolledCount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Enrolled</p>
                  </div>
                </div>

                {/* Prerequisites */}
                {selectedPath.prerequisites && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-300 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Prerequisites: {selectedPath.prerequisites.join(', ')}
                    </p>
                  </div>
                )}

                {/* Skills You'll Learn */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Skills You'll Learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPath.skills.map((skill, i) => (
                      <Badge key={i} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Course List */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Courses in This Path</h3>
                  <div className="space-y-2">
                    {selectedPath.courses.map((course, index) => (
                      <div
                        key={course.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer",
                          course.isLocked
                            ? "bg-slate-800/30 border-slate-700 opacity-60"
                            : course.isCompleted
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-slate-800/50 border-slate-700 hover:border-purple-500/50"
                        )}
                        onClick={() => !course.isLocked && navigate(`/academy/course/${course.slug}`)}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                          course.isCompleted
                            ? "bg-green-500"
                            : course.isLocked
                            ? "bg-slate-700"
                            : `bg-gradient-to-br ${selectedPath.color}`
                        )}>
                          {course.isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : course.isLocked ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{course.title}</p>
                          <p className="text-sm text-gray-400">
                            {course.lessonsCount} lessons • {course.duration}
                          </p>
                        </div>
                        {!course.isLocked && (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certification */}
                <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    <div>
                      <p className="font-semibold text-white">Certification</p>
                      <p className="text-sm text-gray-400">{selectedPath.certification}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-slate-700">
                <Button
                  className={cn("w-full py-6 text-lg bg-gradient-to-r hover:opacity-90", selectedPath.color)}
                  onClick={() => {
                    handleEnroll(selectedPath.id);
                    setSelectedPath(null);
                    navigate(`/academy/course/${selectedPath.courses[0].slug}`);
                  }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  {enrolledPaths.includes(selectedPath.id) ? 'Continue Learning' : 'Start This Path'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademyLearningPaths;
