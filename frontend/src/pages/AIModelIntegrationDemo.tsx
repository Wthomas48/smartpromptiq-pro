import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Zap, 
  BarChart3,
  Clock,
  Target,
  Activity,
  TrendingUp,
  Settings,
  Play,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Cpu,
  Database,
  ArrowRight
} from "lucide-react";

interface ModelMetrics {
  model: string;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  averageTokens: number;
  costPerRequest: number;
  lastUsed: string;
  efficiency: string;
  performance: string;
}

interface BatchResult {
  id: string;
  content: string;
  model: string;
  tokensUsed: number;
  processingTime: number;
  cacheHit: boolean;
  success: boolean;
  error?: string;
}

interface AsyncRequest {
  prompt: string;
  category: string;
  modelPreference: string;
  priority: string;
  customization: {
    tone?: string;
    detailLevel?: string;
    format?: string;
    maxTokens?: number;
  };
}

export default function AIModelIntegrationDemo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [batchRequests, setBatchRequests] = useState<AsyncRequest[]>([]);
  const [singleRequest, setSingleRequest] = useState<AsyncRequest>({
    prompt: "",
    category: "general",
    modelPreference: "auto",
    priority: "medium",
    customization: {}
  });
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);

  // Model metrics and performance data
  const { data: modelMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ["/api/ai/model-metrics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/ai/model-metrics");
      return await response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Rate limits and system status
  const { data: rateLimits } = useQuery({
    queryKey: ["/api/ai/rate-limits"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/ai/rate-limits");
      return await response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Single async request mutation
  const asyncRequestMutation = useMutation({
    mutationFn: async (request: AsyncRequest) => {
      const response = await apiRequest("POST", "/api/ai/async-request", request);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Request Processed",
        description: `Completed in ${data.result.processingTime}ms using ${data.result.model}`,
      });
      refetchMetrics();
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to process request",
        variant: "destructive",
      });
    },
  });

  // Batch processing mutation
  const batchProcessMutation = useMutation({
    mutationFn: async (requests: AsyncRequest[]) => {
      const response = await apiRequest("POST", "/api/ai/batch-process", { requests });
      return await response.json();
    },
    onSuccess: (data) => {
      setBatchResults(data.results);
      toast({
        title: "Batch Completed",
        description: `Processed ${data.summary.successful}/${data.summary.total} requests successfully`,
      });
      refetchMetrics();
    },
    onError: (error: any) => {
      toast({
        title: "Batch Failed",
        description: error.message || "Failed to process batch",
        variant: "destructive",
      });
    },
  });

  // Queue request mutation
  const queueRequestMutation = useMutation({
    mutationFn: async (request: AsyncRequest) => {
      const response = await apiRequest("POST", "/api/ai/queue-request", request);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Request Queued",
        description: `Request ${data.requestId} added to processing queue`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Queue Failed",
        description: error.message || "Failed to queue request",
        variant: "destructive",
      });
    },
  });

  // Test integration mutation
  const testIntegrationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/test-integration");
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Integration Test Complete",
        description: data.comparison.recommendation,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Integration test failed",
        variant: "destructive",
      });
    },
  });

  // Model optimization mutation
  const optimizeModelMutation = useMutation({
    mutationFn: async (category: string) => {
      const response = await apiRequest("POST", "/api/ai/optimize-selection", { category });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Model Optimization",
        description: `Recommended: ${data.optimalModel} for ${data.category}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Optimization Failed",
        description: error.message || "Failed to optimize model selection",
        variant: "destructive",
      });
    },
  });

  const addBatchRequest = () => {
    if (batchRequests.length >= 25) {
      toast({
        title: "Batch Limit",
        description: "Maximum 25 requests per batch",
        variant: "destructive",
      });
      return;
    }

    setBatchRequests([...batchRequests, {
      prompt: "",
      category: "general",
      modelPreference: "auto",
      priority: "medium",
      customization: {}
    }]);
  };

  const removeBatchRequest = (index: number) => {
    setBatchRequests(batchRequests.filter((_, i) => i !== index));
  };

  const updateBatchRequest = (index: number, field: string, value: any) => {
    const updated = [...batchRequests];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[index] = {
        ...updated[index],
        [parent]: { ...updated[index][parent as keyof AsyncRequest], [child]: value }
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setBatchRequests(updated);
  };

  const categories = [
    "general", "creative", "marketing", "technical", "business", 
    "education", "financial", "product", "research", "analysis"
  ];

  const modelOptions = [
    { value: "auto", label: "Auto Select (Recommended)" },
    { value: "gpt-4o", label: "GPT-4o (Creative & Conversational)" },
    { value: "claude-sonnet-4", label: "Claude Sonnet-4 (Analytical & Technical)" }
  ];

  const priorityOptions = [
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority (Queued)" }
  ];

  const getModelBadgeColor = (model: string) => {
    if (model.includes('gpt') || model.includes('GPT')) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (model.includes('claude') || model.includes('Claude')) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const getPerformanceBadgeColor = (performance: string) => {
    if (performance === 'Excellent') return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (performance === 'Good') return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  if (metricsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Brain className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Loading AI Integration</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Initializing advanced AI model integration with async processing...
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
          <Brain className="w-8 h-8 text-primary" />
          AI Model Integration
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Advanced async batch processing with GPT-4o and Claude Sonnet-4 integration
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Requests</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {modelMetrics?.optimization?.totalRequests || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Success Rate</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {((modelMetrics?.optimization?.averageSuccessRate || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Queue Status</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {modelMetrics?.queue?.length || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Processing: {modelMetrics?.queue?.processing || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Preferred Model</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {modelMetrics?.optimization?.preferredModel === 'gpt-4o' ? 'GPT-4o' : 'Claude'}
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="single">Single Request</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
          <TabsTrigger value="metrics">Model Metrics</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        {/* Single Request Tab */}
        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Single Async Request
              </CardTitle>
              <CardDescription>
                Process individual requests with intelligent model selection and caching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Prompt</label>
                <Textarea
                  value={singleRequest.prompt}
                  onChange={(e) => setSingleRequest(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Enter your prompt (minimum 10 characters)..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={singleRequest.category}
                    onValueChange={(value) => setSingleRequest(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Model Preference</label>
                  <Select
                    value={singleRequest.modelPreference}
                    onValueChange={(value) => setSingleRequest(prev => ({ ...prev, modelPreference: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select
                    value={singleRequest.priority}
                    onValueChange={(value) => setSingleRequest(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tone</label>
                  <Select
                    value={singleRequest.customization.tone || ""}
                    onValueChange={(value) => setSingleRequest(prev => ({ 
                      ...prev, 
                      customization: { ...prev.customization, tone: value } 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="analytical">Analytical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Detail Level</label>
                  <Select
                    value={singleRequest.customization.detailLevel || ""}
                    onValueChange={(value) => setSingleRequest(prev => ({ 
                      ...prev, 
                      customization: { ...prev.customization, detailLevel: value } 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select detail level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => asyncRequestMutation.mutate(singleRequest)}
                  disabled={asyncRequestMutation.isPending || singleRequest.prompt.length < 10}
                  className="flex-1"
                >
                  {asyncRequestMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Process Request
                </Button>

                <Button
                  variant="outline"
                  onClick={() => queueRequestMutation.mutate(singleRequest)}
                  disabled={queueRequestMutation.isPending || singleRequest.prompt.length < 10}
                >
                  {queueRequestMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 mr-2" />
                  )}
                  Queue Request
                </Button>
              </div>

              {asyncRequestMutation.data && (
                <Card className="bg-gray-50 dark:bg-gray-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Result</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getModelBadgeColor(asyncRequestMutation.data.result.model)}>
                          {asyncRequestMutation.data.result.model}
                        </Badge>
                        {asyncRequestMutation.data.optimization.cacheHit && (
                          <Badge variant="outline">Cached</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {asyncRequestMutation.data.result.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Time: {asyncRequestMutation.data.optimization.processingTime}ms</span>
                      <span>Tokens: {asyncRequestMutation.data.optimization.tokensUsed}</span>
                      <span className={asyncRequestMutation.data.optimization.costEfficient ? "text-green-600" : "text-orange-600"}>
                        {asyncRequestMutation.data.optimization.costEfficient ? "Cost Efficient" : "Standard Cost"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Processing Tab */}
        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Batch Request Processing
              </CardTitle>
              <CardDescription>
                Process multiple requests efficiently with intelligent grouping and optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Batch Requests ({batchRequests.length}/25)</h4>
                <Button onClick={addBatchRequest} size="sm" disabled={batchRequests.length >= 25}>
                  Add Request
                </Button>
              </div>

              {batchRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No batch requests added yet</p>
                  <Button onClick={addBatchRequest} className="mt-2" size="sm">
                    Add First Request
                  </Button>
                </div>
              )}

              {batchRequests.map((request, index) => (
                <Card key={index} className="border-2 border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">Request {index + 1}</h5>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeBatchRequest(index)}
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <Textarea
                          value={request.prompt}
                          onChange={(e) => updateBatchRequest(index, 'prompt', e.target.value)}
                          placeholder="Enter prompt..."
                          rows={2}
                        />
                      </div>

                      <Select
                        value={request.category}
                        onValueChange={(value) => updateBatchRequest(index, 'category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={request.modelPreference}
                        onValueChange={(value) => updateBatchRequest(index, 'modelPreference', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {modelOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {batchRequests.length > 0 && (
                <Button
                  onClick={() => batchProcessMutation.mutate(batchRequests)}
                  disabled={batchProcessMutation.isPending || batchRequests.some(r => r.prompt.length < 10)}
                  className="w-full"
                >
                  {batchProcessMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 mr-2" />
                  )}
                  Process Batch ({batchRequests.length} requests)
                </Button>
              )}

              {batchResults.length > 0 && (
                <Card className="bg-gray-50 dark:bg-gray-900">
                  <CardHeader>
                    <CardTitle className="text-lg">Batch Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {batchResults.map((result, index) => (
                        <div key={result.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Result {index + 1}</span>
                            <div className="flex items-center gap-2">
                              <Badge className={getModelBadgeColor(result.model)}>
                                {result.model}
                              </Badge>
                              {result.cacheHit && <Badge variant="outline">Cached</Badge>}
                              {result.success ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          </div>
                          {result.success ? (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              {result.content.substring(0, 150)}...
                            </p>
                          ) : (
                            <p className="text-sm text-red-600 mb-1">
                              Error: {result.error}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Time: {result.processingTime}ms</span>
                            <span>Tokens: {result.tokensUsed}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modelMetrics?.models?.map((model: ModelMetrics) => (
              <Card key={model.model}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    {model.model === 'gpt-4o' ? 'GPT-4o' : 'Claude Sonnet-4'}
                  </CardTitle>
                  <CardDescription>
                    {model.model === 'gpt-4o' ? 
                      'Optimized for creative and conversational tasks' : 
                      'Best for analytical and technical content'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {model.totalRequests}
                        </div>
                        <div className="text-sm text-gray-600">Total Requests</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {(model.successRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg Response Time</span>
                        <span className="font-medium">{model.averageResponseTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg Tokens</span>
                        <span className="font-medium">{model.averageTokens.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cost per Request</span>
                        <span className="font-medium">${model.costPerRequest.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Performance</span>
                        <Badge className={getPerformanceBadgeColor(model.performance)}>
                          {model.performance}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="text-xs text-gray-500">
                      Last used: {new Date(model.lastUsed).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {rateLimits && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Rate Limits & System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(rateLimits.rateLimits).map(([model, limits]: [string, any]) => (
                    <div key={model} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 capitalize">
                        {model === 'gpt-4o' ? 'GPT-4o' : 'Claude Sonnet-4'}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Requests/min:</span>
                          <span className="font-medium">{limits.requestsPerMinute.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tokens/min:</span>
                          <span className="font-medium">{limits.tokensPerMinute.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant="outline">{limits.currentStatus}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Model Selection Optimization
              </CardTitle>
              <CardDescription>
                Analyze and optimize model selection based on category performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Optimize by Category</h4>
                  {categories.slice(0, 5).map(category => (
                    <Button
                      key={category}
                      variant="outline"
                      onClick={() => optimizeModelMutation.mutate(category)}
                      disabled={optimizeModelMutation.isPending}
                      className="w-full justify-between"
                    >
                      <span className="capitalize">{category}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Optimization Features</h4>
                  {rateLimits?.optimization && Object.entries(rateLimits.optimization).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Integration Testing
              </CardTitle>
              <CardDescription>
                Test both AI models with the same prompt to compare performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={() => testIntegrationMutation.mutate()}
                  disabled={testIntegrationMutation.isPending}
                  className="w-full"
                >
                  {testIntegrationMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Run Integration Test
                </Button>

                {testIntegrationMutation.data && (
                  <Card className="bg-gray-50 dark:bg-gray-900">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">Test Results</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {testIntegrationMutation.data.comparison.gpt4o && (
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">GPT-4o Result</span>
                              <Badge className={getModelBadgeColor('gpt-4o')}>
                                GPT-4o
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {testIntegrationMutation.data.comparison.gpt4o.content}
                            </p>
                            <div className="text-xs text-gray-500">
                              Time: {testIntegrationMutation.data.comparison.gpt4o.processingTime}ms | 
                              Tokens: {testIntegrationMutation.data.comparison.gpt4o.tokensUsed}
                            </div>
                          </div>
                        )}

                        {testIntegrationMutation.data.comparison.claude && (
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Claude Result</span>
                              <Badge className={getModelBadgeColor('claude')}>
                                Claude
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {testIntegrationMutation.data.comparison.claude.content}
                            </p>
                            <div className="text-xs text-gray-500">
                              Time: {testIntegrationMutation.data.comparison.claude.processingTime}ms | 
                              Tokens: {testIntegrationMutation.data.comparison.claude.tokensUsed}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Recommendation: {testIntegrationMutation.data.comparison.recommendation}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        {Object.entries(testIntegrationMutation.data.systemStatus).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <div className="font-medium capitalize">{key}</div>
                            <Badge variant="outline">{value}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}