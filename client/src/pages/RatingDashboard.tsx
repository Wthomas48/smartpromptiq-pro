import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Target,
  BarChart3,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Award,
  Lightbulb,
  ArrowLeft,
  Eye,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import TopNavigation from "@/components/TopNavigation";
import AnimatedCounter from "@/components/AnimatedCounter";

interface RatingAnalytics {
  overview: {
    totalRatings: number;
    averageRating: number;
    responseRate: number;
    lastWeekChange: number;
    satisfactionRate: number;
  };
  categories: Array<{
    category: string;
    averageRating: number;
    totalRatings: number;
    trend: number;
    topFeedback: string[];
  }>;
  timeSeriesData: {
    labels: string[];
    ratings: number[];
    responses: number[];
  };
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentFeedback: Array<{
    id: string;
    category: string;
    rating: number;
    feedback: string;
    timestamp: string;
    feature?: string;
    triggerType: string;
  }>;
  improvements: Array<{
    area: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    votes: number;
    status: 'planned' | 'in_progress' | 'completed';
  }>;
}

export default function RatingDashboard() {
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState("30d");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Fetch rating analytics
  const { data: analytics, isLoading } = useQuery<RatingAnalytics>({
    queryKey: ["/api/rating/analytics", { timeRange, category: categoryFilter }],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/rating/analytics?range=${timeRange}&category=${categoryFilter}`);
      return await response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.0) return "text-green-600";
    if (rating >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'planned': return <Target className="w-4 h-4 text-purple-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'usability': return <Users className="w-5 h-5" />;
      case 'performance': return <Zap className="w-5 h-5" />;
      case 'accuracy': return <Target className="w-5 h-5" />;
      case 'features': return <Award className="w-5 h-5" />;
      case 'innovation': return <Lightbulb className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <TopNavigation
          onGetStarted={() => setLocation('/signin')}
          onSignIn={() => setLocation('/signin')}
        />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Loading Rating Analytics</h3>
                <p className="text-gray-600">Analyzing user feedback and satisfaction data...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <TopNavigation
        onGetStarted={() => setLocation('/signin')}
        onSignIn={() => setLocation('/signin')}
      />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Badge className="bg-white/20 text-white border-white/30">
              Rating Analytics
            </Badge>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              User Satisfaction
              <span className="block text-yellow-300">Analytics Dashboard</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Comprehensive insights into user ratings, feedback, and satisfaction across all areas of SmartPromptIQ Pro.
            </p>

            {/* Quick Stats */}
            {analytics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    <AnimatedCounter end={analytics.overview.totalRatings} />
                  </div>
                  <div className="text-white/80 text-sm">Total Ratings</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {analytics.overview.averageRating.toFixed(1)}
                  </div>
                  <div className="text-white/80 text-sm">Average Rating</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {analytics.overview.responseRate.toFixed(1)}%
                  </div>
                  <div className="text-white/80 text-sm">Response Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {analytics.overview.satisfactionRate.toFixed(1)}%
                  </div>
                  <div className="text-white/80 text-sm">Satisfaction</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="usability">User Experience</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="accuracy">AI Accuracy</SelectItem>
                <SelectItem value="features">Features</SelectItem>
                <SelectItem value="innovation">Innovation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>

        {analytics && (
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="feedback">Recent Feedback</TabsTrigger>
              <TabsTrigger value="improvements">Improvements</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Rating Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Rating Trends
                    </CardTitle>
                    <CardDescription>
                      Average ratings over time for {timeRange}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.timeSeriesData.labels.map((label, index) => {
                        const rating = analytics.timeSeriesData.ratings[index];
                        const responses = analytics.timeSeriesData.responses[index];
                        const maxRating = Math.max(...analytics.timeSeriesData.ratings);
                        const percentage = (rating / 5) * 100;

                        return (
                          <div key={label} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{label}</span>
                              <div className="flex items-center space-x-2">
                                <span className={`font-bold ${getRatingColor(rating)}`}>
                                  {rating.toFixed(1)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {responses} responses
                                </Badge>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Performance Metrics
                    </CardTitle>
                    <CardDescription>
                      Key satisfaction indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2 flex items-center justify-center space-x-2">
                          <Star className="w-8 h-8 text-yellow-400 fill-current" />
                          <span className={getRatingColor(analytics.overview.averageRating)}>
                            {analytics.overview.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Overall Rating</p>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {analytics.overview.satisfactionRate.toFixed(0)}%
                          </div>
                          <p className="text-sm text-gray-600">Satisfied Users</p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {analytics.overview.responseRate.toFixed(0)}%
                          </div>
                          <p className="text-sm text-gray-600">Response Rate</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Weekly Change:</span>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(analytics.overview.lastWeekChange)}
                          <span className={`text-sm font-medium ${
                            analytics.overview.lastWeekChange > 0 ? 'text-green-600' :
                            analytics.overview.lastWeekChange < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {Math.abs(analytics.overview.lastWeekChange).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.categories.map((category) => (
                  <Card key={category.category} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getCategoryIcon(category.category)}
                          </div>
                          <div>
                            <CardTitle className="capitalize">{category.category}</CardTitle>
                            <CardDescription>{category.totalRatings} ratings</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getRatingColor(category.averageRating)}`}>
                            {category.averageRating.toFixed(1)}
                          </div>
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(category.trend)}
                            <span className="text-sm text-gray-600">
                              {Math.abs(category.trend).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Rating Distribution</span>
                            <span className="text-sm text-gray-600">
                              {category.averageRating.toFixed(1)}/5.0
                            </span>
                          </div>
                          <Progress value={(category.averageRating / 5) * 100} className="h-2" />
                        </div>

                        {category.topFeedback.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Top Feedback:</h4>
                            <div className="space-y-1">
                              {category.topFeedback.slice(0, 3).map((feedback, index) => (
                                <p key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                  "{feedback}"
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Sentiment Tab */}
            <TabsContent value="sentiment" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="w-5 h-5 mr-2" />
                      Sentiment Analysis
                    </CardTitle>
                    <CardDescription>
                      Overall user sentiment distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <ThumbsUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-700">Positive</span>
                          </div>
                          <span className="text-sm font-bold text-green-700">
                            {analytics.sentimentAnalysis.positive.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={analytics.sentimentAnalysis.positive} className="h-3" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gray-400 rounded-full" />
                            <span className="text-sm font-medium text-gray-700">Neutral</span>
                          </div>
                          <span className="text-sm font-bold text-gray-700">
                            {analytics.sentimentAnalysis.neutral.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={analytics.sentimentAnalysis.neutral} className="h-3" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <ThumbsDown className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium text-red-700">Negative</span>
                          </div>
                          <span className="text-sm font-bold text-red-700">
                            {analytics.sentimentAnalysis.negative.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={analytics.sentimentAnalysis.negative} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Sentiment Insights
                    </CardTitle>
                    <CardDescription>
                      Key insights from sentiment analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-800">Strong Positive Sentiment</h4>
                            <p className="text-sm text-green-700">
                              {analytics.sentimentAnalysis.positive.toFixed(1)}% of users express positive feedback, indicating strong satisfaction with the platform.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Target className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-800">Improvement Opportunities</h4>
                            <p className="text-sm text-blue-700">
                              {analytics.sentimentAnalysis.negative.toFixed(1)}% negative sentiment provides clear areas for focused improvements.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-800">Neutral Users</h4>
                            <p className="text-sm text-yellow-700">
                              {analytics.sentimentAnalysis.neutral.toFixed(1)}% neutral sentiment represents potential for converting to positive experiences.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Recent Feedback Tab */}
            <TabsContent value="feedback" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Recent User Feedback
                  </CardTitle>
                  <CardDescription>
                    Latest ratings and comments from users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.recentFeedback.map((feedback) => (
                      <div key={feedback.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= feedback.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {feedback.category}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {feedback.triggerType.replace('_', ' ')}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(feedback.timestamp).toLocaleDateString()}
                          </span>
                        </div>

                        {feedback.feedback && (
                          <p className="text-gray-700 mb-3 italic">"{feedback.feedback}"</p>
                        )}

                        {feedback.feature && (
                          <div className="text-sm text-gray-600">
                            Feature: <span className="font-medium">{feedback.feature}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Improvements Tab */}
            <TabsContent value="improvements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Improvement Roadmap
                  </CardTitle>
                  <CardDescription>
                    Priority improvements based on user feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.improvements.map((improvement, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium">{improvement.area}</h4>
                              <Badge className={getPriorityColor(improvement.priority)}>
                                {improvement.priority} priority
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {improvement.description}
                            </p>
                            <div className="flex items-center space-x-2">
                              <ThumbsUp className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {improvement.votes} user votes
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {getStatusIcon(improvement.status)}
                            <span className="text-sm capitalize font-medium">
                              {improvement.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}