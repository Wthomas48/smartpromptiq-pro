export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  prompts: number;
}

export const categories: Category[] = [
  {
    id: "marketing",
    name: "Marketing",
    description: "Create compelling marketing content and campaigns",
    icon: "📢",
    color: "bg-purple-500",
    prompts: 15
  },
  {
    id: "product",
    name: "Product Development",
    description: "Generate product ideas and feature descriptions",
    icon: "🚀",
    color: "bg-blue-500",
    prompts: 12
  },
  {
    id: "content",
    name: "Content Creation",
    description: "Write engaging blog posts, articles, and social media content",
    icon: "✍️",
    color: "bg-green-500",
    prompts: 20
  },
  {
    id: "sales",
    name: "Sales",
    description: "Craft persuasive sales copy and email templates",
    icon: "💼",
    color: "bg-orange-500",
    prompts: 18
  },
  {
    id: "education",
    name: "Education",
    description: "Create educational materials and course content",
    icon: "🎓",
    color: "bg-indigo-500",
    prompts: 10
  },
  {
    id: "creative",
    name: "Creative Writing",
    description: "Generate stories, scripts, and creative content",
    icon: "🎨",
    color: "bg-pink-500",
    prompts: 25
  }
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find(cat => cat.id === id);
}
