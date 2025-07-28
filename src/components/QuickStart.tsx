import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Palette, Code, ArrowRight, Sparkles } from "lucide-react";

const quickStartOptions = [
  {
    id: "business-plan",
    category: "business",
    title: "Business Strategy Plan",
    description: "Create a comprehensive business strategy with market analysis and growth roadmap",
    icon: Briefcase,
    color: "bg-blue-100 text-blue-600",
    demoAnswers: {
      businessType: "startup",
      goal: "market-expansion",
      audience: "enterprise-clients",
      timeline: "6-months",
      budget: "medium"
    }
  },
  {
    id: "creative-campaign",
    category: "creative", 
    title: "Marketing Campaign Brief",
    description: "Design a creative marketing campaign with visual direction and messaging",
    icon: Palette,
    color: "bg-purple-100 text-purple-600",
    demoAnswers: {
      projectType: "marketing-campaign",
      audience: "millennials",
      style: "modern",
      channels: "digital",
      budget: "high"
    }
  },
  {
    id: "tech-spec",
    category: "technical",
    title: "Software Architecture",
    description: "Define technical requirements and system architecture for development projects",
    icon: Code,
    color: "bg-green-100 text-green-600",
    demoAnswers: {
      projectType: "web-application",
      scale: "enterprise",
      technology: "cloud-native",
      timeline: "3-months",
      complexity: "high"
    }
  }
];

export default function QuickStart() {
  const [, setLocation] = useLocation();

  const handleQuickStart = (option: typeof quickStartOptions[0]) => {
    sessionStorage.setItem('questionnaire', JSON.stringify({
      category: option.category,
      responses: option.demoAnswers,
      isQuickStart: true
    }));
    
    setLocation('/generation');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Quick Start Demo
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Try Smart PromptIQ instantly with pre-configured examples from each category
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {quickStartOptions.map((option) => (
          <Card key={option.id} className="quick-start-card hover:shadow-lg transition-all group">
            <CardHeader className="text-center pb-3">
              <div className={`w-16 h-16 ${option.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <option.icon size={28} />
              </div>
              <CardTitle className="text-xl">{option.title}</CardTitle>
              <Badge variant="outline" className="mx-auto">
                {option.category}
              </Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600 mb-6">
                {option.description}
              </p>
              <Button
                onClick={() => handleQuickStart(option)}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white group-hover:scale-105 transition-transform"
              >
                <Sparkles className="mr-2" size={16} />
                Try Now
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-8">
        <div className="bg-slate-50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold text-slate-900 mb-2">
            Want to create a custom prompt?
          </h3>
          <p className="text-slate-600 mb-4">
            Take our guided questionnaire to create a prompt tailored to your specific needs
          </p>
          <Button 
            variant="outline" 
            onClick={() => setLocation('/categories')}
            className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
          >
            Custom Questionnaire
          </Button>
        </div>
      </div>
    </div>
  );
}
