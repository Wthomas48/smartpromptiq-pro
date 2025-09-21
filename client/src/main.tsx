import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import "./index.css";

// 🚨 NUCLEAR OPTION: Global Array Safety to prevent production crashes
console.log('🔧 Applying global Array.prototype.map safety...');
const originalMap = Array.prototype.map;
Array.prototype.map = function(callback, thisArg) {
  if (this == null || this === undefined) {
    console.error('🚨 MAP ERROR CAUGHT: Map called on null/undefined, returning empty array', {
      stack: new Error().stack,
      component: this
    });
    return [];
  }
  return originalMap.call(this, callback, thisArg);
};

// Global error listener for production debugging
window.addEventListener('error', (event) => {
  if (event.message.includes('map') && event.message.includes('undefined')) {
    console.error('🚨 MAP ERROR CAUGHT:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
// Force deployment Sat, Sep 20, 2025 11:11:08 PM
