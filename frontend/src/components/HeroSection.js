import React from 'react';
export default function HeroSection({ onGetStarted }) {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Transform Ideas Into <span className="text-blue-600">Actionable Prompts</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Smart PromptIQ uses AI to create comprehensive, tailored prompts for your projects.
        </p>
        <button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg">
          Start Creating Free
        </button>
      </div>
    </section>
  );
}
