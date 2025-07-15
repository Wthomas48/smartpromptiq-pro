import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tags: string[];
  gradient: string;
  badgeColor: string;
  onClick: () => void;
  isSelected?: boolean;
}

export default function CategoryCard({
  icon: Icon,
  title,
  description,
  tags,
  gradient,
  badgeColor,
  onClick,
  isSelected
}: CategoryCardProps) {
  return (
    <Card
      className={`category-card cursor-pointer transition-all duration-300 border-2 ${
        isSelected ? 'ring-2 ring-2 ring-indigo-500 border-indigo-300' : 'border-slate-200 hover:border-indigo-300'
      } ${gradient}`}
      onClick={onClick}
    >
      <CardContent className="p-8">
        <div className={`w-16 h-16 bg-gradient-to-br rounded-xl flex items-center justify-center mb-6`}>
          <Icon className="text-white text-2xl" size={32} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className={badgeColor}>
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}