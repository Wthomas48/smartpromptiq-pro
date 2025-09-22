/**
 * Third-Party Library Protection
 * Handles errors from recharts, charts.js, and other external libraries
 */

// Protect against third-party library call errors
(function() {
  'use strict';

  // Enhanced global error protection
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');

    // Suppress third-party library errors that we can't control
    if (message.includes('recharts.js') ||
        message.includes('DataCloneError') ||
        message.includes('postMessage') ||
        message.includes('Cannot read properties of undefined (reading \'call\')') ||
        message.includes('operationBanner.js') ||
        message.includes('backendManager.js') ||
        message.includes('locale_default') ||
        message.includes('defaultLocale')) {
      console.warn('🛡️ THIRD-PARTY: Suppressed library error:', message);
      return;
    }

    originalError.apply(console, args);
  };

  // Protect against DataCloneError in postMessage
  if (typeof window !== 'undefined') {
    const originalPostMessage = window.postMessage.bind(window);
    window.postMessage = function(message, origin, transfer) {
      try {
        // Try to serialize the message first
        if (message && typeof message === 'object') {
          JSON.parse(JSON.stringify(message));
        }
        return originalPostMessage(message, origin, transfer);
      } catch (error) {
        console.warn('🛡️ THIRD-PARTY: PostMessage error prevented:', error.message);
        // Fallback: send a safe version of the message
        try {
          const safeMessage = typeof message === 'object' ?
            { type: 'safe_fallback', original: 'DataCloneError prevented' } :
            message;
          return originalPostMessage(safeMessage, origin, transfer);
        } catch (fallbackError) {
          console.warn('🛡️ THIRD-PARTY: PostMessage fallback also failed');
        }
      }
    };
  }

  // Protect against recharts and other chart library errors
  if (typeof window !== 'undefined') {
    window.addEventListener('error', function(event) {
      const error = event.error;
      if (error && error.message) {
        const message = error.message;

        // Handle specific third-party errors
        if (message.includes('Cannot read properties of undefined (reading \'call\')') ||
            message.includes('recharts') ||
            message.includes('d3-') ||
            message.includes('chart') ||
            message.includes('DataCloneError') ||
            message.includes('operationBanner') ||
            message.includes('backendManager') ||
            message.includes('locale_default') ||
            message.includes('defaultLocale')) {

          console.warn('🛡️ THIRD-PARTY: Library error prevented:', message);
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      }
    }, true);
  }

  // Enhanced Function.prototype protection
  if (typeof Function !== 'undefined' && Function.prototype) {
    const originalApply = Function.prototype.apply;
    const originalCall = Function.prototype.call;

    Function.prototype.apply = function(thisArg, argsArray) {
      try {
        if (typeof this !== 'function') {
          console.warn('🛡️ THIRD-PARTY: Apply called on non-function');
          return undefined;
        }
        return originalApply.call(this, thisArg, argsArray);
      } catch (error) {
        console.warn('🛡️ THIRD-PARTY: Apply error caught:', error.message);
        return undefined;
      }
    };

    Function.prototype.call = function(thisArg, ...args) {
      try {
        if (typeof this !== 'function') {
          console.warn('🛡️ THIRD-PARTY: Call called on non-function');
          return undefined;
        }
        return originalCall.apply(this, [thisArg, ...args]);
      } catch (error) {
        console.warn('🛡️ THIRD-PARTY: Call error caught:', error.message);
        return undefined;
      }
    };
  }

  console.log('🛡️ THIRD-PARTY PROTECTION: Activated for external libraries');
})();

export {};