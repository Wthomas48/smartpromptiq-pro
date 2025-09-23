import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth-supabase";
import "./index.css";

// Simple error suppression for recharts only
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('recharts') || message.includes('locale_default')) {
    return; // Suppress recharts errors only
  }
  originalConsoleError.apply(console, args);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);