import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient, quickPost, priorityPost, cachedGet } from '@/utils/apiClient';
import { RequestQueueMonitor } from './RequestQueueMonitor';
import { Zap, Clock, Database, Loader2 } from 'lucide-react';

export const APIClientExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [businessName, setBusinessName] = useState('TechFlow');

  const testNormalRequest = async () => {
    setLoading(true);
    try {
      const data = await quickPost('/api/demo/generate', {
        template: 'startup-pitch',
        userResponses: {
          businessName,
          industry: 'Technology',
          problem: 'Testing normal priority request',
          solution: 'APIClient with intelligent queuing',
          targetMarket: 'Developers',
          revenueModel: 'SaaS Subscription'
        },
        email: 'test@smartpromptiq.com'
      });
      setResult({ type: 'Normal Priority', data });
    } catch (error) {
      setResult({ type: 'Error', data: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testHighPriorityRequest = async () => {
    setLoading(true);
    try {
      const data = await priorityPost('/api/demo/generate', {
        template: 'social-campaign',
        userResponses: {
          productService: 'API Testing Tool',
          targetAudience: 'Developers and QA engineers',
          campaignGoal: 'Product Launch',
          budget: '$5,000-10,000',
          duration: '6-8 weeks',
          platforms: 'LinkedIn, Twitter, GitHub'
        },
        email: 'test@smartpromptiq.com'
      });
      setResult({ type: 'High Priority', data });
    } catch (error) {
      setResult({ type: 'Error', data: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testCachedRequest = async () => {
    setLoading(true);
    try {
      // First request - will be cached
      const data1 = await cachedGet('/api/demo/templates', 30000); // 30 second cache

      // Second request - should come from cache
      const data2 = await cachedGet('/api/demo/templates', 30000);

      setResult({
        type: 'Cached Request',
        data: {
          firstCall: 'Fresh from API',
          secondCall: 'From cache (same data)',
          cacheStats: apiClient.getCacheStats()
        }
      });
    } catch (error) {
      setResult({ type: 'Error', data: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testBatchRequest = async () => {
    setLoading(true);
    try {
      const requests = [
        {
          endpoint: '/api/demo/generate',
          method: 'POST' as const,
          data: {
            template: 'startup-pitch',
            userResponses: {
              businessName: 'BatchTest1',
              industry: 'Technology',
              problem: 'First batch request',
              solution: 'Batch processing',
              targetMarket: 'Users',
              revenueModel: 'SaaS Subscription'
            }
          }
        },
        {
          endpoint: '/api/demo/generate',
          method: 'POST' as const,
          data: {
            template: 'social-campaign',
            userResponses: {
              productService: 'BatchTest2',
              targetAudience: 'Second batch request users',
              campaignGoal: 'Brand Awareness',
              budget: '$1,000-5,000',
              duration: '3-4 weeks',
              platforms: 'Instagram, TikTok'
            }
          }
        }
      ];

      const results = await apiClient.batch(requests, { priority: 'normal' });
      setResult({ type: 'Batch Request', data: results });
    } catch (error) {
      setResult({ type: 'Error', data: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    apiClient.clearCache();
    setResult({ type: 'Cache Cleared', data: 'All cached data has been cleared' });
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <span>APIClient Testing Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Name:</label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter business name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={testNormalRequest}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>Normal Request</span>
            </Button>

            <Button
              onClick={testHighPriorityRequest}
              disabled={loading}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
            >
              <Zap className="w-4 h-4" />
              <span>High Priority</span>
            </Button>

            <Button
              onClick={testCachedRequest}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Database className="w-4 h-4" />
              <span>Cached Request</span>
            </Button>

            <Button
              onClick={testBatchRequest}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Loader2 className="w-4 h-4" />
              <span>Batch Request</span>
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button onClick={clearCache} variant="destructive" size="sm">
              Clear Cache
            </Button>
            <Badge variant="outline">
              Cache: {apiClient.getCacheStats().size} entries
            </Badge>
          </div>
        </CardContent>
      </Card>

      <RequestQueueMonitor showControls={true} />

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Badge variant={result.type === 'Error' ? 'destructive' : 'default'}>
                {result.type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
              <span className="text-blue-700 font-medium">Processing request...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};