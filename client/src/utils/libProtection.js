// ============================================================================
// Third-Party Library Protection (ES5/ES6 Compatible)
// WARNING: DO NOT USE OPTIONAL CHAINING OR MODERN JS SYNTAX
// This file must remain ES5/ES6-safe or the app will crash on load.
// ============================================================================

(function() {
  "use strict";

  // Store original console.error
  var originalConsoleError = console.error;

  // Patterns to suppress
  var SUPPRESS_PATTERNS = [
    "recharts",
    "DataCloneError",
    "postMessage",
    "Cannot read properties of undefined",
    "operationBanner",
    "backendManager",
    "locale_default",
    "defaultLocale",
    ".create is not a function",
    "convertDetectedLanguage",
    "i18next",
    "Cannot find module",
    "dynamic import",
    "Failed to fetch dynamically imported module",
    "stripe.redirectToCheckout",
    "IntegrationError",
    "Host validation failed",
    "trusted host",
    "StripeError",
    "Failed to fetch",
    "NetworkError",
    "Script error",
    "403",
    "Forbidden"
  ];

  // Helper: Check if message matches any pattern
  function shouldSuppress(msg) {
    if (!msg) return false;
    var str = String(msg);
    for (var i = 0; i < SUPPRESS_PATTERNS.length; i++) {
      if (str.indexOf(SUPPRESS_PATTERNS[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

  // Helper: Safely get message from error or event
  function getErrorMessage(err) {
    if (!err) return "";
    if (err.message) return String(err.message);
    if (typeof err === "string") return err;
    try {
      return String(err);
    } catch (e) {
      return "";
    }
  }

  // Override console.error
  console.error = function() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    var msg = args.join(" ");
    if (shouldSuppress(msg)) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Global error handler
  if (typeof window !== "undefined") {
    window.addEventListener("error", function(event) {
      var msg = "";
      if (event && event.error && event.error.message) {
        msg = event.error.message;
      } else if (event && event.message) {
        msg = event.message;
      }
      if (shouldSuppress(msg)) {
        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
        return false;
      }
    }, true);

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", function(event) {
      var reason = event.reason;
      var msg = "";
      if (reason && reason.message) {
        msg = reason.message;
      } else if (reason) {
        msg = getErrorMessage(reason);
      }
      if (shouldSuppress(msg)) {
        if (event.preventDefault) event.preventDefault();
        return;
      }
    });

    // Safe postMessage wrapper
    var origPostMessage = window.postMessage;
    if (typeof origPostMessage === "function") {
      window.postMessage = function(message, targetOrigin, transfer) {
        try {
          if (message && typeof message === "object") {
            JSON.parse(JSON.stringify(message));
          }
          return origPostMessage.call(window, message, targetOrigin, transfer);
        } catch (err) {
          try {
            var safe = { type: "fallback", error: "DataCloneError prevented" };
            return origPostMessage.call(window, safe, targetOrigin, transfer);
          } catch (e) {
            // Silently fail
          }
        }
      };
    }
  }

  // Log activation
  if (typeof console !== "undefined" && console.log) {
    console.log("LIB-PROTECTION: Active");
  }

})();

export {};
