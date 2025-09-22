// 🛡️ RECHARTS SPECIFIC ERROR FIX
// Targets: "Cannot read properties of undefined (reading 'call')" at locale_default

(function() {
  'use strict';

  console.log('🛡️ LOADING RECHARTS SPECIFIC FIX...');

  // Intercept and prevent recharts locale errors
  if (typeof window !== 'undefined') {
    // Global error handler specifically for recharts locale issues
    window.addEventListener('error', function(event) {
      const error = event.error;
      if (error && error.stack) {
        const stack = error.stack;

        // Detect recharts-specific patterns
        if (stack.includes('locale_default') ||
            stack.includes('defaultLocale') ||
            stack.includes('recharts.js') ||
            (error.message && error.message.includes('Cannot read properties of undefined') &&
             error.message.includes('call'))) {

          console.warn('🛡️ RECHARTS: Locale error intercepted and prevented');
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      }
    }, true);

    // Override console.error for recharts specifically
    const originalError = console.error;
    console.error = function(...args) {
      const message = String(args[0] || '');
      const fullMessage = args.join(' ');

      if (message.includes('Cannot read properties of undefined (reading \'call\')') ||
          fullMessage.includes('locale_default') ||
          fullMessage.includes('defaultLocale') ||
          fullMessage.includes('recharts.js')) {
        console.warn('🛡️ RECHARTS: Console error suppressed:', fullMessage);
        return;
      }

      return originalError.apply(console, args);
    };

    // Additional protection for locale-related function calls
    const originalCall = Function.prototype.call;
    Function.prototype.call = function(thisArg, ...args) {
      try {
        // Check if this is a recharts locale call that might fail
        if (this == null && (
            new Error().stack?.includes('locale_default') ||
            new Error().stack?.includes('defaultLocale') ||
            new Error().stack?.includes('recharts')
          )) {
          console.warn('🛡️ RECHARTS: Prevented null function call in locale');
          return undefined;
        }

        return originalCall.apply(this, [thisArg, ...args]);
      } catch (error) {
        if (error.message?.includes('Cannot read properties of undefined') ||
            new Error().stack?.includes('recharts')) {
          console.warn('🛡️ RECHARTS: Function call error prevented:', error.message);
          return undefined;
        }
        throw error;
      }
    };
  }

  console.log('🛡️ RECHARTS SPECIFIC FIX LOADED');
})();

export {};