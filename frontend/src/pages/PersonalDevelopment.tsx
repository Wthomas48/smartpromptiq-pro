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
import { Target, Mic, Users, Clock, TrendingUp, CheckCircle } from "lucide-react";

interface PersonalDevelopmentPlan {
  id: string;
  type: "goal_setting" | "public_speaking" | "networking";
  title: string;
  description: string;
  focus: string;
  targetOutcome: string;
  strategies: string[];
  actionSteps: string[];
  milestones: string[];
  trackingMethods: string[];
  resources: string[];
  timeline: string;
  challenges: string[];
  recommendations: string[];
}

export default function PersonalDevelopment() {
  const { toast } = useToast();
  const [generatedPlan, setGeneratedPlan] = useState<PersonalDevelopmentPlan | null>(null);
  const [activeTab, setActiveTab] = useState("goals");

  // Goal Setting Form
  const [goalForm, setGoalForm] = useState({
    goalCategory: "",
    specificGoals: "",
    timeframe: "",
    currentSituation: "",
    obstacles: "",
    motivationFactors: ""
  });

  // Public Speaking Form
  const [speakingForm, setSpeakingForm] = useState({
    speechType: "",
    audience: "",
    duration: "",
    mainMessage: "",
    speakingExperience: "",
    specificChallenges: ""
  });

  // Networking Form
  const [networkingForm, setNetworkingForm] = useState({
    networkingGoals: "",
    industryFocus: "",
    currentNetwork: "",
    targetConnections: "",
    networkingStyle: "",
    availableTime: ""
  });

  // Goal Setting Mutation
  const goalSettingMutation = useMutation({
    mutationFn: async (data: typeof goalForm): Promise<PersonalDevelopmentPlan> => {
      const payload = {
        ...data,
        specificGoals: data.specificGoals.split(',').map(g => g.trim()).filter(g => g),
        obstacles: data.obstacles.split(',').map(o => o.trim()).filter(o => o),
        motivationFactors: data.motivationFactors.split(',').map(m => m.trim()).filter(m => m)
      };
      const response = await apiRequest("POST", "/api/personal/goal-setting", payload);
      return await response.json();
    },
    onSuccess: (data: PersonalDevelopmentPlan) => {
      setGeneratedPlan(data);
      toast({
        title: "Goal Setting Plan Generated",
        description: "Your productivity and habit-building strategy is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate goal setting plan",
        variant: "destructive",
      });
    },
  });

  // Public Speaking Mutation
  const publicSpeakingMutation = useMutation({
    mutationFn: async (data: typeof speakingForm): Promise<PersonalDevelopmentPlan> => {
      const payload = {
        ...data,
        specificChallenges: data.specificChallenges.split(',').map(c => c.trim()).filter(c => c)
      };
      const response = await apiRequest("POST", "/api/personal/public-speaking", payload);
      return await response.json();
    },
    onSuccess: (data: PersonalDevelopmentPlan) => {
      setGeneratedPlan(data);
      toast({
        title: "Speaking Strategy Generated",
        description: "Your public speaking framework is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate speaking strategy",
        variant: "destructive",
      });
    },
  });

  // Networking Mutation
  const networkingMutation = useMutation({
    mutationFn: async (data: typeof networkingForm): Promise<PersonalDevelopmentPlan> => {
      const payload = {
        ...data,
        networkingGoals: data.networkingGoals.split(',').map(g => g.trim()).filter(g => g)
      };
      const response = await apiRequest("POST", "/api/personal/networking", payload);
      return await response.json();
    },
    onSuccess: (data: PersonalDevelopmentPlan) => {
      setGeneratedPlan(data);
      toast({
        title: "Networking Strategy Generated",
        description: "Your relationship building plan is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate networking strategy",
        variant: "destructive",
      });
    },
  });

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goalSettingMutation.mutate(goalForm);
  };

  const handleSpeakingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    publicSpeakingMutation.mutate(speakingForm);
  };

  const handleNetworkingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    networkingMutation.mutate(networkingForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-red-900/20">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white">
              <Target className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent mb-4">
            Personal Development & Coaching
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Build productive habits, master communication skills, and expand your professional network with AI-powered coaching
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form Tabs */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="goals">Goal Setting</TabsTrigger>
                <TabsTrigger value="speaking">Public Speaking</TabsTrigger>
                <TabsTrigger value="networking">Networking</TabsTrigger>
              </TabsList>

              {/* Goal Setting Tab */}
              <TabsContent value="goals">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Goal Setting & Productivity
                    </CardTitle>
                    <CardDescription>
                      Create structured plans for habit-building and success tracking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleGoalSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="goalCategory">Goal Category</Label>
                        <Select
                          value={goalForm.goalCategory}
                          onValueChange={(value) => setGoalForm(prev => ({ ...prev, goalCategory: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="career">Career Development</SelectItem>
                            <SelectItem value="health">Health & Fitness</SelectItem>
                            <SelectItem value="financial">Financial Goals</SelectItem>
                            <SelectItem value="education">Learning & Skills</SelectItem>
                            <SelectItem value="relationships">Relationships</SelectItem>
                            <SelectItem value="personal">Personal Growth</SelectItem>
                            <SelectItem value="creative">Creative Projects</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="specificGoals">Specific Goals (comma-separated)</Label>
                        <Textarea
                          id="specificGoals"
                          value={goalForm.specificGoals}
                          onChange={(e) => setGoalForm(prev => ({ ...prev, specificGoals: e.target.value }))}
                          placeholder="get promoted, lose 20 pounds, save $10k, learn Spanish"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="timeframe">Timeframe</Label>
                          <Select
                            value={goalForm.timeframe}
                            onValueChange={(value) => setGoalForm(prev => ({ ...prev, timeframe: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30 days">30 days</SelectItem>
                              <SelectItem value="90 days">90 days</SelectItem>
                              <SelectItem value="6 months">6 months</SelectItem>
                              <SelectItem value="1 year">1 year</SelectItem>
                              <SelectItem value="2+ years">2+ years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="currentSituation">Current Situation</Label>
                          <Input
                            id="currentSituation"
                            value={goalForm.currentSituation}
                            onChange={(e) => setGoalForm(prev => ({ ...prev, currentSituation: e.target.value }))}
                            placeholder="Starting point description"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="obstacles">Potential Obstacles (comma-separated)</Label>
                        <Textarea
                          id="obstacles"
                          value={goalForm.obstacles}
                          onChange={(e) => setGoalForm(prev => ({ ...prev, obstacles: e.target.value }))}
                          placeholder="time constraints, lack of resources, motivation issues"
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="motivationFactors">Motivation Factors (comma-separated)</Label>
                        <Textarea
                          id="motivationFactors"
                          value={goalForm.motivationFactors}
                          onChange={(e) => setGoalForm(prev => ({ ...prev, motivationFactors: e.target.value }))}
                          placeholder="family, financial security, personal satisfaction, recognition"
                          rows={2}
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={goalSettingMutation.isPending}
                      >
                        {goalSettingMutation.isPending ? "Generating Plan..." : "Generate Goal Setting Plan"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Public Speaking Tab */}
              <TabsContent value="speaking">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      Public Speaking & Persuasion
                    </CardTitle>
                    <CardDescription>
                      Generate speech frameworks and persuasion strategies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSpeakingSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="speechType">Speech Type</Label>
                          <Select
                            value={speakingForm.speechType}
                            onValueChange={(value) => setSpeakingForm(prev => ({ ...prev, speechType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="business-presentation">Business Presentation</SelectItem>
                              <SelectItem value="keynote">Keynote Speech</SelectItem>
                              <SelectItem value="sales-pitch">Sales Pitch</SelectItem>
                              <SelectItem value="conference-talk">Conference Talk</SelectItem>
                              <SelectItem value="training-session">Training Session</SelectItem>
                              <SelectItem value="wedding-speech">Wedding Speech</SelectItem>
                              <SelectItem value="debate">Debate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="duration">Duration</Label>
                          <Select
                            value={speakingForm.duration}
                            onValueChange={(value) => setSpeakingForm(prev => ({ ...prev, duration: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5 minutes">5 minutes</SelectItem>
                              <SelectItem value="10-15 minutes">10-15 minutes</SelectItem>
                              <SelectItem value="20-30 minutes">20-30 minutes</SelectItem>
                              <SelectItem value="45-60 minutes">45-60 minutes</SelectItem>
                              <SelectItem value="90+ minutes">90+ minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="audience">Target Audience</Label>
                        <Input
                          id="audience"
                          value={speakingForm.audience}
                          onChange={(e) => setSpeakingForm(prev => ({ ...prev, audience: e.target.value }))}
                          placeholder="executives, students, peers, general public"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="mainMessage">Main Message/Objective</Label>
                        <Textarea
                          id="mainMessage"
                          value={speakingForm.mainMessage}
                          onChange={(e) => setSpeakingForm(prev => ({ ...prev, mainMessage: e.target.value }))}
                          placeholder="What do you want your audience to think, feel, or do?"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="speakingExperience">Speaking Experience Level</Label>
                        <Select
                          value={speakingForm.speakingExperience}
                          onValueChange={(value) => setSpeakingForm(prev => ({ ...prev, speakingExperience: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="some-experience">Some Experience</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="experienced">Experienced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="specificChallenges">Specific Challenges (comma-separated)</Label>
                        <Textarea
                          id="specificChallenges"
                          value={speakingForm.specificChallenges}
                          onChange={(e) => setSpeakingForm(prev => ({ ...prev, specificChallenges: e.target.value }))}
                          placeholder="stage fright, voice projection, audience engagement, Q&A handling"
                          rows={2}
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={publicSpeakingMutation.isPending}
                      >
                        {publicSpeakingMutation.isPending ? "Generating Strategy..." : "Generate Speaking Strategy"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Networking Tab */}
              <TabsContent value="networking">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Networking & Relationship Building
                    </CardTitle>
                    <CardDescription>
                      AI-powered prompts for outreach, engagement, and collaboration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleNetworkingSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="networkingGoals">Networking Goals (comma-separated)</Label>
                        <Textarea
                          id="networkingGoals"
                          value={networkingForm.networkingGoals}
                          onChange={(e) => setNetworkingForm(prev => ({ ...prev, networkingGoals: e.target.value }))}
                          placeholder="find mentors, build partnerships, job opportunities, industry insights"
                          rows={2}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="industryFocus">Industry Focus</Label>
                          <Input
                            id="industryFocus"
                            value={networkingForm.industryFocus}
                            onChange={(e) => setNetworkingForm(prev => ({ ...prev, industryFocus: e.target.value }))}
                            placeholder="Technology, Healthcare, Finance, etc."
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="currentNetwork">Current Network Size</Label>
                          <Select
                            value={networkingForm.currentNetwork}
                            onValueChange={(value) => setNetworkingForm(prev => ({ ...prev, currentNetwork: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="very-small">Very Small (0-25)</SelectItem>
                              <SelectItem value="small">Small (25-100)</SelectItem>
                              <SelectItem value="medium">Medium (100-500)</SelectItem>
                              <SelectItem value="large">Large (500-1000)</SelectItem>
                              <SelectItem value="very-large">Very Large (1000+)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="targetConnections">Target New Connections</Label>
                          <Select
                            value={networkingForm.targetConnections}
                            onValueChange={(value) => setNetworkingForm(prev => ({ ...prev, targetConnections: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10-25 per month">10-25 per month</SelectItem>
                              <SelectItem value="25-50 per month">25-50 per month</SelectItem>
                              <SelectItem value="50-100 per month">50-100 per month</SelectItem>
                              <SelectItem value="100+ per month">100+ per month</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="networkingStyle">Preferred Style</Label>
                          <Select
                            value={networkingForm.networkingStyle}
                            onValueChange={(value) => setNetworkingForm(prev => ({ ...prev, networkingStyle: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online-focused">Online Focused</SelectItem>
                              <SelectItem value="in-person-events">In-person Events</SelectItem>
                              <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                              <SelectItem value="referral-based">Referral Based</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="availableTime">Available Time for Networking</Label>
                        <Select
                          value={networkingForm.availableTime}
                          onValueChange={(value) => setNetworkingForm(prev => ({ ...prev, availableTime: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time commitment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-2 hours per week">1-2 hours per week</SelectItem>
                            <SelectItem value="3-5 hours per week">3-5 hours per week</SelectItem>
                            <SelectItem value="5-10 hours per week">5-10 hours per week</SelectItem>
                            <SelectItem value="10+ hours per week">10+ hours per week</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={networkingMutation.isPending}
                      >
                        {networkingMutation.isPending ? "Generating Strategy..." : "Generate Networking Strategy"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Generated Plan */}
          <div className="space-y-6">
            {generatedPlan ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {generatedPlan.title}
                    <Badge variant="secondary" className="ml-2">
                      {generatedPlan.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{generatedPlan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plan Overview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Focus</Badge>
                      <span className="text-sm">{generatedPlan.focus}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{generatedPlan.timeline}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Strategies */}
                  {generatedPlan.strategies.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Key Strategies
                      </h4>
                      <div className="space-y-2">
                        {generatedPlan.strategies.map((strategy, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{strategy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Steps */}
                  {generatedPlan.actionSteps.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Action Steps
                      </h4>
                      <div className="space-y-2">
                        {generatedPlan.actionSteps.map((step, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-400 flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-sm">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestones */}
                  {generatedPlan.milestones.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Success Milestones
                      </h4>
                      <div className="space-y-2">
                        {generatedPlan.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{milestone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tracking Methods */}
                  {generatedPlan.trackingMethods.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Progress Tracking
                      </h4>
                      <div className="space-y-2">
                        {generatedPlan.trackingMethods.map((method, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{method}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {generatedPlan.resources.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        Recommended Resources
                      </h4>
                      <div className="space-y-2">
                        {generatedPlan.resources.map((resource, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{resource}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Challenges */}
                  {generatedPlan.challenges.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Potential Challenges
                      </h4>
                      <div className="space-y-2">
                        {generatedPlan.challenges.map((challenge, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{challenge}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {generatedPlan.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Expert Recommendations
                      </h4>
                      <div className="space-y-2">
                        {generatedPlan.recommendations.map((rec, index) => (
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
                  <Target className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    Generate Personal Development Plan
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Select a development area and complete the form to generate your personalized coaching strategy
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