import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useDemoGeneration,
  useBatchDemoGeneration,
  useDemoGenerationWithStatus
} from '@/hooks/useDemoGeneration';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  RotateCcw,
  Users,
  AlertCircle
} from 'lucide-react';

export const DemoGenerationExample: React.FC = () => {
  const [formData, setFormData] = useState({
    businessName: 'InnovateTech',
    industry: 'Technology',
    problem: 'Small businesses struggle with digital transformation',
    solution: 'AI-powered automation platform',
    targetMarket: 'SMBs with 10-100 employees',
    revenueModel: 'SaaS Subscription'
  });

  // Single demo generation
  const {
    loading,
    error,
    data,
    generateDemo,
    reset,
    cancel,
    retry,
    isRetrying,
    canRetry,
    progress
  } = useDemoGeneration();

  // Batch demo generation
  const {
    loading: batchLoading,
    error: batchError,
    results: batchResults,
    completed: batchCompleted,
    total: batchTotal,
    generateBatch,
    resetBatch,
    progress: batchProgress
  } = useBatchDemoGeneration();

  // Demo generation with system status
  const {
    loading: statusLoading,
    queueStatus,
    systemLoad,
    generateDemo: generateWithStatus
  } = useDemoGenerationWithStatus();

  const handleSingleGeneration = async () => {
    try {
      await generateDemo({
        template: 'startup-pitch',
        userResponses: formData,
        email: 'test@smartpromptiq.com'
      });
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  const handleBatchGeneration = async () => {
    const batchData = [
      {
        template: 'startup-pitch',
        userResponses: {
          ...formData,
          businessName: 'BatchTest1'
        }
      },
      {
        template: 'social-campaign',
        userResponses: {
          productService: 'BatchTest2',
          targetAudience: 'Tech enthusiasts',
          campaignGoal: 'Brand Awareness',
          budget: '$5,000-10,000',
          duration: '6-8 weeks',
          platforms: 'LinkedIn, Twitter'
        }
      },
      {
        template: 'startup-pitch',
        userResponses: {
          ...formData,
          businessName: 'BatchTest3'
        }
      }
    ];

    try {
      await generateBatch(batchData);
    } catch (err) {
      console.error('Batch generation failed:', err);
    }
  };

  const handleRetry = async () => {
    try {
      await retry({
        template: 'startup-pitch',
        userResponses: formData,
        email: 'test@smartpromptiq.com'
      });
    } catch (err) {
      console.error('Retry failed:', err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* System Status Overview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span>Queue: {queueStatus.queueLength}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-500" />
              <span>Active: {queueStatus.activeRequests}/{queueStatus.maxConcurrent}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>Load: {Math.round(systemLoad.utilization)}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              <span>Status: {queueStatus.processing ? 'Busy' : 'Ready'}</span>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={systemLoad.utilization} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Generation Form</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Business Name</label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Industry</label>
              <Input
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Problem Statement</label>
            <Textarea
              value={formData.problem}
              onChange={(e) => setFormData(prev => ({ ...prev, problem: e.target.value }))}
              rows={2}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Solution</label>
            <Textarea
              value={formData.solution}
              onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Single Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Single Demo Generation</span>
            {loading && (
              <Badge variant="secondary" className="ml-2">
                {progress.isQueued ? `Queue: ${progress.queuePosition}` : 'Processing'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={handleSingleGeneration}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>{loading ? 'Generating...' : 'Generate Demo'}</span>
            </Button>

            {canRetry && (
              <Button
                onClick={handleRetry}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry</span>
              </Button>
            )}

            {loading && (
              <Button
                onClick={cancel}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
            )}

            <Button onClick={reset} variant="outline" size="sm">
              Reset
            </Button>
          </div>

          {/* Progress indicator */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {progress.isQueued ? `Position in queue: ${progress.queuePosition}` : 'Processing request...'}
                </span>
                {isRetrying && (
                  <span className="text-yellow-600">
                    Retry {progress.retryCount}/{progress.maxRetries}
                  </span>
                )}
              </div>
              <Progress value={progress.isQueued ? 30 : 70} className="h-2" />
            </div>
          )}

          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success display */}
          {data && (
            <Alert>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription>
                Demo generated successfully!
                <Badge variant="outline" className="ml-2">
                  {data.type}
                </Badge>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Batch Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Batch Demo Generation</span>
            {batchLoading && (
              <Badge variant="secondary" className="ml-2">
                {batchCompleted}/{batchTotal}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={handleBatchGeneration}
              disabled={batchLoading}
              className="flex items-center space-x-2"
            >
              {batchLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              <span>{batchLoading ? 'Processing Batch...' : 'Generate 3 Demos'}</span>
            </Button>

            <Button onClick={resetBatch} variant="outline" size="sm">
              Reset Batch
            </Button>
          </div>

          {/* Batch progress */}
          {batchLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Batch Progress</span>
                <span>{batchCompleted}/{batchTotal} completed</span>
              </div>
              <Progress value={batchProgress} className="h-2" />
            </div>
          )}

          {/* Batch error */}
          {batchError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{batchError}</AlertDescription>
            </Alert>
          )}

          {/* Batch results */}
          {batchResults.length > 0 && (
            <Alert>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription>
                Batch completed! Generated {batchResults.length} demos successfully.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {(data || batchResults.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Results</CardTitle>
          </CardHeader>
          <CardContent>
            {data && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Single Generation Result:</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}

            {batchResults.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Batch Generation Results:</h4>
                <div className="space-y-2">
                  {batchResults.map((result, index) => (
                    <div key={index} className="border rounded p-2">
                      <Badge variant="outline" className="mb-1">Demo {index + 1}</Badge>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-24">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};