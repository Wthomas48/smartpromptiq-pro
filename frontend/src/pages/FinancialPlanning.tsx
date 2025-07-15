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
import { DollarSign, TrendingUp, Presentation, Calculator, Target, Users } from "lucide-react";

interface FinancialStrategy {
  id: string;
  type: "revenue_model" | "funding_strategy" | "pitch_deck" | "financial_projections";
  title: string;
  description: string;
  businessModel: string;
  targetMarket: string;
  projections: {
    revenue: string[];
    expenses: string[];
    profitability: string[];
  };
  fundingOptions: string[];
  pitchElements: string[];
  riskFactors: string[];
  recommendations: string[];
  timeline: string;
}

export default function FinancialPlanning() {
  const { toast } = useToast();
  const [generatedStrategy, setGeneratedStrategy] = useState<FinancialStrategy | null>(null);
  const [activeTab, setActiveTab] = useState("revenue");

  // Revenue Model Form
  const [revenueForm, setRevenueForm] = useState({
    businessType: "",
    industry: "",
    targetCustomers: "",
    pricePoints: "",
    scalabilityFactors: "",
    competitiveLandscape: ""
  });

  // Funding Strategy Form
  const [fundingForm, setFundingForm] = useState({
    businessStage: "",
    fundingAmount: "",
    useOfFunds: "",
    businessModel: "",
    traction: "",
    team: ""
  });

  // Pitch Deck Form
  const [pitchForm, setPitchForm] = useState({
    companyName: "",
    problemStatement: "",
    solution: "",
    marketSize: "",
    businessModel: "",
    traction: "",
    team: "",
    fundingAmount: ""
  });

  // Financial Projections Form
  const [projectionsForm, setProjectionsForm] = useState({
    businessType: "",
    industry: "",
    initialInvestment: "",
    revenueStreams: "",
    operatingExpenses: "",
    growthRate: "",
    timeHorizon: ""
  });

  // Revenue Model Mutation
  const revenueModelMutation = useMutation({
    mutationFn: async (data: typeof revenueForm): Promise<FinancialStrategy> => {
      const payload = {
        ...data,
        pricePoints: data.pricePoints.split(',').map(p => p.trim()).filter(p => p),
        scalabilityFactors: data.scalabilityFactors.split(',').map(s => s.trim()).filter(s => s)
      };
      const response = await apiRequest("POST", "/api/financial/revenue-model", payload);
      return await response.json();
    },
    onSuccess: (data: FinancialStrategy) => {
      setGeneratedStrategy(data);
      toast({
        title: "Revenue Model Generated",
        description: "Your comprehensive revenue strategy is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate revenue model",
        variant: "destructive",
      });
    },
  });

  // Funding Strategy Mutation
  const fundingStrategyMutation = useMutation({
    mutationFn: async (data: typeof fundingForm): Promise<FinancialStrategy> => {
      const payload = {
        ...data,
        useOfFunds: data.useOfFunds.split(',').map(u => u.trim()).filter(u => u),
        team: data.team.split(',').map(t => t.trim()).filter(t => t)
      };
      const response = await apiRequest("POST", "/api/financial/funding-strategy", payload);
      return await response.json();
    },
    onSuccess: (data: FinancialStrategy) => {
      setGeneratedStrategy(data);
      toast({
        title: "Funding Strategy Generated",
        description: "Your investment roadmap is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate funding strategy",
        variant: "destructive",
      });
    },
  });

  // Pitch Deck Mutation
  const pitchDeckMutation = useMutation({
    mutationFn: async (data: typeof pitchForm): Promise<FinancialStrategy> => {
      const response = await apiRequest("POST", "/api/financial/pitch-deck", data);
      return await response.json();
    },
    onSuccess: (data: FinancialStrategy) => {
      setGeneratedStrategy(data);
      toast({
        title: "Pitch Deck Strategy Generated",
        description: "Your investor presentation guide is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate pitch deck strategy",
        variant: "destructive",
      });
    },
  });

  // Financial Projections Mutation
  const projectionsMutation = useMutation({
    mutationFn: async (data: typeof projectionsForm): Promise<FinancialStrategy> => {
      const payload = {
        ...data,
        revenueStreams: data.revenueStreams.split(',').map(r => r.trim()).filter(r => r),
        operatingExpenses: data.operatingExpenses.split(',').map(o => o.trim()).filter(o => o)
      };
      const response = await apiRequest("POST", "/api/financial/projections", payload);
      return await response.json();
    },
    onSuccess: (data: FinancialStrategy) => {
      setGeneratedStrategy(data);
      toast({
        title: "Financial Projections Generated",
        description: "Your detailed financial model is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate financial projections",
        variant: "destructive",
      });
    },
  });

  const handleRevenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    revenueModelMutation.mutate(revenueForm);
  };

  const handleFundingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fundingStrategyMutation.mutate(fundingForm);
  };

  const handlePitchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pitchDeckMutation.mutate(pitchForm);
  };

  const handleProjectionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    projectionsMutation.mutate(projectionsForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-teal-900/20">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Financial & Investment Planning
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Build sustainable financial models, secure funding, and create compelling investor presentations with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form Tabs */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="revenue">Revenue Models</TabsTrigger>
                <TabsTrigger value="funding">Funding Strategy</TabsTrigger>
                <TabsTrigger value="pitch">Pitch Decks</TabsTrigger>
                <TabsTrigger value="projections">Projections</TabsTrigger>
              </TabsList>

              {/* Revenue Model Tab */}
              <TabsContent value="revenue">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Revenue Model Strategy
                    </CardTitle>
                    <CardDescription>
                      Create detailed financial projections and pricing strategies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRevenueSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="businessType">Business Type</Label>
                          <Select
                            value={revenueForm.businessType}
                            onValueChange={(value) => setRevenueForm(prev => ({ ...prev, businessType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="saas">SaaS Platform</SelectItem>
                              <SelectItem value="ecommerce">E-commerce</SelectItem>
                              <SelectItem value="marketplace">Marketplace</SelectItem>
                              <SelectItem value="subscription">Subscription Service</SelectItem>
                              <SelectItem value="consulting">Consulting</SelectItem>
                              <SelectItem value="mobile-app">Mobile App</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="revIndustry">Industry</Label>
                          <Input
                            id="revIndustry"
                            value={revenueForm.industry}
                            onChange={(e) => setRevenueForm(prev => ({ ...prev, industry: e.target.value }))}
                            placeholder="Technology, Healthcare, etc."
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="targetCustomers">Target Customers</Label>
                        <Textarea
                          id="targetCustomers"
                          value={revenueForm.targetCustomers}
                          onChange={(e) => setRevenueForm(prev => ({ ...prev, targetCustomers: e.target.value }))}
                          placeholder="Describe your ideal customer segments and market"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="pricePoints">Price Points (comma-separated)</Label>
                        <Input
                          id="pricePoints"
                          value={revenueForm.pricePoints}
                          onChange={(e) => setRevenueForm(prev => ({ ...prev, pricePoints: e.target.value }))}
                          placeholder="$9.99/month, $99/year, $299 one-time"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="scalabilityFactors">Scalability Factors (comma-separated)</Label>
                        <Textarea
                          id="scalabilityFactors"
                          value={revenueForm.scalabilityFactors}
                          onChange={(e) => setRevenueForm(prev => ({ ...prev, scalabilityFactors: e.target.value }))}
                          placeholder="viral growth, network effects, automation, partnerships"
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="competitiveLandscape">Competitive Landscape</Label>
                        <Textarea
                          id="competitiveLandscape"
                          value={revenueForm.competitiveLandscape}
                          onChange={(e) => setRevenueForm(prev => ({ ...prev, competitiveLandscape: e.target.value }))}
                          placeholder="Describe key competitors and market dynamics"
                          rows={3}
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={revenueModelMutation.isPending}
                      >
                        {revenueModelMutation.isPending ? "Generating Revenue Model..." : "Generate Revenue Model"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Funding Strategy Tab */}
              <TabsContent value="funding">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Funding Strategy
                    </CardTitle>
                    <CardDescription>
                      Develop comprehensive funding and investment strategies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleFundingSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="businessStage">Business Stage</Label>
                          <Select
                            value={fundingForm.businessStage}
                            onValueChange={(value) => setFundingForm(prev => ({ ...prev, businessStage: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pre-seed">Pre-seed</SelectItem>
                              <SelectItem value="seed">Seed</SelectItem>
                              <SelectItem value="series-a">Series A</SelectItem>
                              <SelectItem value="series-b">Series B</SelectItem>
                              <SelectItem value="growth">Growth Stage</SelectItem>
                              <SelectItem value="bootstrap">Bootstrap</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="fundingAmount">Funding Amount</Label>
                          <Select
                            value={fundingForm.fundingAmount}
                            onValueChange={(value) => setFundingForm(prev => ({ ...prev, fundingAmount: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select amount" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="$50k-$250k">$50k - $250k</SelectItem>
                              <SelectItem value="$250k-$1M">$250k - $1M</SelectItem>
                              <SelectItem value="$1M-$5M">$1M - $5M</SelectItem>
                              <SelectItem value="$5M-$25M">$5M - $25M</SelectItem>
                              <SelectItem value="$25M+">$25M+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="useOfFunds">Use of Funds (comma-separated)</Label>
                        <Textarea
                          id="useOfFunds"
                          value={fundingForm.useOfFunds}
                          onChange={(e) => setFundingForm(prev => ({ ...prev, useOfFunds: e.target.value }))}
                          placeholder="product development, marketing, hiring, operations"
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="fundBusinessModel">Business Model</Label>
                        <Input
                          id="fundBusinessModel"
                          value={fundingForm.businessModel}
                          onChange={(e) => setFundingForm(prev => ({ ...prev, businessModel: e.target.value }))}
                          placeholder="SaaS, marketplace, subscription, etc."
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="traction">Current Traction</Label>
                        <Textarea
                          id="traction"
                          value={fundingForm.traction}
                          onChange={(e) => setFundingForm(prev => ({ ...prev, traction: e.target.value }))}
                          placeholder="Revenue, users, partnerships, team achievements"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="fundTeam">Team & Key Personnel (comma-separated)</Label>
                        <Input
                          id="fundTeam"
                          value={fundingForm.team}
                          onChange={(e) => setFundingForm(prev => ({ ...prev, team: e.target.value }))}
                          placeholder="CEO John Doe, CTO Jane Smith, VP Sales Mike Johnson"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={fundingStrategyMutation.isPending}
                      >
                        {fundingStrategyMutation.isPending ? "Generating Funding Strategy..." : "Generate Funding Strategy"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pitch Deck Tab */}
              <TabsContent value="pitch">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Presentation className="w-5 h-5" />
                      Pitch Deck Strategy
                    </CardTitle>
                    <CardDescription>
                      AI-enhanced storytelling prompts for investor presentations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePitchSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={pitchForm.companyName}
                          onChange={(e) => setPitchForm(prev => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Your company name"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="problemStatement">Problem Statement</Label>
                        <Textarea
                          id="problemStatement"
                          value={pitchForm.problemStatement}
                          onChange={(e) => setPitchForm(prev => ({ ...prev, problemStatement: e.target.value }))}
                          placeholder="What problem are you solving?"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="solution">Solution</Label>
                        <Textarea
                          id="solution"
                          value={pitchForm.solution}
                          onChange={(e) => setPitchForm(prev => ({ ...prev, solution: e.target.value }))}
                          placeholder="How does your product solve the problem?"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="marketSize">Market Size</Label>
                          <Input
                            id="marketSize"
                            value={pitchForm.marketSize}
                            onChange={(e) => setPitchForm(prev => ({ ...prev, marketSize: e.target.value }))}
                            placeholder="$10B TAM, $2B SAM"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="pitchBusinessModel">Business Model</Label>
                          <Input
                            id="pitchBusinessModel"
                            value={pitchForm.businessModel}
                            onChange={(e) => setPitchForm(prev => ({ ...prev, businessModel: e.target.value }))}
                            placeholder="SaaS, B2B, B2C, etc."
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="pitchTraction">Traction & Metrics</Label>
                        <Textarea
                          id="pitchTraction"
                          value={pitchForm.traction}
                          onChange={(e) => setPitchForm(prev => ({ ...prev, traction: e.target.value }))}
                          placeholder="Key metrics, growth, achievements"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="pitchTeam">Team Background</Label>
                        <Textarea
                          id="pitchTeam"
                          value={pitchForm.team}
                          onChange={(e) => setPitchForm(prev => ({ ...prev, team: e.target.value }))}
                          placeholder="Team experience and expertise"
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="pitchFundingAmount">Funding Amount Sought</Label>
                        <Input
                          id="pitchFundingAmount"
                          value={pitchForm.fundingAmount}
                          onChange={(e) => setPitchForm(prev => ({ ...prev, fundingAmount: e.target.value }))}
                          placeholder="$2M Series A"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={pitchDeckMutation.isPending}
                      >
                        {pitchDeckMutation.isPending ? "Generating Pitch Strategy..." : "Generate Pitch Deck Strategy"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financial Projections Tab */}
              <TabsContent value="projections">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Financial Projections
                    </CardTitle>
                    <CardDescription>
                      Create detailed financial models and forecasts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProjectionsSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="projBusinessType">Business Type</Label>
                          <Input
                            id="projBusinessType"
                            value={projectionsForm.businessType}
                            onChange={(e) => setProjectionsForm(prev => ({ ...prev, businessType: e.target.value }))}
                            placeholder="SaaS, E-commerce, etc."
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="projIndustry">Industry</Label>
                          <Input
                            id="projIndustry"
                            value={projectionsForm.industry}
                            onChange={(e) => setProjectionsForm(prev => ({ ...prev, industry: e.target.value }))}
                            placeholder="Technology, Healthcare, etc."
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="initialInvestment">Initial Investment</Label>
                        <Select
                          value={projectionsForm.initialInvestment}
                          onValueChange={(value) => setProjectionsForm(prev => ({ ...prev, initialInvestment: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select initial investment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="$10k-$50k">$10k - $50k</SelectItem>
                            <SelectItem value="$50k-$250k">$50k - $250k</SelectItem>
                            <SelectItem value="$250k-$1M">$250k - $1M</SelectItem>
                            <SelectItem value="$1M-$5M">$1M - $5M</SelectItem>
                            <SelectItem value="$5M+">$5M+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="revenueStreams">Revenue Streams (comma-separated)</Label>
                        <Textarea
                          id="revenueStreams"
                          value={projectionsForm.revenueStreams}
                          onChange={(e) => setProjectionsForm(prev => ({ ...prev, revenueStreams: e.target.value }))}
                          placeholder="subscriptions, one-time sales, consulting, partnerships"
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="operatingExpenses">Operating Expenses (comma-separated)</Label>
                        <Textarea
                          id="operatingExpenses"
                          value={projectionsForm.operatingExpenses}
                          onChange={(e) => setProjectionsForm(prev => ({ ...prev, operatingExpenses: e.target.value }))}
                          placeholder="salaries, marketing, infrastructure, office rent"
                          rows={2}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="growthRate">Expected Growth Rate</Label>
                          <Select
                            value={projectionsForm.growthRate}
                            onValueChange={(value) => setProjectionsForm(prev => ({ ...prev, growthRate: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select growth rate" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10-25% annually">10-25% annually</SelectItem>
                              <SelectItem value="25-50% annually">25-50% annually</SelectItem>
                              <SelectItem value="50-100% annually">50-100% annually</SelectItem>
                              <SelectItem value="100%+ annually">100%+ annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="timeHorizon">Time Horizon</Label>
                          <Select
                            value={projectionsForm.timeHorizon}
                            onValueChange={(value) => setProjectionsForm(prev => ({ ...prev, timeHorizon: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select time horizon" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1 year">1 year</SelectItem>
                              <SelectItem value="3 years">3 years</SelectItem>
                              <SelectItem value="5 years">5 years</SelectItem>
                              <SelectItem value="10 years">10 years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={projectionsMutation.isPending}
                      >
                        {projectionsMutation.isPending ? "Generating Projections..." : "Generate Financial Projections"}
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
                      <Badge variant="outline">Model</Badge>
                      <span className="text-sm">{generatedStrategy.businessModel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">{generatedStrategy.timeline}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Revenue Projections */}
                  {generatedStrategy.projections.revenue.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Revenue Projections
                      </h4>
                      <div className="space-y-2">
                        {generatedStrategy.projections.revenue.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expense Analysis */}
                  {generatedStrategy.projections.expenses.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Expense Analysis
                      </h4>
                      <div className="space-y-2">
                        {generatedStrategy.projections.expenses.map((expense, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{expense}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Profitability Timeline */}
                  {generatedStrategy.projections.profitability.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Profitability Analysis
                      </h4>
                      <div className="space-y-2">
                        {generatedStrategy.projections.profitability.map((profit, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{profit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Funding Options */}
                  {generatedStrategy.fundingOptions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Funding Options
                      </h4>
                      <div className="space-y-2">
                        {generatedStrategy.fundingOptions.map((option, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pitch Elements */}
                  {generatedStrategy.pitchElements.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Presentation className="w-4 h-4" />
                        Key Pitch Elements
                      </h4>
                      <div className="space-y-2">
                        {generatedStrategy.pitchElements.map((element, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-sm">{element}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {generatedStrategy.riskFactors.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Risk Factors
                      </h4>
                      <div className="space-y-2">
                        {generatedStrategy.riskFactors.map((risk, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
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
                        <TrendingUp className="w-4 h-4" />
                        Strategic Recommendations
                      </h4>
                      <div className="space-y-2">
                        {generatedStrategy.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
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
                  <DollarSign className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    Generate Your Financial Strategy
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Select a strategy type and complete the form to generate comprehensive financial planning insights
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