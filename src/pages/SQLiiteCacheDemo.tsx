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
import { Separator } from "@/components/ui/separator";
import { 
  Database, 
  TrendingUp, 
  Clock, 
  BarChart3,
  Search,
  Zap,
  Users,
  Activity,
  Download,
  Trash2,
  RefreshCw,
  HardDrive,
  Target
} from "lucide-react";

interface SQLiteStats {
  totalCached: number;
  hitRate: number;
  averageResponseTime: number;
  popularQueries: Array<{ query: string; count: number }>;
  categoryBreakdown: Record<string, number>;
  performance: {
    averageUsage: number;
    maxUsage: number;
    totalCategories: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  };
  cacheStats: {
    hitCount: number;
    missCount: number;
    totalRequests: number;
    averageResponseTime: number;
  };
}

interface UserInsights {
  totalInteractions: number;
  categories: Array<{
    category: string;
    interactions: number;
    success_rate: number;
    unique_queries: number;
  }>;
  averageSuccessRate: number;
  uniqueQueries: number;
  recommendations: {
    mostUsedCategory: string;
    suggestionForImprovement: string;
    nextSteps: string;
  };
}

export default function SQLiteCacheDemo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // SQLite cache statistics
  const { data: cacheStats, isLoading: statsLoading, refetch: refetchStats } = useQuery<SQLiteStats>({
    queryKey: ["/api/cache/sqlite/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/cache/sqlite/stats");
      return await response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // SQLite cache metrics
  const { data: cacheMetrics } = useQuery({
    queryKey: ["/api/cache/sqlite/metrics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/cache/sqlite/metrics");
      return await response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // User insights from SQLite
  const { data: userInsights } = useQuery<UserInsights>({
    queryKey: ["/api/user/insights"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user/insights");
      return await response.json();
    },
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  // Search similar queries
  const searchSimilarMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("GET", `/api/cache/sqlite/similar/${encodeURIComponent(query)}`);
      return await response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.similarQueries || []);
      toast({
        title: "Search Complete",
        description: `Found ${data.similarQueries?.length || 0} similar queries`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search similar queries",
        variant: "destructive",
      });
    },
  });

  // Backup cache
  const backupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/cache/sqlite/backup");
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Backup Created",
        description: `SQLite cache backed up to ${data.backupPath}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Backup Failed",
        description: error.message || "Failed to create backup",
        variant: "destructive",
      });
    },
  });

  // Clear cache
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/cache/sqlite/clear");
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Cache Maintenance",
        description: data.message,
      });
      refetchStats();
    },
    onError: (error: any) => {
      toast({
        title: "Clear Failed",
        description: error.message || "Failed to clear cache",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim().length >= 3) {
      searchSimilarMutation.mutate(searchQuery);
    } else {
      toast({
        title: "Invalid Query",
        description: "Search query must be at least 3 characters long",
        variant: "destructive",
      });
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 0.8) return "text-green-600 dark:text-green-400";
    if (rate >= 0.6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (statsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Loading SQLite Cache</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Initializing high-performance local caching system...
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
          <Database className="w-8 h-8 text-primary" />
          SQLite Cache Management
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          High-performance local caching system for prompt suggestions with automatic optimization
        </p>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {cacheStats?.hitRate.toFixed(1) || 0}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Progress value={cacheStats?.hitRate || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cached Items</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {cacheStats?.totalCached || 0}
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Max: 10,000 items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Response</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {cacheStats?.averageResponseTime.toFixed(1) || 0}ms
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Local SQLite storage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Requests</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {cacheStats?.cacheStats.totalRequests || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Hits: {cacheStats?.cacheStats.hitCount || 0} | Misses: {cacheStats?.cacheStats.missCount || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="insights">User Insights</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Queries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Most Popular Queries
                </CardTitle>
                <CardDescription>
                  Frequently accessed prompt suggestions from cache
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cacheStats?.popularQueries && cacheStats.popularQueries.length > 0 ? (
                  <div className="space-y-3">
                    {cacheStats.popularQueries.slice(0, 8).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xs w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium truncate">{item.query}</span>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">
                          {item.count}x
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No popular queries yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Category Distribution
                </CardTitle>
                <CardDescription>
                  Cache distribution across different suggestion categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cacheStats?.categoryBreakdown && Object.keys(cacheStats.categoryBreakdown).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(cacheStats.categoryBreakdown)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 6)
                      .map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{category}</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(count / Math.max(...Object.values(cacheStats.categoryBreakdown))) * 100} 
                              className="w-16 h-2"
                            />
                            <span className="text-xs text-gray-600 w-8 text-right">{count}</span>
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
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Response Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {cacheStats?.averageResponseTime.toFixed(1) || 0}ms
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">Average Response</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cache Hits:</span>
                      <span className="font-medium">{cacheStats?.cacheStats.hitCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache Misses:</span>
                      <span className="font-medium">{cacheStats?.cacheStats.missCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hit Ratio:</span>
                      <span className="font-medium">{cacheStats?.hitRate.toFixed(1) || 0}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Storage Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {cacheStats?.performance.totalCategories || 0}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Categories</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Max Usage:</span>
                      <span className="font-medium">{cacheStats?.performance.maxUsage || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Usage:</span>
                      <span className="font-medium">{cacheStats?.performance.averageUsage.toFixed(1) || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache Expiry:</span>
                      <span className="font-medium">6 hours</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cacheMetrics?.performance?.features?.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {feature}
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      <Activity className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Loading features...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Similar Query Search
              </CardTitle>
              <CardDescription>
                Find cached suggestions similar to your query using similarity matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for similar cached queries..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    onClick={handleSearch}
                    disabled={searchSimilarMutation.isPending || searchQuery.length < 3}
                  >
                    {searchSimilarMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Similar Queries Found:</h4>
                    {searchResults.map((result, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{result.query}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {(result.similarity * 100).toFixed(0)}% match
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {result.usageCount}x used
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 capitalize">
                          Category: {result.category}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {searchSimilarMutation.isPending && (
                  <div className="text-center py-4">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-sm text-gray-600">Searching similar queries...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Your Usage Patterns
                </CardTitle>
                <CardDescription>
                  Personal interaction statistics from SQLite cache
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userInsights ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {userInsights.totalInteractions}
                        </div>
                        <div className="text-sm text-gray-600">Total Interactions</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getSuccessRateColor(userInsights.averageSuccessRate)}`}>
                          {(userInsights.averageSuccessRate * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Category Usage</h4>
                      <div className="space-y-2">
                        {userInsights.categories.slice(0, 4).map((cat, index) => (
                          <div key={cat.category} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{cat.category}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">{cat.interactions}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getSuccessRateColor(cat.success_rate)}`}
                              >
                                {(cat.success_rate * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {userInsights.uniqueQueries}
                      </div>
                      <div className="text-sm text-gray-600">Unique Queries</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No user insights available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized suggestions to improve your experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userInsights?.recommendations ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Most Used Category</h5>
                      <p className="text-sm text-blue-700 dark:text-blue-300 capitalize">
                        {userInsights.recommendations.mostUsedCategory}
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Improvement Tip</h5>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {userInsights.recommendations.suggestionForImprovement}
                      </p>
                    </div>

                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Next Steps</h5>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        {userInsights.recommendations.nextSteps}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Start using suggestions to get recommendations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="management" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Cache Backup
                </CardTitle>
                <CardDescription>
                  Create a backup of your SQLite cache database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Backup your entire suggestion cache including all queries, usage statistics, and user interactions.
                  </p>
                  
                  <Button
                    onClick={() => backupMutation.mutate()}
                    disabled={backupMutation.isPending}
                    className="w-full"
                  >
                    {backupMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Create Backup
                  </Button>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Backup includes all cached suggestions</p>
                    <p>• Usage statistics and analytics preserved</p>
                    <p>• Automatic timestamp in filename</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Cache Maintenance
                </CardTitle>
                <CardDescription>
                  Manage cache cleanup and optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    The SQLite cache automatically maintains itself with hourly cleanup of expired entries.
                  </p>
                  
                  <Button
                    variant="outline"
                    onClick={() => clearCacheMutation.mutate()}
                    disabled={clearCacheMutation.isPending}
                    className="w-full"
                  >
                    {clearCacheMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Check Maintenance Status
                  </Button>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Expired entries cleaned every hour</p>
                    <p>• Database optimized every 6 hours</p>
                    <p>• Cache size limit: 10,000 items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Cache Information
              </CardTitle>
              <CardDescription>
                Technical details about your SQLite cache implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-lg font-bold">6 hours</div>
                  <div className="text-sm text-gray-600">Cache Expiry</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-lg font-bold">10,000</div>
                  <div className="text-sm text-gray-600">Max Items</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-lg font-bold">SQLite</div>
                  <div className="text-sm text-gray-600">Database Type</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}