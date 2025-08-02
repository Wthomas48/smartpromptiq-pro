import { useState } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import BackButton from "@/components/BackButton";
import CategoryCard from "@/components/CategoryCard";
import { TrendingUp, Palette, Code, Wand2, Upload, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useTierLimits } from "@/hooks/useTierLimits";

export default function Categories() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { canAccessCategory, currentTier, getUpgradeReason, isAuthenticated } = useTierLimits();

  const categories = [
    {
      id: "business-strategy",
      icon: TrendingUp,
      title: "Business Strategy",
      description: "Generate comprehensive business plans, marketing strategies, competitive analyses, and operational frameworks tailored to your industry and goals.",
      tags: ["Market Analysis", "Business Plans", "Strategy"],
      gradient: "bg-gradient-to-br from-blue-50 to-indigo-100",
      badgeColor: "bg-blue-100 text-blue-800",
      iconGradient: "from-blue-500 to-indigo-600",
      tier: "free"
    },
    {
      id: "creative",
      icon: Palette,
      title: "Creative & Design", 
      description: "Create detailed creative briefs, design specifications, brand guidelines, and artistic direction for your visual projects.",
      tags: ["Brand Design", "Creative Briefs", "Art Direction"],
      gradient: "bg-gradient-to-br from-violet-50 to-purple-100",
      badgeColor: "bg-violet-100 text-violet-800",
      iconGradient: "from-violet-500 to-purple-600"
    },
    {
      id: "technical",
      icon: Code,
      title: "Technical & Development",
      description: "Generate technical specifications, project requirements, architecture diagrams, and development roadmaps for your software projects.",
      tags: ["Architecture", "Requirements", "Roadmaps"],
      gradient: "bg-gradient-to-br from-emerald-50 to-teal-100", 
      badgeColor: "bg-emerald-100 text-emerald-800",
      iconGradient: "from-emerald-500 to-teal-600"
    }
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // Navigate to questionnaire after selection
    setTimeout(() => {
      setLocation(`/questionnaire/${categoryId}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton />
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Choose Your Category</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Select the type of prompt you want to generate. Each category uses specialized questionnaires 
              to create the most relevant outputs.
            </p>
          </div>
          
          {/* Featured Custom Questionnaire */}
          <div className="mb-12">
            <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Custom Prompt Builder</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Take our guided questionnaire to create a prompt tailored to your specific needs
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">File Upload</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Multi-Step Form</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Personalized</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Advanced</span>
                </div>
                <Button 
                  onClick={() => setLocation("/custom-questionnaire")}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-medium"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Start Custom Builder
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Quick Start Categories</h3>
            <p className="text-gray-600">Or choose from our predefined categories for faster prompt generation</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                icon={category.icon}
                title={category.title}
                description={category.description}
                tags={category.tags}
                gradient={category.gradient}
                badgeColor={category.badgeColor}
                onClick={() => handleCategorySelect(category.id)}
                isSelected={selectedCategory === category.id}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
