import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
import { useToast } from "@/hooks/use-toast";
import { 
  Megaphone, 
  Search, 
  Target, 
  TrendingUp, 
  Hash, 
  MessageSquare,
  Lightbulb,
  Users,
  Calendar,
  DollarSign,
  BarChart3
} from "lucide-react";

interface MarketingCampaign {
  id: string;
  type: string;
  title: string;
  description: string;
  targetAudience: string;
  platforms: string[];
  goals: string[];
  content: string;
  metrics: string[];
  timeline: string;
  budget?: string;
}

export default function Marketing() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("social");
  const [generatedCampaign, setGeneratedCampaign] = useState<MarketingCampaign | null>(null);
  const [generatedResults, setGeneratedResults] = useState<any>(null);

  // Social Media Campaign Form
  const [socialForm, setSocialForm] = useState({
    brand: "",
    industry: "",
    targetAudience: "",
    platform: "",
    campaignGoal: "",
    budget: ""
  });

  // SEO Strategy Form
  const [seoForm, setSeoForm] = useState({
    website: "",
    industry: "",
    targetKeywords: "",
    competitorAnalysis: "",
    contentGoals: ""
  });

  // Brand Strategy Form
  const [brandForm, setBrandForm] = useState({
    companyName: "",
    industry: "",
    targetMarket: "",
    brandValues: "",
    competitivePositioning: "",
    brandPersonality: ""
  });

  // Quick Tools Forms
  const [contentForm, setContentForm] = useState({
    platform: "",
    industry: "",
    contentType: "",
    audience: "",
    trends: ""
  });

  const [keywordForm, setKeywordForm] = useState({
    website: "",
    industry: "",
    targetLocation: "",
    businessType: "",
    competitorKeywords: ""
  });

  const [messagingForm, setMessagingForm] = useState({
    brand: "",
    targetAudience: "",
    uniqueValueProposition: "",
    brandPersonality: "",
    competitorDifferentiation: ""
  });

  // Social Media Campaign Mutation
  const socialCampaignMutation = useMutation({
    mutationFn: async (data: typeof socialForm): Promise<MarketingCampaign> => {
      const response = await apiRequest("POST", "/api/marketing/social-campaign", data);
      return await response.json();
    },
    onSuccess: (data: MarketingCampaign) => {
      setGeneratedCampaign(data);
      toast({
        title: "Social Media Campaign Generated",
        description: "Your comprehensive campaign strategy is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate social media campaign",
        variant: "destructive",
      });
    },
  });

  // SEO Strategy Mutation
  const seoStrategyMutation = useMutation({
    mutationFn: async (data: typeof seoForm): Promise<MarketingCampaign> => {
      const payload = {
        ...data,
        targetKeywords: data.targetKeywords.split(',').map(k => k.trim()).filter(k => k)
      };
      const response = await apiRequest("POST", "/api/marketing/seo-strategy", payload);
      return await response.json();
    },
    onSuccess: (data: MarketingCampaign) => {
      setGeneratedCampaign(data);
      toast({
        title: "SEO Strategy Generated",
        description: "Your optimization roadmap is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate SEO strategy",
        variant: "destructive",
      });
    },
  });

  // Brand Strategy Mutation
  const brandStrategyMutation = useMutation({
    mutationFn: async (data: typeof brandForm): Promise<MarketingCampaign> => {
      const payload = {
        ...data,
        brandValues: data.brandValues.split(',').map(v => v.trim()).filter(v => v)
      };
      const response = await apiRequest("POST", "/api/marketing/brand-strategy", payload);
      return await response.json();
    },
    onSuccess: (data: MarketingCampaign) => {
      setGeneratedCampaign(data);
      toast({
        title: "Brand Strategy Generated",
        description: "Your brand development plan is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate brand strategy",
        variant: "destructive",
      });
    },
  });

  // Quick Tools Mutations
  const contentIdeasMutation = useMutation({
    mutationFn: async (data: typeof contentForm) => {
      const payload = {
        ...data,
        trends: data.trends.split(',').map(t => t.trim()).filter(t => t)
      };
      const response = await apiRequest("POST", "/api/marketing/content-ideas", payload);
      return await response.json();
    },
    onSuccess: (data: any) => {
      setGeneratedResults(data);
      toast({
        title: "Content Ideas Generated",
        description: `Generated ${data.ideas?.length || 0} content ideas for your campaign!`,
      });
    },
  });

  const keywordStrategyMutation = useMutation({
    mutationFn: async (data: typeof keywordForm) => {
      const payload = {
        ...data,
        competitorKeywords: data.competitorKeywords.split(',').map(k => k.trim()).filter(k => k)
      };
      const response = await apiRequest("POST", "/api/marketing/keyword-strategy", payload);
      return await response.json();
    },
    onSuccess: (data: any) => {
      setGeneratedResults(data);
      toast({
        title: "Keyword Strategy Generated",
        description: "Your SEO keyword roadmap is ready!",
      });
    },
  });

  const brandMessagingMutation = useMutation({
    mutationFn: async (data: typeof messagingForm) => {
      const response = await apiRequest("POST", "/api/marketing/brand-messaging", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      setGeneratedResults(data);
      toast({
        title: "Brand Messaging Generated",
        description: "Your brand messaging framework is ready!",
      });
    },
  });

  const handleSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    socialCampaignMutation.mutate(socialForm);
  };

  const handleSeoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    seoStrategyMutation.mutate(seoForm);
  };

  const handleBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    brandStrategyMutation.mutate(brandForm);
  };

  const platforms = [
    "Instagram", "Facebook", "LinkedIn", "Twitter", "TikTok", 
    "YouTube", "Pinterest", "Snapchat", "Reddit"
  ];

  const industries = [
    "Technology", "Healthcare", "Finance", "E-commerce", "Education",
    "Real Estate", "Food & Beverage", "Fashion", "Travel", "Fitness"
  ];

  const campaignGoals = [
    "Brand Awareness", "Lead Generation", "Sales Conversion", 
    "Engagement", "Traffic", "App Downloads", "Event Promotion"
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <BackButton />
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Marketing & Growth Strategies</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Generate AI-powered marketing campaigns, SEO strategies, and brand development plans 
          to accelerate your business growth and engagement.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Social Campaigns
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO Strategy
          </TabsTrigger>
          <TabsTrigger value="brand" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Brand Development
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Quick Tools
          </TabsTrigger>
        </TabsList>

        {/* Social Media Campaigns */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-blue-500" />
                  Social Media Campaign Generator
                </CardTitle>
                <CardDescription>
                  Create comprehensive social media strategies with AI-driven content ideas and growth tactics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSocialSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand">Brand Name</Label>
                      <Input
                        id="brand"
                        value={socialForm.brand}
                        onChange={(e) => setSocialForm({...socialForm, brand: e.target.value})}
                        placeholder="Your brand name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={socialForm.industry}
                        onValueChange={(value) => setSocialForm({...socialForm, industry: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      value={socialForm.targetAudience}
                      onChange={(e) => setSocialForm({...socialForm, targetAudience: e.target.value})}
                      placeholder="e.g., Young professionals aged 25-35"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="platform">Platform</Label>
                      <Select
                        value={socialForm.platform}
                        onValueChange={(value) => setSocialForm({...socialForm, platform: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map((platform) => (
                            <SelectItem key={platform} value={platform}>
                              {platform}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="campaignGoal">Campaign Goal</Label>
                      <Select
                        value={socialForm.campaignGoal}
                        onValueChange={(value) => setSocialForm({...socialForm, campaignGoal: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent>
                          {campaignGoals.map((goal) => (
                            <SelectItem key={goal} value={goal}>
                              {goal}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget Range</Label>
                    <Input
                      id="budget"
                      value={socialForm.budget}
                      onChange={(e) => setSocialForm({...socialForm, budget: e.target.value})}
                      placeholder="e.g., $1,000 - $5,000"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={socialCampaignMutation.isPending}
                  >
                    {socialCampaignMutation.isPending ? "Generating Campaign..." : "Generate Social Campaign"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Campaign Results */}
            {generatedCampaign && generatedCampaign.type === "social_media" && (
              <Card>
                <CardHeader>
                  <CardTitle>{generatedCampaign.title}</CardTitle>
                  <CardDescription>{generatedCampaign.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Target Audience</Label>
                      <p className="text-sm text-gray-600">{generatedCampaign.targetAudience}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Timeline</Label>
                      <p className="text-sm text-gray-600">{generatedCampaign.timeline}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Platforms</Label>
                    <div className="flex gap-2 mt-1">
                      {generatedCampaign.platforms.map((platform) => (
                        <Badge key={platform} variant="secondary">{platform}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Goals</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {generatedCampaign.goals.map((goal) => (
                        <Badge key={goal} variant="outline">{goal}</Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Campaign Strategy</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{generatedCampaign.content}</pre>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Key Metrics</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {generatedCampaign.metrics.map((metric) => (
                        <Badge key={metric} variant="outline" className="bg-blue-50">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* SEO Strategy */}
        <TabsContent value="seo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-green-500" />
                  SEO Strategy Generator
                </CardTitle>
                <CardDescription>
                  Generate comprehensive SEO strategies for improved search rankings and organic traffic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSeoSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      value={seoForm.website}
                      onChange={(e) => setSeoForm({...seoForm, website: e.target.value})}
                      placeholder="https://yourwebsite.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="seoIndustry">Industry</Label>
                    <Select
                      value={seoForm.industry}
                      onValueChange={(value) => setSeoForm({...seoForm, industry: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetKeywords">Target Keywords</Label>
                    <Input
                      id="targetKeywords"
                      value={seoForm.targetKeywords}
                      onChange={(e) => setSeoForm({...seoForm, targetKeywords: e.target.value})}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div>
                    <Label htmlFor="competitorAnalysis">Competitor Analysis</Label>
                    <Textarea
                      id="competitorAnalysis"
                      value={seoForm.competitorAnalysis}
                      onChange={(e) => setSeoForm({...seoForm, competitorAnalysis: e.target.value})}
                      placeholder="Describe your main competitors and their SEO strengths"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contentGoals">Content Goals</Label>
                    <Textarea
                      id="contentGoals"
                      value={seoForm.contentGoals}
                      onChange={(e) => setSeoForm({...seoForm, contentGoals: e.target.value})}
                      placeholder="What do you want to achieve with your content?"
                      rows={3}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={seoStrategyMutation.isPending}
                  >
                    {seoStrategyMutation.isPending ? "Generating Strategy..." : "Generate SEO Strategy"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* SEO Results */}
            {generatedCampaign && generatedCampaign.type === "seo" && (
              <Card>
                <CardHeader>
                  <CardTitle>{generatedCampaign.title}</CardTitle>
                  <CardDescription>{generatedCampaign.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Timeline</Label>
                      <p className="text-sm text-gray-600">{generatedCampaign.timeline}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Focus Areas</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {generatedCampaign.platforms.map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">{platform}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">SEO Goals</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {generatedCampaign.goals.map((goal) => (
                        <Badge key={goal} variant="outline">{goal}</Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">SEO Roadmap</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{generatedCampaign.content}</pre>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Success Metrics</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {generatedCampaign.metrics.map((metric) => (
                        <Badge key={metric} variant="outline" className="bg-green-50">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Brand Development */}
        <TabsContent value="brand" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Brand Strategy Generator
                </CardTitle>
                <CardDescription>
                  Develop comprehensive brand positioning, messaging, and audience targeting strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBrandSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={brandForm.companyName}
                      onChange={(e) => setBrandForm({...brandForm, companyName: e.target.value})}
                      placeholder="Your company name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brandIndustry">Industry</Label>
                      <Select
                        value={brandForm.industry}
                        onValueChange={(value) => setBrandForm({...brandForm, industry: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="targetMarket">Target Market</Label>
                      <Input
                        id="targetMarket"
                        value={brandForm.targetMarket}
                        onChange={(e) => setBrandForm({...brandForm, targetMarket: e.target.value})}
                        placeholder="e.g., Small businesses"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="brandValues">Brand Values</Label>
                    <Input
                      id="brandValues"
                      value={brandForm.brandValues}
                      onChange={(e) => setBrandForm({...brandForm, brandValues: e.target.value})}
                      placeholder="value1, value2, value3"
                    />
                  </div>

                  <div>
                    <Label htmlFor="competitivePositioning">Competitive Positioning</Label>
                    <Textarea
                      id="competitivePositioning"
                      value={brandForm.competitivePositioning}
                      onChange={(e) => setBrandForm({...brandForm, competitivePositioning: e.target.value})}
                      placeholder="How do you differentiate from competitors?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="brandPersonality">Brand Personality</Label>
                    <Input
                      id="brandPersonality"
                      value={brandForm.brandPersonality}
                      onChange={(e) => setBrandForm({...brandForm, brandPersonality: e.target.value})}
                      placeholder="e.g., Professional, innovative, approachable"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={brandStrategyMutation.isPending}
                  >
                    {brandStrategyMutation.isPending ? "Generating Strategy..." : "Generate Brand Strategy"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Brand Results */}
            {generatedCampaign && generatedCampaign.type === "brand_development" && (
              <Card>
                <CardHeader>
                  <CardTitle>{generatedCampaign.title}</CardTitle>
                  <CardDescription>{generatedCampaign.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Target Market</Label>
                      <p className="text-sm text-gray-600">{generatedCampaign.targetAudience}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Timeline</Label>
                      <p className="text-sm text-gray-600">{generatedCampaign.timeline}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Strategic Goals</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {generatedCampaign.goals.map((goal) => (
                        <Badge key={goal} variant="outline">{goal}</Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Brand Strategy</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{generatedCampaign.content}</pre>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Success Metrics</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {generatedCampaign.metrics.map((metric) => (
                        <Badge key={metric} variant="outline" className="bg-purple-50">
                          <Target className="h-3 w-3 mr-1" />
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Quick Tools */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Content Ideas Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  Content Ideas
                </CardTitle>
                <CardDescription>Generate engaging content ideas for social media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Platform</Label>
                  <Select
                    value={contentForm.platform}
                    onValueChange={(value) => setContentForm({...contentForm, platform: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Industry</Label>
                  <Select
                    value={contentForm.industry}
                    onValueChange={(value) => setContentForm({...contentForm, industry: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => contentIdeasMutation.mutate(contentForm)}
                  disabled={contentIdeasMutation.isPending || !contentForm.platform || !contentForm.industry}
                  className="w-full"
                >
                  Generate Ideas
                </Button>
              </CardContent>
            </Card>

            {/* Keyword Strategy Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Hash className="h-5 w-5 text-green-500" />
                  Keyword Research
                </CardTitle>
                <CardDescription>Generate keyword strategies for SEO optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Website</Label>
                  <Input
                    value={keywordForm.website}
                    onChange={(e) => setKeywordForm({...keywordForm, website: e.target.value})}
                    placeholder="yourwebsite.com"
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Select
                    value={keywordForm.industry}
                    onValueChange={(value) => setKeywordForm({...keywordForm, industry: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => keywordStrategyMutation.mutate(keywordForm)}
                  disabled={keywordStrategyMutation.isPending || !keywordForm.website || !keywordForm.industry}
                  className="w-full"
                >
                  Generate Keywords
                </Button>
              </CardContent>
            </Card>

            {/* Brand Messaging Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-purple-500" />
                  Brand Messaging
                </CardTitle>
                <CardDescription>Create compelling brand messages and taglines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Brand Name</Label>
                  <Input
                    value={messagingForm.brand}
                    onChange={(e) => setMessagingForm({...messagingForm, brand: e.target.value})}
                    placeholder="Your brand"
                  />
                </div>
                <div>
                  <Label>Target Audience</Label>
                  <Input
                    value={messagingForm.targetAudience}
                    onChange={(e) => setMessagingForm({...messagingForm, targetAudience: e.target.value})}
                    placeholder="Your audience"
                  />
                </div>
                <Button 
                  onClick={() => brandMessagingMutation.mutate(messagingForm)}
                  disabled={brandMessagingMutation.isPending || !messagingForm.brand || !messagingForm.targetAudience}
                  className="w-full"
                >
                  Generate Messaging
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Tools Results */}
          {generatedResults && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Results</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedResults.ideas && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Content Ideas</Label>
                    <div className="space-y-2">
                      {generatedResults.ideas.map((idea: string, index: number) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm">{idea}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedResults.primaryKeywords && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Primary Keywords</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {generatedResults.primaryKeywords.map((keyword: string, index: number) => (
                          <Badge key={index} variant="default">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Long-tail Keywords</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {generatedResults.longTailKeywords.map((keyword: string, index: number) => (
                          <Badge key={index} variant="outline">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {generatedResults.tagline && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Brand Tagline</Label>
                      <p className="text-lg font-semibold text-purple-600 mt-1">{generatedResults.tagline}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Elevator Pitch</Label>
                      <p className="text-sm text-gray-700 mt-1">{generatedResults.elevator_pitch}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Value Propositions</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {generatedResults.value_propositions.map((prop: string, index: number) => (
                          <Badge key={index} variant="secondary">{prop}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}