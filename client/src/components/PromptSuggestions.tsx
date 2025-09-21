import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeMap, ensureArray } from "@/utils/arrayUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Lightbulb, 
  TrendingUp, 
  User, 
  Sparkles, 
  Clock, 
  Tag,
  Copy,
  Search,
  RefreshCw
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

interface PromptSuggestionsProps {
  onSelectSuggestion?: (suggestion: PromptSuggestion) => void;
  currentQuery?: string;
  category?: string;
  className?: string;
}

export default function PromptSuggestions({ 
  onSelectSuggestion, 
  currentQuery = "",
  category,
  className = "" 
}: PromptSuggestionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("suggestions");
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate suggestions based on user query
  const generateSuggestionsMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/suggestions/generate", {
        query,
        context: {
          previousQueries: [],
          userPreferences: category ? [category] : [],
          sessionData: { currentCategory: category }
        }
      });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['suggestions', 'generated', searchQuery], data.suggestions);
      setIsGenerating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate suggestions",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  // Trending suggestions
  const { data: trendingSuggestions, isLoading: isTrendingLoading } = useQuery({
    queryKey: ["/api/suggestions/trending"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/suggestions/trending?timeframe=week");
      return await response.json();
    },
  });

  // Personalized suggestions
  const { data: personalizedSuggestions, isLoading: isPersonalizedLoading } = useQuery({
    queryKey: ["/api/suggestions/personalized", category],
    queryFn: async () => {
      const url = category 
        ? `/api/suggestions/personalized?category=${encodeURIComponent(category)}`
        : "/api/suggestions/personalized";
      const response = await apiRequest("GET", url);
      return await response.json();
    },
  });

  // Generated suggestions from search
  const { data: generatedSuggestions } = useQuery<PromptSuggestion[]>({
    queryKey: ['suggestions', 'generated', searchQuery],
    enabled: false // Only fetch when explicitly triggered
  });

  // Record interaction when user selects a suggestion
  const recordInteractionMutation = useMutation({
    mutationFn: async (data: { suggestion: PromptSuggestion; query: string }) => {
      await apiRequest("POST", "/api/suggestions/interaction", {
        query: data.query,
        category: data.suggestion.category,
        selectedSuggestion: data.suggestion.id,
        context: {
          previousQueries: [data.query],
          userPreferences: [data.suggestion.category],
          sessionData: { selectedFrom: activeTab }
        }
      });
    },
  });

  const handleGenerateSuggestions = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter a Query",
        description: "Please enter a search query to generate suggestions",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateSuggestionsMutation.mutate(searchQuery);
  };

  const handleSelectSuggestion = (suggestion: PromptSuggestion) => {
    // Record the interaction for learning
    recordInteractionMutation.mutate({
      suggestion,
      query: searchQuery || "trending_selection"
    });

    // Copy to clipboard
    navigator.clipboard.writeText(suggestion.prompt);
    
    toast({
      title: "Prompt Copied",
      description: "The prompt has been copied to your clipboard",
    });

    // Notify parent component
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      marketing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      product: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      financial: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      education: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      personal: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      general: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const renderSuggestionCard = (suggestion: PromptSuggestion, source: string) => (
    <Card key={suggestion.id} className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
              {suggestion.title}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {suggestion.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Badge className={`text-xs ${getCategoryColor(suggestion.category)}`}>
              {suggestion.category}
            </Badge>
            {suggestion.relevanceScore > 0.8 && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                High Match
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {suggestion.prompt}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {suggestion.estimatedTokens} tokens
            </div>
            {suggestion.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {suggestion.tags.slice(0, 2).join(", ")}
                {suggestion.tags.length > 2 && ` +${suggestion.tags.length - 2}`}
              </div>
            )}
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSelectSuggestion(suggestion)}
            className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy className="w-3 h-3 mr-1" />
            Use
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5" />
            AI Prompt Suggestions
          </CardTitle>
          <CardDescription>
            Get intelligent prompt recommendations based on your needs and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="suggestions" className="text-xs">
                <Search className="w-4 h-4 mr-1" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="trending" className="text-xs">
                <TrendingUp className="w-4 h-4 mr-1" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="personalized" className="text-xs">
                <User className="w-4 h-4 mr-1" />
                Personal
              </TabsTrigger>
            </TabsList>

            {/* Generate Suggestions Tab */}
            <TabsContent value="suggestions" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Describe what you want to create..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerateSuggestions()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleGenerateSuggestions}
                  disabled={isGenerating || !searchQuery.trim()}
                  size="sm"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Generate
                </Button>
              </div>

              {isGenerating && (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Generating intelligent suggestions...
                  </p>
                </div>
              )}

              {Array.isArray(generatedSuggestions) && generatedSuggestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Generated Suggestions</span>
                    <Badge variant="outline" className="text-xs">
                      {generatedSuggestions.length} results
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    {safeMap(ensureArray(generatedSuggestions), (suggestion: PromptSuggestion) =>
                      renderSuggestionCard(suggestion, "generated")
                    )}
                  </div>
                </div>
              )}

              {!isGenerating && !generatedSuggestions && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Enter a query to generate personalized suggestions</p>
                </div>
              )}
            </TabsContent>

            {/* Trending Suggestions Tab */}
            <TabsContent value="trending" className="space-y-4">
              {isTrendingLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Loading trending suggestions...
                  </p>
                </div>
              ) : trendingSuggestions?.suggestions?.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">This Week's Trending Prompts</span>
                    <Badge variant="outline" className="text-xs">
                      {trendingSuggestions.suggestions.length} prompts
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    {safeMap(ensureArray(trendingSuggestions.suggestions), (suggestion: PromptSuggestion) =>
                      renderSuggestionCard(suggestion, "trending")
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No trending suggestions available</p>
                </div>
              )}
            </TabsContent>

            {/* Personalized Suggestions Tab */}
            <TabsContent value="personalized" className="space-y-4">
              {isPersonalizedLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Loading personalized suggestions...
                  </p>
                </div>
              ) : personalizedSuggestions?.suggestions?.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Personalized for You</span>
                    <Badge variant="outline" className="text-xs">
                      Based on your usage patterns
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    {safeMap(ensureArray(personalizedSuggestions.suggestions), (suggestion: PromptSuggestion) =>
                      renderSuggestionCard(suggestion, "personalized")
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Use the platform more to get personalized suggestions
                  </p>
                  <p className="text-xs mt-1">
                    Try generating a few prompts to build your profile
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}