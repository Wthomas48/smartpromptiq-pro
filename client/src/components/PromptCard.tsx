import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock Prompt type definition
interface Prompt {
  id: number;
  title: string;
  description?: string;
  content: string;
  category: string;
  isFavorite: boolean;
  createdAt: string;
  tags?: string[];
  status?: string;
  quality?: number;
}

interface PromptCardProps {
  prompt: Prompt;
  onToggleFavorite: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (prompt: Prompt) => void;
}

export default function PromptCard({ prompt, onToggleFavorite, onDelete, onView }: PromptCardProps) {
  const { toast } = useToast();

  // Safety check to prevent undefined errors
  if (!prompt) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content || '');
      toast({
        title: "Copied to clipboard! 📋",
        description: `"${prompt.title}" content copied successfully`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleView = () => {
    onView(prompt);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {prompt.title || 'Untitled Prompt'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {prompt.createdAt ? new Date(prompt.createdAt).toLocaleDateString() : 'No date'}
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
          <Button variant="outline" size="sm" onClick={handleView}>
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