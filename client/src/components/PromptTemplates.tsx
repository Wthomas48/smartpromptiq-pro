import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Palette, Code, Zap, Copy, Eye, Plus } from "lucide-react";
import { safeMap, ensureArray } from "@/utils/arrayUtils";

interface TemplateItem {
 id: string;
 title: string;
 description: string;
 category: string;
 tags: string[];
 preview: string;
 icon: any;
}

const templateLibrary: TemplateItem[] = [
 {
   id: "business-strategy",
   title: "Business Strategy Framework",
   description: "Comprehensive business planning and strategy development template",
   category: "business",
   tags: ["strategy", "planning", "analysis"],
   preview: "Create a strategic business plan including market analysis, competitive positioning, and growth roadmap...",
   icon: Briefcase
 },
 {
   id: "creative-brief",
   title: "Creative Campaign Brief",
   description: "Structured creative brief for marketing and design projects",
   category: "creative", 
   tags: ["design", "marketing", "campaign"],
   preview: "Develop a comprehensive creative brief outlining objectives, target audience, key messaging...",
   icon: Palette
 },
 {
   id: "technical-spec",
   title: "Technical Specification",
   description: "Detailed technical requirements and architecture documentation",
   category: "technical",
   tags: ["development", "architecture", "requirements"],
   preview: "Generate technical specifications including system architecture, data flow, and implementation details...",
   icon: Code
 }
];

interface PromptTemplatesProps {
 onSelectTemplate: (template: TemplateItem) => void;
 selectedCategory?: string;
}

export default function PromptTemplates({ onSelectTemplate, selectedCategory }: PromptTemplatesProps) {
 const filteredTemplates = selectedCategory 
   ? templateLibrary.filter(template => template.category === selectedCategory)
   : templateLibrary;

 const categoryColors = {
   business: "bg-blue-100 text-blue-800",
   creative: "bg-purple-100 text-purple-800", 
   technical: "bg-green-100 text-green-800"
 };

 return (
   <div className="space-y-6">
     <div className="text-center">
       <h3 className="text-xl font-semibold text-slate-900 mb-2">
         Choose a Template
       </h3>
       <p className="text-slate-600">
         Start with a proven template or create from scratch
       </p>
     </div>

     <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
       {safeMap(ensureArray(filteredTemplates), (template) => (
         <Card key={template.id} className="template-card hover:shadow-lg transition-all">
           <CardHeader className="pb-3">
             <div className="flex items-start justify-between">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-lg flex items-center justify-center">
                   <template.icon size={20} className="text-indigo-600" />
                 </div>
                 <div>
                   <CardTitle className="text-lg">{template.title}</CardTitle>
                   <Badge 
                     className={categoryColors[template.category as keyof typeof categoryColors]}
                     variant="secondary"
                   >
                     {template.category}
                   </Badge>
                 </div>
               </div>
             </div>
           </CardHeader>
           <CardContent className="pt-0">
             <p className="text-slate-600 text-sm mb-4">
               {template.description}
             </p>
             
             <div className="bg-slate-50 rounded-lg p-3 mb-4">
               <p className="text-xs text-slate-500 italic">
                 "{template.preview}..."
               </p>
             </div>

             <div className="flex flex-wrap gap-2 mb-4">
               {safeMap(ensureArray(template.tags), (tag) => (
                 <Badge key={tag} variant="outline" className="text-xs">
                   {tag}
                 </Badge>
               ))}
             </div>

             <div className="flex space-x-2">
               <Button
                 onClick={() => onSelectTemplate(template)}
                 className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                 size="sm"
               >
                 <Zap size={14} className="mr-2" />
                 Use Template
               </Button>
               <Button variant="outline" size="sm">
                 <Eye size={14} />
               </Button>
             </div>
           </CardContent>
         </Card>
       ))}
     </div>

     <div className="text-center pt-4">
       <Button variant="outline" className="w-full sm:w-auto">
         <Plus size={16} className="mr-2" />
         Create Custom Template
       </Button>
     </div>
   </div>
 );
}