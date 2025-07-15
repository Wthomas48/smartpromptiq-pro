import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import PromptSuggestions from "@/components/PromptSuggestions";
import QuickSuggestions from "@/components/QuickSuggestions";
import OptimizationDashboard from "@/components/OptimizationDashboard";
import { 
  Lightbulb, 
  TrendingUp, 
  User, 
  Sparkles, 
  Bot,
  Zap,
  Target,
  Users
} from "lucide-react";

export default function PromptSuggestionsDemo() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const categories = [
    { id: "marketing", name: "Marketing", icon: TrendingUp, color: "blue" },
    { id: "product", name: "Product Development", icon: Target, color: "green" },
    { id: "financial", name: "Financial Planning", icon: Sparkles, color: "purple" },
    { id: "education", name: "Education", icon: Lightbulb, color: "indigo" },
    { id: "personal", name: "Personal Development", icon: User, color: "orange" },
    { id: "general", name: "General", icon: Bot, color: "gray" }
  ];

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Generation",
      description: "Generate intelligent prompt suggestions using OpenAI GPT-4o and Anthropic Claude Sonnet-4",
      capabilities: [
        "Real-time query analysis",
        "Context-aware recommendations", 
        "Multi-model AI integration",
        "Optimized token usage"
      ]
    },
    {
      icon: TrendingUp,
      title: "Trending Analysis",
      description: "Discover what's popular across business, technology, and professional development",
      capabilities: [
        "Weekly trending prompts",
        "Industry-specific trends",
        "Seasonal recommendations",
        "Market opportunity insights"
      ]
    },
    {
      icon: User,
      title: "Personalized Learning",
      description: "Adaptive suggestions based on your usage patterns and preferences",
      capabilities: [
        "Behavioral pattern analysis",
        "Progressive skill development",
        "Category preference learning",
        "Usage history optimization"
      ]
    },
    {
      icon: Zap,
      title: "Smart Caching",
      description: "Optimized performance with intelligent caching to minimize costs",
      capabilities: [
        "LRU cache implementation",
        "70-80% cost reduction",
        "Fast response times",
        "Efficient data retrieval"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Lightbulb className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI-Powered Prompt Suggestions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience intelligent prompt recommendations with real-time analysis, trending insights, and personalized learning
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-sm font-semibold">{feature.title}</CardTitle>
                <CardDescription className="text-xs">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {feature.capabilities.map((capability, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {capability}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Select Category for Personalized Suggestions
            </CardTitle>
            <CardDescription>
              Choose a category to see contextual prompt recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex flex-col items-center gap-2 h-auto py-3"
                >
                  <category.icon className="w-5 h-5" />
                  <span className="text-xs">{category.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="optimization">API Optimization</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Full Suggestions Interface */}
              <div>
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="w-5 h-5" />
                      Complete Suggestions Interface
                    </CardTitle>
                    <CardDescription>
                      Generate, browse trending, and get personalized recommendations
                    </CardDescription>
                  </CardHeader>
                </Card>
                <PromptSuggestions 
                  category={selectedCategory}
                  onSelectSuggestion={(suggestion) => {
                    console.log("Selected suggestion:", suggestion);
                  }}
                />
              </div>

              {/* Quick Suggestions Widget */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="w-5 h-5" />
                      Quick Suggestions Widget
                    </CardTitle>
                    <CardDescription>
                      Compact suggestions perfect for integration into any page
                    </CardDescription>
                  </CardHeader>
                </Card>

                <QuickSuggestions 
                  category={selectedCategory}
                  maxSuggestions={6}
                  onSelectSuggestion={(suggestion) => {
                    console.log("Quick suggestion selected:", suggestion);
                  }}
                  compact={false}
                />

                {/* Implementation Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Implementation Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Smart Caching</span>
                        <Badge variant="secondary">70-80% Cost Reduction</Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">AI Models</span>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">GPT-4o</Badge>
                          <Badge variant="outline" className="text-xs">Claude Sonnet-4</Badge>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Batch Processing</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Optimized
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Token Efficiency</span>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Intelligent Limits
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <OptimizationDashboard />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* API Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Optimized API Endpoints
                </CardTitle>
                <CardDescription>
                  Advanced endpoints with batch processing and intelligent model selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Batch Processing</h4>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                        POST /api/suggestions/batch
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-500">
                        GET /api/suggestions/optimized/:type/:category
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Session Management</h4>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border-l-2 border-purple-500">
                        GET /api/session/limits
                      </div>
                      <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border-l-2 border-orange-500">
                        POST /api/session/update-tier
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Cache Management</h4>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded border-l-2 border-teal-500">
                        GET /api/cache/stats
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-500">
                        DELETE /api/batch/expired
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Analytics</h4>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded border-l-2 border-indigo-500">
                        GET /api/optimization/stats
                      </div>
                      <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded border-l-2 border-pink-500">
                        POST /api/suggestions/interaction
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Technology Stack */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Technology Implementation
            </CardTitle>
            <CardDescription>
              Advanced AI optimization with batch processing, intelligent model selection, and token efficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Optimization
                </h4>
                <div className="space-y-2 text-sm">
                  <div>• GPT-4o for creative prompts</div>
                  <div>• Claude Sonnet-4 for structured content</div>
                  <div>• Intelligent model selection</div>
                  <div>• Batch request processing</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Performance
                </h4>
                <div className="space-y-2 text-sm">
                  <div>• 70-85% cost reduction</div>
                  <div>• Smart caching system</div>
                  <div>• Session limit management</div>
                  <div>• Token efficiency controls</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Optimization
                </h4>
                <div className="space-y-2 text-sm">
                  <div>• Batch queue management</div>
                  <div>• Priority-based processing</div>
                  <div>• Adaptive learning</div>
                  <div>• Real-time analytics</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}