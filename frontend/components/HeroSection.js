import React from 'react';

export default function HeroSection({ onGetStarted }) {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8">
          ✨ AI-Powered Prompt Generation
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
          Transform Ideas Into
          <span className="text-blue-600"> Actionable Prompts</span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
          Smart PromptIQ uses intelligent questionnaires and advanced AI to create 
          comprehensive, tailored prompts that drive results for your specific projects.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button 
            onClick={onGetStarted}
            className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Start Creating Free →
          </button>
          <button className="px-8 py-4 text-lg border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors">
            Watch Demo
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-slate-500">
          <div>⚡ No credit card required</div>
          <div>🎯 5 free prompts included</div>
          <div>✨ Instant results</div>
        </div>
      </div>
    </section>
  );
}
