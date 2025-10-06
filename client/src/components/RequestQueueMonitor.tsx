import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { requestQueue, type QueueStatus } from '@/lib/queryClient';

interface RequestQueueMonitorProps {
  showControls?: boolean;
  className?: string;
}

export const RequestQueueMonitor: React.FC<RequestQueueMonitorProps> = ({
  showControls = false,
  className = ""
}) => {
  const [status, setStatus] = useState<QueueStatus>({
    queueLength: 0,
    activeRequests: 0,
    maxConcurrent: 3,
    processing: false
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(requestQueue.getStatus());
    };

    // Update status every second
    const interval = setInterval(updateStatus, 1000);
    updateStatus(); // Initial update

    return () => clearInterval(interval);
  }, []);

  // Auto-show when there's activity
  useEffect(() => {
    if (status.queueLength > 0 || status.activeRequests > 0) {
      setIsVisible(true);
    } else {
      // Hide after 3 seconds of inactivity
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status.queueLength, status.activeRequests]);

  if (!isVisible && !showControls) {
    return null;
  }

  const getStatusColor = () => {
    if (status.activeRequests > 0 || status.processing) return 'bg-blue-500';
    if (status.queueLength > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (status.activeRequests > 0) return 'Processing';
    if (status.queueLength > 0) return 'Queued';
    return 'Idle';
  };

  return (
    <Card className={`${className} transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Activity className="w-4 h-4" />
          <span>Request Queue</span>
          <Badge variant="outline" className={`${getStatusColor()} text-white border-0`}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span>Queue: {status.queueLength}</span>
          </div>
          <div className="flex items-center space-x-2">
            <RotateCcw className={`w-4 h-4 ${status.processing ? 'animate-spin text-blue-500' : 'text-gray-400'}`} />
            <span>Active: {status.activeRequests}/{status.maxConcurrent}</span>
          </div>
        </div>

        {/* Progress bar for active requests */}
        <div className="space-y-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(status.activeRequests / status.maxConcurrent) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center">
            {status.activeRequests > 0 ? 'Processing requests...' : 'Ready for requests'}
          </div>
        </div>

        {showControls && (
          <div className="flex space-x-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => requestQueue.clear()}
              disabled={status.activeRequests > 0}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Clear Queue
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => requestQueue.setMaxConcurrent(status.maxConcurrent === 3 ? 5 : 3)}
            >
              Max: {status.maxConcurrent}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Hook for easy integration
export const useRequestQueue = () => {
  const [status, setStatus] = useState<QueueStatus>(requestQueue.getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(requestQueue.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...status,
    clear: () => requestQueue.clear(),
    setMaxConcurrent: (max: number) => requestQueue.setMaxConcurrent(max),
    setMaxRetries: (max: number) => requestQueue.setMaxRetries(max),
  };
};