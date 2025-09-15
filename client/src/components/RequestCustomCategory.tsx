import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Send, 
  Lightbulb, 
  Users, 
  Target, 
  TrendingUp,
  Building,
  Sparkles,
  Mail,
  Phone
} from "lucide-react";

interface RequestCustomCategoryProps {
  onRequestSubmitted?: () => void;
}

export default function RequestCustomCategory({ onRequestSubmitted }: RequestCustomCategoryProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    industryType: "",
    description: "",
    useCase: "",
    targetAudience: "",
    priority: "medium",
    companyName: "",
    email: "",
    phone: ""
  });

  const submitRequest = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/custom-categories/request", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted Successfully!",
        description: "We'll review your custom category request and get back to you within 24-48 hours.",
      });
      setIsOpen(false);
      setFormData({
        categoryName: "",
        industryType: "",
        description: "",
        useCase: "",
        targetAudience: "",
        priority: "medium",
        companyName: "",
        email: "",
        phone: ""
      });
      onRequestSubmitted?.();
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit custom category request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryName.trim() || !formData.description.trim() || !formData.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    submitRequest.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const industryTypes = [
    "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
    "Retail", "Real Estate", "Legal", "Consulting", "Non-profit",
    "Government", "Entertainment", "Agriculture", "Transportation", "Other"
  ];

  const priorityLevels = [
    { value: "low", label: "Low Priority", color: "bg-green-500" },
    { value: "medium", label: "Medium Priority", color: "bg-yellow-500" },
    { value: "high", label: "High Priority", color: "bg-orange-500" },
    { value: "urgent", label: "Urgent", color: "bg-red-500" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary transition-colors">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="mb-2 text-xl">Can't find what you're looking for?</CardTitle>
            <CardDescription className="mb-4 max-w-sm">
              Our AI can adapt to any industry or use case. Contact us for custom category development.
            </CardDescription>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Request Custom Category
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Request Custom Category
          </DialogTitle>
          <DialogDescription>
            Tell us about your specific needs and we'll create a custom AI category tailored to your industry and use case.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Category Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoryName" className="text-sm font-medium">
                  Category Name *
                </Label>
                <Input
                  id="categoryName"
                  placeholder="e.g., Legal Document Analysis"
                  value={formData.categoryName}
                  onChange={(e) => handleInputChange("categoryName", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="industryType" className="text-sm font-medium">
                  Industry Type
                </Label>
                <Select 
                  value={formData.industryType} 
                  onValueChange={(value) => handleInputChange("industryType", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryTypes.map((industry) => (
                      <SelectItem key={industry} value={industry.toLowerCase()}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Category Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what this category should help users accomplish..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="useCase" className="text-sm font-medium">
                Specific Use Case
              </Label>
              <Textarea
                id="useCase"
                placeholder="Provide specific examples of how this category would be used..."
                value={formData.useCase}
                onChange={(e) => handleInputChange("useCase", e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="targetAudience" className="text-sm font-medium">
                Target Audience
              </Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Legal professionals, Small business owners"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Priority Level</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityLevels.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${priority.color}`}></div>
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName" className="text-sm font-medium">
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  placeholder="Your company name"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number (Optional)
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              What You'll Get
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                <span>Custom AI prompts tailored to your industry</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                <span>Industry-specific questionnaires</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                <span>Dedicated category in your dashboard</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                <span>24-48 hour development turnaround</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitRequest.isPending}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {submitRequest.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}