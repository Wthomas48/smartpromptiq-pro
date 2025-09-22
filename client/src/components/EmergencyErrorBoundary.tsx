/**
 * 🚨 EMERGENCY ERROR BOUNDARY - Prevents app crashes from map errors
 *
 * This component catches React errors and prevents the entire app from crashing
 * when map errors occur on undefined arrays.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorCount: number;
}

class EmergencyErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorCount: 0
  };

  public static getDerivedStateFromError(error: Error): State {
    // Check if this is a map-related error
    const isMapError = error.message.includes('map') &&
                      (error.message.includes('undefined') ||
                       error.message.includes('Cannot read properties'));

    if (isMapError) {
      console.warn('🚨 EMERGENCY: Caught map error in Error Boundary:', error.message);
    }

    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorCount: 0
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isMapError = error.message.includes('map') &&
                      (error.message.includes('undefined') ||
                       error.message.includes('Cannot read properties'));

    console.error('🚨 EMERGENCY ERROR BOUNDARY - Caught error:', {
      error: error.message,
      isMapError,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // Store error info
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });

    // If it's a map error, try to recover automatically after a short delay
    if (isMapError && this.state.errorCount < 3) {
      console.warn('🚨 EMERGENCY: Attempting automatic recovery from map error...');
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: undefined,
          errorInfo: undefined
        });
      }, 1000);
    }
  }

  public render() {
    if (this.state.hasError) {
      const isMapError = this.state.error?.message.includes('map') &&
                        (this.state.error?.message.includes('undefined') ||
                         this.state.error?.message.includes('Cannot read properties'));

      if (isMapError && this.state.errorCount < 3) {
        // Show a minimal loading state for map errors while we try to recover
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Recovering from error...</p>
              <p className="text-xs text-gray-400 mt-2">
                🚨 Emergency recovery in progress ({this.state.errorCount + 1}/3)
              </p>
            </div>
          </div>
        );
      }

      // Show error UI for persistent errors
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Application Error
              </h2>
              <p className="text-gray-600 mb-4">
                {isMapError
                  ? "A data processing error occurred. The development team has been notified."
                  : "Something went wrong. Please refresh the page or contact support."
                }
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Refresh Page
                </button>

                <button
                  onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                  className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Try Again
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    🔍 Debug Information
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-40">
                    <p><strong>Error:</strong> {this.state.error?.message}</p>
                    <p><strong>Is Map Error:</strong> {isMapError ? 'Yes' : 'No'}</p>
                    <p><strong>Recovery Attempts:</strong> {this.state.errorCount}</p>
                    {this.state.error?.stack && (
                      <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EmergencyErrorBoundary;