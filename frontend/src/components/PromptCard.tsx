import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Prompt } from "@shared/schema";

interface PromptCardProps {
  prompt: Prompt;
  onToggleFavorite: (id: number) => void;
  onDelete: (id: number) => void;
}

const categoryColors = {
  business: "bg-blue-100 text-blue-800",
  creative: "bg-violet-100 text-violet-800", 
  technical: "bg-emerald-100 text-emerald-800"
};

export default function PromptCard({ prompt, onToggleFavorite, onDelete }: PromptCardProps) {
  const categoryColor = categoryColors[prompt.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800";

  return (
    <Card className="prompt-card hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge className={categoryColor}>
            {prompt.category.charAt(0).toUpperCase() + prompt.category.slice(1)}
          </Badge>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(prompt.id)}
              className={prompt.isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-slate-400 hover:text-yellow-500"}
            >
              <Star size={16} fill={prompt.isFavorite ? "currentColor" : "none"} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onDelete(prompt.id)} className="text-red-600">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{prompt.title}</h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {prompt.content.substring(0, 150)}...
        </p>
        
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            {prompt.createdAt ? new Date(prompt.createdAt).toLocaleDateString() : 'Unknown date'}
          </span>
          <span>Used {prompt.usageCount || 0} times</span>
        </div>
      </CardContent>
    </Card>
  );
}
