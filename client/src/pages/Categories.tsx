import React from 'react';
import { Link } from 'wouter';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Zap, 
  DollarSign, 
  GraduationCap, 
  Heart, 
  ArrowRight 
} from 'lucide-react';

const categories = [
  {
    id: 'marketing',
    title: 'Marketing',
    description: 'Create compelling marketing content and campaigns',
    icon: Briefcase,
    color: 'bg-blue-500',
    questions: 5
  },
  {
    id: 'product-development',
    title: 'Product Development',
    description: 'Design and develop innovative products',
    icon: Zap,
    color: 'bg-purple-500',
    questions: 4
  },
  {
    id: 'financial-planning',
    title: 'Financial Planning',
    description: 'Plan and manage your finances effectively',
    icon: DollarSign,
    color: 'bg-green-500',
    questions: 6
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Create engaging educational content',
    icon: GraduationCap,
    color: 'bg-yellow-500',
    questions: 4
  },
  {
    id: 'personal-development',
    title: 'Personal Development',
    description: 'Grow and improve yourself',
    icon: Heart,
    color: 'bg-pink-500',
    questions: 5
  }
];

export default function Categories() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Category
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select a category to start your personalized questionnaire. Our AI will guide you through targeted questions to create the perfect prompt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">
                    {category.questions} questions
                  </span>
                  <span className="text-sm text-gray-600">
                    ~3 min
                  </span>
                </div>
                <Link href={`/questionnaire/${category.id}`}>
                  <Button className="w-full">
                    Start Questionnaire
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
