// src/components/QuickStart.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  // Add User to your imports - THIS FIXES THE ERROR
  User,
  Sparkles,
  Rocket,
  Target,
  Zap,
  Brain,
  CheckCircle,
  ArrowRight,
  Clock,
  Star,
  Play,
  Wand2,
  FileText,
  BarChart3,
  Code,
  Palette,
  Megaphone,
  GraduationCap,
  Users,
  TrendingUp,
  Award,
  Lightbulb,
  Globe,
  MessageCircle,
  Coffee,
  Timer,
  BookOpen,
  Shield,
  Heart,
  Crown,
  Flame,
  Eye,
  Settings,
  ChevronRight,
  Plus
} from 'lucide-react';

const QuickStart = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const navigate = useNavigate();

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to SmartPromptIQ',
      description: 'Let\'s get you started with the perfect prompts for your needs'
    },
    {
      id: 'goal',
      title: 'What\'s your primary goal?',
      description: 'Choose your main focus area to get personalized recommendations'
    },
    {
      id: 'experience',
      title: 'What\'s your experience level?',
      description: 'This helps us tailor the complexity of our suggestions'
    },
    {
      id: 'recommendations',
      title: 'Your Personalized Recommendations',
      description: 'Based on your preferences, here are the best starting points'
    }
  ];

  const goals = [
    {
      id: 'business',
      title: 'Business Strategy',
      description: 'Strategic planning, market analysis, business development',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'content',
      title: 'Content Creation',
      description: 'Blog posts, social media, marketing copy, creative writing',
      icon: <Megaphone className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'development',
      title: 'Software Development',
      description: 'Code documentation, architecture, technical specifications',
      icon: <Code className="w-6 h-6" />,
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'design',
      title: 'Creative Design',
      description: 'Design briefs, brand guidelines, creative concepts',
      icon: <Palette className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'education',
      title: 'Education & Training',
      description: 'Learning materials, curriculum design, educational content',
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'general',
      title: 'General Use',
      description: 'Exploring different types of prompts and capabilities',
      icon: <Target className="w-6 h-6" />,
      color: 'from-gray-500 to-slate-600'
    }
  ];

  const experienceLevels = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'New to AI prompts and prompt engineering',
      icon: <User className="w-6 h-6" />,
      recommended: true
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: 'Some experience with AI tools and prompt writing',
      icon: <Brain className="w-6 h-6" />,
      recommended: false
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'Experienced with complex prompts and AI optimization',
      icon: <Rocket className="w-6 h-6" />,
      recommended: false
    }
  ];

  const getRecommendations = () => {
    const baseRecommendations = [
      {
        type: 'category',
        title: `Start with ${goals.find(g => g.id === selectedGoal)?.title || 'Your Selected'} Category`,
        description: 'Explore curated prompts specifically designed for your focus area',
        action: 'Browse Category',
        link: `/categories`,
        priority: 'high'
      },
      {
        type: 'template',
        title: 'Quick Template Library',
        description: 'Browse our collection of ready-to-use prompt templates',
        action: 'View Templates',
        link: '/templates',
        priority: 'medium'
      },
      {
        type: 'builder',
        title: 'AI Prompt Builder',
        description: 'Create custom prompts with our intelligent prompt builder',
        action: 'Start Building',
        link: '/create',
        priority: userLevel === 'beginner' ? 'medium' : 'high'
      }
    ];

    if (userLevel === 'beginner') {
      baseRecommendations.unshift({
        type: 'tutorial',
        title: 'Beginner\'s Guide',
        description: 'Start with our step-by-step tutorial on prompt engineering basics',
        action: 'Start Tutorial',
        link: '/tutorials',
        priority: 'high'
      });
    }

    return baseRecommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    setTimeout(() => handleNext(), 500);
  };

  const handleLevelSelect = (level: string) => {
    setUserLevel(level);
    setTimeout(() => handleNext(), 500);
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to SmartPromptIQ!
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We'll help you get started with the perfect prompts for your needs. 
              This quick setup takes just 2 minutes.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Personalized</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Quick start</span>
              </div>
            </div>
            <Button 
              onClick={handleNext}
              size="lg" 
              className="text-lg px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        );

      case 'goal':
        return (
          <div className="py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What's your primary goal?
              </h2>
              <p className="text-gray-600">
                Choose your main focus area to get personalized recommendations
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg ${
                    selectedGoal === goal.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${goal.color} flex items-center justify-center text-white mb-4`}>
                    {goal.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{goal.title}</h3>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What's your experience level?
              </h2>
              <p className="text-gray-600">
                This helps us tailor the complexity of our suggestions
              </p>
            </div>
            <div className="max-w-2xl mx-auto space-y-4">
              {experienceLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleLevelSelect(level.id)}
                  className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg ${
                    userLevel === level.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                      {level.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{level.title}</h3>
                        {level.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{level.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="py-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                You're all set! 🎉
              </h2>
              <p className="text-gray-600">
                Based on your preferences, here are the best starting points for you
              </p>
            </div>
            <div className="max-w-4xl mx-auto space-y-4">
              {getRecommendations().map((recommendation, index) => (
                <Card key={index} className={`border-l-4 ${
                  recommendation.priority === 'high' 
                    ? 'border-l-green-500 bg-green-50' 
                    : 'border-l-blue-500 bg-blue-50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{recommendation.title}</h3>
                          {recommendation.priority === 'high' && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{recommendation.description}</p>
                      </div>
                      <Link to={recommendation.link}>
                        <Button 
                          variant={recommendation.priority === 'high' ? 'default' : 'outline'}
                          className={recommendation.priority === 'high' ? 
                            'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 
                            ''
                          }
                        >
                          {recommendation.action}
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/dashboard">
                <Button variant="outline" size="lg">
                  <Eye className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          </div>
        </div>

        {/* Step Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h1>
          <p className="text-gray-600 text-lg">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div className="flex justify-between items-center mt-8">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button 
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !selectedGoal) || 
                (currentStep === 2 && !userLevel)
              }
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickStart;