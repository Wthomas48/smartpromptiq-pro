// src/components/Questionnaire.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import QuestionCard from './QuestionCard';
import { 
  Brain, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles,
  Target,
  Users,
  BarChart3,
  Rocket
} from 'lucide-react';

// Question data structure
interface Question {
  id: string;
  title: string;
  description: string;
  options: {
    value: string;
    label: string;
    description: string;
  }[];
}

// Define all questionnaire questions
const questions: Question[] = [
  {
    id: 'primary_use',
    title: 'What\'s your primary use case?',
    description: 'This helps us recommend the most relevant templates and features for your needs.',
    options: [
      {
        value: 'content_creation',
        label: 'Content Creation',
        description: 'Blog posts, social media, marketing copy, and creative writing'
      },
      {
        value: 'business_analysis',
        label: 'Business Analysis',
        description: 'Data analysis, reports, strategic planning, and decision making'
      },
      {
        value: 'software_development',
        label: 'Software Development',
        description: 'Code generation, debugging, documentation, and technical writing'
      },
      {
        value: 'education_training',
        label: 'Education & Training',
        description: 'Course creation, tutoring, educational content, and learning materials'
      },
      {
        value: 'customer_support',
        label: 'Customer Support',
        description: 'Help desk responses, FAQ creation, and customer communication'
      }
    ]
  },
  {
    id: 'experience_level',
    title: 'What\'s your experience with AI prompts?',
    description: 'We\'ll customize the interface and suggestions based on your expertise level.',
    options: [
      {
        value: 'beginner',
        label: 'Beginner',
        description: 'New to AI prompts, need guidance and simple templates'
      },
      {
        value: 'intermediate',
        label: 'Intermediate',
        description: 'Some experience, comfortable with basic prompt engineering'
      },
      {
        value: 'advanced',
        label: 'Advanced',
        description: 'Experienced with complex prompts and optimization techniques'
      },
      {
        value: 'expert',
        label: 'Expert',
        description: 'Professional prompt engineer, need advanced tools and flexibility'
      }
    ]
  },
  {
    id: 'team_size',
    title: 'How large is your team?',
    description: 'This helps us recommend the right collaboration features and pricing plan.',
    options: [
      {
        value: 'individual',
        label: 'Just Me',
        description: 'Individual user working independently'
      },
      {
        value: 'small_team',
        label: 'Small Team (2-10)',
        description: 'Small team needing basic collaboration features'
      },
      {
        value: 'medium_team',
        label: 'Medium Team (11-50)',
        description: 'Growing team with structured workflows'
      },
      {
        value: 'large_team',
        label: 'Large Team (50+)',
        description: 'Enterprise team needing advanced management features'
      }
    ]
  },
  {
    id: 'ai_models',
    title: 'Which AI models do you primarily use?',
    description: 'We\'ll optimize templates and suggestions for your preferred AI platforms.',
    options: [
      {
        value: 'openai_gpt',
        label: 'OpenAI (GPT-3.5, GPT-4)',
        description: 'ChatGPT, GPT-4, and OpenAI API models'
      },
      {
        value: 'claude',
        label: 'Anthropic Claude',
        description: 'Claude Sonnet, Opus, and other Anthropic models'
      },
      {
        value: 'multiple_models',
        label: 'Multiple Models',
        description: 'Use various AI models depending on the task'
      },
      {
        value: 'other_models',
        label: 'Other Models',
        description: 'Gemini, Llama, or other AI models not listed'
      }
    ]
  },
  {
    id: 'frequency',
    title: 'How often do you create new prompts?',
    description: 'This helps us understand your usage patterns and recommend appropriate features.',
    options: [
      {
        value: 'daily',
        label: 'Daily',
        description: 'Multiple prompts every day as part of regular workflow'
      },
      {
        value: 'weekly',
        label: 'Weekly',
        description: 'Several prompts per week for ongoing projects'
      },
      {
        value: 'monthly',
        label: 'Monthly',
        description: 'Occasional prompt creation for specific needs'
      },
      {
        value: 'as_needed',
        label: 'As Needed',
        description: 'Irregular usage based on project requirements'
      }
    ]
  }
];

export default function Questionnaire() {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = answers[currentQuestion?.id];

  // Handle answer selection
  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  // Navigate to next question
  const handleNext = () => {
    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Complete questionnaire
  const handleComplete = () => {
    setIsCompleted(true);
    
    // Store answers in localStorage for now (you can replace with API call)
    localStorage.setItem('smartpromptiq_onboarding', JSON.stringify({
      answers,
      completedAt: new Date().toISOString()
    }));

    // Redirect to dashboard after a delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  // Skip questionnaire
  const handleSkip = () => {
    navigate('/dashboard');
  };

  // Completion screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to SmartPromptIQ! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for completing the setup. We're personalizing your experience...
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <Target className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-indigo-900">Personalized Templates</h3>
                    <p className="text-sm text-indigo-700">Custom templates based on your use case</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-purple-900">Smart Suggestions</h3>
                    <p className="text-sm text-purple-700">AI-powered recommendations for your level</p>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-bold text-green-800 mb-2">What's Next:</h3>
                  <ul className="text-green-700 text-left space-y-1">
                    <li>✅ Your dashboard is being customized</li>
                    <li>✅ Relevant templates are being prepared</li>
                    <li>✅ Smart suggestions are being calibrated</li>
                    <li>🚀 Redirecting to your dashboard...</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SmartPromptIQ
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Let's personalize your experience
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Answer a few questions to get the most relevant templates and features
          </p>
          
          {/* Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <div className="mb-8">
          <QuestionCard
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            title={currentQuestion.title}
            description={currentQuestion.description}
            options={currentQuestion.options}
            value={answers[currentQuestion.id] || ''}
            onChange={handleAnswerChange}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            {currentQuestionIndex > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </Button>
          </div>

          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center space-x-2"
            size="lg"
          >
            <span>{isLastQuestion ? 'Complete Setup' : 'Next Question'}</span>
            {isLastQuestion ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Question Summary */}
        <div className="mt-12 text-center">
          <div className="flex justify-center space-x-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index < currentQuestionIndex
                    ? 'bg-green-500'
                    : index === currentQuestionIndex
                    ? 'bg-indigo-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}