import React, { useState } from 'react';

interface PromptExample {
  title: string;
  prompt: string;
  expectedOutput?: string;
  tips?: string[];
}

interface PromptPlaygroundProps {
  examples?: PromptExample[];
  challenge?: string;
  onComplete?: () => void;
}

const PromptPlayground: React.FC<PromptPlaygroundProps> = ({ examples, challenge, onComplete }) => {
  const [activeTab, setActiveTab] = useState<'playground' | 'examples'>('playground');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedExample, setSelectedExample] = useState(0);

  const handleRunPrompt = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt first!');
      return;
    }

    setLoading(true);
    setOutput('');

    try {
      // Simulate AI response (in real app, this would call your AI API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      setOutput(`🤖 AI Response:\n\nThis is a simulated response to your prompt. In production, this would connect to OpenAI, Claude, or your configured AI service.\n\nYour prompt was:\n"${prompt}"\n\n✨ Great job experimenting with prompts!`);

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      setOutput('❌ Error: Could not generate response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (example: PromptExample) => {
    setPrompt(example.prompt);
    setOutput('');
    setActiveTab('playground');
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-2xl p-8 border-4 border-purple-100">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            <i className="fas fa-code text-purple-600 mr-2"></i>
            Prompt Playground
          </h3>
          {challenge && (
            <span className="px-4 py-2 bg-orange-100 border-2 border-orange-300 text-orange-800 rounded-full font-bold text-sm">
              <i className="fas fa-flag-checkered mr-2"></i>
              Challenge Mode
            </span>
          )}
        </div>

        {challenge && (
          <div className="p-4 bg-white rounded-xl border-2 border-orange-300 mb-4">
            <h4 className="font-bold text-gray-900 mb-2">
              <i className="fas fa-bullseye text-orange-600 mr-2"></i>
              Challenge
            </h4>
            <p className="text-gray-700">{challenge}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('playground')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'playground'
                ? 'bg-white shadow-lg text-purple-600'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            <i className="fas fa-play mr-2"></i>
            Playground
          </button>
          {examples && examples.length > 0 && (
            <button
              onClick={() => setActiveTab('examples')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'examples'
                  ? 'bg-white shadow-lg text-purple-600'
                  : 'bg-white/50 text-gray-600 hover:bg-white/80'
              }`}
            >
              <i className="fas fa-lightbulb mr-2"></i>
              Examples ({examples.length})
            </button>
          )}
        </div>
      </div>

      {activeTab === 'playground' ? (
        <div className="space-y-6">
          {/* Input Area */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <i className="fas fa-keyboard mr-2 text-purple-600"></i>
              Enter Your Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write your prompt here... Try to be clear, specific, and structured!"
              rows={8}
              className="w-full p-4 bg-white border-2 border-purple-200 rounded-xl text-gray-800 font-mono text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">
                {prompt.length} characters
              </span>
              <button
                onClick={() => setPrompt('')}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                <i className="fas fa-eraser mr-1"></i>
                Clear
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRunPrompt}
            disabled={loading || !prompt.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Generating Response...
              </>
            ) : (
              <>
                <i className="fas fa-rocket mr-2"></i>
                Run Prompt
              </>
            )}
          </button>

          {/* Output Area */}
          {(output || loading) && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <i className="fas fa-robot mr-2 text-indigo-600"></i>
                AI Response
              </label>
              <div className="bg-gray-900 text-green-400 p-6 rounded-xl font-mono text-sm min-h-[200px] whitespace-pre-wrap">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-green-400">AI is thinking...</p>
                    </div>
                  </div>
                ) : (
                  output
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {examples && examples.map((example, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedExample === idx ? 'ring-4 ring-purple-300' : ''
              }`}
              onClick={() => setSelectedExample(idx)}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-bold text-gray-900">
                  <span className="inline-block w-8 h-8 bg-purple-100 text-purple-600 rounded-lg text-center leading-8 mr-2 font-bold">
                    {idx + 1}
                  </span>
                  {example.title}
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadExample(example);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-sm hover:scale-105 transition-all"
                >
                  <i className="fas fa-play mr-2"></i>
                  Try It
                </button>
              </div>

              <div className="mb-3">
                <p className="text-sm font-bold text-gray-600 mb-2">Prompt:</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <code className="text-sm text-gray-800 font-mono">{example.prompt}</code>
                </div>
              </div>

              {example.expectedOutput && (
                <div className="mb-3">
                  <p className="text-sm font-bold text-gray-600 mb-2">Expected Output:</p>
                  <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm text-gray-700">{example.expectedOutput}</p>
                  </div>
                </div>
              )}

              {example.tips && example.tips.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-2">
                    <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                    Tips:
                  </p>
                  <ul className="space-y-1">
                    {example.tips.map((tip, tipIdx) => (
                      <li key={tipIdx} className="text-sm text-gray-600 flex items-start">
                        <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips Panel */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
        <h4 className="font-bold text-gray-900 mb-2">
          <i className="fas fa-info-circle text-blue-600 mr-2"></i>
          Prompt Writing Tips
        </h4>
        <ul className="space-y-1 text-sm text-gray-700">
          <li><i className="fas fa-check-circle text-green-500 mr-2"></i>Be specific and clear about what you want</li>
          <li><i className="fas fa-check-circle text-green-500 mr-2"></i>Provide context and examples when helpful</li>
          <li><i className="fas fa-check-circle text-green-500 mr-2"></i>Specify the format you want for the output</li>
          <li><i className="fas fa-check-circle text-green-500 mr-2"></i>Iterate and refine based on results</li>
        </ul>
      </div>
    </div>
  );
};

export default PromptPlayground;
