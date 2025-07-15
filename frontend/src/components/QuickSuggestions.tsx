import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  Copy, 
  Sparkles, 
  RefreshCw,
  ChevronRight
} from "lucide-react";

interface PromptSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  tags: string[];
  relevanceScore: number;
  estimatedTokens: number;
}

interface QuickSuggestionsProps {
  category?: string;
  maxSuggestions?: number;
  onSelectSuggestion?: (suggestion: PromptSuggestion) => void;
  showHeader?: boolean;
  compact?: boolean;
}

export default function QuickSuggestions({ 
  category,
  maxSuggestions = 4,
  onSelectSuggestion,
  showHeader = true,
  compact = false
}: QuickSuggestionsProps) {
  const { toast } = useToast();
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  // Get suggestions based on category or personalized
  const { data: suggestions = [], isLoading, refetch } = useQuery({
    queryKey: category 
      ? ["/api/suggestions/personalized", category]
      : ["/api/suggestions/trending"],
    queryFn: async () => {
      const endpoint = category 
        ? `/api/suggestions/personalized?category=${encodeURIComponent(category)}`
        : "/api/suggestions/trending?timeframe=week";
      const response = await apiRequest("GET", endpoint);
      const data = await response.json();
      return Array.isArray(data.suggestions) ? data.suggestions.slice(0, maxSuggestions) : [];
    },
  });

  // Record interaction when user selects a suggestion
  const recordInteractionMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      await apiRequest("POST", "/api/suggestions/interaction", {
        suggestionId,
        action: "select"
      });
    },
  });

  const handleSelectSuggestion = (suggestion: PromptSuggestion) => {
    setSelectedSuggestion(suggestion.id);
    recordInteractionMutation.mutate(suggestion.id);
    onSelectSuggestion?.(suggestion);
  };

  const handleCopy = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      marketing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      creative: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      technical: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      business: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      education: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      general: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[category] || colors.general;
  };

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {category ? `${category} Suggestions` : "Trending Suggestions"}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={compact ? "p-0 pt-3" : "pt-0"}>
          <div className="space-y-2">
            {[...Array(maxSuggestions)].map((_, index) => (
              <div key={index} className="p-3 rounded-lg border animate-pulse">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {category ? `${category} Suggestions` : "Trending Suggestions"}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-0 pt-3" : "pt-0"}>
        <div className="space-y-2">
          {suggestions && Array.isArray(suggestions) && suggestions.length > 0 ? (
            suggestions.map((suggestion: PromptSuggestion) => (
              <div
                key={suggestion.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all duration-200 group
                  ${selectedSuggestion === suggestion.id 
                    ? 'border-primary bg-primary/5 scale-[1.02]' 
                    : `hover:shadow-sm ${getCategoryColor(suggestion.category)}`
                  }
                `}
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4 h-4 text-primary flex-shrink-0" />
                      <h4 className="font-medium text-sm truncate">{suggestion.title}</h4>
                      <Badge className={getCategoryColor(suggestion.category)}>
                        {suggestion.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Relevance: {(suggestion.relevanceScore * 100).toFixed(0)}%</span>
                      <span>Tokens: {suggestion.estimatedTokens}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(suggestion.prompt);
                      }}
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    
                    {selectedSuggestion === suggestion.id && (
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">Selected</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No suggestions available
            </div>
          )}
        </div>
        
        {suggestions && suggestions.length >= maxSuggestions && (
          <div className="mt-3 pt-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View More Suggestions
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}