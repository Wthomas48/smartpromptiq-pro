import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import PromptCard from "@/components/PromptCard";
import TokenBalance from "@/components/TokenBalance";
import UsageTracker from "@/components/UsageTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Star, BarChart, Clock, Search } from "lucide-react";

// Mock data for development
const mockStats = {
  totalPrompts: 12,
  favorites: 5,
  usesThisMonth: 47
};

const mockPrompts = [
  {
    id: 1,
    title: "Business Plan Generator",
    description: "Create comprehensive business plans with market analysis and financial projections",
    category: "business",
    isFavorite: true,
    createdAt: new Date().toISOString(),
    content: "Generate a detailed business plan for..."
  },
  {
    id: 2,
    title: "Creative Writing Prompt",
    description: "Generate engaging story prompts for creative writing projects",
    category: "creative",
    isFavorite: false,
    createdAt: new Date().toISOString(),
    content: "Write a compelling story about..."
  },
  {
    id: 3,
    title: "Technical Documentation",
    description: "Create clear and comprehensive technical documentation",
    category: "technical",
    isFavorite: true,
    createdAt: new Date().toISOString(),
    content: "Document the following technical process..."
  }
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    favorites: false
  });

  // Mock queries for development - replace with real API calls later
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => mockStats,
  });

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ["/api/prompts", filters],
    queryFn: async () => {
      // Filter mock data based on filters
      let filtered = [...mockPrompts];
      
      if (filters.category && filters.category !== "all") {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      
      if (filters.search) {
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.favorites) {
        filtered = filtered.filter(p => p.isFavorite);
      }
      
      return filtered;
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (promptId: number) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Updated",
        description: "Favorite status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (promptId: number) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Deleted",
        description: "Prompt deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete prompt",
        variant: "destructive",
      });
    }
  });

  const handleToggleFavorite = (promptId: number) => {
    toggleFavoriteMutation.mutate(promptId);
  };

  const handleDelete = (promptId: number) => {
    if (window.confirm("Are you sure you want to delete this prompt?")) {
      deleteMutation.mutate(promptId);
    }
  };

  const handleCreateNew = () => {
    setLocation("/categories");
  };

  const statsCards = [
    {
      icon: FileText,
      title: "Total Prompts",
      value: stats?.totalPrompts ?? 0,
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      icon: Star,
      title: "Favorites",
      value: stats?.favorites ?? 0,
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      icon: BarChart,
      title: "Uses This Month",
      value: stats?.usesThisMonth ?? 0,
      color: "bg-violet-100 text-violet-600"
    },
    {
      icon: Clock,
      title: "Time Saved",
      value: "2.4h",
      color: "bg-cyan-100 text-cyan-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Your Prompt Library</h2>
              <p className="text-slate-600">Manage and organize your generated prompts</p>
            </div>
            <Button 
              onClick={handleCreateNew}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              <Plus className="mr-2" size={16} />
              New Prompt
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {statsCards.map((stat, index) => (
              <Card key={index} className="shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className="text-slate-600 text-sm">{stat.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Token Balance and Usage Tracking */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <TokenBalance />
            <UsageTracker />
          </div>

          {/* Filter Bar */}
          <Card className="shadow-sm border border-slate-200 mb-8">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    value={filters.category} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant={filters.favorites ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, favorites: !prev.favorites }))}
                  >
                    <Star className="mr-2" size={16} />
                    Favorites
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    type="text"
                    placeholder="Search prompts..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompts Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <div className="text-slate-600">Loading your prompts...</div>
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-slate-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No prompts found</h3>
              <p className="text-slate-600 mb-6">
                {filters.search || filters.category || filters.favorites
                  ? "Try adjusting your filters or search terms."
                  : "Create your first AI-powered prompt to get started."
                }
              </p>
              <Button onClick={handleCreateNew} className="bg-indigo-500 hover:bg-indigo-600">
                <Plus className="mr-2" size={16} />
                Create Your First Prompt
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prompts.map((prompt: any) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {prompts.length >= 12 && (
                <div className="text-center mt-12">
                  <Button variant="outline" className="border-slate-300 hover:border-indigo-500 text-slate-600 hover:text-indigo-500">
                    Load More Prompts
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}