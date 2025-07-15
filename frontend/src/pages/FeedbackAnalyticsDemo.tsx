import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import RealTimeSuggestionPanel from "@/components/RealTimeSuggestionPanel";
import { 
  Star, 
  TrendingUp, 
  BarChart3,
  Users,
  Target,
  Award,
  Activity,
  ThumbsUp,
  MessageCircle,
  Zap,
  Trophy,
  Clock
} from "lucide-react";

interface FeedbackAnalytics {
  overview: {
    totalRatingsSubmitted: number;
    averageRatingGiven: number;
    ratingsThisWeek: number;
    improvementScore: number;
  };
  categoryBreakdown: Record<string, { avgRating: number; count: number }>;
  trendingHighRated: string[];
  personalizedRecommendations: {
    basedOnRatings: boolean;
    preferredComplexity: string;
    favoriteCategories: string[];
    suggestionAccuracy: string;
  };
  impactMetrics: {
    ratingsInfluenceFuture: boolean;
    contributesToCommunity: boolean;
    improvesTrending: boolean;
    enhancesPersonalization: boolean;
  };
}

interface LeaderboardData {
  topRatedSuggestions: Array<{
    id: string;
    title: string;
    category: string;
    averageRating: number;
    totalRatings: number;
    description: string;
  }>;
  criteria: {
    minimumRatings: number;
    sortBy: string;
    timeframe: string;
  };
}

export default function FeedbackAnalyticsDemo() {
  const [timeframe, setTimeframe] = useState("7d");
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);

  // Feedback analytics data
  const { data: feedbackAnalytics, isLoading: analyticsLoading } = useQuery<FeedbackAnalytics>({
    queryKey: ["/api/feedback/analytics", { timeframe }],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/feedback/analytics?timeframe=${timeframe}`);
      return await response.json();
    }
  });

  // Community leaderboard data
  const { data: leaderboard } = useQuery<LeaderboardData>({
    queryKey: ["/api/feedback/leaderboard", { limit: 10 }],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/feedback/leaderboard?limit=10");
      return await response.json();
    }
  });

  const handleSuggestionSelect = (suggestion: any) => {
    setSelectedSuggestion(suggestion);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600 dark:text-green-400";
    if (rating >= 4.0) return "text-blue-600 dark:text-blue-400";
    if (rating >= 3.5) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      marketing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      creative: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      technical: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      business: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      education: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  if (analyticsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Activity className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Loading Feedback Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Analyzing user ratings and feedback patterns...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <BackButton />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <MessageCircle className="w-8 h-8 text-primary" />
          User Feedback Analytics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Real-time user feedback system with dynamic suggestions and rating analytics
        </p>
      </div>

      {/* Timeframe Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Analytics Timeframe
          </CardTitle>
          <CardDescription>
            Select the time period for feedback analytics and user rating data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Time Period:</label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="w-4 h-4" />
              <span>Real-time feedback tracking active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Ratings</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {feedbackAnalytics?.overview.totalRatingsSubmitted || 0}
                </p>
              </div>
              <Star className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +{feedbackAnalytics?.overview.ratingsThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {feedbackAnalytics?.overview.averageRatingGiven.toFixed(1) || "0.0"}★
                </p>
              </div>
              <ThumbsUp className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-2">
              <Progress 
                value={((feedbackAnalytics?.overview.averageRatingGiven || 0) / 5) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Improvement</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {feedbackAnalytics?.overview.improvementScore.toFixed(0) || 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Suggestion accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">This Week</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {feedbackAnalytics?.overview.ratingsThisWeek || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              New ratings submitted
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime">Real-time Demo</TabsTrigger>
          <TabsTrigger value="analytics">Rating Analytics</TabsTrigger>
          <TabsTrigger value="leaderboard">Community Board</TabsTrigger>
          <TabsTrigger value="impact">Impact Metrics</TabsTrigger>
        </TabsList>

        {/* Real-time Demo Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real-time suggestions panel */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Interactive Suggestion Panel
                  </CardTitle>
                  <CardDescription>
                    Real-time suggestions with user rating system and dynamic feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RealTimeSuggestionPanel
                    onSuggestionSelect={handleSuggestionSelect}
                    enableRealTime={true}
                    showRatings={true}
                    maxSuggestions={6}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Selected suggestion details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Selected Suggestion
                  </CardTitle>
                  <CardDescription>
                    Details and rating interface for selected suggestion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedSuggestion ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">{selectedSuggestion.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {selectedSuggestion.description}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Category:</span>
                          <Badge className={getCategoryColor(selectedSuggestion.category)}>
                            {selectedSuggestion.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Type:</span>
                          <Badge className={
                            selectedSuggestion.isPersonalized ? "bg-blue-100 text-blue-800" :
                            selectedSuggestion.isTrending ? "bg-orange-100 text-orange-800" :
                            "bg-green-100 text-green-800"
                          }>
                            {selectedSuggestion.isPersonalized ? "Personal" :
                             selectedSuggestion.isTrending ? "Trending" : "Generated"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Relevance:</span>
                          <span className="font-medium">
                            {(selectedSuggestion.relevanceScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <Separator />

                      {/* Rating Display */}
                      {selectedSuggestion.averageRating && (
                        <div>
                          <h5 className="text-xs font-medium mb-2">Community Rating</h5>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= Math.round(selectedSuggestion.averageRating)
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">
                              {selectedSuggestion.averageRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({selectedSuggestion.totalRatings} ratings)
                            </span>
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="text-xs font-medium mb-2">Generated Prompt</h5>
                        <div className="text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded border max-h-24 overflow-y-auto">
                          {selectedSuggestion.prompt}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select a suggestion to see details and rating interface</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Category Rating Breakdown
                </CardTitle>
                <CardDescription>
                  Average ratings and activity by suggestion category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedbackAnalytics?.categoryBreakdown ? (
                  <div className="space-y-3">
                    {Object.entries(feedbackAnalytics.categoryBreakdown).map(([category, data]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(category)}>
                            {category}
                          </Badge>
                          <span className="text-sm text-gray-600">{data.count} ratings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= Math.round(data.avgRating)
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{data.avgRating.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No category data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trending High-Rated */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Trending High-Rated Suggestions
                </CardTitle>
                <CardDescription>
                  Most popular suggestions based on user ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedbackAnalytics?.trendingHighRated ? (
                  <div className="space-y-3">
                    {feedbackAnalytics.trendingHighRated.map((suggestion, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{suggestion}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Hot
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No trending data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Personalized Recommendations Insight */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personalization Insights
              </CardTitle>
              <CardDescription>
                How your ratings improve future recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackAnalytics?.personalizedRecommendations ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {feedbackAnalytics.personalizedRecommendations.suggestionAccuracy}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Accuracy</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400 capitalize">
                      {feedbackAnalytics.personalizedRecommendations.preferredComplexity}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">Complexity</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {feedbackAnalytics.personalizedRecommendations.favoriteCategories.length}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Top Categories</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {feedbackAnalytics.personalizedRecommendations.basedOnRatings ? "Active" : "Inactive"}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">Rating-Based</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Personalization data loading...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Community Leaderboard
              </CardTitle>
              <CardDescription>
                Top-rated suggestions from the community based on user feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard?.topRatedSuggestions ? (
                <div className="space-y-3">
                  {leaderboard.topRatedSuggestions.map((suggestion, index) => (
                    <div key={suggestion.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? "bg-yellow-100 text-yellow-800" :
                        index === 1 ? "bg-gray-100 text-gray-800" :
                        index === 2 ? "bg-orange-100 text-orange-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{suggestion.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {suggestion.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{suggestion.averageRating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(suggestion.category)}>
                            {suggestion.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {suggestion.totalRatings} ratings
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Leaderboard loading...</p>
                </div>
              )}
              
              {leaderboard?.criteria && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h5 className="text-sm font-medium mb-2">Leaderboard Criteria</h5>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600">Min Ratings:</span>
                      <span className="font-medium ml-1">{leaderboard.criteria.minimumRatings}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Sort By:</span>
                      <span className="font-medium ml-1 capitalize">{leaderboard.criteria.sortBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Timeframe:</span>
                      <span className="font-medium ml-1">{leaderboard.criteria.timeframe}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impact Metrics Tab */}
        <TabsContent value="impact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Feedback Impact Metrics
              </CardTitle>
              <CardDescription>
                How user ratings improve the overall system and community experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackAnalytics?.impactMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(feedbackAnalytics.impactMetrics).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 p-4 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <h4 className="font-medium text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {value ? 'Active and improving system performance' : 'Currently inactive'}
                        </p>
                      </div>
                      <Badge variant={value ? "default" : "secondary"} className="ml-auto">
                        {value ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Impact metrics loading...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}