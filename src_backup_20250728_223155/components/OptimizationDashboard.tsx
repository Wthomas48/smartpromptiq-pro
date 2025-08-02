import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  Database, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  BarChart3,
  RefreshCw,
  Cpu,
  Target,
  Users,
  Brain,
  Activity
} from "lucide-react";

interface OptimizationStats {
  caching: {
    hitRate: number;
    costSavings: number;
    totalCached: number;
  };
  batchProcessing: {
    queueLength: number;
    processing: boolean;
    efficiency: string;
  };
  apiOptimization: {
    modelSelection: string;
    tokenEfficiency: string;
    costReduction: string;
  };
}

interface SessionLimits {
  userId: string;
  requestCount: number;
  tokenUsage: number;
  lastReset: string;
  dailyLimit: number;
  sessionLimit: number;
}

interface BatchRequest {
  type: 'creative' | 'structured' | 'technical' | 'trending';
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export default function OptimizationDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<BatchRequest>({
    type: 'creative',
    category: 'marketing',
    priority: 'medium'
  });

  // Optimization statistics
  const { data: optimizationStats, isLoading: statsLoading, refetch: refetchStats } = useQuery<OptimizationStats>({
    queryKey: ["/api/optimization/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/optimization/stats");
      return await response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Session limits and usage
  const { data: sessionData, refetch: refetchSession } = useQuery({
    queryKey: ["/api/session/limits"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/session/limits");
      return await response.json();
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Batch processing mutation
  const batchMutation = useMutation({
    mutationFn: async (request: BatchRequest) => {
      const response = await apiRequest("POST", "/api/suggestions/batch", request);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Batch Processed",
        description: `Generated ${data.suggestions.length} suggestions using ${data.batchInfo.aiModel}`,
      });
      refetchStats();
      refetchSession();
    },
    onError: (error: any) => {
      toast({
        title: "Batch Failed",
        description: error.message || "Failed to process batch request",
        variant: "destructive",
      });
    },
  });

  // Clear expired batches mutation
  const clearBatchesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/batch/expired");
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Batches Cleared",
        description: `Cleared ${data.clearedBatches} expired batch entries`,
      });
      refetchStats();
    },
    onError: (error: any) => {
      toast({
        title: "Clear Failed",
        description: error.message || "Failed to clear expired batches",
        variant: "destructive",
      });
    },
  });

  const handleBatchRequest = () => {
    batchMutation.mutate(selectedRequest);
  };

  const getModelBadgeColor = (model: string) => {
    if (model.includes('gpt-4o')) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (model.includes('claude')) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const getEfficiencyColor = (efficiency: string) => {
    if (efficiency === 'optimal') return "text-green-600 dark:text-green-400";
    if (efficiency === 'queued') return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const calculateLimitProgress = (current: number, limit: number): number => {
    if (limit <= 0) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  if (statsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            API Optimization Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Loading optimization statistics...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            API Optimization Dashboard
          </CardTitle>
          <CardDescription>
            Monitor batch processing, intelligent model selection, and token efficiency
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(optimizationStats?.caching?.hitRate || 0).toFixed(1)}%
                </p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Progress 
                value={optimizationStats?.caching?.hitRate || 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Batch Efficiency</p>
                <p className={`text-2xl font-bold ${getEfficiencyColor(optimizationStats?.batchProcessing?.efficiency || 'optimal')}`}>
                  {optimizationStats?.batchProcessing?.efficiency || 'Optimal'}
                </p>
              </div>
              <Cpu className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Queue: {optimizationStats?.batchProcessing?.queueLength || 0} items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cost Reduction</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {optimizationStats?.apiOptimization?.costReduction || '70-85%'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Through smart optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">AI Models</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  Auto
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Intelligent selection
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="batch" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
          <TabsTrigger value="session">Session Management</TabsTrigger>
          <TabsTrigger value="models">AI Model Selection</TabsTrigger>
        </TabsList>

        {/* Batch Processing Tab */}
        <TabsContent value="batch" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Create Batch Request
                </CardTitle>
                <CardDescription>
                  Generate multiple suggestions with optimized API calls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Request Type</label>
                  <Select
                    value={selectedRequest.type}
                    onValueChange={(value: any) => setSelectedRequest(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="creative">Creative (GPT-4o)</SelectItem>
                      <SelectItem value="structured">Structured (Claude Sonnet-4)</SelectItem>
                      <SelectItem value="technical">Technical (Claude Sonnet-4)</SelectItem>
                      <SelectItem value="trending">Trending (Mixed Models)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={selectedRequest.category}
                    onValueChange={(value) => setSelectedRequest(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="product">Product Development</SelectItem>
                      <SelectItem value="financial">Financial Planning</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="personal">Personal Development</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select
                    value={selectedRequest.priority}
                    onValueChange={(value: any) => setSelectedRequest(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High (Immediate)</SelectItem>
                      <SelectItem value="medium">Medium (Queued)</SelectItem>
                      <SelectItem value="low">Low (Background)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleBatchRequest}
                  disabled={batchMutation.isPending}
                  className="w-full"
                >
                  {batchMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Process Batch Request
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Batch Queue Status
                </CardTitle>
                <CardDescription>
                  Real-time processing queue and efficiency metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {optimizationStats?.batchProcessing?.queueLength || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Queue Length</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${optimizationStats?.batchProcessing?.processing ? 'text-orange-600' : 'text-green-600'}`}>
                      {optimizationStats?.batchProcessing?.processing ? 'Active' : 'Idle'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Status</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Efficiency Rating</span>
                    <Badge className={getEfficiencyColor(optimizationStats?.batchProcessing?.efficiency || 'optimal')}>
                      {optimizationStats?.batchProcessing?.efficiency || 'Optimal'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Model Selection</span>
                    <Badge variant="outline">Automatic</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Token Optimization</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {optimizationStats?.apiOptimization?.tokenEfficiency || 'High'}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => clearBatchesMutation.mutate()}
                  disabled={clearBatchesMutation.isPending}
                  className="w-full"
                >
                  {clearBatchesMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Clear Expired Batches
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Session Management Tab */}
        <TabsContent value="session" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Session Limits & Usage
              </CardTitle>
              <CardDescription>
                Monitor API usage limits and optimize request patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionData?.sessionStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Daily Requests</span>
                        <span className="text-sm text-gray-600">
                          {sessionData.sessionStats.requestCount} / {sessionData.sessionStats.dailyLimit > 0 ? sessionData.sessionStats.dailyLimit : '∞'}
                        </span>
                      </div>
                      <Progress 
                        value={calculateLimitProgress(sessionData.sessionStats.requestCount, sessionData.sessionStats.dailyLimit)} 
                        className="h-2"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Session Requests</span>
                        <span className="text-sm text-gray-600">
                          {sessionData.sessionStats.requestCount} / {sessionData.sessionStats.sessionLimit > 0 ? sessionData.sessionStats.sessionLimit : '∞'}
                        </span>
                      </div>
                      <Progress 
                        value={calculateLimitProgress(sessionData.sessionStats.requestCount, sessionData.sessionStats.sessionLimit)} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        ${sessionData.sessionStats.tokenUsage.toFixed(4)}
                      </div>
                      <div className="text-sm text-gray-600">Token Usage Cost</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {sessionData.recommendations?.nextOptimalRequest === 'available' ? 'Available' : 'Limited'}
                      </div>
                      <div className="text-sm text-gray-600">Next Request</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {sessionData.queueStatus?.averageWaitTime || 0}s
                      </div>
                      <div className="text-sm text-gray-600">Avg Wait Time</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No session data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Model Selection Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Intelligent Model Selection
                </CardTitle>
                <CardDescription>
                  Automatic AI model optimization based on request type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Creative Prompts</div>
                      <div className="text-sm text-gray-600">Brainstorming, ideation, innovation</div>
                    </div>
                    <Badge className={getModelBadgeColor('gpt-4o')}>
                      GPT-4o
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Structured Content</div>
                      <div className="text-sm text-gray-600">Frameworks, processes, analysis</div>
                    </div>
                    <Badge className={getModelBadgeColor('claude')}>
                      Claude Sonnet-4
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Technical Prompts</div>
                      <div className="text-sm text-gray-600">Implementation, specifications</div>
                    </div>
                    <Badge className={getModelBadgeColor('claude')}>
                      Claude Sonnet-4
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Trending Content</div>
                      <div className="text-sm text-gray-600">Current topics, market trends</div>
                    </div>
                    <Badge variant="outline">
                      Mixed Models
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Benefits
                </CardTitle>
                <CardDescription>
                  Optimization results from intelligent API management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      70-85%
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Cost Reduction
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Through batch processing
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      3-5x
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Faster Response
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Cached vs live API
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      Auto
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      Model Selection
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Optimal for each type
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}