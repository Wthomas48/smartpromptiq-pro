// utils/requestQueue.ts
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private maxConcurrent = 3;
  private activeRequests = 0;
  private retryAttempts = new Map<string, number>();
  private maxRetries = 5;

  async add<T>(
    requestFn: () => Promise<T>,
    requestId: string,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedRequest = async () => {
        try {
          const result = await this.executeWithRetry(requestFn, requestId);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (priority === 'high') {
        this.queue.unshift(wrappedRequest);
      } else {
        this.queue.push(wrappedRequest);
      }

      this.processQueue();
    });
  }

  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    requestId: string
  ): Promise<T> {
    const attempts = this.retryAttempts.get(requestId) || 0;

    try {
      const result = await requestFn();
      this.retryAttempts.delete(requestId);
      return result;
    } catch (error: any) {
      if (error.status === 429 && attempts < this.maxRetries) {
        this.retryAttempts.set(requestId, attempts + 1);

        // Exponential backoff with jitter
        const baseDelay = Math.min(1000 * Math.pow(2, attempts), 30000);
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;

        console.log(`Rate limited. Retry ${attempts + 1}/${this.maxRetries} in ${Math.round(delay)}ms`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(requestFn, requestId);
      }

      this.retryAttempts.delete(requestId);
      throw error;
    }
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    if (this.activeRequests >= this.maxConcurrent) return;

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const request = this.queue.shift();
      if (request) {
        this.activeRequests++;

        // Execute request without awaiting to allow concurrent processing
        request()
          .finally(() => {
            this.activeRequests--;
            // Continue processing queue if there are more requests
            if (this.queue.length > 0) {
              this.processing = false;
              this.processQueue();
            }
          });
      }
    }

    this.processing = false;
  }

  // Get queue status for monitoring
  getStatus() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      maxConcurrent: this.maxConcurrent,
      processing: this.processing
    };
  }

  // Clear the queue
  clear() {
    this.queue = [];
    this.retryAttempts.clear();
  }

  // Update configuration
  setMaxConcurrent(max: number) {
    this.maxConcurrent = Math.max(1, max);
  }

  setMaxRetries(max: number) {
    this.maxRetries = Math.max(0, max);
  }
}

// Create singleton instance
export const requestQueue = new RequestQueue();

// Export class for custom instances if needed
export { RequestQueue };

// Helper function for easy use
export const queueRequest = <T>(
  requestFn: () => Promise<T>,
  requestId: string,
  priority?: 'high' | 'normal' | 'low'
): Promise<T> => {
  return requestQueue.add(requestFn, requestId, priority);
};

// Type definitions for better TypeScript support
export interface QueueStatus {
  queueLength: number;
  activeRequests: number;
  maxConcurrent: number;
  processing: boolean;
}

export type RequestPriority = 'high' | 'normal' | 'low';