import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  Zap, 
  Users, 
  Target, 
  Database, 
  Clock,
  DollarSign,
  Activity
} from "lucide-react";

interface CacheStats {
  ai: {
    size: number;
    calculatedSize: number;
    hitRate: number;
  };
  user: {
    size: number;
    calculatedSize: number;
  };
  template: {
    size: number;
    calculatedSize: number;
  };
}

interface ABTestResults {
  testId: string;
  testName: string;
  variants: Record<string, {
    name: string;
    users: number;
    events: number;
    metrics: Record<string, number>;
  }>;
  totalEvents: number;
  totalUsers: number;
}

export default function Analytics() {
  const [selectedTest, setSelectedTest] = useState("onboarding_flow_v1");

  const { data: cacheStats, isLoading: cacheLoading } = useQuery<CacheStats>({
    queryKey: ["/api/cache-stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: testResults, isLoading: testLoading } = useQuery<ABTestResults>({
    queryKey: ["/api/ab-results", selectedTest],
    enabled: !!selectedTest,
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Sample performance metrics
  const performanceMetrics = [
    {
      metric: "Avg Response Time",
      value: "245ms",
      change: -12,
      icon: Clock,
      color: "text-green-600"
    },
    {
      metric: "Cache Hit Rate",
      value: formatPercentage(cacheStats?.ai?.hitRate ?? 0),
      change: 8,
      icon: Zap,
      color: "text-blue-600"
    },
    {
      metric: "Token Efficiency",
      value: "87%",
      change: 15,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      metric: "Active Users",
      value: "1,234",
      change: 5,
      icon: Users,
      color: "text-purple-600"
    }
  ];

  // Sample A/B test data
  const testsList = [
    { id: "onboarding_flow_v1", name: "Onboarding Flow Optimization" },
    { id: "pricing_display_v1", name: "Pricing Display Test" },
    { id: "prompt_generation_ui_v1", name: "Prompt Generation UI" }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <BackButton />
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Monitor system performance, cache efficiency, and A/B test results to optimize user experience and reduce costs.
        </p>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache Analytics</TabsTrigger>
          <TabsTrigger value="abtests">A/B Tests</TabsTrigger>
          <TabsTrigger value="costs">Cost Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.metric}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className={`text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}% vs last week
                      </p>
                    </div>
                    <metric.icon className={`h-8 w-8 ${metric.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Response Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trends</CardTitle>
              <CardDescription>Average API response times over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { time: '00:00', responseTime: 245 },
                  { time: '04:00', responseTime: 230 },
                  { time: '08:00', responseTime: 280 },
                  { time: '12:00', responseTime: 320 },
                  { time: '16:00', responseTime: 295 },
                  { time: '20:00', responseTime: 240 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="responseTime" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          {/* Cache Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  AI Cache
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Entries:</span>
                    <span className="font-medium">{cacheStats?.ai?.size ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">{formatBytes(cacheStats?.ai?.calculatedSize ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hit Rate:</span>
                    <span className="font-medium text-green-600">
                      {formatPercentage(cacheStats?.ai?.hitRate ?? 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  User Cache
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Entries:</span>
                    <span className="font-medium">{cacheStats?.user?.size ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">{formatBytes(cacheStats?.user?.calculatedSize ?? 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  Template Cache
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Entries:</span>
                    <span className="font-medium">{cacheStats?.template?.size ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">{formatBytes(cacheStats?.template?.calculatedSize ?? 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cache Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Effectiveness</CardTitle>
              <CardDescription>Cache hit rates and token savings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { period: 'Last Hour', hitRate: 75, tokensSaved: 120 },
                  { period: 'Last 6 Hours', hitRate: 68, tokensSaved: 680 },
                  { period: 'Last Day', hitRate: 72, tokensSaved: 2340 },
                  { period: 'Last Week', hitRate: 69, tokensSaved: 15600 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hitRate" fill="#8884d8" name="Hit Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtests" className="space-y-6">
          {/* Test Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Active A/B Tests</CardTitle>
              <CardDescription>Select a test to view detailed results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {testsList.map((test) => (
                  <Button
                    key={test.id}
                    variant={selectedTest === test.id ? "default" : "outline"}
                    onClick={() => setSelectedTest(test.id)}
                    className="h-auto p-4 text-left"
                  >
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-gray-500">{test.id}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle>{testResults.testName}</CardTitle>
                <CardDescription>
                  Total Users: {testResults.totalUsers} | Total Events: {testResults.totalEvents}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Variant Performance</h4>
                    <div className="space-y-4">
                      {Object.entries(testResults.variants).map(([variantId, variant]) => (
                        <div key={variantId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{variant.name}</h5>
                            <Badge variant="outline">{variantId}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Users:</span>
                              <span className="ml-2 font-medium">{variant.users}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Events:</span>
                              <span className="ml-2 font-medium">{variant.events}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">User Distribution</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={Object.entries(testResults.variants).map(([id, variant]) => ({
                            name: variant.name,
                            value: variant.users,
                            id
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {Object.entries(testResults.variants).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          {/* Cost Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  AI Cost Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">$2,340</div>
                <p className="text-sm text-gray-600">Saved this month through caching</p>
                <div className="mt-2">
                  <Progress value={78} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">78% reduction in API calls</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Token Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-sm text-gray-600">Efficient token usage rate</p>
                <div className="mt-2">
                  <Progress value={87} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">15,600 tokens saved</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.4%</div>
                <p className="text-sm text-gray-600">Free to paid conversion</p>
                <div className="mt-2">
                  <Progress value={62} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">+2.1% from A/B testing</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Optimization Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cost Optimization</CardTitle>
              <CardDescription>AI API costs vs savings through optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { month: 'Jan', costs: 4200, savings: 1800 },
                  { month: 'Feb', costs: 3800, savings: 2100 },
                  { month: 'Mar', costs: 3500, savings: 2400 },
                  { month: 'Apr', costs: 3200, savings: 2800 },
                  { month: 'May', costs: 2900, savings: 3200 },
                  { month: 'Jun', costs: 2600, savings: 3600 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="costs" fill="#FF8042" name="API Costs ($)" />
                  <Bar dataKey="savings" fill="#00C49F" name="Savings ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}