import React, { useState } from 'react';

export default function QuickStart() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    projectType: '',
    industry: '',
    audience: '',
    goals: ''
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePrompt = () => {
    const prompt = Create a comprehensive {formData.projectType} strategy for the {formData.industry} industry, targeting {formData.audience}. The main goals are: {formData.goals}. Please provide detailed, actionable recommendations with specific tactics and implementation steps.;
    setGeneratedPrompt(prompt);
    setCurrentStep(3);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Try Smart PromptIQ Free</h2>
        <p className="text-lg text-slate-600">Experience intelligent prompt generation in 3 steps</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Step 1: Project Details</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Type</label>
                <select 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.projectType}
                  onChange={(e) => handleInputChange('projectType', e.target.value)}
                >
                  <option value="">Select project type</option>
                  <option value="marketing-campaign">Marketing Campaign</option>
                  <option value="content-creation">Content Creation</option>
                  <option value="business-strategy">Business Strategy</option>
                  <option value="product-development">Product Development</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
                <select 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
              <input
                type="text"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Small business owners, Tech professionals..."
                value={formData.audience}
                onChange={(e) => handleInputChange('audience', e.target.value)}
              />
            </div>

            <button 
              onClick={() => setCurrentStep(2)}
              disabled={!formData.projectType || !formData.industry}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Continue to Goals →
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Step 2: Define Your Goals</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Primary Goals</label>
              <textarea
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="What do you want to achieve? Be specific about your desired outcomes..."
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
              />
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setCurrentStep(1)}
                className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-lg font-medium transition-colors"
              >
                ← Back
              </button>
              <button 
                onClick={generatePrompt}
                disabled={!formData.goals}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Generate Prompt ✨
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Step 3: Your Custom Prompt</h3>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-slate-700">{generatedPrompt}</pre>
            </div>

            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                className="flex-1 sm:flex-none border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                📋 Copy Prompt
              </button>
              <button 
                onClick={() => {
                  setCurrentStep(1);
                  setFormData({ projectType: '', industry: '', audience: '', goals: '' });
                  setGeneratedPrompt('');
                }}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
