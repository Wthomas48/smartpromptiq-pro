import { useState } from 'react';
import { Save, Search, Star, Copy } from 'lucide-react';

export default function Library() {
  const [searchTerm, setSearchTerm] = useState('');
  const [prompts] = useState([
    {
      id: 1,
      title: "Content Writing Assistant",
      category: "Writing",
      prompt: "Create engaging blog content about...",
      tags: ["blog", "content", "seo"],
      favorite: true
    },
    {
      id: 2,
      title: "Code Review Helper",
      category: "Development", 
      prompt: "Review this code for best practices...",
      tags: ["code", "review", "development"],
      favorite: false
    },
    {
      id: 3,
      title: "Data Analysis Guide",
      category: "Analytics",
      prompt: "Analyze this dataset and provide insights...",
      tags: ["data", "analysis", "insights"],
      favorite: true
    }
  ]);

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    alert('Prompt copied to clipboard!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Save className="text-amber-600" size={32} />
        <h2 className="text-3xl font-bold text-slate-900">Prompt Library</h2>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search prompts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Prompts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-900">{prompt.title}</h3>
              <button className={`${prompt.favorite ? 'text-yellow-500' : 'text-slate-300'}`}>
                <Star size={20} fill={prompt.favorite ? 'currentColor' : 'none'} />
              </button>
            </div>
            
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-3">
              {prompt.category}
            </span>
            
            <p className="text-slate-600 mb-4 line-clamp-3">{prompt.prompt}</p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {prompt.tags.map((tag) => (
                <span key={tag} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
            
            <button 
              onClick={() => copyPrompt(prompt.prompt)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Copy size={16} />
              Copy Prompt
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
