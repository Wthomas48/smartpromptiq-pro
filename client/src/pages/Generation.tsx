import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Copy, Save, Plus, Loader2 } from "lucide-react";
import PromptCustomizer from "@/components/PromptCustomizer";
import PromptRefinement from "@/components/PromptRefinement";
import QuickSuggestions from "@/components/QuickSuggestions";
import { PDFExport } from "@/components/PDFExport";

export default function Generation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [customization, setCustomization] = useState({
    tone: "professional",
    detailLevel: "comprehensive",
    format: "structured"
  });
  const [promptTitle, setPromptTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("business");
  const [directMode, setDirectMode] = useState(false);

  // Get questionnaire data from session storage
  const questionnaireData = JSON.parse(sessionStorage.getItem('questionnaire') || '{}');

  useEffect(() => {
    console.log('Generation page useEffect - questionnaireData:', questionnaireData);

    // Handle both questionnaire flow and template flow
    const isTemplateFlow = questionnaireData.isTemplate && questionnaireData.templateData;
    const isQuestionnaireFlow = questionnaireData.category && questionnaireData.responses;

    console.log('isTemplateFlow:', isTemplateFlow);
    console.log('isQuestionnaireFlow:', isQuestionnaireFlow);

    if (!isTemplateFlow && !isQuestionnaireFlow) {
      console.log('No template or questionnaire data found, enabling direct generation mode');
      setDirectMode(true);
      setPromptTitle("Direct Generation");
      return;
    }

    // If it's a template, pre-populate the content
    if (isTemplateFlow) {
      console.log('Template flow detected, setting content:', questionnaireData.templateData);
      setGeneratedContent(questionnaireData.templateData.previewPrompt);
      setPromptTitle(questionnaireData.templateData.name);
    }
  }, [questionnaireData, setLocation]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      // For templates, don't regenerate - just use existing content
      if (questionnaireData.isTemplate && questionnaireData.templateData) {
        return { prompt: questionnaireData.templateData.previewPrompt };
      }

      const response = await apiRequest("POST", "/api/demo-generate-prompt", {
        category: directMode ? selectedCategory : (questionnaireData.category || "business"),
        answers: directMode ? {} : (questionnaireData.responses || {}),
        customization
      });
      const result = await response.json();
      return result.data || result; // Handle both new and old response formats
    },
    onSuccess: (data) => {
      setGeneratedContent(data.prompt);
      
      // Set title based on mode
      if (questionnaireData.isTemplate && questionnaireData.templateData) {
        setPromptTitle(questionnaireData.templateData.name);
      } else if (directMode) {
        setPromptTitle(`${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Prompt`);
      } else {
        const category = questionnaireData.category || "business";
        setPromptTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} Strategy Prompt`);
      }
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Determine category for saving based on mode
      const category = directMode
        ? selectedCategory
        : (questionnaireData.isTemplate && questionnaireData.templateData
          ? questionnaireData.templateData.category || questionnaireData.category
          : questionnaireData.category);

      const response = await apiRequest("POST", "/api/prompts", {
        title: promptTitle,
        content: generatedContent,
        category: category,
        questionnaire: questionnaireData.responses || {},
        customization: customization,
        isFavorite: false,
        templateId: questionnaireData.templateId || null
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Prompt Saved",
        description: "Your prompt has been saved to your dashboard",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    });
  };

  const handleSave = () => {
    if (!promptTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your prompt",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate();
  };

  const handleCreateAnother = () => {
    sessionStorage.removeItem('questionnaire');
    setLocation("/categories");
  };

  if (!questionnaireData.category && !directMode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton />
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-white text-2xl" size={32} />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              {generateMutation.isPending ? "Generating Your Custom Prompt" : "Your Generated Prompt"}
            </h2>
            <p className="text-xl text-slate-600">
              {generateMutation.isPending 
                ? "Our AI is analyzing your responses to create the perfect prompt..."
                : "Review and customize your AI-generated prompt below"
              }
            </p>
          </div>

          {generateMutation.isPending ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-2 text-indigo-600 text-lg font-medium">
                <Loader2 className="animate-spin" size={24} />
                <span>Processing...</span>
              </div>
              <div className="mt-6 max-w-2xl mx-auto">
                <div className="bg-slate-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : generatedContent ? (
            <div>
              {/* Generated Result */}
              <Card className="bg-slate-900 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={promptTitle}
                      onChange={(e) => setPromptTitle(e.target.value)}
                      className="bg-transparent text-white font-semibold text-lg border-none outline-none flex-1"
                      placeholder="Enter prompt title..."
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="text-slate-400 hover:text-white"
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="min-h-[400px] bg-slate-800 border-slate-700 text-green-400 font-mono text-sm leading-relaxed resize-none"
                  />
                </CardContent>
              </Card>

              {/* AI Refinement Panel */}
              <PromptRefinement
                currentPrompt={generatedContent}
                onPromptUpdate={setGeneratedContent}
                category={directMode ? selectedCategory : questionnaireData.category}
                originalAnswers={directMode ? {} : questionnaireData.responses}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={16} />
                      Save to Dashboard
                    </>
                  )}
                </Button>
                <div className="flex items-center space-x-2">
                  <PDFExport
                    content={{
                      title: promptTitle || "Generated Prompt",
                      content: generatedContent,
                      category: directMode ? selectedCategory : (questionnaireData.category || "Business"),
                      metadata: {
                        generatedAt: new Date().toISOString(),
                        templateType: directMode ? selectedCategory : (questionnaireData.isTemplate ? questionnaireData.templateData?.name : questionnaireData.category),
                        userEmail: 'user@smartpromptiq.com'
                      }
                    }}
                    size="sm"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCreateAnother}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="mr-2" size={16} />
                    Create Another
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/dashboard")}
                    className="w-full sm:w-auto"
                  >
                    View Dashboard
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Customization Panel */}
              <div className="lg:col-span-1">
                <PromptCustomizer 
                  customization={customization}
                  onChange={setCustomization}
                />
              </div>
              
              {/* Generation Panel */}
              <div className="lg:col-span-1">
                <Card className="generation-card">
                  <CardContent className="p-6">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mx-auto">
                        <Sparkles className="text-indigo-600" size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          Ready to Generate
                        </h3>
                        <p className="text-slate-600 mb-6">
                          {directMode
                            ? "Choose a category and click below to generate an AI prompt with default settings."
                            : "Click below to create your customized AI prompt based on your questionnaire responses and preferences."
                          }
                        </p>
                        {directMode && (
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Select Category
                            </label>
                            <select
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="business">Business Strategy</option>
                              <option value="marketing">Marketing & Growth</option>
                              <option value="product">Product Development</option>
                              <option value="education">Education & Training</option>
                              <option value="personal">Personal Development</option>
                            </select>
                          </div>
                        )}
                      </div>
                    <Button
                      onClick={() => generateMutation.mutate()}
                      disabled={generateMutation.isPending}
                      size="lg"
                      className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={20} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2" size={20} />
                          Generate AI Prompt
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </div>
              
              {/* AI Suggestions Panel */}
              <div className="lg:col-span-1">
                <QuickSuggestions 
                  category={questionnaireData.category}
                  maxSuggestions={6}
                  onSelectSuggestion={(suggestion) => {
                    setGeneratedContent(suggestion.prompt);
                    setPromptTitle(suggestion.title);
                  }}
                  compact={true}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}