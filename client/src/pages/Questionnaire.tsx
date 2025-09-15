import { useEffect, useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { ArrowLeft, ArrowRight, CheckCircle, Circle, Sparkles, Brain, Target, Lightbulb, Zap, Trophy, Settings, User, Building, Calendar, DollarSign, Users, Star, Wand2, Flame, Rocket, Gem, Crown, Heart } from "lucide-react";

interface QuestionOption {
  value: string;
  label: string;
  description: string;
  icon?: string;
  color?: string;
}

interface Question {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  type: 'single' | 'multiple' | 'scale' | 'text' | 'select' | 'textarea';
  options?: QuestionOption[];
  selectOptions?: string[];
  minOptions?: number;
  maxOptions?: number;
  required?: boolean;
  placeholder?: string;
}

const questionsByCategory: Record<string, { title: string; description: string; icon: string; questions: Question[] }> = {
  "marketing": {
    title: "Marketing Strategy",
    description: "Create compelling marketing campaigns that convert",
    icon: "📊",
    questions: [
      {
        id: "marketing_goal",
        title: "What's your primary marketing goal?",
        subtitle: "This helps us tailor the perfect strategy for you",
        description: "Choose the main objective you want to achieve with your marketing efforts",
        type: "single",
        options: [
          { value: "brand_awareness", label: "Brand Awareness", description: "Increase visibility and recognition", icon: "🎯", color: "from-blue-500 to-cyan-500" },
          { value: "lead_generation", label: "Lead Generation", description: "Capture qualified prospects", icon: "🔍", color: "from-green-500 to-emerald-500" },
          { value: "sales_growth", label: "Sales Growth", description: "Drive direct revenue increase", icon: "💰", color: "from-purple-500 to-indigo-500" },
          { value: "customer_retention", label: "Customer Retention", description: "Keep existing customers engaged", icon: "❤️", color: "from-pink-500 to-rose-500" },
        ]
      },
      {
        id: "target_audience",
        title: "Who is your ideal customer?",
        subtitle: "Understanding your audience is key to success",
        description: "Select the demographics that best describe your target market",
        type: "multiple",
        minOptions: 1,
        maxOptions: 3,
        options: [
          { value: "young_professionals", label: "Young Professionals (25-35)", description: "Career-focused millennials", icon: "👔" },
          { value: "families", label: "Families with Children", description: "Parents making household decisions", icon: "👨‍👩‍👧‍👦" },
          { value: "seniors", label: "Seniors (55+)", description: "Mature audience with spending power", icon: "👴" },
          { value: "students", label: "Students & Young Adults", description: "Education-focused demographic", icon: "🎓" },
          { value: "entrepreneurs", label: "Business Owners", description: "Decision-makers and founders", icon: "🚀" },
          { value: "creatives", label: "Creative Professionals", description: "Artists, designers, content creators", icon: "🎨" },
        ]
      },
      {
        id: "budget_range",
        title: "What's your marketing budget range?",
        subtitle: "We'll optimize strategies within your budget",
        description: "This helps us recommend the most effective tactics for your investment level",
        type: "single",
        options: [
          { value: "startup", label: "Startup Budget", description: "$500 - $2,000/month", icon: "🌱", color: "from-green-400 to-green-600" },
          { value: "small_business", label: "Small Business", description: "$2,000 - $10,000/month", icon: "🏪", color: "from-blue-400 to-blue-600" },
          { value: "enterprise", label: "Enterprise", description: "$10,000+ /month", icon: "🏢", color: "from-purple-400 to-purple-600" },
          { value: "flexible", label: "Flexible/Variable", description: "Budget depends on ROI", icon: "📈", color: "from-orange-400 to-orange-600" },
        ]
      },
      {
        id: "campaign_urgency",
        title: "What's your timeline for results?",
        subtitle: "Different strategies work for different timeframes",
        description: "Understanding your urgency helps us prioritize the right tactics",
        type: "single",
        options: [
          { value: "immediate", label: "Immediate Results", description: "Need results within 1-2 weeks", icon: "⚡", color: "from-red-500 to-orange-500" },
          { value: "short_term", label: "Short Term", description: "1-3 months for significant impact", icon: "🎯", color: "from-yellow-500 to-orange-500" },
          { value: "long_term", label: "Long Term Growth", description: "Building sustainable growth over 6+ months", icon: "🌱", color: "from-green-500 to-blue-500" },
        ]
      },
    ]
  },
  "product-development": {
    title: "Product Development",
    description: "Build products that users love and markets demand",
    icon: "💻",
    questions: [
      {
        id: "product_stage",
        title: "What stage is your product in?",
        subtitle: "We'll tailor our approach to your current phase",
        description: "Understanding where you are helps us provide the most relevant guidance",
        type: "single",
        options: [
          { value: "idea", label: "Idea Stage", description: "Concept validation and planning", icon: "💡", color: "from-yellow-500 to-amber-500" },
          { value: "prototype", label: "Prototype/MVP", description: "Building initial version", icon: "🔧", color: "from-blue-500 to-cyan-500" },
          { value: "beta", label: "Beta Testing", description: "Testing with users", icon: "🧪", color: "from-purple-500 to-indigo-500" },
          { value: "launch", label: "Ready to Launch", description: "Preparing for market release", icon: "🚀", color: "from-green-500 to-emerald-500" },
          { value: "scaling", label: "Scaling", description: "Growing existing product", icon: "📈", color: "from-pink-500 to-rose-500" },
        ]
      },
      {
        id: "target_market",
        title: "Who will use your product?",
        subtitle: "User-centered design starts with knowing your users",
        description: "Select your primary user segments",
        type: "multiple",
        minOptions: 1,
        maxOptions: 2,
        options: [
          { value: "consumers", label: "Individual Consumers", description: "B2C market targeting end users", icon: "👤" },
          { value: "small_business", label: "Small Businesses", description: "SMB market with <100 employees", icon: "🏪" },
          { value: "enterprise", label: "Enterprise Clients", description: "Large organizations with complex needs", icon: "🏢" },
          { value: "developers", label: "Developers/Technical Users", description: "Technical professionals and programmers", icon: "💻" },
        ]
      }
    ]
  },
  "education": {
    title: "Education & Training",
    description: "Create engaging learning experiences that stick",
    icon: "🎓",
    questions: [
      {
        id: "learning_type",
        title: "What type of learning content are you creating?",
        subtitle: "Different formats require different approaches",
        description: "This helps us suggest the most effective content structure",
        type: "single",
        options: [
          { value: "course", label: "Online Course", description: "Structured curriculum with modules", icon: "📚", color: "from-blue-500 to-indigo-500" },
          { value: "workshop", label: "Workshop/Seminar", description: "Interactive live or recorded sessions", icon: "🎪", color: "from-purple-500 to-pink-500" },
          { value: "certification", label: "Certification Program", description: "Professional credential pathway", icon: "🏆", color: "from-yellow-500 to-orange-500" },
          { value: "microlearning", label: "Micro-Learning", description: "Bite-sized learning modules", icon: "⚡", color: "from-green-500 to-teal-500" },
        ]
      }
    ]
  },
  "financial-planning": {
    title: "Financial Planning",
    description: "Smart financial strategies for growth and security",
    icon: "💰",
    questions: [
      {
        id: "financial_goal",
        title: "What's your primary financial objective?",
        subtitle: "Focus on what matters most to you",
        description: "Understanding your main goal helps prioritize strategies",
        type: "single",
        options: [
          { value: "emergency_fund", label: "Emergency Fund", description: "Build financial safety net", icon: "🛡️", color: "from-blue-500 to-cyan-500" },
          { value: "debt_reduction", label: "Debt Reduction", description: "Eliminate high-interest debt", icon: "📉", color: "from-red-500 to-pink-500" },
          { value: "investment_growth", label: "Investment Growth", description: "Grow wealth through investments", icon: "📈", color: "from-green-500 to-emerald-500" },
          { value: "retirement", label: "Retirement Planning", description: "Long-term retirement security", icon: "🏖️", color: "from-purple-500 to-indigo-500" },
        ]
      }
    ]
  }
};

export default function Questionnaire() {
  const [, params] = useRoute("/questionnaire/:category");
  const [, setLocation] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [questionTransition, setQuestionTransition] = useState('fade-in');
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get questionnaire data from session storage (includes template data)
  const sessionData = JSON.parse(sessionStorage.getItem('questionnaire') || '{}');
  const isTemplateFlow = sessionData.isTemplate && sessionData.templateData;

  const category = params?.category || sessionData.category || "marketing";
  const categoryData = questionsByCategory[category];

  // For templates, create questions from template customization fields
  const templateQuestions = isTemplateFlow ?
    sessionData.templateData.customizationFields.map((field: any, index: number) => ({
      id: field.label.toLowerCase().replace(/\s+/g, '_'),
      title: field.label,
      subtitle: isTemplateFlow ? `Customize your ${sessionData.templateData?.name || 'template'}` : undefined,
      description: field.description || `Please provide your ${field.label.toLowerCase()}`,
      type: field.type === 'select' ? 'select' : field.type === 'textarea' ? 'textarea' : 'text',
      selectOptions: field.options || [],
      required: field.required,
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}...`
    })) : [];

  const questions = isTemplateFlow ? templateQuestions : (categoryData?.questions || []);
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (!isTemplateFlow && !categoryData) {
      toast({
        title: "Category not found",
        description: "Redirecting to available categories...",
        variant: "destructive"
      });
      setLocation("/categories");
    }
  }, [category, categoryData, isTemplateFlow, setLocation, toast]);

  const handleSingleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const handleMultipleAnswer = (value: string, checked: boolean) => {
    const currentAnswers = (answers[currentQuestion.id] as string[]) || [];

    if (checked) {
      const newAnswers = [...currentAnswers, value];
      if (currentQuestion.maxOptions && newAnswers.length > currentQuestion.maxOptions) {
        toast({
          title: "Too many selections",
          description: `You can select up to ${currentQuestion.maxOptions} options.`,
          variant: "destructive"
        });
        return;
      }
      setAnswers({
        ...answers,
        [currentQuestion.id]: newAnswers,
      });
    } else {
      setAnswers({
        ...answers,
        [currentQuestion.id]: currentAnswers.filter(a => a !== value),
      });
    }
  };

  const handleTextAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const isCurrentQuestionAnswered = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'multiple') {
      const answerArray = answer as string[] || [];
      return answerArray.length >= (currentQuestion.minOptions || 1);
    }
    if (currentQuestion.type === 'text' || currentQuestion.type === 'textarea' || currentQuestion.type === 'select') {
      if (currentQuestion.required) {
        return !!(answer && (answer as string).trim());
      }
      return true; // Optional fields are always valid
    }
    return !!answer;
  };

  const celebrateAnswer = () => {
    setStreak(prev => prev + 1);
    setTotalScore(prev => prev + 10);

    // Celebration effect
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1000);

    // Achievement toasts
    if ((streak + 1) === 3) {
      toast({
        title: "🔥 On Fire!",
        description: "You're on a 3-question streak! Keep going!"
      });
    } else if ((streak + 1) === 5) {
      toast({
        title: "🚀 Unstoppable!",
        description: "5 questions in a row! You're crushing this!"
      });
    } else if ((streak + 1) === questions.length && questions.length > 1) {
      toast({
        title: "👑 Perfect Run!",
        description: "You've answered every question! You're a champion!"
      });
    }
  };

  const handleNext = async () => {
    // Celebrate the answer
    celebrateAnswer();

    // Smooth transition effect
    setQuestionTransition('fade-out');

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestionTransition('slide-in');
        setTimeout(() => setQuestionTransition('fade-in'), 100);
      } else {
        // Generate results
        setIsGenerating(true);

        // Simulate generation with a delay
        setTimeout(() => {
          try {
            toast({
              title: `🎊 AMAZING! You scored ${totalScore + 10} points!`,
              description: "Generating your personalized masterpiece...",
            });

            // Save complete questionnaire data to session storage
            const completedData = {
              category: category,
              responses: answers,
              isTemplate: isTemplateFlow,
              templateData: isTemplateFlow ? sessionData.templateData : null,
              customizationValues: isTemplateFlow ? answers : null,
              completedAt: new Date().toISOString()
            };

            sessionStorage.setItem('questionnaire', JSON.stringify(completedData));
            setLocation('/generation');
          } catch (error) {
            toast({
              title: "Generation failed",
              description: "Please try again or contact support.",
              variant: "destructive"
            });
          } finally {
            setIsGenerating(false);
          }
        }, 2000); // 2 second delay for generation simulation
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setLocation("/categories");
    }
  };

  if (!isTemplateFlow && !categoryData) {
    return null;
  }

  // Particle animation component
  const ParticleField = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            background: `hsl(${Math.random() * 60 + 250}, 70%, 70%)`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${Math.random() * 3 + 2}s`
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <ParticleField />
      <Navigation />
      <BackButton />

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Gamification Header */}
        <div className="text-center mb-8 relative">
          {showCelebration && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
              <div className="animate-bounce text-6xl">🎉</div>
              <div className="absolute animate-ping text-4xl">✨</div>
              <div className="absolute animate-pulse text-3xl ml-10">🔥</div>
              <div className="absolute animate-bounce text-3xl -ml-10 mt-5">⭐</div>
            </div>
          )}

          {/* Score and Streak Display */}
          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span className="font-bold text-lg">{totalScore} pts</span>
              </div>
            </div>
            {streak > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  <span className="font-bold text-lg">{streak} streak</span>
                </div>
              </div>
            )}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                <span className="font-bold text-lg">Level {Math.floor(totalScore / 50) + 1}</span>
              </div>
            </div>
          </div>
          {isTemplateFlow ? (
            <>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg mb-6">
                <Wand2 className="w-6 h-6" />
                <span className="font-bold text-lg">Template Customization</span>
                <Star className="w-5 h-5 fill-current" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Customize Your {sessionData.templateData?.name || 'Template'}
              </h1>
              <p className="text-xl text-slate-600 mb-6">
                Personalize this {sessionData.templateData.category?.replace('-', ' ') || 'template'} template to match your specific needs
              </p>
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-4 max-w-3xl mx-auto">
                <p className="text-slate-700 font-medium">
                  ✨ {sessionData.templateData?.description || 'Template description'}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border mb-4">
                <span className="text-2xl">{categoryData.icon}</span>
                <span className="font-semibold text-slate-700">{categoryData.title}</span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Smart Questionnaire
              </h1>
              <p className="text-xl text-slate-600 mb-6">
                {categoryData.description}
              </p>
            </>
          )}
          
          {/* Enhanced Progress */}
          <div className="max-w-lg mx-auto">
            <div className="flex justify-between text-sm text-slate-600 mb-3">
              <span className="font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="font-semibold">{Math.round(progress)}% Complete</span>
            </div>
            <div className="relative">
              <Progress
                value={progress}
                className="h-4 border border-white shadow-lg"
              />
              {/* Progress milestones */}
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-2">
                {questions.map((_, index) => {
                  const stepProgress = ((index + 1) / questions.length) * 100;
                  const isComplete = currentQuestionIndex >= index;
                  const isCurrent = currentQuestionIndex === index;

                  return (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-500 ${
                        isComplete
                          ? isCurrent
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 scale-150 shadow-lg'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600'
                          : 'bg-slate-300'
                      }`}
                      style={{ left: `${stepProgress - 100/questions.length/2}%` }}
                    />
                  );
                })}
              </div>
            </div>
            {progress > 50 && (
              <div className="mt-2 text-center">
                <span className="text-sm bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                  🚀 You're more than halfway there! Keep going!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Question Card */}
        {currentQuestion && (
          <Card
            ref={cardRef}
            className={`
              bg-white/90 backdrop-blur-sm border-0 shadow-2xl relative overflow-hidden
              transition-all duration-500 transform
              ${questionTransition === 'fade-out' ? 'opacity-0 scale-95' : ''}
              ${questionTransition === 'slide-in' ? 'translate-x-8 opacity-0' : ''}
              ${questionTransition === 'fade-in' ? 'opacity-100 scale-100 translate-x-0' : ''}
              hover:shadow-3xl hover:scale-[1.01]
            `}
          >
            {/* Animated border */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 opacity-20 blur-xl animate-pulse" />
            <div className="absolute inset-[1px] bg-white/90 backdrop-blur-sm rounded-lg" />

            <div className="relative z-10">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="relative">
                  {currentQuestion.type === 'single' && (
                    <div className="relative">
                      <Target className="w-6 h-6 text-blue-600 animate-pulse" />
                      <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-30 animate-ping" />
                    </div>
                  )}
                  {currentQuestion.type === 'multiple' && (
                    <div className="relative">
                      <CheckCircle className="w-6 h-6 text-green-600 animate-bounce" />
                      <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-30 animate-ping" />
                    </div>
                  )}
                  {(currentQuestion.type === 'text' || currentQuestion.type === 'textarea' || currentQuestion.type === 'select') && (
                    <div className="relative">
                      <Settings className="w-6 h-6 text-purple-600 animate-spin" style={{ animationDuration: '3s' }} />
                      <div className="absolute inset-0 bg-purple-400 rounded-full blur opacity-30 animate-ping" />
                    </div>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 shadow-sm px-4 py-1"
                >
                  {currentQuestion.type === 'single' ? '🎯 Choose One' :
                   currentQuestion.type === 'multiple' ? '✅ Choose Multiple' :
                   '✍️ Customize'}
                </Badge>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent mb-3 leading-tight">
                {currentQuestion.title}
              </CardTitle>
              {currentQuestion.subtitle && (
                <p className="text-lg bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-semibold mb-3 animate-pulse">
                  ✨ {currentQuestion.subtitle}
                </p>
              )}
              <p className="text-slate-700 text-lg leading-relaxed">
                {currentQuestion.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Template customization fields */}
              {(currentQuestion.type === 'text' || currentQuestion.type === 'textarea' || currentQuestion.type === 'select') && (
                <div className="space-y-6">
                  {currentQuestion.type === 'text' && (
                    <div className="space-y-4">
                      <div className="relative group">
                        <Input
                          value={(answers[currentQuestion.id] as string) || ''}
                          onChange={(e) => handleTextAnswer(e.target.value)}
                          placeholder={currentQuestion.placeholder}
                          className="text-lg p-5 border-2 border-slate-200 focus:border-purple-400 rounded-xl shadow-md group-hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      {currentQuestion.required && (
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <span className="text-red-400">*</span>
                          This field is required
                        </p>
                      )}
                    </div>
                  )}

                  {currentQuestion.type === 'textarea' && (
                    <div className="space-y-4">
                      <div className="relative group">
                        <Textarea
                          value={(answers[currentQuestion.id] as string) || ''}
                          onChange={(e) => handleTextAnswer(e.target.value)}
                          placeholder={currentQuestion.placeholder}
                          rows={5}
                          className="text-lg p-5 border-2 border-slate-200 focus:border-purple-400 rounded-xl resize-none shadow-md group-hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      {currentQuestion.required && (
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <span className="text-red-400">*</span>
                          This field is required
                        </p>
                      )}
                    </div>
                  )}

                  {currentQuestion.type === 'select' && (
                    <div className="space-y-4">
                      <div className="relative group">
                        <Select
                          value={(answers[currentQuestion.id] as string) || ''}
                          onValueChange={(value) => handleTextAnswer(value)}
                        >
                          <SelectTrigger className="text-lg p-5 border-2 border-slate-200 focus:border-purple-400 rounded-xl shadow-md group-hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm">
                            <SelectValue placeholder={currentQuestion.placeholder || "Select an option..."} />
                          </SelectTrigger>
                          <SelectContent>
                            {currentQuestion.selectOptions?.map((option) => (
                              <SelectItem key={option} value={option} className="text-lg py-2">
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      {currentQuestion.required && (
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <span className="text-red-400">*</span>
                          This field is required
                        </p>
                      )}
                    </div>
                  )}

                  {/* Enhanced visual enhancement for template fields */}
                  <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-5 border-2 border-indigo-200 shadow-lg">
                    <div className="flex items-center gap-3 text-indigo-700">
                      <div className="relative">
                        <Gem className="w-5 h-5 animate-pulse" />
                        <div className="absolute inset-0 bg-indigo-400 rounded-full blur opacity-30 animate-ping" />
                      </div>
                      <span className="text-sm font-semibold">
                        {isTemplateFlow ? '💎 Customizing your premium template' : '🎨 Personalizing your unique response'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Regular questionnaire options */}
              {(currentQuestion.type === 'single' || currentQuestion.type === 'multiple') && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = currentQuestion.type === 'single'
                      ? answers[currentQuestion.id] === option.value
                      : ((answers[currentQuestion.id] as string[]) || []).includes(option.value);

                    return (
                      <label
                        key={option.value}
                        className={`
                          group flex items-start gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-500 relative overflow-hidden
                          ${isSelected
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 shadow-xl transform scale-[1.03] ring-4 ring-purple-200'
                            : 'border-slate-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50 hover:scale-[1.02] hover:shadow-lg'
                          }
                        `}
                      >
                        {/* Animated background */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-blue-400/10 to-indigo-400/10 animate-pulse" />
                        )}
                        <div className="flex items-center justify-center mt-1 relative z-10">
                          {currentQuestion.type === 'single' ? (
                            <div className="relative">
                              <Circle
                                className={`w-6 h-6 transition-all duration-300 ${
                                  isSelected ? 'text-purple-600 fill-current animate-pulse' : 'text-slate-400 group-hover:text-purple-400'
                                }`}
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-purple-400 rounded-full blur opacity-30 animate-ping" />
                              )}
                            </div>
                          ) : (
                            <div className="relative">
                              <CheckCircle
                                className={`w-6 h-6 transition-all duration-300 ${
                                  isSelected ? 'text-green-600 fill-current animate-bounce' : 'text-slate-400 group-hover:text-green-400'
                                }`}
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-30 animate-ping" />
                              )}
                            </div>
                          )}
                        </div>

                        {option.icon && (
                          <div className={`
                            text-3xl p-4 rounded-xl transition-all duration-300 relative z-10
                            ${isSelected
                              ? `bg-gradient-to-r ${option.color || 'from-purple-500 to-blue-500'} text-white shadow-xl transform scale-110 animate-pulse`
                              : 'bg-gradient-to-r from-slate-100 to-slate-200 group-hover:from-purple-100 group-hover:to-blue-100 group-hover:scale-105'
                            }
                          `}>
                            <div className={isSelected ? 'animate-bounce' : ''}>
                              {option.icon}
                            </div>
                          </div>
                        )}

                        <div className="flex-1 relative z-10">
                          <div className={`font-bold text-xl mb-2 transition-all duration-300 ${
                            isSelected ? 'text-purple-900 transform scale-105' : 'text-slate-900 group-hover:text-purple-700'
                          }`}>
                            {isSelected && '✨ '}{option.label}
                          </div>
                          <div className={`text-base transition-colors ${
                            isSelected ? 'text-slate-700 font-medium' : 'text-slate-600 group-hover:text-slate-700'
                          }`}>
                            {option.description}
                          </div>
                          {isSelected && (
                            <div className="mt-2 text-sm text-purple-600 font-semibold flex items-center gap-1">
                              <Heart className="w-4 h-4 fill-current animate-pulse" />
                              Selected!
                            </div>
                          )}
                        </div>

                        <input
                          type={currentQuestion.type === 'single' ? 'radio' : 'checkbox'}
                          name={currentQuestion.id}
                          value={option.value}
                          checked={isSelected}
                          onChange={(e) => {
                            if (currentQuestion.type === 'single') {
                              handleSingleAnswer(option.value);
                            } else {
                              handleMultipleAnswer(option.value, e.target.checked);
                            }
                          }}
                          className="sr-only"
                        />
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Enhanced multiple selection info */}
              {currentQuestion.type === 'multiple' && (
                <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 shadow-lg">
                  <div className="flex items-center gap-3 text-blue-700">
                    <div className="relative">
                      <Lightbulb className="w-5 h-5 animate-pulse" />
                      <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-30 animate-ping" />
                    </div>
                    <span className="text-base font-semibold">
                      💡 Select {currentQuestion.minOptions || 1} to {currentQuestion.maxOptions || 'multiple'} options that resonate with you
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-indigo-600">
                    The more accurate your selection, the better your personalized results!
                  </div>
                </div>
              )}
            </CardContent>
            </div>
          </Card>
        )}

        {/* Enhanced Navigation */}
        <div className="flex justify-between items-center mt-10">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            className="flex items-center gap-3 hover:scale-110 transition-all duration-300 border-2 border-slate-300 hover:border-purple-400 px-6 py-3 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentQuestionIndex === 0
              ? (isTemplateFlow ? 'Back to Templates' : 'Back to Categories')
              : 'Previous'
            }
          </Button>

          {/* Enhanced step indicators */}
          <div className="flex items-center gap-3">
            {questions.map((_, index) => {
              const isComplete = index < currentQuestionIndex;
              const isCurrent = index === currentQuestionIndex;
              const isUpcoming = index > currentQuestionIndex;

              return (
                <div key={index} className="relative">
                  <div
                    className={`transition-all duration-500 relative ${
                      isCurrent
                        ? 'w-10 h-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 scale-125 shadow-lg'
                        : isComplete
                        ? 'w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-md'
                        : 'w-3 h-3 rounded-full bg-slate-300'
                    }`}
                  >
                    {isComplete && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                    )}
                  </div>
                  {isCurrent && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-bounce" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            size="lg"
            onClick={handleNext}
            disabled={!isCurrentQuestionAnswered() || isGenerating}
            className={`flex items-center gap-3 hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-2xl px-6 py-3 relative overflow-hidden ${
              currentQuestionIndex === questions.length - 1
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 ring-4 ring-green-200'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 ring-4 ring-purple-200'
            } ${!isCurrentQuestionAnswered() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {!isGenerating && !isCurrentQuestionAnswered() && (
              <div className="absolute inset-0 bg-black/10 animate-pulse" />
            )}
            <div className="relative z-10 flex items-center gap-3">
              {isGenerating ? (
                <>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <Rocket className="w-4 h-4 animate-bounce" />
                  </div>
                  <span className="font-bold">
                    {isTemplateFlow ? '🎨 Crafting Your Masterpiece...' : '⚡ Generating Your Strategy...'}
                  </span>
                </>
              ) : currentQuestionIndex === questions.length - 1 ? (
                <>
                  {isTemplateFlow ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 animate-pulse" />
                        <Gem className="w-4 h-4 animate-bounce" />
                      </div>
                      <span className="font-bold">🚀 Generate Custom Masterpiece</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 animate-pulse" />
                        <Crown className="w-4 h-4 animate-bounce" />
                      </div>
                      <span className="font-bold">👑 Generate Winning Strategy</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="font-bold">Next Question</span>
                  <ArrowRight className="w-5 h-5 animate-bounce" style={{ animationDirection: 'alternate' }} />
                </>
              )}
            </div>
          </Button>
        </div>

        {/* Ultra Enhanced footer for template flow */}
        {isTemplateFlow && (
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-white/80 via-purple-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/50 shadow-xl">
              <div className="flex items-center justify-center gap-3 text-slate-700 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current animate-pulse" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <Star className="w-3 h-3 text-yellow-300 fill-current animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                  Customizing Premium Template
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-300 fill-current animate-pulse" style={{ animationDelay: '0.6s' }} />
                  <Star className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: '0.8s' }} />
                  <Star className="w-5 h-5 text-yellow-500 fill-current animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
              </div>
              <div className="text-base text-slate-600 font-medium">
                🎨 "{sessionData.templateData?.name || 'Template'}" - Your personalized AI experience
              </div>
              <div className="mt-2 text-sm text-indigo-600">
                ✨ Every answer makes it more uniquely yours
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}