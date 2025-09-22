import React, { useState } from "react";
import AuthForm from "@/components/AuthForm";

export default function AuthFormTest() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState("");

  const handleSuccess = () => {
    setMessage(`✅ ${mode === 'signin' ? 'Login' : 'Signup'} successful! Redirecting...`);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">
            {message}
          </div>
        )}

        <AuthForm
          mode={mode}
          onSuccess={handleSuccess}
          onModeChange={handleModeChange}
          showDemo={true}
          showSocialLogin={false}
          showRememberMe={true}
          showTerms={true}
          redirectPath="/dashboard"
        />

        <div className="text-center text-sm text-gray-600 bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">🧪 AuthForm Test Page</h3>
          <p className="mb-2">Current Mode: <span className="font-medium">{mode}</span></p>
          <p className="text-xs">
            This page demonstrates the enhanced AuthForm component with all features enabled.
            Try both signin and signup modes to test functionality.
          </p>
        </div>
      </div>
    </div>
  );
}