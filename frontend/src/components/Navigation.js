import React from 'react';
import Logo from './Logo';
export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Logo size={32} />
          <span className="text-xl font-bold">Smart PromptIQ</span>
        </div>
        <div className="flex space-x-4">
          <button className="text-gray-600 hover:text-gray-900">Sign In</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Get Started</button>
        </div>
      </div>
    </nav>
  );
}
