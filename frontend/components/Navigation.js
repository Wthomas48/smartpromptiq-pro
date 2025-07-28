import React from 'react';
import Logo from './Logo';

export default function Navigation() {
  const handleLogin = () => {
    alert('Login functionality will be implemented');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Logo size={32} />
            <span className="text-xl font-bold text-slate-900">Smart PromptIQ</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={handleLogin}
              className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium"
            >
              Sign In
            </button>
            <button 
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
