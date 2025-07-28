import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, Target, TrendingUp, Users, Clock, DollarSign } from "lucide-react";

interface ProductStrategy {
  id: string;
  type: "mvp_planning" | "ux_design" | "competitive_analysis";
  title: string;
  description: string;
  industry: string;
  targetMarket: string;
  features: string[];
  roadmap: string[];
  validationMethods: string[];
  timeline: string;
  budget?: string;
  risks: string[];
  recommendations: string[];
}

export default function ProductDevelopment() {
  const { toast } = useToast();
  const [generatedStrategy, setGeneratedStrategy] = useState<ProductStrategy | null>(null);
  const [activeTab, setActiveTab] = useState("mvp");

  // MVP Planning Form
  const [mvpForm, setMvpForm] = useState({
    productName: "",
    industry: "",
    targetAudience: "",
    problemStatement: "",
    coreFeatures: "",
    budget: "",
    timeline: ""
  });

  // UX Design Form
  const [uxForm, setUxForm] = useState({
    productType: "",
    userPersonas: "",
    businessGoals: "",
    platforms: "",
    designPrinciples: ""
  });

  // Competitive Analysis Form
  const [competitiveForm, setCompetitiveForm] = useState({
    industry: "",
    productCategory: "",
    competitors: "",
    marketSize: "",
    differentiationGoals: ""
  });

  // MVP Planning Mutation
  const mvpPlanningMutation = useMutation({
    mutationFn: async (data: typeof mvpForm): Promise<ProductStrategy> => {
      const payload = {
        ...data,
        coreFeatures: data.coreFeatures.split(',').map(f => f.trim()).filter(f => f)
      };
      const response = await apiRequest("POST", "/api/product/mvp-planning", payload);
      return await response.json();
    },
    onSuccess: (data: ProductStrategy) => {
      setGeneratedStrategy(data);
      toast({
        title: "MVP Strategy Generated",
        description: "Your comprehensive MVP planning strategy is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate MVP planning strategy",
        variant: "destructive",
      });
    },
  });

  // UX Design Mutation
  const uxDesignMutation = useMutation({
    mutationFn: async (data: typeof uxForm): Promise<ProductStrategy> => {
      const payload = {
        ...data,
        userPersonas: data.userPersonas.split(',').map(p => p.trim()).filter(p => p),
        businessGoals: data.businessGoals.split(',').map(g => g.trim()).filter(g => g),
        platforms: data.platforms.split(',').map(p => p.trim()).filter(p => p)
      };
      const response = await apiRequest("POST", "/api/product/ux-design", payload);
      return await response.json();
    },
    onSuccess: (data: ProductStrategy) => {
      setGeneratedStrategy(data);
      toast({
        title: "UX Strategy Generated",
        description: "Your user experience design strategy is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate UX design strategy",
        variant: "destructive",
      });
    },
  });

  // Competitive Analysis Mutation
  const competitiveMutation = useMutation({
    mutationFn: async (data: typeof competitiveForm): Promise<ProductStrategy> => {
      const payload = {
        ...data,
        competitors: data.competitors.split(',').map(c => c.trim()).filter(c => c),
        differentiationGoals: data.differentiationGoals.split(',').map(d => d.trim()).filter(d => d)
      };
      const response = await apiRequest("POST", "/api/product/competitive-analysis", payload);
      return await response.json();
    },
    onSuccess: (data: ProductStrategy) => {
      setGeneratedStrategy(data);
      toast({
        title: "Competitive Analysis Generated",
        description: "Your market intelligence report is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate competitive analysis",
        variant: "destructive",
      });
    },
  });

  const handleMvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mvpPlanningMutation.mutate(mvpForm);
  };

  const handleUxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uxDesignMutation.mutate(uxForm);
  };

  const handleCompetitiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    competitiveMutation.mutate(competitiveForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              <Lightbulb className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Product Development & Innovation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your ideas into market-ready products with AI-powered planning, UX design strategies, and competitive intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form Tabs */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mvp">MVP Planning</TabsTrigger>
                <TabsTrigger value="ux">UX Design</TabsTrigger>
                <TabsTrigger value="competitive">Competitive Analysis</TabsTrigger>
              </TabsList>

              {/* MVP Planning Tab */}
              <TabsContent value="mvp">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      MVP Planning Strategy
                    </CardTitle>
                    <CardDescription>
                      Define product features, roadmaps, and market validation strategies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleMvpSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="productName">Product Name</Label>
                        <Input
                          id="productName"
                          value={mvpForm.productName}
                          onChange={(e) => setMvpForm(prev => ({ ...prev, productName: e.target.value }))}
                          placeholder="Enter your product name"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="industry">Industry</Label>
                          <Select
                            value={mvpForm.industry}
                            onValueChange={(value) => setMvpForm(prev => ({ ...prev, industry: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="ecommerce">E-commerce</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="entertainment">Entertainment</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="timeline">Timeline</Label>
                          <Select
                            value={mvpForm.timeline}
                            onValueChange={(value) => setMvpForm(prev => ({ ...prev, timeline: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3-6 months">3-6 months</SelectItem>
                              <SelectItem value="6-12 months">6-12 months</SelectItem>
                              <SelectItem value="1-2 years">1-2 years</SelectItem>
                              <SelectItem value="2+ years">2+ years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="targetAudience">Target Audience</Label>
                        <Textarea
                          id="targetAudience"
                          value={mvpForm.targetAudience}
                          onChange={(e) => setMvpForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                          placeholder="Describe your target users and market"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="problemStatement">Problem Statement</Label>
                        <Textarea
                          id="problemStatement"
                          value={mvpForm.problemStatement}
                          onChange={(e) => setMvpForm(prev => ({ ...prev, problemStatement: e.target.value }))}
                          placeholder="What problem does your product solve?"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="coreFeatures">Core Features (comma-separated)</Label>
                        <Textarea
                          id="coreFeatures"
                          value={mvpForm.coreFeatures}
                          onChange={(e) => setMvpForm(prev => ({ ...prev, coreFeatures: e.target.value }))}
                          placeholder="user registration, payment processing, analytics dashboard"
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="budget">Budget Range</Label>
                        <Select
                          value={mvpForm.budget}
                          onValueChange={(value) => setMvpForm(prev => ({ ...prev, budget: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="$0-$10k">$0 - $10,000</SelectItem>
                            <SelectItem value="$10k-$50k">$10,000 - $50,000</SelectItem>
                            <SelectItem value="$50k-$100k">$50,000 - $100,000</SelectItem>
                            <SelectItem value="$100k-$500k">$100,000 - $500,000</SelectItem>
                            <SelectItem value="$500k+">$500,000+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={mvpPlanningMutation.isPending}
                      >
                        {mvpPlanningMutation.isPending ? "Generating MVP Strategy..." : "Generate MVP Strategy"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* UX Design Tab */}
              <TabsContent value="ux">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      UX Design Strategy
                    </CardTitle>
                    <CardDescription>
                      Generate prompts for wireframes, flows, and usability improvements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUxSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="productType">Product Type</Label>
                        <Input
                          id="productType"
                          value={uxForm.productType}
                          onChange={(e) => setUxForm(prev => ({ ...prev, productType: e.target.value }))}
                          placeholder="Web app, mobile app, SaaS platform, etc."
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="userPersonas">User Personas (comma-separated)</Label>
                        <Textarea
                          id="userPersonas"
                          value={uxForm.userPersonas}
                          onChange={(e) => setUxForm(prev => ({ ...prev, userPersonas: e.target.value }))}
                          placeholder="busy professionals, students, small business owners"
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="businessGoals">Business Goals (comma-separated)</Label>
                        <Textarea
                          id="businessGoals"
                          value={uxForm.businessGoals}
                          onChange={(e) => setUxForm(prev => ({ ...prev, businessGoals: e.target.value }))}
                          placeholder="increase user engagement, reduce support tickets, improve conversion rates"
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="platforms">Target Platforms (comma-separated)</Label>
                        <Input
                          id="platforms"
                          value={uxForm.platforms}
                          onChange={(e) => setUxForm(prev => ({ ...prev, platforms: e.target.value }))}
                          placeholder="iOS, Android, Web, Desktop"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="designPrinciples">Design Principles</Label>
                        <Textarea
                          id="designPrinciples"
                          value={uxForm.designPrinciples}
                          onChange={(e) => setUxForm(prev => ({ ...prev, designPrinciples: e.target.value }))}
                          placeholder="Describe your design philosophy and principles"
                          rows={3}
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={uxDesignMutation.isPending}
                      >
                        {uxDesignMutation.isPending ? "Generating UX Strategy..." : "Generate UX Strategy"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Competitive Analysis Tab */}
              <TabsContent value="competitive">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Competitive Analysis
                    </CardTitle>
                    <CardDescription>
                      AI-powered breakdowns of industry trends and differentiation strategies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCompetitiveSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="compIndustry">Industry</Label>
                          <Input
                            id="compIndustry"
                            value={competitiveForm.industry}
                            onChange={(e) => setCompetitiveForm(prev => ({ ...prev, industry: e.target.value }))}
                            placeholder="Technology, Healthcare, etc."
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="productCategory">Product Category</Label>
                          <Input
                            id="productCategory"
                            value={competitiveForm.productCategory}
                            onChange={(e) => setCompetitiveForm(prev => ({ ...prev, productCategory: e.target.value }))}
                            placeholder="CRM software, mobile apps, etc."
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="competitors">Key Competitors (comma-separated)</Label>
                        <Textarea
                          id="competitors"
                          value={competitiveForm.competitors}
                          onChange={(e) => setCompetitiveForm(prev => ({ ...prev, competitors: e.target.value }))}
                          placeholder="Competitor A, Competitor B, Competitor C"
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="marketSize">Market Size & Context</Label>
                        <Textarea
                          id="marketSize"
                          value={competitiveForm.marketSize}
                          onChange={(e) => setCompetitiveForm(prev => ({ ...prev, marketSize: e.target.value }))}
                          placeholder="Describe the market size, growth trends, and dynamics"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="differentiationGoals">Differentiation Goals (comma-separated)</Label>
                        <Textarea
                          id="differentiationGoals"
                          value={competitiveForm.differentiationGoals}
                          onChange={(e) => setCompetitiveForm(prev => ({ ...prev, differentiationGoals: e.target.value }))}
                          placeholder="better user experience, lower pricing, advanced features"
                          rows={2}
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={competitiveMutation.isPending}
                      >
                        {competitiveMutation.isPending ? "Generating Analysis..." : "Generate Competitive Analysis"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Generated Strategy */}
          <div className="space-y-6">
            {generatedStrategy ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {generatedStrategy.title}
                    <Badge variant="secondary" className="ml-2">
                      {generatedStrategy.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{generatedStrategy.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Strategy Overview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Industry</Badge>
                      <span className="text-sm">{generatedStrategy.industry}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{generatedStrategy.timeline}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Key Features/Opportunities */}
                  {generatedStrategy.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Key Features & Opportunities
                      </h4>
                      <div className="space-y-2">
                        {generatedStrategy.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Implementation Roadmap */}
                  {generatedStrategy.roadmap.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Implementation Roadmap
                      </h4>
                      <div className="space-y-2">
                        {generatedStrategy.roadmap.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Validation Methods */}
                  {generatedStrategy.validationMethods.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Validation & Testing Methods
                      </h4>
                      <div className="space-y-2">
                        {generatedStrategy.validationMethods.map((method, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{method}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {generatedStrategy.risks.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Risk Factors & Mitigation
                      </h4>
                      <div className="space-y-2">
                        {generatedStrategy.risks.map((risk, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {generatedStrategy.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Key Recommendations
                      </h4>
                      <div className="space-y-2">
                        {generatedStrategy.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Lightbulb className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    Generate Your Product Strategy
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Select a strategy type and fill out the form to generate comprehensive product development insights
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}