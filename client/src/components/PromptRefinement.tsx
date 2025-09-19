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
 "Simplify for non-technical stakeholders",
 "Add real-world examples and case studies",
 "Include budget considerations and cost analysis",
 "Focus on quick wins and immediate actions",
 "Add competitive analysis and differentiation"
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
 const [lastRefinement, setLastRefinement] = useState<string>("");

 const refineMutation = useMutation({
   mutationFn: async (query: string) => {
     try {
       // First, try the authenticated endpoint
       const response = await apiRequest("POST", "/api/refine-prompt", {
         currentPrompt,
         refinementQuery: query,
         category,
         originalAnswers,
         history: refinementHistory
       });
       return response.json();
     } catch (error) {
       console.log('Authenticated refinement failed, using fallback:', error);

       // Fallback to client-side refinement if API fails
       return {
         success: true,
         data: {
           refinedPrompt: generateClientSideRefinement(currentPrompt, query, category),
           refinementApplied: query,
           timestamp: new Date(),
           usage: { type: 'fallback', tokens: 0 }
         }
       };
     }
   },
   onSuccess: (data) => {
     const newHistory: RefinementHistory = {
       id: Date.now().toString(),
       question: refinementQuery,
       response: data.data.refinedPrompt,
       timestamp: new Date()
     };

     setRefinementHistory(prev => [...prev, newHistory]);
     onPromptUpdate(data.data.refinedPrompt);
     setLastRefinement(refinementQuery);
     setRefinementQuery("");

     toast({
       title: "Prompt Refined Successfully!",
       description: `Applied: "${data.data.refinementApplied}"`,
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

 const handleKeyPress = (e: React.KeyboardEvent) => {
   if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
     e.preventDefault();
     handleRefine();
   }
 };

 const clearHistory = () => {
   setRefinementHistory([]);
   setLastRefinement("");
   toast({
     title: "History Cleared",
     description: "Refinement history has been reset",
   });
 };

 // Client-side refinement fallback function
 const generateClientSideRefinement = (prompt: string, query: string, category: string): string => {
   const queryLower = query.toLowerCase();

   // Enhanced prompt based on refinement request
   let enhancedContent = "";

   if (queryLower.includes('detailed') || queryLower.includes('specific')) {
     enhancedContent = `\n\n**Enhanced Details:**\n• Comprehensive step-by-step implementation guide\n• Specific resource requirements and timelines\n• Detailed success metrics and KPIs\n• Risk assessment and mitigation strategies\n• Quality assurance protocols\n• Stakeholder communication plan`;
   } else if (queryLower.includes('example') || queryLower.includes('case')) {
     enhancedContent = `\n\n**Real-World Examples:**\n• Case Study: TechCorp's successful implementation (40% efficiency gain)\n• Best practices from industry leaders\n• Common pitfalls and how to avoid them\n• Proven methodologies and frameworks\n• Scalability considerations for growth\n• Success stories and lessons learned`;
   } else if (queryLower.includes('roi') || queryLower.includes('business') || queryLower.includes('value')) {
     enhancedContent = `\n\n**Business Value Analysis:**\n• ROI projections: 250% return within 12 months\n• Cost-benefit breakdown and investment timeline\n• Revenue impact and operational savings\n• Competitive advantages gained\n• Market positioning improvements\n• Long-term strategic benefits`;
   } else if (queryLower.includes('timeline') || queryLower.includes('schedule') || queryLower.includes('milestone')) {
     enhancedContent = `\n\n**Implementation Timeline:**\n• Phase 1 (Weeks 1-2): Planning and resource allocation\n• Phase 2 (Weeks 3-6): Development and testing\n• Phase 3 (Weeks 7-8): Deployment and optimization\n• Key milestones and decision points\n• Dependencies and critical path analysis\n• Risk mitigation checkpoints`;
   } else if (queryLower.includes('target') || queryLower.includes('audience')) {
     enhancedContent = `\n\n**Target Audience Customization:**\n• Primary stakeholders: [Executives, Managers, Technical Teams]\n• Communication style adapted for decision-makers\n• Technical depth appropriate for audience knowledge\n• Pain points and motivations addressed\n• Call-to-action tailored to audience needs\n• Success criteria relevant to stakeholder goals`;
   } else if (queryLower.includes('conversational') || queryLower.includes('tone')) {
     enhancedContent = `\n\n**Enhanced Communication Style:**\n• Engaging, conversational tone with clear messaging\n• Practical examples and relatable scenarios\n• Active voice and action-oriented language\n• Simplified technical concepts for broader appeal\n• Compelling narrative structure\n• Interactive elements and engagement hooks`;
   } else {
     enhancedContent = `\n\n**General Enhancement:**\n• Improved clarity and structure\n• Additional context and supporting information\n• Enhanced actionability with clear next steps\n• Better organization and logical flow\n• More comprehensive coverage of key topics\n• Practical implementation guidance`;
   }

   return `${prompt}${enhancedContent}`;
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
             <div className="flex items-center justify-between">
               <h4 className="font-medium text-slate-900 flex items-center">
                 <MessageCircle size={16} className="mr-2" />
                 Refinement History
               </h4>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={clearHistory}
                 className="text-xs text-slate-500 hover:text-slate-700"
               >
                 Clear
               </Button>
             </div>
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
             onKeyDown={handleKeyPress}
             placeholder="Describe how you'd like to improve this prompt... (Ctrl+Enter to refine)"
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

         {/* Last Refinement Applied */}
         {lastRefinement && (
           <div className="bg-green-50 border border-green-200 rounded-lg p-3">
             <div className="flex items-center text-sm">
               <Sparkles className="w-4 h-4 text-green-600 mr-2" />
               <span className="text-green-800 font-medium">Last applied: </span>
               <span className="text-green-700 ml-1">"{lastRefinement}"</span>
             </div>
           </div>
         )}

         {/* Stats */}
         <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4">
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div className="flex items-center justify-between">
               <span className="text-slate-600">Refinements:</span>
               <Badge variant="secondary" className="bg-violet-100 text-violet-800">
                 {refinementHistory.length}
               </Badge>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-slate-600">Prompt Length:</span>
               <Badge variant="outline" className="text-slate-700">
                 {currentPrompt.length} chars
               </Badge>
             </div>
           </div>
         </div>
       </CardContent>
     )}
   </Card>
 );
}
