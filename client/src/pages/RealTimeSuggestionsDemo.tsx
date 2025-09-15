import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RealTimeSuggestionPanel from "@/components/RealTimeSuggestionPanel";
import TopNavigation from "@/components/TopNavigation";
import AnimatedCounter from "@/components/AnimatedCounter";
import { 
  Zap, 
  Star,
  Clock,
  Users,
  TrendingUp,
  Target,
  Activity,
  MessageCircle,
  ThumbsUp,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Brain,
  BarChart3,
  Globe,
  Award,
  Lightbulb,
  Rocket,
  Settings,
  RefreshCw
} from "lucide-react";

interface SelectedSuggestion {
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

export default function RealTimeSuggestionsDemo() {
  const [, setLocation] = useLocation();
  const [selectedSuggestion, setSelectedSuggestion] = useState<SelectedSuggestion | null>(null);
  const [interactionHistory, setInteractionHistory] = useState<SelectedSuggestion[]>([]);
  const [animatedStats, setAnimatedStats] = useState(false);
  const [demoSettings, setDemoSettings] = useState({
    enableRealTime: true,
    showRatings: true,
    showTrending: true,
    showPersonalized: true,
    maxSuggestions: 6
  });

  // Demo statistics
  const demoStats = {
    totalSuggestions: 47283,
    avgResponseTime: 150,
    accuracyRate: 94.7,
    activeUsers: 8947
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSuggestionSelect = (suggestion: SelectedSuggestion) => {
    setSelectedSuggestion(suggestion);
    setInteractionHistory(prev => [suggestion, ...prev.slice(0, 4)]); // Keep last 5 interactions
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

  const getTypeIcon = (suggestion: SelectedSuggestion) => {
    if (suggestion.isPersonalized) return <Users className="w-4 h-4 text-blue-600" />;
    if (suggestion.isTrending) return <TrendingUp className="w-4 h-4 text-orange-600" />;
    return <Sparkles className="w-4 h-4 text-purple-600" />;
  };

  const getTypeBadge = (suggestion: SelectedSuggestion) => {
    if (suggestion.isPersonalized) return { label: "Personalized", color: "bg-blue-100 text-blue-800" };
    if (suggestion.isTrending) return { label: "Trending", color: "bg-orange-100 text-orange-800" };
    return { label: "AI Generated", color: "bg-purple-100 text-purple-800" };
  };

  const demoFeatures = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Real-Time Generation",
      description: "Suggestions update dynamically as you type with 300ms debouncing",
      status: demoSettings.enableRealTime ? "Active" : "Disabled"
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "User Rating System", 
      description: "5-star rating system with community feedback integration",
      status: demoSettings.showRatings ? "Active" : "Disabled"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Trending Suggestions",
      description: "Popular suggestions from community usage patterns",
      status: demoSettings.showTrending ? "Active" : "Disabled"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Personalized Content",
      description: "AI-tailored suggestions based on user preferences",
      status: demoSettings.showPersonalized ? "Active" : "Disabled"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <TopNavigation 
        onGetStarted={() => setLocation('/signin')}
        onSignIn={() => setLocation('/signin')}
      />

      {/* Hero Section */}
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
              Live Demo
            </Badge>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Real-Time AI Suggestions
              <span className="block text-yellow-300">Intelligence Engine</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Experience our advanced AI suggestion system that provides instant, contextual prompts as you type with intelligent ranking and personalization.
            </p>
            
            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {animatedStats ? <AnimatedCounter end={demoStats.totalSuggestions} /> : '0'}
                </div>
                <div className="text-white/80 text-sm">AI Suggestions</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {animatedStats ? `${demoStats.avgResponseTime}ms` : '0ms'}
                </div>
                <div className="text-white/80 text-sm">Avg Response</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {animatedStats ? `${demoStats.accuracyRate}%` : '0%'}
                </div>
                <div className="text-white/80 text-sm">Accuracy Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {animatedStats ? <AnimatedCounter end={demoStats.activeUsers} /> : '0'}
                </div>
                <div className="text-white/80 text-sm">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {demoFeatures.map((feature, index) => (
          <Card key={index} className="border-2 border-dashed hover:border-solid transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-primary">{feature.icon}</div>
                <Badge variant={feature.status === "Active" ? "default" : "secondary"}>
                  {feature.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="interactive" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="interactive">Interactive Demo</TabsTrigger>
          <TabsTrigger value="details">Suggestion Details</TabsTrigger>
          <TabsTrigger value="history">Interaction History</TabsTrigger>
          <TabsTrigger value="settings">Demo Settings</TabsTrigger>
        </TabsList>

        {/* Interactive Demo Tab */}
        <TabsContent value="interactive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main suggestion panel */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Real-Time Suggestion Panel
                    {demoSettings.enableRealTime && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Start typing to see dynamic AI suggestions with real-time updates and rating system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RealTimeSuggestionPanel
                    onSuggestionSelect={handleSuggestionSelect}
                    enableRealTime={demoSettings.enableRealTime}
                    showRatings={demoSettings.showRatings}
                    showTrending={demoSettings.showTrending}
                    showPersonalized={demoSettings.showPersonalized}
                    maxSuggestions={demoSettings.maxSuggestions}
                    placeholder="Try typing: marketing strategy, technical documentation, creative writing..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Live metrics panel */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Live Metrics
                  </CardTitle>
                  <CardDescription>
                    Real-time interaction statistics and performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {interactionHistory.length}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Interactions</div>
                  </div>

                  {selectedSuggestion && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Current Selection</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>Relevance:</span>
                            <span className="font-medium">
                              {(selectedSuggestion.relevanceScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Token Est:</span>
                            <span className="font-medium">{selectedSuggestion.estimatedTokens}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <Badge className={getTypeBadge(selectedSuggestion).color}>
                              {getTypeBadge(selectedSuggestion).label}
                            </Badge>
                          </div>
                          {selectedSuggestion.averageRating && (
                            <div className="flex justify-between">
                              <span>Rating:</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="font-medium">
                                  {selectedSuggestion.averageRating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">System Status</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Real-time suggestions active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Rating system enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span>Trending data live</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Suggestion Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Selected Suggestion Details
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of the currently selected suggestion
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSuggestion ? (
                <div className="space-y-6">
                  {/* Header info */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(selectedSuggestion)}
                        <h3 className="font-semibold text-lg">{selectedSuggestion.title}</h3>
                        <Badge className={getCategoryColor(selectedSuggestion.category)}>
                          {selectedSuggestion.category}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        {selectedSuggestion.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>{(selectedSuggestion.relevanceScore * 100).toFixed(0)}% match</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{selectedSuggestion.estimatedTokens} tokens</span>
                        </div>
                        {selectedSuggestion.usageCount && (
                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            <span>{selectedSuggestion.usageCount} uses</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Generated prompt */}
                  <div>
                    <h4 className="font-semibold mb-2">Generated Prompt</h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                      <p className="text-sm leading-relaxed">{selectedSuggestion.prompt}</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigator.clipboard.writeText(selectedSuggestion.prompt)}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>

                  <Separator />

                  {/* Tags and metadata */}
                  <div>
                    <h4 className="font-semibold mb-2">Tags & Metadata</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Tags:</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSuggestion.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {selectedSuggestion.averageRating && (
                        <div>
                          <label className="text-sm font-medium">Community Rating:</label>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= Math.round(selectedSuggestion.averageRating!)
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
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Suggestion Selected</h3>
                  <p className="text-sm">
                    Use the interactive demo to select a suggestion and see its detailed analysis here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interaction History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Interaction History
              </CardTitle>
              <CardDescription>
                Recent suggestion selections and user interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {interactionHistory.length > 0 ? (
                <div className="space-y-3">
                  {interactionHistory.map((suggestion, index) => (
                    <div key={`${suggestion.id}-${index}`} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(suggestion)}
                          <h4 className="font-medium text-sm truncate">{suggestion.title}</h4>
                          <Badge className={getCategoryColor(suggestion.category)}>
                            {suggestion.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                          {suggestion.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs text-gray-500">
                          {(suggestion.relevanceScore * 100).toFixed(0)}% match
                        </div>
                        {suggestion.averageRating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs">{suggestion.averageRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Interactions Yet</h3>
                  <p className="text-sm">
                    Start interacting with suggestions in the demo to see your history here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Demo Configuration
              </CardTitle>
              <CardDescription>
                Customize the real-time suggestion panel behavior and features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Feature toggles */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Feature Settings</h4>
                  
                  {[
                    { key: 'enableRealTime', label: 'Real-Time Updates', description: 'Enable live suggestion generation' },
                    { key: 'showRatings', label: 'Rating System', description: 'Show user rating interface' },
                    { key: 'showTrending', label: 'Trending Suggestions', description: 'Display popular suggestions' },
                    { key: 'showPersonalized', label: 'Personalized Content', description: 'Show user-tailored suggestions' }
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <label className="font-medium text-sm">{setting.label}</label>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{setting.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={demoSettings[setting.key as keyof typeof demoSettings] ? "default" : "outline"}
                        onClick={() => setDemoSettings(prev => ({
                          ...prev,
                          [setting.key]: !prev[setting.key as keyof typeof demoSettings]
                        }))}
                      >
                        {demoSettings[setting.key as keyof typeof demoSettings] ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Performance settings */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Performance Settings</h4>
                  
                  <div className="p-3 border rounded-lg">
                    <label className="font-medium text-sm block mb-2">Max Suggestions</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="3"
                        max="12"
                        value={demoSettings.maxSuggestions}
                        onChange={(e) => setDemoSettings(prev => ({
                          ...prev,
                          maxSuggestions: parseInt(e.target.value)
                        }))}
                        className="flex-1"
                      />
                      <span className="font-medium text-sm w-8">{demoSettings.maxSuggestions}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Current Configuration</h5>
                    <div className="space-y-1 text-xs">
                      <div>Real-time: {demoSettings.enableRealTime ? "Active (300ms debounce)" : "Disabled"}</div>
                      <div>Ratings: {demoSettings.showRatings ? "5-star system enabled" : "Hidden"}</div>
                      <div>Max results: {demoSettings.maxSuggestions} suggestions</div>
                      <div>Sources: {[
                        demoSettings.showTrending && "Trending",
                        demoSettings.showPersonalized && "Personalized", 
                        "AI Generated"
                      ].filter(Boolean).join(", ")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How It Works Section */}
      <div className="mt-16 bg-gradient-to-r from-gray-50 to-white rounded-3xl p-12 border border-gray-200">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">How Our AI Suggestion Engine Works</h3>
          <p className="text-gray-600 text-lg">Advanced machine learning algorithms power real-time contextual suggestions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-4">Natural Language Processing</h4>
            <p className="text-gray-600 leading-relaxed">
              Advanced NLP analyzes your input in real-time, understanding context, intent, and semantic meaning to generate relevant suggestions.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-4">Machine Learning Ranking</h4>
            <p className="text-gray-600 leading-relaxed">
              ML algorithms rank suggestions based on relevance, user preferences, trending patterns, and historical performance data.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-4">Personalization Engine</h4>
            <p className="text-gray-600 leading-relaxed">
              Learns from your usage patterns, preferences, and feedback to deliver increasingly personalized and accurate suggestions.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">
          Experience Lightning-Fast AI Suggestions
        </h3>
        <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
          Join thousands of users who save hours daily with our intelligent suggestion system. Get instant, contextual prompts as you type.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            size="lg" 
            className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 text-lg font-medium"
            onClick={() => setLocation('/demo')}
          >
            <Rocket className="w-5 h-5 mr-2" />
            Try Full Demo
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
            <span>94.7% Accuracy</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>150ms Response</span>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>47K+ Suggestions</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}