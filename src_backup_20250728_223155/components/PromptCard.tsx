import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, Copy, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Prompt } from "@shared/schema";

interface PromptCardProps {
  prompt: Prompt;
  onToggleFavorite: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function PromptCard({ prompt, onToggleFavorite, onDelete }: PromptCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    // You can add a toast notification here
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {prompt.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(prompt.id)}
            className={prompt.isFavorite ? "text-yellow-500" : "text-gray-400"}
          >
            <Star className={prompt.isFavorite ? "fill-current" : ""} size={18} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Badge variant="secondary" className="mb-3">
          {prompt.category}
        </Badge>
        <p className="text-gray-600 line-clamp-3">
          {prompt.description || prompt.content.substring(0, 150) + "..."}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy size={16} className="mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink size={16} className="mr-1" />
            View
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(prompt.id)}
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
}