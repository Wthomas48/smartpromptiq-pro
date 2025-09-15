import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Download,
  Eye,
  ArrowLeft,
  Calendar,
  Target,
  Zap,
  Brain,
  Award,
  Activity,
  Globe
} from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import TopNavigation from "@/components/TopNavigation";

export default function FeedbackAnalyticsDemo() {
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [animatedData, setAnimatedData] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalFeedback: 15847,
      avgRating: 4.7,
      responseRate: 89.3,
      npsScore: 67,
      satisfactionRate: 94.2,
      trendsUp: 12.5
    },
    timeSeriesData: {
      "7d": {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        feedback: [145, 167, 189, 203, 178, 134, 156],
        ratings: [4.6, 4.8, 4.7, 4.9, 4.5, 4.6, 4.8]
      },
      "30d": {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        feedback: [1234, 1456, 1678, 1589],
        ratings: [4.5, 4.7, 4.8, 4.6]
      },
      "90d": {
        labels: ["Month 1", "Month 2", "Month 3"],
        feedback: [4567, 5234, 5896],
        ratings: [4.4, 4.6, 4.7]
      }
    },
    categoryBreakdown: [
      { name: "Business Templates", feedback: 4567, rating: 4.8, trend: 15.2 },
      { name: "Marketing Campaigns", feedback: 3891, rating: 4.6, trend: 8.7 },
      { name: "Financial Planning", feedback: 2934, rating: 4.9, trend: 22.1 },
      { name: "Education & Training", feedback: 2456, rating: 4.5, trend: -3.2 },
      { name: "Health & Wellness", feedback: 1999, rating: 4.7, trend: 18.9 }
    ],
    sentimentAnalysis: {
      positive: 78.5,
      neutral: 16.2,
      negative: 5.3
    },
    recentFeedback: [
      {
        id: 1,
        user: "Sarah Johnson",
        template: "Startup Pitch Generator",
        rating: 5,
        comment: "Absolutely amazing! This saved me 10+ hours of work. The pitch deck generated was so professional that my investors were impressed.",
        timestamp: "2 hours ago",
        verified: true,
        helpful: 23
      },
      {
        id: 2,
        user: "Michael Chen",
        template: "Social Media Campaign",
        rating: 4,
        comment: "Great tool for creating content strategies. The AI suggestions were spot-on for our target audience. Minor formatting issues but overall excellent.",
        timestamp: "5 hours ago",
        verified: true,
        helpful: 18
      },
      {
        id: 3,
        user: "Emily Rodriguez",
        template: "Financial Planning Guide",
        rating: 5,
        comment: "This transformed how I approach financial consulting with my clients. The comprehensive plans are incredibly detailed and professional.",
        timestamp: "1 day ago",
        verified: true,
        helpful: 31
      },
      {
        id: 4,
        user: "David Kim",
        template: "Course Creator",
        rating: 5,
        comment: "Built my entire online course curriculum in under 2 hours. Students love the structured approach and clear learning objectives.",
        timestamp: "1 day ago",
        verified: true,
        helpful: 27
      },
      {
        id: 5,
        user: "Lisa Thompson",
        template: "Wellness Coaching",
        rating: 4,
        comment: "Perfect for creating client programs. The 8-week structure is exactly what I needed. Would love more customization options.",
        timestamp: "2 days ago",
        verified: true,
        helpful: 15
      }
    ],
    topKeywords: [
      { word: "professional", count: 1247, sentiment: "positive" },
      { word: "time-saving", count: 1089, sentiment: "positive" },
      { word: "comprehensive", count: 967, sentiment: "positive" },
      { word: "easy to use", count: 823, sentiment: "positive" },
      { word: "detailed", count: 756, sentiment: "positive" },
      { word: "formatting", count: 234, sentiment: "neutral" },
      { word: "customization", count: 189, sentiment: "neutral" },
      { word: "slow loading", count: 67, sentiment: "negative" }
    ],
    improvementSuggestions: [
      {
        category: "User Experience",
        suggestion: "Add more customization options for template formatting",
        votes: 124,
        status: "In Progress"
      },
      {
        category: "Features",
        suggestion: "Include real-time collaboration for team projects",
        votes: 98,
        status: "Planned"
      },
      {
        category: "Content",
        suggestion: "More industry-specific templates for healthcare",
        votes: 87,
        status: "Under Review"
      },
      {
        category: "Performance",
        suggestion: "Faster AI generation for complex templates",
        votes: 76,
        status: "In Progress"
      }
    ]
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-yellow-600";
    return "text-red-600";
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "bg-green-100 text-green-800";
      case "neutral": return "bg-gray-100 text-gray-800";
      case "negative": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Planned": return "bg-purple-100 text-purple-800";
      case "Under Review": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
              Live Demo Data
            </Badge>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Feedback Analytics
              <span className="block text-yellow-300">Intelligence Dashboard</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Comprehensive analytics and insights from user feedback across all SmartPromptIQ templates and features.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {animatedData ? <AnimatedCounter end={analyticsData.overview.totalFeedback} /> : '0'}
                </div>
                <div className="text-white/80 text-sm">Total Feedback</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {animatedData ? analyticsData.overview.avgRating.toFixed(1) : '0.0'}
                </div>
                <div className="text-white/80 text-sm">Avg Rating</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {animatedData ? `${analyticsData.overview.responseRate}%` : '0%'}
                </div>
                <div className="text-white/80 text-sm">Response Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {animatedData ? analyticsData.overview.npsScore : '0'}
                </div>
                <div className="text-white/80 text-sm">NPS Score</div>
              </div>
            </div>
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
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="business">Business Templates</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="finance">Financial Planning</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="wellness">Health & Wellness</SelectItem>
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

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="feedback">Recent Feedback</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.overview.satisfactionRate}%
                  </div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{analyticsData.overview.trendsUp}% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.overview.avgRating.toFixed(1)}/5.0
                  </div>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= Math.round(analyticsData.overview.avgRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.overview.responseRate}%
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Industry avg: 72%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
                  <Target className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.overview.npsScore}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Excellent (50+)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Feedback Volume & Rating Trends
                </CardTitle>
                <CardDescription>
                  Daily feedback volume and average ratings for {timeRange}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Mock Chart - Feedback Volume */}
                  <div>
                    <h4 className="text-sm font-medium mb-4">Feedback Volume</h4>
                    <div className="space-y-3">
                      {analyticsData.timeSeriesData[timeRange as keyof typeof analyticsData.timeSeriesData].labels.map((label, index) => {
                        const value = analyticsData.timeSeriesData[timeRange as keyof typeof analyticsData.timeSeriesData].feedback[index];
                        const maxValue = Math.max(...analyticsData.timeSeriesData[timeRange as keyof typeof analyticsData.timeSeriesData].feedback);
                        const percentage = (value / maxValue) * 100;
                        
                        return (
                          <div key={label} className="flex items-center space-x-3">
                            <div className="w-16 text-sm text-gray-600">{label}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: animatedData ? `${percentage}%` : '0%' }}
                              />
                            </div>
                            <div className="w-12 text-sm font-medium text-gray-900">{value}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mock Chart - Ratings */}
                  <div>
                    <h4 className="text-sm font-medium mb-4">Average Ratings</h4>
                    <div className="space-y-3">
                      {analyticsData.timeSeriesData[timeRange as keyof typeof analyticsData.timeSeriesData].labels.map((label, index) => {
                        const rating = analyticsData.timeSeriesData[timeRange as keyof typeof analyticsData.timeSeriesData].ratings[index];
                        const percentage = (rating / 5) * 100;
                        
                        return (
                          <div key={label} className="flex items-center space-x-3">
                            <div className="w-16 text-sm text-gray-600">{label}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: animatedData ? `${percentage}%` : '0%' }}
                              />
                            </div>
                            <div className="w-12 text-sm font-medium text-gray-900">{rating}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sentiment Analysis Tab */}
          <TabsContent value="sentiment" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Sentiment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Distribution</CardTitle>
                  <CardDescription>Overall sentiment across all feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700">Positive</span>
                        <span className="text-sm font-bold text-green-700">{analyticsData.sentimentAnalysis.positive}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: animatedData ? `${analyticsData.sentimentAnalysis.positive}%` : '0%' }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Neutral</span>
                        <span className="text-sm font-bold text-gray-700">{analyticsData.sentimentAnalysis.neutral}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gray-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: animatedData ? `${analyticsData.sentimentAnalysis.neutral}%` : '0%' }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-700">Negative</span>
                        <span className="text-sm font-bold text-red-700">{analyticsData.sentimentAnalysis.negative}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-red-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: animatedData ? `${analyticsData.sentimentAnalysis.negative}%` : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Keywords</CardTitle>
                  <CardDescription>Most mentioned words in feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.topKeywords.map((keyword, index) => (
                      <div key={keyword.word} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium">{index + 1}.</div>
                          <span className="font-medium">{keyword.word}</span>
                          <Badge className={getSentimentColor(keyword.sentiment)}>
                            {keyword.sentiment}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">{keyword.count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Feedback metrics by template category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analyticsData.categoryBreakdown.map((category) => (
                    <div key={category.name} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {category.feedback} feedback
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className={`font-medium ${getRatingColor(category.rating)}`}>
                              {category.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Total Feedback</div>
                          <div className="text-2xl font-bold">{category.feedback.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Average Rating</div>
                          <div className="text-2xl font-bold">{category.rating}/5.0</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Trend</div>
                          <div className={`text-2xl font-bold flex items-center ${category.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {category.trend > 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
                            {Math.abs(category.trend)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Feedback Tab */}
          <TabsContent value="feedback" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Feedback</CardTitle>
                <CardDescription>Latest reviews and comments from users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analyticsData.recentFeedback.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {feedback.user.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{feedback.user}</h4>
                              {feedback.verified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{feedback.template}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
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
                          <span className="text-sm text-gray-500">{feedback.timestamp}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 leading-relaxed">{feedback.comment}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button variant="ghost" size="sm" className="text-gray-600">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Helpful ({feedback.helpful})
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          Verified Purchase
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-8">
            
            {/* Improvement Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>User Improvement Suggestions</CardTitle>
                <CardDescription>Top feature requests and improvement ideas from users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.improvementSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline">{suggestion.category}</Badge>
                          <Badge className={getStatusColor(suggestion.status)}>
                            {suggestion.status}
                          </Badge>
                        </div>
                        <p className="text-gray-900 font-medium">{suggestion.suggestion}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <ThumbsUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{suggestion.votes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    What's Working Well
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Professional Output Quality</div>
                        <div className="text-sm text-gray-600">Users consistently praise the professional quality of generated content</div>
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Time Savings</div>
                        <div className="text-sm text-gray-600">Average time savings reported: 8-12 hours per project</div>
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Ease of Use</div>
                        <div className="text-sm text-gray-600">Intuitive interface with minimal learning curve</div>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-700">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Customization Options</div>
                        <div className="text-sm text-gray-600">Users want more control over output formatting and style</div>
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Loading Performance</div>
                        <div className="text-sm text-gray-600">Some users experience slower generation for complex templates</div>
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Collaboration Features</div>
                        <div className="text-sm text-gray-600">Teams need real-time collaboration capabilities</div>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Experience What Users Love About SmartPromptIQ
          </h3>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied users who've transformed their workflow with our AI-powered prompt generation.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 text-lg font-medium"
              onClick={() => setLocation('/demo')}
            >
              <Zap className="w-5 h-5 mr-2" />
              Try Interactive Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/50 text-white hover:bg-white/10 px-8 py-3 text-lg font-medium"
              onClick={() => setLocation('/signin')}
            >
              Start Free Account
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 mt-8 text-white/80">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>4.7/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>15,847+ Happy Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>94.2% Satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}