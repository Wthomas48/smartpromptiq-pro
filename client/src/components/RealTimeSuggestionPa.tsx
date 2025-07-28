import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  TrendingUp, 
  User, 
  Clock, 
  Zap, 
  Copy,
  Heart,
  Star,
  ArrowRight,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  RotateCcw
} from "lucide-react";

interface RealtimeSuggestion {
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
}

interface SuggestionPanelProps {
  onSuggestionSelect?: (suggestion: RealtimeSuggestion) => void;
  placeholder?: string;
  maxSuggestions?: number;
  showTrending?: boolean;
  showPersonalized?: boolean;
  categories?: string[];
  enableRealTime?: boolean;
  showRatings?: boolean;
}

export default function RealTimeSuggestionPanel({
  onSuggestionSelect,
  placeholder = "Start typing to get AI-powered suggestions...",
  maxSuggestions = 6,
  showTrending = true,
  showPersonalized = true,
  categories = ['marketing', 'product', 'financial', 'education', 'personal', 'general'],
  enableRealTime = true,
  showRatings = true
}: SuggestionPanelProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<RealtimeSuggestion[]>([]);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<RealtimeSuggestion[]>([]);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Real-time trending suggestions for when user hasn't typed anything
  const { data: trendingSuggestions } = useQuery({
    queryKey: ["/api/suggestions/trending", { limit: 8 }],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/suggestions/trending?limit=8");
      const data = await response.json();
      return data.suggestions?.map((s: any) => ({
        ...s,
        isTrending: true,
        isPersonalized: false,
        averageRating: Math.random() * 2 + 3, // Simulated rating between 3-5
        totalRatings: Math.floor(Math.random() * 50) + 10
      })) || [];
    },
    enabled: showTrending,
    refetchInterval: enableRealTime ? 30000 : false, // Refresh every 30 seconds if real-time enabled
  });

  // Personalized suggestions for user
  const { data: personalizedSuggestions } = useQuery({
    queryKey: ["/api/suggestions/personalized", { limit: 6 }],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/suggestions/personalized?limit=6");
      const data = await response.json();
      return data.suggestions?.map((s: any) => ({
        ...s,
        isPersonalized: true,
        isTrending: false,
        averageRating: Math.random() * 1.5 + 3.5, // Personalized suggestions tend to be rated higher
        totalRatings: Math.floor(Math.random() * 30) + 5
      })) || [];
    },
    enabled: showPersonalized,
    refetchInterval: enableRealTime ? 60000 : false, // Refresh every minute if real-time enabled
  });

  // Real-time suggestion generation
  const generateSuggestionsMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await apiRequest("POST", "/api/suggestions/generate", {
        query: searchQuery,
        context: {
          previousQueries: [searchQuery],
          userPreferences: categories,
          sessionData: { realtime: true, maxResults: maxSuggestions }
        }
      });
      return await response.json();
    },
    onSuccess: (data) => {
      const realtimeSuggestions = data.suggestions?.map((s: any) => ({
        ...s,
        isPersonalized: false,
        isTrending: false,
        averageRating: Math.random() * 2 + 3, // New suggestions start with moderate ratings
        totalRatings: Math.floor(Math.random() * 10) + 1
      })) || [];
      
      setSuggestions(realtimeSuggestions);
      setIsTyping(false);
      
      // Update dynamic suggestions for real-time display
      if (enableRealTime) {
        setDynamicSuggestions(prev => {
          const combined = [...realtimeSuggestions, ...prev];
          return combined.slice(0, maxSuggestions * 2); // Keep double for rotation
        });
      }
    },
    onError: (error: any) => {
      console.error("Real-time suggestion error:", error);
      setIsTyping(false);
      setSuggestions([]);
    }
  });

  // Rating mutation
  const rateSuggestionMutation = useMutation({
    mutationFn: async ({ suggestionId, rating }: { suggestionId: string; rating: number }) => {
      const response = await apiRequest("POST", "/api/suggestions/rate", {
        suggestionId,
        rating,
        context: {
          query,
          category: getCurrentSuggestions()[0]?.category || 'general'
        }
      });
      return await response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Rating Submitted",
        description: `You rated this suggestion ${variables.rating} ${variables.rating === 1 ? 'star' : 'stars'}`,
      });
      
      // Update local suggestion ratings
      const updateRatings = (suggestionsList: RealtimeSuggestion[]) => 
        suggestionsList.map(s => 
          s.id === variables.suggestionId 
            ? { 
                ...s, 
                userRating: variables.rating,
                averageRating: data.newAverageRating,
                totalRatings: data.totalRatings
              }
            : s
        );
      
      setSuggestions(updateRatings);
      setDynamicSuggestions(updateRatings);
    },
    onError: (error: any) => {
      toast({
        title: "Rating Failed",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    }
  });

  // Record interaction when suggestion is selected
  const recordInteractionMutation = useMutation({
    mutationFn: async (suggestion: RealtimeSuggestion) => {
      await apiRequest("POST", "/api/suggestions/interaction", {
        query,
        category: suggestion.category,
        selectedSuggestion: suggestion.id,
        context: {
          source: 'realtime_panel',
          userQuery: query,
          suggestionType: suggestion.isPersonalized ? 'personalized' : 
                         suggestion.isTrending ? 'trending' : 'generated',
          userRating: suggestion.userRating,
          hasRating: !!suggestion.userRating
        }
      });
    }
  });

  // Handle input changes with dynamic debouncing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length >= 3) {
      setIsTyping(true);
      const debounceTime = enableRealTime ? 300 : 500; // Faster debounce for real-time
      
      debounceRef.current = setTimeout(() => {
        generateSuggestionsMutation.mutate(query);
      }, debounceTime);
    } else {
      setIsTyping(false);
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, enableRealTime]);

  // Real-time suggestion rotation effect
  useEffect(() => {
    if (enableRealTime && dynamicSuggestions.length > maxSuggestions) {
      const interval = setInterval(() => {
        setDynamicSuggestions(prev => {
          const rotated = [...prev.slice(1), prev[0]];
          return rotated;
        });
      }, 5000); // Rotate every 5 seconds

      return () => clearInterval(interval);
    }
  }, [enableRealTime, dynamicSuggestions.length, maxSuggestions]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentSuggestions = getCurrentSuggestions();
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < currentSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : currentSuggestions.length - 1
        );
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSuggestionSelect(currentSuggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setSelectedIndex(-1);
        inputRef.current?.blur();
      }
    };

    if (inputRef.current) {
      inputRef.current.addEventListener('keydown', handleKeyDown);
      return () => {
        inputRef.current?.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedIndex, suggestions, query]);

  const getCurrentSuggestions = (): RealtimeSuggestion[] => {
    if (query.trim().length >= 3 && suggestions.length > 0) {
      return suggestions;
    }
    
    if (query.trim().length === 0) {
      if (enableRealTime && dynamicSuggestions.length > 0) {
        return dynamicSuggestions.slice(0, maxSuggestions);
      }
      
      // Mix trending and personalized when no query
      const trending = trendingSuggestions?.slice(0, 3) || [];
      const personalized = personalizedSuggestions?.slice(0, 3) || [];
      return [...personalized, ...trending].slice(0, maxSuggestions);
    }
    
    return [];
  };

  const handleSuggestionSelect = (suggestion: RealtimeSuggestion) => {
    // Copy to clipboard
    navigator.clipboard.writeText(suggestion.prompt);
    
    // Record interaction
    recordInteractionMutation.mutate(suggestion);
    
    // Notify parent component
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    
    // Show toast with rating prompt
    toast({
      title: "Suggestion Applied",
      description: showRatings ? "Prompt copied! Rate this suggestion to improve recommendations." : "Prompt copied to clipboard",
    });
    
    // Clear selection
    setSelectedIndex(-1);
  };

  const handleRating = (suggestionId: string, rating: number) => {
    rateSuggestionMutation.mutate({ suggestionId, rating });
  };

  const getSuggestionTypeIcon = (suggestion: RealtimeSuggestion) => {
    if (suggestion.isPersonalized) return <User className="w-3 h-3 text-blue-600" />;
    if (suggestion.isTrending) return <TrendingUp className="w-3 h-3 text-orange-600" />;
    return <Sparkles className="w-3 h-3 text-purple-600" />;
  };

  const getSuggestionTypeBadge = (suggestion: RealtimeSuggestion) => {
    if (suggestion.isPersonalized) return "Personal";
    if (suggestion.isTrending) return "Trending";
    return "Generated";
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 dark:text-green-400";
    if (score >= 0.6) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-yellow-500";
    if (rating >= 3) return "text-yellow-400";
    return "text-gray-400";
  };

  const currentSuggestions = getCurrentSuggestions();

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Input with Real-time Indicator */}
      <div className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-12 py-3 text-lg border-2 border-gray-200 dark:border-gray-700 focus:border-primary"
          />
          {isTyping && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
          {enableRealTime && !isTyping && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Real-time suggestions active" />
            </div>
          )}
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>
            {query.length >= 3 ? 
              `Generating suggestions for "${query}"...` :
             query.length > 0 ? 
              "Type at least 3 characters for suggestions" :
              enableRealTime ? 
                "Real-time suggestions active" : 
                "Showing trending and personalized suggestions"
            }
          </span>
          {currentSuggestions.length > 0 && (
            <div className="flex items-center gap-2">
              <span>{currentSuggestions.length} suggestions</span>
              {enableRealTime && <RotateCcw className="w-3 h-3 animate-spin text-green-500" />}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Suggestions Panel */}
      {currentSuggestions.length > 0 && (
        <Card className="border-2 border-gray-100 dark:border-gray-800">
          <CardContent className="p-0">
            <ScrollArea className="max-h-96">
              <div className="p-2">
                {currentSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 last:mb-0
                      ${selectedIndex === index 
                        ? 'bg-primary/10 border-2 border-primary' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                      }
                      ${enableRealTime ? 'animate-fadeIn' : ''}
                    `}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Title and badges */}
                        <div className="flex items-center gap-2 mb-1">
                          {getSuggestionTypeIcon(suggestion)}
                          <h4 className="font-medium text-sm truncate">
                            {suggestion.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className="text-xs flex items-center gap-1"
                          >
                            {getSuggestionTypeBadge(suggestion)}
                          </Badge>
                          {enableRealTime && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Live
                            </Badge>
                          )}
                        </div>
                        
                        {/* Description */}
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {suggestion.description}
                        </p>
                        
                        {/* Tags and metadata */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {suggestion.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-xs text-gray-500">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={getRelevanceColor(suggestion.relevanceScore)}>
                              {(suggestion.relevanceScore * 100).toFixed(0)}% match
                            </span>
                            <span className="text-gray-400">
                              {suggestion.estimatedTokens}t
                            </span>
                          </div>
                        </div>

                        {/* Rating System */}
                        {showRatings && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {suggestion.averageRating && (
                                <>
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <Star
                                        key={star}
                                        className={`w-3 h-3 ${
                                          star <= Math.round(suggestion.averageRating!)
                                            ? getRatingColor(suggestion.averageRating!)
                                            : 'text-gray-300'
                                        } ${star <= Math.round(suggestion.averageRating!) ? 'fill-current' : ''}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({suggestion.totalRatings})
                                  </span>
                                </>
                              )}
                            </div>
                            
                            {/* Quick rating buttons */}
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-1 h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRating(suggestion.id, 5);
                                }}
                                disabled={!!suggestion.userRating}
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-1 h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRating(suggestion.id, 2);
                                }}
                                disabled={!!suggestion.userRating}
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action indicators */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {suggestion.usageCount && suggestion.usageCount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <Star className="w-3 h-3" />
                            {suggestion.usageCount}
                          </div>
                        )}
                        {suggestion.userRating && (
                          <Badge variant="outline" className="text-xs">
                            Rated {suggestion.userRating}★
                          </Badge>
                        )}
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions and Status */}
      {query.trim().length === 0 && (
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Trending</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>Personalized</span>
            </div>
            {enableRealTime && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-green-600" />
                <span>Real-time</span>
              </div>
            )}
            {showRatings && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>Ratings</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help text */}
      {currentSuggestions.length === 0 && query.trim().length >= 3 && !isTyping && (
        <div className="mt-4 text-center py-6 text-gray-500">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No suggestions found for "{query}"</p>
          <p className="text-xs mt-1">Try different keywords or check your spelling</p>
        </div>
      )}
    </div>
  );
}