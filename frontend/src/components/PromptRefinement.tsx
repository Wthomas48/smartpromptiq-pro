import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Send, Loader2, MessageCircle, Sparkles } from "lucide-react";

interface RefinementHistory {
  id: string;
  question: string;
  response: string;
  timestamp: Date;
}

interface PromptRefinementProps {
  currentPrompt: string;
  onPromptUpdate: (newPrompt: string) => void;
  category: string;
  originalAnswers: Record<string, any>;
}

const suggestedRefinements = [
  "Make this more specific to my target audience",
  "Add more detailed implementation steps", 
  "Include potential challenges and solutions",
  "Emphasize ROI and business value",
  "Make the tone more conversational",
  "Add timeline and milestones",
  "Include success metrics and KPIs",
  "Simplify for non-technical stakeholders"
];

export default function PromptRefinement({ 
  currentPrompt, 
  onPromptUpdate, 
  category, 
  originalAnswers 
}: PromptRefinementProps) {
  const { toast } = useToast();
  const [refinementQuery, setRefinementQuery] = useState("");
  const [refinementHistory, setRefinementHistory] = useState<RefinementHistory[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const refineMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/refine-prompt", {
        currentPrompt,
        refinementQuery: query,
        category,
        originalAnswers,
        history: refinementHistory
      });
      return response.json();
    },
    onSuccess: (data) => {
      const newHistory: RefinementHistory = {
        id: Date.now().toString(),
        question: refinementQuery,
        response: data.refinedPrompt,
        timestamp: new Date()
      };
      
      setRefinementHistory(prev => [...prev, newHistory]);
      onPromptUpdate(data.refinedPrompt);
      setRefinementQuery("");
      
      toast({
        title: "Prompt Refined",
        description: "Your prompt has been updated based on your feedback",
      });
    },
    onError: (error) => {
      toast({
        title: "Refinement Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSuggestedRefinement = (suggestion: string) => {
    setRefinementQuery(suggestion);
  };

  const handleRefine = () => {
    if (!refinementQuery.trim()) return;
    refineMutation.mutate(refinementQuery);
  };

  return (
    <Card className="refinement-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Wand2 size={20} className="text-violet-600" />
            <span>AI Refinement</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Refinement History */}
          {refinementHistory.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 flex items-center">
                <MessageCircle size={16} className="mr-2" />
                Refinement History
              </h4>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {refinementHistory.map((item) => (
                  <div key={item.id} className="bg-slate-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-slate-700 mb-1">
                      "{item.question}"
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* Suggested Refinements */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Quick Refinements</h4>
            <div className="grid grid-cols-2 gap-2">
              {suggestedRefinements.slice(0, 6).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedRefinement(suggestion)}
                  className="text-left justify-start h-auto p-2 text-xs"
                >
                  <Sparkles size={12} className="mr-1 flex-shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Custom Refinement Input */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900">Custom Refinement</h4>
            <Textarea
              value={refinementQuery}
              onChange={(e) => setRefinementQuery(e.target.value)}
              placeholder="Describe how you'd like to improve this prompt..."
              className="min-h-[80px] resize-none"
            />
            <Button
              onClick={handleRefine}
              disabled={!refinementQuery.trim() || refineMutation.isPending}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {refineMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Refining...
                </>
              ) : (
                <>
                  <Send className="mr-2" size={16} />
                  Refine Prompt
                </>
              )}
            </Button>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Refinements Applied:</span>
              <Badge variant="secondary" className="bg-violet-100 text-violet-800">
                {refinementHistory.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}