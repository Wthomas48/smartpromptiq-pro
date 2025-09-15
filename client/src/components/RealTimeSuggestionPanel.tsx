import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  TrendingUp,
  Users,
  Sparkles,
  Clock,
  Target,
  Activity,
  ThumbsUp,
  Copy,
  Zap,
  RefreshCw,
  MessageSquare
} from "lucide-react";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
  relevanceScore: number;
  isPersonalized: boolean;
  isTrending: boolean;
  estimatedTokens: number;
  usageCount?: number;
  userRating?: number;
  averageRating?: number;
  totalRatings?: number;
  generatedAt: Date;
}

interface RealTimeSuggestionPanelProps {
  onSuggestionSelect: (suggestion: Suggestion) => void;
  enableRealTime?: boolean;
  showRatings?: boolean;
  showTrending?: boolean;
  showPersonalized?: boolean;
  maxSuggestions?: number;
  placeholder?: string;
}

export default function RealTimeSuggestionPanel({
  onSuggestionSelect,
  enableRealTime = true,
  showRatings = true,
  showTrending = true,
  showPersonalized = true,
  maxSuggestions = 6,
  placeholder = "Start typing to get AI suggestions..."
}: RealTimeSuggestionPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  // Mock suggestion database
  const mockSuggestions: Suggestion[] = [
    {
      id: "1",
      title: "Social Media Marketing Strategy",
      description: "Comprehensive social media strategy for brand awareness and engagement",
      prompt: "Create a detailed social media marketing strategy for a [BUSINESS TYPE] targeting [TARGET AUDIENCE]. Include platform-specific content calendars, engagement tactics, hashtag strategies, and KPI tracking methods. Focus on building brand awareness and driving conversions.",
      category: "marketing",
      tags: ["social-media", "strategy", "branding", "engagement"],
      relevanceScore: 0.95,
      isPersonalized: true,
      isTrending: true,
      estimatedTokens: 450,
      usageCount: 1247,
      averageRating: 4.8,
      totalRatings: 156,
      generatedAt: new Date()
    },
    {
      id: "2", 
      title: "Technical Documentation Template",
      description: "Professional technical documentation structure for software projects",
      prompt: "Generate comprehensive technical documentation for [PROJECT NAME]. Include: 1) Architecture overview with diagrams, 2) API documentation with examples, 3) Installation and setup guides, 4) User guides with screenshots, 5) Troubleshooting section, 6) Contributing guidelines for developers.",
      category: "technical",
      tags: ["documentation", "technical", "api", "software"],
      relevanceScore: 0.88,
      isPersonalized: false,
      isTrending: true,
      estimatedTokens: 680,
      usageCount: 892,
      averageRating: 4.6,
      totalRatings: 74,
      generatedAt: new Date()
    },
    {
      id: "3",
      title: "Creative Writing Prompt Generator",
      description: "Inspiring creative writing prompts for stories and character development",
      prompt: "Generate a creative writing prompt that includes: A unique character with a specific background and motivation, an intriguing setting that influences the story, a central conflict or challenge, and an unexpected twist element. Make it engaging for [GENRE] writing with themes of [THEMES].",
      category: "creative",
      tags: ["creative-writing", "storytelling", "characters", "fiction"],
      relevanceScore: 0.92,
      isPersonalized: true,
      isTrending: false,
      estimatedTokens: 320,
      usageCount: 567,
      averageRating: 4.9,
      totalRatings: 89,
      generatedAt: new Date()
    },
    {
      id: "4",
      title: "Business Plan Executive Summary",
      description: "Professional executive summary template for business plans and proposals",
      prompt: "Create a compelling executive summary for [BUSINESS NAME] that includes: Company overview and mission, market opportunity analysis, competitive advantages, financial projections summary, funding requirements, and growth strategy. Keep it concise but comprehensive for [INDUSTRY] sector.",
      category: "business",
      tags: ["business-plan", "executive-summary", "strategy", "funding"],
      relevanceScore: 0.85,
      isPersonalized: false,
      isTrending: true,
      estimatedTokens: 520,
      usageCount: 734,
      averageRating: 4.7,
      totalRatings: 92,
      generatedAt: new Date()
    },
    {
      id: "5",
      title: "Educational Course Curriculum",
      description: "Structured curriculum design for online courses and training programs",
      prompt: "Design a comprehensive curriculum for [COURSE TOPIC] targeting [SKILL LEVEL] learners. Include: Learning objectives for each module, lesson plans with time estimates, practical exercises and assignments, assessment methods, required resources, and progression tracking. Make it engaging and outcome-focused.",
      category: "education", 
      tags: ["curriculum", "education", "course-design", "learning"],
      relevanceScore: 0.90,
      isPersonalized: true,
      isTrending: false,
      estimatedTokens: 580,
      usageCount: 445,
      averageRating: 4.8,
      totalRatings: 67,
      generatedAt: new Date()
    },
    {
      id: "6",
      title: "Email Marketing Campaign",
      description: "High-converting email marketing sequence for customer engagement",
      prompt: "Create an email marketing campaign for [PRODUCT/SERVICE] with 5 emails: 1) Welcome/introduction email, 2) Value-driven educational content, 3) Social proof and testimonials, 4) Limited-time offer, 5) Follow-up and feedback request. Include subject lines, personalization tokens, and clear CTAs.",
      category: "marketing",
      tags: ["email-marketing", "campaigns", "conversion", "automation"],
      relevanceScore: 0.87,
      isPersonalized: false,
      isTrending: true,
      estimatedTokens: 420,
      usageCount: 623,
      averageRating: 4.5,
      totalRatings: 78,
      generatedAt: new Date()
    },
    {
      id: "7",
      title: "Product Launch Strategy",
      description: "Complete product launch plan with marketing and communication strategy",
      prompt: "Develop a comprehensive product launch strategy for [PRODUCT NAME]. Include: Pre-launch buzz building tactics, launch day activities and promotions, post-launch growth strategies, influencer outreach plan, PR and media strategy, customer feedback collection, and success metrics tracking.",
      category: "business",
      tags: ["product-launch", "marketing", "strategy", "promotion"],
      relevanceScore: 0.93,
      isPersonalized: true,
      isTrending: true,
      estimatedTokens: 650,
      usageCount: 389,
      averageRating: 4.9,
      totalRatings: 45,
      generatedAt: new Date()
    },
    {
      id: "8",
      title: "User Research Interview Guide",
      description: "Structured interview questions for user experience research",
      prompt: "Create a comprehensive user research interview guide for [PRODUCT/SERVICE]. Include: Background questions to understand user context, task-based questions to observe behavior, pain point discovery questions, feature preference inquiries, and wrap-up questions for additional insights. Focus on [RESEARCH GOALS].",
      category: "technical",
      tags: ["user-research", "interviews", "ux", "product"],
      relevanceScore: 0.84,
      isPersonalized: false,
      isTrending: false,
      estimatedTokens: 380,
      usageCount: 267,
      averageRating: 4.6,
      totalRatings: 34,
      generatedAt: new Date()
    }
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        const filtered = mockSuggestions
          .filter(suggestion => {
            const query = searchQuery.toLowerCase();
            return (
              suggestion.title.toLowerCase().includes(query) ||
              suggestion.description.toLowerCase().includes(query) ||
              suggestion.category.toLowerCase().includes(query) ||
              suggestion.tags.some(tag => tag.toLowerCase().includes(query))
            );
          })
          .filter(suggestion => {
            if (!showPersonalized && suggestion.isPersonalized) return false;
            if (!showTrending && suggestion.isTrending) return false;
            return true;
          })
          .sort((a, b) => {
            // Sort by relevance score and other factors
            if (b.relevanceScore !== a.relevanceScore) {
              return b.relevanceScore - a.relevanceScore;
            }
            if (showTrending && a.isTrending !== b.isTrending) {
              return b.isTrending ? 1 : -1;
            }
            return (b.averageRating || 0) - (a.averageRating || 0);
          })
          .slice(0, maxSuggestions)
          .map(suggestion => ({
            ...suggestion,
            generatedAt: new Date()
          }));

        setSuggestions(filtered);
        setIsLoading(false);
      }, enableRealTime ? 300 : 1000);
    }, enableRealTime ? 300 : 1000),
    [enableRealTime, showPersonalized, showTrending, maxSuggestions]
  );

  useEffect(() => {
    if (enableRealTime && inputValue) {
      debouncedSearch(inputValue);
    }
  }, [inputValue, debouncedSearch, enableRealTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleManualSearch = () => {
    if (inputValue.trim()) {
      debouncedSearch(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    onSuggestionSelect(suggestion);
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      marketing: "bg-blue-100 text-blue-800 border-blue-200",
      creative: "bg-purple-100 text-purple-800 border-purple-200",
      technical: "bg-green-100 text-green-800 border-green-200",
      business: "bg-orange-100 text-orange-800 border-orange-200",
      education: "bg-indigo-100 text-indigo-800 border-indigo-200",
      general: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[category] || colors.general;
  };

  const getTypeIcon = (suggestion: Suggestion) => {
    if (suggestion.isPersonalized) return <Users className="w-4 h-4 text-blue-600" />;
    if (suggestion.isTrending) return <TrendingUp className="w-4 h-4 text-orange-600" />;
    return <Sparkles className="w-4 h-4 text-purple-600" />;
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= Math.round(rating)
                ? "text-yellow-500 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="flex-1"
          />
          {!enableRealTime && (
            <Button onClick={handleManualSearch} disabled={!inputValue.trim()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${enableRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span>{enableRealTime ? 'Real-time active' : 'Manual search'}</span>
            </div>
            {isLoading && (
              <div className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Generating suggestions...</span>
              </div>
            )}
          </div>
          <div className="text-xs">
            {suggestions.length} of {maxSuggestions} suggestions
          </div>
        </div>
      </div>

      {/* Suggestions Grid */}
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion) => (
            <Card 
              key={suggestion.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 ${
                selectedSuggestion?.id === suggestion.id ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(suggestion)}
                    <Badge className={getCategoryColor(suggestion.category)}>
                      {suggestion.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Target className="w-3 h-3" />
                    <span>{(suggestion.relevanceScore * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 mb-3">
                  <h3 className="font-semibold text-sm leading-tight">{suggestion.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {suggestion.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {suggestion.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                      #{tag}
                    </Badge>
                  ))}
                  {suggestion.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      +{suggestion.tags.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Footer Stats */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {showRatings && suggestion.averageRating && (
                      <div className="flex items-center gap-1">
                        {renderRatingStars(suggestion.averageRating)}
                        <span className="text-gray-600 ml-1">
                          {suggestion.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-500">
                      <Activity className="w-3 h-3" />
                      <span>{suggestion.usageCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{suggestion.estimatedTokens}t</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Suggestion Details */}
      {selectedSuggestion && (
        <Card className="border-primary">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Selected Suggestion</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyPrompt(selectedSuggestion.prompt)}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Prompt
                </Button>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  {getTypeIcon(selectedSuggestion)}
                  {selectedSuggestion.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">{selectedSuggestion.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Generated Prompt:</label>
                <Textarea 
                  value={selectedSuggestion.prompt}
                  readOnly
                  className="min-h-[120px] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-600">Category:</label>
                  <div className="mt-1">
                    <Badge className={getCategoryColor(selectedSuggestion.category)}>
                      {selectedSuggestion.category}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Relevance:</label>
                  <div className="mt-1 font-medium">
                    {(selectedSuggestion.relevanceScore * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Est. Tokens:</label>
                  <div className="mt-1 font-medium">{selectedSuggestion.estimatedTokens}</div>
                </div>
                {showRatings && selectedSuggestion.averageRating && (
                  <div>
                    <label className="font-medium text-gray-600">Rating:</label>
                    <div className="mt-1 flex items-center gap-1">
                      {renderRatingStars(selectedSuggestion.averageRating)}
                      <span className="text-sm">{selectedSuggestion.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && inputValue && suggestions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Suggestions Found</h3>
          <p className="text-sm">
            Try different keywords or check your filter settings
          </p>
        </div>
      )}

      {/* Initial State */}
      {!inputValue && suggestions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Ready for AI Suggestions</h3>
          <p className="text-sm">
            Start typing to see real-time AI-powered prompt suggestions
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["marketing strategy", "technical docs", "creative writing", "business plan"].map(keyword => (
              <Button
                key={keyword}
                size="sm"
                variant="outline"
                onClick={() => setInputValue(keyword)}
                className="text-xs"
              >
                Try "{keyword}"
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}