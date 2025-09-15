import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Play, 
  Settings, 
  Palette, 
  Sparkles, 
  Brain, 
  Target, 
  Users, 
  Lightbulb,
  Wand2,
  ChevronUp,
  ChevronDown,
  Copy,
  Eye,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  Star
} from "lucide-react";

interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface Question {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  type: 'single' | 'multiple' | 'scale' | 'text' | 'rating';
  options?: QuestionOption[];
  minOptions?: number;
  maxOptions?: number;
  required: boolean;
  order: number;
}

interface CustomQuestionnaireData {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  questions: Question[];
  settings: {
    allowBack: boolean;
    showProgress: boolean;
    randomizeOptions: boolean;
    theme: string;
  };
  createdAt: string;
  updatedAt: string;
}

const questionTypeOptions = [
  { value: 'single', label: 'Single Choice', description: 'Choose one option', icon: '◯' },
  { value: 'multiple', label: 'Multiple Choice', description: 'Choose multiple options', icon: '☑️' },
  { value: 'scale', label: 'Scale Rating', description: '1-10 rating scale', icon: '📊' },
  { value: 'text', label: 'Text Input', description: 'Open text response', icon: '📝' },
  { value: 'rating', label: 'Star Rating', description: '5-star rating system', icon: '⭐' },
];

const categoryOptions = [
  { value: 'marketing', label: 'Marketing', icon: '📊', color: 'from-blue-500 to-cyan-500' },
  { value: 'product', label: 'Product', icon: '💻', color: 'from-purple-500 to-indigo-500' },
  { value: 'education', label: 'Education', icon: '🎓', color: 'from-green-500 to-emerald-500' },
  { value: 'finance', label: 'Finance', icon: '💰', color: 'from-yellow-500 to-orange-500' },
  { value: 'hr', label: 'HR & People', icon: '👥', color: 'from-pink-500 to-rose-500' },
  { value: 'custom', label: 'Custom', icon: '🎨', color: 'from-purple-600 to-pink-600' },
];

const themeOptions = [
  { value: 'modern', label: 'Modern', preview: 'bg-gradient-to-r from-blue-500 to-purple-600' },
  { value: 'elegant', label: 'Elegant', preview: 'bg-gradient-to-r from-gray-800 to-gray-900' },
  { value: 'vibrant', label: 'Vibrant', preview: 'bg-gradient-to-r from-pink-500 to-yellow-500' },
  { value: 'nature', label: 'Nature', preview: 'bg-gradient-to-r from-green-500 to-teal-600' },
];

const defaultQuestionnaire: CustomQuestionnaireData = {
  id: 'new',
  title: 'My Custom Questionnaire',
  description: 'Create an engaging questionnaire tailored to your needs',
  category: 'custom',
  icon: '🎨',
  color: 'from-purple-600 to-pink-600',
  questions: [],
  settings: {
    allowBack: true,
    showProgress: true,
    randomizeOptions: false,
    theme: 'modern',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function CustomQuestionnaire() {
  const [, setLocation] = useLocation();
  const [questionnaire, setQuestionnaire] = useState<CustomQuestionnaireData>(defaultQuestionnaire);
  const [currentTab, setCurrentTab] = useState('builder');
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    title: '',
    description: '',
    type: 'single',
    required: true,
    options: [
      { id: '1', label: 'Option 1', description: '' },
      { id: '2', label: 'Option 2', description: '' },
    ],
  });
  const { toast } = useToast();

  const generateQuestionId = () => `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generateOptionId = () => `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addQuestion = () => {
    const question: Question = {
      id: generateQuestionId(),
      title: newQuestion.title || 'New Question',
      subtitle: newQuestion.subtitle,
      description: newQuestion.description || 'Please provide your response',
      type: newQuestion.type || 'single',
      options: newQuestion.options || [],
      minOptions: newQuestion.minOptions,
      maxOptions: newQuestion.maxOptions,
      required: newQuestion.required ?? true,
      order: questionnaire.questions.length,
    };

    setQuestionnaire(prev => ({
      ...prev,
      questions: [...prev.questions, question],
      updatedAt: new Date().toISOString(),
    }));

    setNewQuestion({
      title: '',
      description: '',
      type: 'single',
      required: true,
      options: [
        { id: '1', label: 'Option 1', description: '' },
        { id: '2', label: 'Option 2', description: '' },
      ],
    });

    toast({
      title: "Question Added! 🎉",
      description: "Your question has been successfully added to the questionnaire.",
    });
  };

  const deleteQuestion = (questionId: string) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
      updatedAt: new Date().toISOString(),
    }));

    toast({
      title: "Question Deleted",
      description: "The question has been removed from your questionnaire.",
    });
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    setQuestionnaire(prev => {
      const questions = [...prev.questions];
      const index = questions.findIndex(q => q.id === questionId);
      
      if (direction === 'up' && index > 0) {
        [questions[index], questions[index - 1]] = [questions[index - 1], questions[index]];
      } else if (direction === 'down' && index < questions.length - 1) {
        [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
      }

      questions.forEach((q, i) => q.order = i);

      return {
        ...prev,
        questions,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const addOption = (questionId?: string) => {
    const targetQuestion = questionId || 'new';
    const newOption: QuestionOption = {
      id: generateOptionId(),
      label: `Option ${((targetQuestion === 'new' ? newQuestion.options : questionnaire.questions.find(q => q.id === questionId)?.options) || []).length + 1}`,
      description: '',
    };

    if (targetQuestion === 'new') {
      setNewQuestion(prev => ({
        ...prev,
        options: [...(prev.options || []), newOption],
      }));
    } else {
      setQuestionnaire(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q.id === questionId 
            ? { ...q, options: [...(q.options || []), newOption] }
            : q
        ),
        updatedAt: new Date().toISOString(),
      }));
    }
  };

  const removeOption = (questionId: string | undefined, optionId: string) => {
    const targetQuestion = questionId || 'new';

    if (targetQuestion === 'new') {
      setNewQuestion(prev => ({
        ...prev,
        options: (prev.options || []).filter(opt => opt.id !== optionId),
      }));
    } else {
      setQuestionnaire(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q.id === questionId 
            ? { ...q, options: (q.options || []).filter(opt => opt.id !== optionId) }
            : q
        ),
        updatedAt: new Date().toISOString(),
      }));
    }
  };

  const previewQuestionnaire = () => {
    if (questionnaire.questions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please add at least one question before previewing.",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage for preview
    localStorage.setItem('preview_questionnaire', JSON.stringify(questionnaire));
    window.open('/questionnaire/preview', '_blank');
  };

  const saveQuestionnaire = () => {
    const saved = JSON.parse(localStorage.getItem('custom_questionnaires') || '[]');
    const updated = saved.filter((q: CustomQuestionnaireData) => q.id !== questionnaire.id);
    updated.push(questionnaire);
    
    localStorage.setItem('custom_questionnaires', JSON.stringify(updated));
    
    toast({
      title: "Questionnaire Saved! 💾",
      description: "Your custom questionnaire has been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-purple-200 mb-6">
            <Wand2 className="w-6 h-6 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Custom Questionnaire Builder
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Create Your Perfect Questionnaire
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Build engaging, interactive questionnaires with our advanced drag-and-drop builder. 
            Perfect for surveys, assessments, lead generation, and customer feedback.
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Builder Tab */}
          <TabsContent value="builder" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Question Builder */}
              <div className="lg:col-span-2 space-y-6">
                {/* Questionnaire Info */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <CardTitle className="text-xl">Questionnaire Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={questionnaire.title}
                          onChange={(e) => setQuestionnaire(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter questionnaire title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={questionnaire.category}
                          onValueChange={(value) => {
                            const category = categoryOptions.find(c => c.value === value);
                            setQuestionnaire(prev => ({ 
                              ...prev, 
                              category: value,
                              icon: category?.icon || '🎨',
                              color: category?.color || 'from-purple-600 to-pink-600',
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center gap-2">
                                  <span>{category.icon}</span>
                                  <span>{category.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={questionnaire.description}
                        onChange={(e) => setQuestionnaire(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this questionnaire is about"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Questions List */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <CardTitle className="text-xl">Questions ({questionnaire.questions.length})</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {questionnaire.questions.length} questions added
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {questionnaire.questions.length === 0 ? (
                      <div className="text-center py-12">
                        <Lightbulb className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg mb-2">No questions yet</p>
                        <p className="text-slate-400">Start building your questionnaire by adding questions using the form on the right.</p>
                      </div>
                    ) : (
                      questionnaire.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="group p-6 border border-slate-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/30 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {questionTypeOptions.find(t => t.value === question.type)?.icon} {questionTypeOptions.find(t => t.value === question.type)?.label}
                                </Badge>
                                {question.required && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-slate-900 mb-1">
                                {index + 1}. {question.title}
                              </h3>
                              <p className="text-slate-600 text-sm mb-3">{question.description}</p>
                              {question.options && question.options.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {question.options.map((option) => (
                                    <Badge key={option.id} variant="secondary" className="text-xs">
                                      {option.label}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveQuestion(question.id, 'up')}
                                disabled={index === 0}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveQuestion(question.id, 'down')}
                                disabled={index === questionnaire.questions.length - 1}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteQuestion(question.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Add Question Panel */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-xl sticky top-8">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-purple-600" />
                      <CardTitle className="text-lg text-purple-900">Add New Question</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="question-title">Question Title</Label>
                      <Input
                        id="question-title"
                        value={newQuestion.title || ''}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="What do you want to ask?"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="question-subtitle">Subtitle (Optional)</Label>
                      <Input
                        id="question-subtitle"
                        value={newQuestion.subtitle || ''}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="Additional context or guidance"
                      />
                    </div>

                    <div>
                      <Label htmlFor="question-description">Description</Label>
                      <Textarea
                        id="question-description"
                        value={newQuestion.description || ''}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Provide more details about this question"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="question-type">Question Type</Label>
                      <Select
                        value={newQuestion.type}
                        onValueChange={(value: any) => setNewQuestion(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypeOptions.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <span>{type.icon}</span>
                                <div>
                                  <div>{type.label}</div>
                                  <div className="text-xs text-slate-500">{type.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Options for choice questions */}
                    {(newQuestion.type === 'single' || newQuestion.type === 'multiple') && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label>Options</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addOption()}
                            className="text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Option
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(newQuestion.options || []).map((option, index) => (
                            <div key={option.id} className="flex gap-2">
                              <Input
                                value={option.label}
                                onChange={(e) => {
                                  setNewQuestion(prev => ({
                                    ...prev,
                                    options: (prev.options || []).map(opt => 
                                      opt.id === option.id ? { ...opt, label: e.target.value } : opt
                                    )
                                  }));
                                }}
                                placeholder={`Option ${index + 1}`}
                                className="text-sm"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeOption(undefined, option.id)}
                                disabled={(newQuestion.options || []).length <= 2}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Multiple choice limits */}
                    {newQuestion.type === 'multiple' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="min-options" className="text-xs">Min Options</Label>
                          <Input
                            id="min-options"
                            type="number"
                            min="1"
                            value={newQuestion.minOptions || 1}
                            onChange={(e) => setNewQuestion(prev => ({ ...prev, minOptions: parseInt(e.target.value) || 1 }))}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="max-options" className="text-xs">Max Options</Label>
                          <Input
                            id="max-options"
                            type="number"
                            min="1"
                            value={newQuestion.maxOptions || (newQuestion.options?.length || 2)}
                            onChange={(e) => setNewQuestion(prev => ({ ...prev, maxOptions: parseInt(e.target.value) || undefined }))}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="required"
                        checked={newQuestion.required}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, required: e.target.checked }))}
                        className="rounded border-slate-300"
                      />
                      <Label htmlFor="required" className="text-sm">Required question</Label>
                    </div>

                    <Button
                      onClick={addQuestion}
                      disabled={!newQuestion.title?.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={previewQuestionnaire}
                      variant="outline"
                      className="w-full justify-start"
                      disabled={questionnaire.questions.length === 0}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Questionnaire
                    </Button>
                    <Button
                      onClick={saveQuestionnaire}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Questionnaire
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share & Embed
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-600" />
                    Theme & Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Choose Theme</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {themeOptions.map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => setQuestionnaire(prev => ({
                            ...prev,
                            settings: { ...prev.settings, theme: theme.value }
                          }))}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            questionnaire.settings.theme === theme.value
                              ? 'border-purple-500 ring-2 ring-purple-200'
                              : 'border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          <div className={`w-full h-8 rounded-lg ${theme.preview} mb-2`}></div>
                          <div className="text-sm font-medium">{theme.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">Category & Icon</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {categoryOptions.map((category) => (
                        <button
                          key={category.value}
                          onClick={() => setQuestionnaire(prev => ({
                            ...prev,
                            category: category.value,
                            icon: category.icon,
                            color: category.color,
                          }))}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            questionnaire.category === category.value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{category.icon}</div>
                          <div className="text-xs font-medium">{category.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-100 rounded-xl p-6 min-h-[400px]">
                    <div className="text-center mb-6">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${questionnaire.color} text-white rounded-full mb-4`}>
                        <span className="text-lg">{questionnaire.icon}</span>
                        <span className="font-semibold">{categoryOptions.find(c => c.value === questionnaire.category)?.label}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{questionnaire.title}</h3>
                      <p className="text-slate-600">{questionnaire.description}</p>
                    </div>

                    {questionnaire.questions.length > 0 ? (
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="mb-4">
                          <Badge variant="secondary" className="mb-2">Question 1 of {questionnaire.questions.length}</Badge>
                          <h4 className="font-semibold text-lg">{questionnaire.questions[0].title}</h4>
                          <p className="text-slate-600 text-sm mt-1">{questionnaire.questions[0].description}</p>
                        </div>
                        
                        {questionnaire.questions[0].options && (
                          <div className="space-y-2">
                            {questionnaire.questions[0].options.slice(0, 3).map((option) => (
                              <div key={option.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                                <div className="w-4 h-4 border-2 border-slate-300 rounded-full"></div>
                                <span className="text-sm">{option.label}</span>
                              </div>
                            ))}
                            {questionnaire.questions[0].options.length > 3 && (
                              <div className="text-xs text-slate-500 text-center mt-2">
                                +{questionnaire.questions[0].options.length - 3} more options
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-slate-500">
                        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Add questions to see preview</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-600" />
                  Full Preview Mode
                </CardTitle>
                <p className="text-slate-600 mt-2">
                  See exactly how your questionnaire will appear to respondents
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Button
                    onClick={previewQuestionnaire}
                    size="lg"
                    disabled={questionnaire.questions.length === 0}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Launch Full Preview
                  </Button>
                </div>
                
                {questionnaire.questions.length === 0 && (
                  <div className="text-center mt-8 text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>Add at least one question to enable preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600" />
                    Questionnaire Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Allow Back Navigation</Label>
                        <p className="text-sm text-slate-500">Let users go back to previous questions</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={questionnaire.settings.allowBack}
                        onChange={(e) => setQuestionnaire(prev => ({
                          ...prev,
                          settings: { ...prev.settings, allowBack: e.target.checked }
                        }))}
                        className="rounded border-slate-300"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Show Progress Bar</Label>
                        <p className="text-sm text-slate-500">Display completion progress</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={questionnaire.settings.showProgress}
                        onChange={(e) => setQuestionnaire(prev => ({
                          ...prev,
                          settings: { ...prev.settings, showProgress: e.target.checked }
                        }))}
                        className="rounded border-slate-300"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Randomize Options</Label>
                        <p className="text-sm text-slate-500">Show options in random order</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={questionnaire.settings.randomizeOptions}
                        onChange={(e) => setQuestionnaire(prev => ({
                          ...prev,
                          settings: { ...prev.settings, randomizeOptions: e.target.checked }
                        }))}
                        className="rounded border-slate-300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-green-600" />
                    Sharing & Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Share Link
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export as JSON
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="w-4 h-4 mr-2" />
                    Embed Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 p-4">
          <div className="container mx-auto max-w-7xl flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {questionnaire.questions.length} questions
              </Badge>
              <span className="text-sm text-slate-500">
                Last saved: {new Date(questionnaire.updatedAt).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setLocation('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button
                onClick={saveQuestionnaire}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={previewQuestionnaire}
                disabled={questionnaire.questions.length === 0}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}