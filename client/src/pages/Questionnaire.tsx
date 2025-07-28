import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface Question {
  id: string;
  type: 'radio' | 'checkbox' | 'text' | 'textarea' | 'scale';
  question: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

const questionsByCategory: Record<string, Question[]> = {
  marketing: [
    {
      id: 'target-audience',
      type: 'text',
      question: 'Who is your target audience?',
      placeholder: 'e.g., Small business owners aged 25-45',
      required: true
    },
    {
      id: 'goals',
      type: 'radio',
      question: 'What is your primary marketing goal?',
      options: ['Brand Awareness', 'Lead Generation', 'Sales Conversion', 'Customer Retention'],
      required: true
    },
    {
      id: 'channels',
      type: 'checkbox',
      question: 'Which marketing channels do you use?',
      options: ['Social Media', 'Email', 'Content Marketing', 'PPC', 'SEO', 'Events']
    },
    {
      id: 'tone',
      type: 'radio',
      question: 'What tone should your content have?',
      options: ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Playful'],
      required: true
    },
    {
      id: 'details',
      type: 'textarea',
      question: 'Describe your product/service and unique value proposition',
      placeholder: 'Tell us what makes your offering special...',
      required: true
    }
  ],
  education: [
    {
      id: 'subject',
      type: 'text',
      question: 'What subject are you teaching?',
      required: true
    },
    {
      id: 'level',
      type: 'radio',
      question: 'What is the education level?',
      options: ['Elementary', 'Middle School', 'High School', 'College', 'Professional'],
      required: true
    },
    {
      id: 'format',
      type: 'radio',
      question: 'What format do you need?',
      options: ['Lesson Plan', 'Quiz', 'Assignment', 'Study Guide', 'Presentation'],
      required: true
    },
    {
      id: 'duration',
      type: 'radio',
      question: 'How long should this content be?',
      options: ['15 minutes', '30 minutes', '1 hour', '2+ hours', 'Multi-day'],
      required: true
    }
  ],
  'product-development': [
    {
      id: 'stage',
      type: 'radio',
      question: 'What stage is your product in?',
      options: ['Ideation', 'Design', 'Development', 'Testing', 'Launch', 'Growth'],
      required: true
    },
    {
      id: 'type',
      type: 'radio',
      question: 'What type of product?',
      options: ['Software/App', 'Physical Product', 'Service', 'Platform', 'Other'],
      required: true
    },
    {
      id: 'users',
      type: 'text',
      question: 'Who are your target users?',
      required: true
    },
    {
      id: 'problem',
      type: 'textarea',
      question: 'What problem does your product solve?',
      required: true
    }
  ]
};

export default function Questionnaire() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const category = params.category as string;
  
  const questions = questionsByCategory[category] || questionsByCategory.marketing;
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Save answers and navigate to generation
      localStorage.setItem('questionnaire-answers', JSON.stringify({
        category,
        answers,
        timestamp: new Date().toISOString()
      }));
      setLocation('/generation');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isCurrentAnswered = () => {
    const answer = answers[currentQuestion.id];
    if (!currentQuestion.required) return true;
    if (currentQuestion.type === 'checkbox') return answer && answer.length > 0;
    return !!answer;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold capitalize">{category.replace('-', ' ')} Questionnaire</h1>
            <span className="text-sm text-gray-600">
              Question {currentStep + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion.type === 'radio' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2 mb-3">
                    <div className="space-y-3">
                    <Label htmlFor={option} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <Input
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full"
              />
            )}

            {currentQuestion.type === 'textarea' && (
              <Textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full min-h-[120px]"
              />
            )}

            {currentQuestion.type === 'checkbox' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={option}
                      checked={(answers[currentQuestion.id] || []).includes(option)}
                      onChange={(e) => {
                        const current = answers[currentQuestion.id] || [];
                        if (e.target.checked) {
                          handleAnswer([...current, option]);
                        } else {
                          handleAnswer(current.filter((item: string) => item !== option));
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={option} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isCurrentAnswered()}
          >
            {currentStep === questions.length - 1 ? (
              <>
                Generate Prompt
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

