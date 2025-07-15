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
  business: [
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
      id: "resources",
      title: "What resources do you have available?",
      description: "This helps us recommend realistic and achievable strategies.",
      options: [
        {
          value: "limited",
          label: "Limited Resources",
          description: "Small team, tight budget, need cost-effective solutions"
        },
        {
          value: "moderate",
          label: "Moderate Resources",
          description: "Dedicated team, reasonable budget for strategic initiatives"
        },
        {
          value: "extensive",
          label: "Extensive Resources",
          description: "Large team, significant budget, enterprise-level capabilities"
        },
        {
          value: "unlimited",
          label: "Resource-Rich",
          description: "No significant constraints, premium solutions welcome"
        }
      ]
    },
    {
      id: "industry",
      title: "What industry sector best describes your business?",
      description: "Industry-specific insights help create more targeted strategies.",
      options: [
        {
          value: "technology",
          label: "Technology & Software",
          description: "SaaS, AI, fintech, cybersecurity, and tech services"
        },
        {
          value: "ecommerce",
          label: "E-commerce & Retail", 
          description: "Online stores, marketplaces, consumer goods"
        },
        {
          value: "healthcare",
          label: "Healthcare & Life Sciences",
          description: "Medical devices, pharmaceuticals, health services"
        },
        {
          value: "services",
          label: "Professional Services",
          description: "Consulting, legal, financial, marketing services"
        }
      ]
    }
  ],
  creative: [
    {
      id: "project_type",
      title: "What type of creative project are you working on?",
      description: "This helps us understand the scope and requirements of your creative work.",
      options: [
        {
          value: "branding",
          label: "Brand Identity",
          description: "Logo design, brand guidelines, visual identity systems"
        },
        {
          value: "marketing",
          label: "Marketing Materials",
          description: "Campaigns, advertisements, promotional content"
        },
        {
          value: "digital",
          label: "Digital Design",
          description: "Website design, app interfaces, digital experiences"
        },
        {
          value: "print",
          label: "Print Design",
          description: "Brochures, packaging, publications, merchandise"
        }
      ]
    },
    {
      id: "style",
      title: "What visual style appeals to you?",
      description: "Understanding your aesthetic preferences helps guide the creative direction.",
      options: [
        {
          value: "modern",
          label: "Modern & Minimalist",
          description: "Clean lines, white space, contemporary aesthetics"
        },
        {
          value: "bold",
          label: "Bold & Vibrant",
          description: "Strong colors, dynamic compositions, eye-catching designs"
        },
        {
          value: "classic",
          label: "Classic & Timeless",
          description: "Traditional elements, elegant typography, refined aesthetics"
        },
        {
          value: "playful",
          label: "Playful & Creative",
          description: "Fun illustrations, creative concepts, unique approaches"
        }
      ]
    },
    {
      id: "audience",
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
    },
    {
      id: "deliverables",
      title: "What are your key deliverables?",
      description: "This helps us structure the creative brief around your specific needs.",
      options: [
        {
          value: "concepts",
          label: "Creative Concepts",
          description: "Initial ideas, mood boards, creative direction"
        },
        {
          value: "designs",
          label: "Final Designs",
          description: "Production-ready files, complete visual assets"
        },
        {
          value: "guidelines",
          label: "Brand Guidelines",
          description: "Style guides, usage instructions, brand standards"
        },
        {
          value: "campaign",
          label: "Full Campaign",
          description: "Multi-channel creative campaign with all assets"
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
    },
    {
      id: "timeline_tech",
      title: "What's your development timeline?",
      description: "Timeline affects architecture decisions, MVP scope, and implementation strategy.",
      options: [
        {
          value: "rapid",
          label: "Rapid Prototype",
          description: "2-4 weeks, MVP, proof of concept"
        },
        {
          value: "standard",
          label: "Standard Development",
          description: "2-6 months, full feature set, production ready"
        },
        {
          value: "comprehensive",
          label: "Comprehensive Build",
          description: "6-12 months, enterprise features, extensive testing"
        },
        {
          value: "phased",
          label: "Phased Approach",
          description: "Multiple releases, iterative development, long-term roadmap"
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
  const questions = category ? questionsByCategory[category] : [];

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
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton />
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              {questions.map((_, index) => (
                <div key={index} className="flex items-center">
                  <div className={`step-indicator w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    index <= currentStep ? 'active' : 'bg-slate-300 text-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < questions.length - 1 && (
                    <div className="w-16 h-1 bg-slate-300 rounded"></div>
                  )}
                </div>
              ))}
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

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-2" size={16} />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              {isLastQuestion ? "Generate Prompt" : "Next"}
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
