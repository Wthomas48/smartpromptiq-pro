import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Wand2, Copy, Download, Save, Sparkles, Brain, 
  Plus, X, Eye, Settings, BookOpen, Zap,
  FileText, MessageSquare, Code, Briefcase
} from 'lucide-react';

interface Variable {
  id: string;
  name: string;
  placeholder: string;
  value: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  variables: string[];
  icon: any;
}

export default function PromptBuilder() {
  const [promptText, setPromptText] = useState('');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [promptTitle, setPromptTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'build' | 'templates' | 'variables'>('build');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sample templates
  const templates: Template[] = [
    {
      id: '1',
      name: 'Content Writer',
      category: 'Marketing',
      description: 'Create engaging content for any topic',
      content: 'Write a compelling {content_type} about {topic} for {audience}. The tone should be {tone} and include {key_points}. Make it {length} and ensure it {goal}.',
      variables: ['content_type', 'topic', 'audience', 'tone', 'key_points', 'length', 'goal'],
      icon: FileText
    },
    {
      id: '2', 
      name: 'Code Assistant',
      category: 'Development',
      description: 'Get help with coding tasks',
      content: 'Help me write {language} code that {functionality}. Please {requirements} and make sure to {best_practices}. Include comments and {additional_notes}.',
      variables: ['language', 'functionality', 'requirements', 'best_practices', 'additional_notes'],
      icon: Code
    },
    {
      id: '3',
      name: 'Business Analyst', 
      category: 'Business',
      description: 'Analyze business scenarios',
      content: 'Analyze the {business_situation} for {company_type}. Consider {factors} and provide {analysis_type}. Focus on {priorities} and suggest {recommendations}.',
      variables: ['business_situation', 'company_type', 'factors', 'analysis_type', 'priorities', 'recommendations'],
      icon: Briefcase
    },
    {
      id: '4',
      name: 'Creative Writer',
      category: 'Creative',
      description: 'Creative writing and storytelling',
      content: 'Write a creative {content_format} about {subject}. Set it in {setting} with {characters}. The mood should be {mood} and include elements of {genre}. Make it {style}.',
      variables: ['content_format', 'subject', 'setting', 'characters', 'mood', 'genre', 'style'],
      icon: BookOpen
    }
  ];

  // Extract variables from prompt text
  useEffect(() => {
    const variableMatches = promptText.match(/\{([^}]+)\}/g);
    if (variableMatches) {
      const newVariables = variableMatches
        .map(match => match.slice(1, -1))
        .filter((variable, index, self) => self.indexOf(variable) === index)
        .map(variable => ({
          id: variable,
          name: variable,
          placeholder: `Enter ${variable}...`,
          value: variables.find(v => v.name === variable)?.value || ''
        }));
      setVariables(newVariables);
    } else {
      setVariables([]);
    }
  }, [promptText]);

  const insertVariable = (variableName: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = promptText.substring(0, start);
      const after = promptText.substring(end);
      const newText = before + `{${variableName}}` + after;
      setPromptText(newText);
      
      // Focus back to textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableName.length + 2, start + variableName.length + 2);
      }, 0);
    }
  };

  const loadTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setPromptText(template.content);
    setPromptTitle(template.name);
    setActiveTab('build');
  };

  const updateVariableValue = (variableName: string, value: string) => {
    setVariables(prev => 
      prev.map(variable => 
        variable.name === variableName ? { ...variable, value } : variable
      )
    );
  };

  const getPreviewText = () => {
    let preview = promptText;
    variables.forEach(variable => {
      const value = variable.value || `[${variable.name}]`;
      preview = preview.replace(new RegExp(`\\{${variable.name}\\}`, 'g'), value);
    });
    return preview;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getPreviewText());
    // You could add a toast notification here
  };

  const savePrompt = () => {
    // Implementation for saving prompt
    console.log('Saving prompt:', {
      title: promptTitle,
      content: promptText,
      variables: variables
    });
  };

  const exportPrompt = () => {
    const promptData = {
      title: promptTitle,
      content: promptText,
      variables: variables,
      preview: getPreviewText(),
      created: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(promptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${promptTitle || 'prompt'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-10 h-10 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Smart Prompt Builder</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create powerful, dynamic AI prompts with variables, templates, and real-time preview
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab('build')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'build'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <Wand2 className="w-4 h-4 inline mr-2" />
              Build
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Templates
            </button>
            <button
              onClick={() => setActiveTab('variables')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'variables'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Variables ({variables.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'build' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Prompt Editor</CardTitle>
                      <CardDescription>
                        Write your prompt and use {`{variables}`} for dynamic content
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {showPreview ? 'Edit' : 'Preview'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      placeholder="Prompt title (optional)"
                      value={promptTitle}
                      onChange={(e) => setPromptTitle(e.target.value)}
                    />
                    
                    {showPreview ? (
                      <div className="min-h-[300px] p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {getPreviewText() || 'Your prompt preview will appear here...'}
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <textarea
                          ref={textareaRef}
                          value={promptText}
                          onChange={(e) => setPromptText(e.target.value)}
                          placeholder="Write your prompt here... Use {variable_name} for dynamic content.&#10;&#10;Example: Write a {content_type} about {topic} for {audience}..."
                          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                          {promptText.length} characters
                        </div>
                      </div>
                    )}

                    {/* Quick Variable Insertion */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-600">Quick insert:</span>
                      {['topic', 'audience', 'tone', 'goal', 'context'].map(variable => (
                        <button
                          key={variable}
                          onClick={() => insertVariable(variable)}
                          className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                        >
                          {`{${variable}}`}
                        </button>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button onClick={copyToClipboard} variant="outline">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button onClick={savePrompt} variant="outline">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={exportPrompt} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button className="ml-auto">
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Optimize
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Prompt Templates</CardTitle>
                    <CardDescription>
                      Choose from professionally crafted templates to get started quickly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {templates.map((template) => {
                        const IconComponent = template.icon;
                        return (
                          <div
                            key={template.id}
                            className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => loadTemplate(template)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center">
                                <IconComponent className="w-5 h-5 text-indigo-600 mr-2" />
                                <h4 className="font-medium text-gray-900">{template.name}</h4>
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {template.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {template.variables.slice(0, 3).map(variable => (
                                <span key={variable} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded">
                                  {`{${variable}}`}
                                </span>
                              ))}
                              {template.variables.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{template.variables.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'variables' && (
              <Card>
                <CardHeader>
                  <CardTitle>Variables</CardTitle>
                  <CardDescription>
                    Configure values for variables in your prompt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {variables.length === 0 ? (
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No variables detected</p>
                      <p className="text-sm text-gray-500">
                        Add variables to your prompt using {`{variable_name}`} syntax
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {variables.map((variable) => (
                        <div key={variable.id} className="flex items-center gap-4">
                          <div className="w-24">
                            <span className="text-sm font-medium text-gray-700">
                              {`{${variable.name}}`}
                            </span>
                          </div>
                          <div className="flex-1">
                            <Input
                              placeholder={variable.placeholder}
                              value={variable.value}
                              onChange={(e) => updateVariableValue(variable.name, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 Add more context about your target audience for better results
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✨ Consider adding a tone variable to make your prompt more flexible
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      🎯 Specify the desired output format for clearer instructions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Characters:</span>
                    <span className="text-sm font-medium">{promptText.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Words:</span>
                    <span className="text-sm font-medium">
                      {promptText.trim() ? promptText.trim().split(/\s+/).length : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Variables:</span>
                    <span className="text-sm font-medium">{variables.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estimated tokens:</span>
                    <span className="text-sm font-medium">
                      ~{Math.ceil(promptText.length / 4)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}