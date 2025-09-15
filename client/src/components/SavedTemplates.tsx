import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Star, Users, Globe, Lock, Search, Filter, Zap, Copy, Trash2 } from "lucide-react";

interface Template {
  id: number;
  title: string;
  description: string;
  category: string;
  content: string;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  createdBy: string;
  teamId?: number;
  createdAt: string;
}

interface SavedTemplatesProps {
  onUseTemplate: (template: Template) => void;
}

export default function SavedTemplates({ onUseTemplate }: SavedTemplatesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Fetch templates
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates", { search: searchQuery, category: categoryFilter !== "all" ? categoryFilter : undefined }],
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      category: string;
      content: string;
      tags: string[];
      isPublic: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/templates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setShowCreateTemplate(false);
      toast({
        title: "Template Saved",
        description: "Your template has been added to the library",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      await apiRequest("DELETE", `/api/templates/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template Deleted",
        description: "Template removed from library",
      });
    },
  });

  const filteredTemplates = templates.filter(template => 
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categoryColors = {
    business: "bg-blue-100 text-blue-800",
    creative: "bg-purple-100 text-purple-800",
    technical: "bg-green-100 text-green-800"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Saved Templates</h2>
          <p className="text-slate-600">Reuse and share your best prompt templates</p>
        </div>
        <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus size={16} className="mr-2" />
              Save Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean);
              createTemplateMutation.mutate({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                category: formData.get('category') as string,
                content: formData.get('content') as string,
                tags,
                isPublic: formData.get('isPublic') === 'on',
              });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input name="title" placeholder="Template title" required />
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea name="description" placeholder="Template description" />
              <Textarea name="content" placeholder="Template content" className="min-h-[200px]" required />
              <Input name="tags" placeholder="Tags (comma-separated)" />
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="isPublic" id="isPublic" />
                <label htmlFor="isPublic" className="text-sm text-slate-700">Make template public</label>
              </div>
              <Button type="submit" disabled={createTemplateMutation.isPending} className="w-full">
                {createTemplateMutation.isPending ? "Saving..." : "Save Template"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="creative">Creative</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="template-card hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{template.title}</CardTitle>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={categoryColors[template.category as keyof typeof categoryColors]} variant="secondary">
                      {template.category}
                    </Badge>
                    {template.isPublic ? (
                      <Badge variant="outline" className="text-xs">
                        <Globe size={10} className="mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <Lock size={10} className="mr-1" />
                        Private
                      </Badge>
                    )}
                    {template.teamId && (
                      <Badge variant="outline" className="text-xs">
                        <Users size={10} className="mr-1" />
                        Team
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                {template.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.tags.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>Used {template.usageCount} times</span>
                <span>{new Date(template.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => onUseTemplate(template)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                >
                  <Zap size={14} className="mr-2" />
                  Use Template
                </Button>
                <Button variant="outline" size="sm">
                  <Copy size={14} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteTemplateMutation.mutate(template.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Templates Found</h3>
              <p className="text-slate-600 mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Create your first template to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCreateTemplate(true)} variant="outline">
                  <Plus size={16} className="mr-2" />
                  Create Template
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge className={categoryColors[selectedTemplate.category as keyof typeof categoryColors]} variant="secondary">
                  {selectedTemplate.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedTemplate.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
              <p className="text-slate-600">{selectedTemplate.description}</p>
              <div className="bg-slate-50 rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap">{selectedTemplate.content}</pre>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  onUseTemplate(selectedTemplate);
                  setSelectedTemplate(null);
                }}>
                  Use Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}