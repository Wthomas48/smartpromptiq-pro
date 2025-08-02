import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import BackButton from "@/components/BackButton";
import QuestionCard from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Question {
  id: string;
  title: string;
  description: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
  }>;
}

const questionsByCategory = {
  "business-strategy": [
    {
      id: "objective",
      title: "What's your primary business objective?",
      description: "Help us understand your main goal so we can tailor the strategy accordingly.",
      options: [
        {
          value: "growth",
          label: "Accelerate Growth",
          description: "Expand market reach, increase revenue, or scale operations"
        },
        {
          value: "efficiency", 
          label: "Improve Efficiency",
          description: "Optimize processes, reduce costs, or streamline operations"
        },
        {
          value: "innovation",
          label: "Drive Innovation", 
          description: "Develop new products, enter new markets, or adopt new technologies"
        },
        {
          value: "market",
          label: "Market Leadership",
          description: "Establish competitive advantage or become industry leader"
        }
      ]
    },
    {
      id: "timeline",
      title: "What's your target timeline?",
      description: "Understanding your timeline helps us create appropriate milestones and expectations.",
      options: [
        {
          value: "3months",
          label: "3 Months",
          description: "Quick wins and immediate impact strategies"
        },
        {
          value: "6months",
          label: "6 Months", 
          description: "Medium-term strategic initiatives"
        },
        {
          value: "1year",
          label: "1 Year",
          description: "Long-term transformation and growth"
        },
        {
          value: "18months",
          label: "18+ Months",
          description: "Enterprise-level strategic overhaul"
        }
      ]
    },
    {
      id: "market_position",
      title: "What's your current market position?",
      description: "This helps us understand your competitive landscape and strategic starting point.",
      options: [
        {
          value: "startup",
          label: "Early-stage Startup",
          description: "Pre-revenue or early revenue, establishing market presence"
        },
        {
          value: "growth",
          label: "Growth-stage Company",
          description: "Proven model, scaling operations and market reach"
        },
        {
          value: "established",
          label: "Established Business",
          description: "Mature company looking to optimize or pivot strategies"
        },
        {
          value: "enterprise",
          label: "Enterprise Organization",
          description: "Large corporation with complex strategic requirements"
        }
      ]
    }
  ],
  creative: [
    {
      id: "project_type",
      title: "What type of creative project are you working on?",
      description: "Understanding your project type helps us provide the most relevant creative direction.",
      options: [
        {
          value: "branding",
          label: "Brand Identity",
          description: "Logo design, brand guidelines, visual identity systems"
        },
        {
          value: "marketing",
          label: "Marketing Materials",
          description: "Advertisements, campaigns, promotional content"
        },
        {
          value: "web_design",
          label: "Web/Digital Design",
          description: "Website design, mobile apps, user interfaces"
        },
        {
          value: "print",
          label: "Print Design",
          description: "Brochures, posters, packaging, publications"
        }
      ]
    },
    {
      id: "style_preference",
      title: "What design style appeals to you?",
      description: "This helps us understand your aesthetic preferences and target audience.",
      options: [
        {
          value: "modern",
          label: "Modern & Minimalist",
          description: "Clean lines, simple layouts, contemporary feel"
        },
        {
          value: "classic",
          label: "Classic & Traditional",
          description: "Timeless design, established conventions, formal approach"
        },
        {
          value: "creative",
          label: "Creative & Experimental",
          description: "Bold choices, unique concepts, artistic expression"
        },
        {
          value: "professional",
          label: "Corporate & Professional",
          description: "Business-oriented, trustworthy, industry-standard"
        }
      ]
    },
    {
      id: "target_audience",
      title: "Who is your target audience?",
      description: "Understanding your audience helps create more effective creative solutions.",
      options: [
        {
          value: "b2b",
          label: "Business Professionals",
          description: "C-suite executives, decision makers, B2B customers"
        },
        {
          value: "b2c",
          label: "General Consumers",
          description: "End consumers, retail customers, broad market appeal"
        },
        {
          value: "young",
          label: "Young Adults",
          description: "Millennials, Gen Z, tech-savvy demographics"
        },
        {
          value: "niche",
          label: "Specialized Niche",
          description: "Industry experts, hobbyists, specific interest groups"
        }
      ]
    }
  ],
  technical: [
    {
      id: "project_scope",
      title: "What's the scope of your technical project?",
      description: "Understanding the project scope helps us create appropriate technical specifications.",
      options: [
        {
          value: "webapp",
          label: "Web Application",
          description: "Frontend/backend web apps, SaaS platforms, web services"
        },
        {
          value: "mobile",
          label: "Mobile Application",
          description: "iOS/Android apps, cross-platform mobile solutions"
        },
        {
          value: "api",
          label: "API & Backend",
          description: "REST APIs, microservices, backend architecture"
        },
        {
          value: "infrastructure",
          label: "Infrastructure & DevOps",
          description: "Cloud architecture, deployment pipelines, system design"
        }
      ]
    },
    {
      id: "complexity",
      title: "How complex is your technical solution?",
      description: "This helps us determine the level of detail and architectural considerations needed.",
      options: [
        {
          value: "simple",
          label: "Simple & Straightforward",
          description: "Basic functionality, minimal integrations, standard patterns"
        },
        {
          value: "moderate",
          label: "Moderate Complexity",
          description: "Multiple features, some integrations, custom requirements"
        },
        {
          value: "complex",
          label: "Complex System",
          description: "Many integrations, advanced features, scalability requirements"
        },
        {
          value: "enterprise",
          label: "Enterprise-Grade",
          description: "High availability, security, compliance, massive scale"
        }
      ]
    },
    {
      id: "technology",
      title: "What technology stack are you considering?",
      description: "Technology preferences help us create more specific and actionable recommendations.",
      options: [
        {
          value: "javascript",
          label: "JavaScript/Node.js",
          description: "React, Vue, Angular, Node.js, modern JS ecosystem"
        },
        {
          value: "python",
          label: "Python",
          description: "Django, Flask, FastAPI, data science, AI/ML"
        },
        {
          value: "cloud",
          label: "Cloud-Native",
          description: "AWS, Azure, GCP, serverless, containerized solutions"
        },
        {
          value: "flexible",
          label: "Technology Agnostic",
          description: "Open to recommendations, best tool for the job"
        }
      ]
    }
  ]
};

export default function Questionnaire() {
  const [match, params] = useRoute("/questionnaire/:category");
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const category = params?.category as keyof typeof questionsByCategory;
  const questions = category && questionsByCategory[category] ? questionsByCategory[category] : [];

  useEffect(() => {
    if (!match || !category || !questionsByCategory[category]) {
      setLocation("/categories");
    }
  }, [match, category, setLocation]);

  if (!questions.length) {
    return null;
  }

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const canProceed = responses[currentQuestion.id];

  const handleNext = () => {
    if (isLastQuestion) {
      // Store responses and navigate to generation
      sessionStorage.setItem('questionnaire', JSON.stringify({
        category,
        responses
      }));
      setLocation("/generation");
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResponseChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <BackButton />
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">
              {category === "business-strategy" && "Business Strategy"}
              {category === "creative" && "Creative & Design"}
              {category === "technical" && "Technical & Development"}
            </h1>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {questions.length}
            </div>
          </div>
          
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <QuestionCard
          questionNumber={currentStep + 1}
          totalQuestions={questions.length}
          title={currentQuestion.title}
          description={currentQuestion.description}
          options={currentQuestion.options}
          value={responses[currentQuestion.id] || ""}
          onChange={handleResponseChange}
        />

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center"
          >
            {isLastQuestion ? "Generate Prompt" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

