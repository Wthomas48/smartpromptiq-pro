import { useState } from 'react';
import { SlidersHorizontal, Save } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    tone: 'professional',
    length: 'medium',
    complexity: 'intermediate',
    format: 'structured'
  });

  const handleSave = () => {
    // Save settings logic
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <SlidersHorizontal className="text-emerald-600" size={32} />
        <h2 className="text-3xl font-bold text-slate-900">Customization Settings</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tone
            </label>
            <select 
              value={settings.tone}
              onChange={(e) => setSettings({...settings, tone: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Length
            </label>
            <select 
              value={settings.length}
              onChange={(e) => setSettings({...settings, length: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
              <option value="detailed">Very Detailed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Complexity
            </label>
            <select 
              value={settings.complexity}
              onChange={(e) => setSettings({...settings, complexity: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Format
            </label>
            <select 
              value={settings.format}
              onChange={(e) => setSettings({...settings, format: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="structured">Structured</option>
              <option value="bullets">Bullet Points</option>
              <option value="paragraph">Paragraph</option>
              <option value="numbered">Numbered List</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          <Save size={20} />
          Save Settings
        </button>
      </div>
    </div>
  );
}
