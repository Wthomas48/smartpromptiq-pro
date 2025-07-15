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
import { BookOpen, TrendingUp, Search, Target, Clock, Users } from "lucide-react";

interface EducationalContent {
  id: string;
  type: "course_creation" | "skill_development" | "research_insights";
  title: string;
  description: string;
  subject: string;
  targetAudience: string;
  modules: string[];
  objectives: string[];
  activities: string[];
  assessments: string[];
  resources: string[];
  timeline: string;
  difficulty: string;
  recommendations: string[];
}

export default function Education() {
  const { toast } = useToast();
  const [generatedContent, setGeneratedContent] = useState<EducationalContent | null>(null);
  const [activeTab, setActiveTab] = useState("course");

  // Course Creation Form
  const [courseForm, setCourseForm] = useState({
    courseName: "",
    subject: "",
    targetAudience: "",
    learningObjectives: "",
    duration: "",
    deliveryMethod: "",
    assessmentMethods: ""
  });

  // Skill Development Form
  const [skillForm, setSkillForm] = useState({
    skillName: "",
    currentLevel: "",
    targetLevel: "",
    timeframe: "",
    learningStyle: "",
    careerGoals: ""
  });

  // Research Insights Form
  const [researchForm, setResearchForm] = useState({
    researchTopic: "",
    dataTypes: "",
    analysisGoals: "",
    stakeholders: "",
    methodology: "",
    timeline: ""
  });

  // Course Creation Mutation
  const courseCreationMutation = useMutation({
    mutationFn: async (data: typeof courseForm): Promise<EducationalContent> => {
      const payload = {
        ...data,
        learningObjectives: data.learningObjectives.split(',').map(o => o.trim()).filter(o => o),
        assessmentMethods: data.assessmentMethods.split(',').map(m => m.trim()).filter(m => m)
      };
      const response = await apiRequest("POST", "/api/education/course-creation", payload);
      return await response.json();
    },
    onSuccess: (data: EducationalContent) => {
      setGeneratedContent(data);
      toast({
        title: "Course Structure Generated",
        description: "Your comprehensive course design is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate course structure",
        variant: "destructive",
      });
    },
  });

  // Skill Development Mutation
  const skillDevelopmentMutation = useMutation({
    mutationFn: async (data: typeof skillForm): Promise<EducationalContent> => {
      const payload = {
        ...data,
        careerGoals: data.careerGoals.split(',').map(g => g.trim()).filter(g => g)
      };
      const response = await apiRequest("POST", "/api/education/skill-development", payload);
      return await response.json();
    },
    onSuccess: (data: EducationalContent) => {
      setGeneratedContent(data);
      toast({
        title: "Skill Development Path Generated",
        description: "Your personalized learning pathway is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate skill development path",
        variant: "destructive",
      });
    },
  });

  // Research Insights Mutation
  const researchInsightsMutation = useMutation({
    mutationFn: async (data: typeof researchForm): Promise<EducationalContent> => {
      const payload = {
        ...data,
        dataTypes: data.dataTypes.split(',').map(t => t.trim()).filter(t => t),
        analysisGoals: data.analysisGoals.split(',').map(g => g.trim()).filter(g => g)
      };
      const response = await apiRequest("POST", "/api/education/research-insights", payload);
      return await response.json();
    },
    onSuccess: (data: EducationalContent) => {
      setGeneratedContent(data);
      toast({
        title: "Research Framework Generated",
        description: "Your data analysis methodology is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate research insights",
        variant: "destructive",
      });
    },
  });

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    courseCreationMutation.mutate(courseForm);
  };

  const handleSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    skillDevelopmentMutation.mutate(skillForm);
  };

  const handleResearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    researchInsightsMutation.mutate(researchForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <BookOpen className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Education & Learning Resources
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create structured learning experiences, develop professional skills, and transform data into actionable insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form Tabs */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="course">Course Creation</TabsTrigger>
                <TabsTrigger value="skill">Skill Development</TabsTrigger>
                <TabsTrigger value="research">Research Insights</TabsTrigger>
              </TabsList>

              {/* Course Creation Tab */}
              <TabsContent value="course">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Course Creation
                    </CardTitle>
                    <CardDescription>
                      Generate structured lesson plans and educational materials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCourseSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="courseName">Course Name</Label>
                        <Input
                          id="courseName"
                          value={courseForm.courseName}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, courseName: e.target.value }))}
                          placeholder="Introduction to Data Science"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="subject">Subject Area</Label>
                          <Select
                            value={courseForm.subject}
                            onValueChange={(value) => setCourseForm(prev => ({ ...prev, subject: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="duration">Course Duration</Label>
                          <Select
                            value={courseForm.duration}
                            onValueChange={(value) => setCourseForm(prev => ({ ...prev, duration: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                              <SelectItem value="1 month">1 month</SelectItem>
                              <SelectItem value="2-3 months">2-3 months</SelectItem>
                              <SelectItem value="6 months">6 months</SelectItem>
                              <SelectItem value="1 year">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="targetAudience">Target Audience</Label>
                        <Textarea
                          id="targetAudience"
                          value={courseForm.targetAudience}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                          placeholder="Professionals, students, beginners, etc."
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="learningObjectives">Learning Objectives (comma-separated)</Label>
                        <Textarea
                          id="learningObjectives"
                          value={courseForm.learningObjectives}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, learningObjectives: e.target.value }))}
                          placeholder="understand concepts, apply skills, analyze data"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="deliveryMethod">Delivery Method</Label>
                          <Select
                            value={courseForm.deliveryMethod}
                            onValueChange={(value) => setCourseForm(prev => ({ ...prev, deliveryMethod: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="in-person">In-person</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                              <SelectItem value="self-paced">Self-paced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="assessmentMethods">Assessment Methods</Label>
                          <Input
                            id="assessmentMethods"
                            value={courseForm.assessmentMethods}
                            onChange={(e) => setCourseForm(prev => ({ ...prev, assessmentMethods: e.target.value }))}
                            placeholder="quizzes, projects, presentations"
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={courseCreationMutation.isPending}
                      >
                        {courseCreationMutation.isPending ? "Generating Course..." : "Generate Course Structure"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skill Development Tab */}
              <TabsContent value="skill">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Skill Development
                    </CardTitle>
                    <CardDescription>
                      AI-driven learning pathways for professional and personal growth
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSkillSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="skillName">Skill/Competency</Label>
                        <Input
                          id="skillName"
                          value={skillForm.skillName}
                          onChange={(e) => setSkillForm(prev => ({ ...prev, skillName: e.target.value }))}
                          placeholder="Python Programming, Public Speaking, etc."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="currentLevel">Current Level</Label>
                          <Select
                            value={skillForm.currentLevel}
                            onValueChange={(value) => setSkillForm(prev => ({ ...prev, currentLevel: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Novice">Novice</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="Expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="targetLevel">Target Level</Label>
                          <Select
                            value={skillForm.targetLevel}
                            onValueChange={(value) => setSkillForm(prev => ({ ...prev, targetLevel: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Novice">Novice</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="Expert">Expert</SelectItem>
                              <SelectItem value="Master">Master</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="timeframe">Learning Timeframe</Label>
                          <Select
                            value={skillForm.timeframe}
                            onValueChange={(value) => setSkillForm(prev => ({ ...prev, timeframe: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-3 months">1-3 months</SelectItem>
                              <SelectItem value="3-6 months">3-6 months</SelectItem>
                              <SelectItem value="6-12 months">6-12 months</SelectItem>
                              <SelectItem value="1-2 years">1-2 years</SelectItem>
                              <SelectItem value="2+ years">2+ years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="learningStyle">Learning Style</Label>
                          <Select
                            value={skillForm.learningStyle}
                            onValueChange={(value) => setSkillForm(prev => ({ ...prev, learningStyle: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Visual">Visual</SelectItem>
                              <SelectItem value="Auditory">Auditory</SelectItem>
                              <SelectItem value="Hands-on">Hands-on</SelectItem>
                              <SelectItem value="Reading/Writing">Reading/Writing</SelectItem>
                              <SelectItem value="Mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="careerGoals">Career Goals (comma-separated)</Label>
                        <Textarea
                          id="careerGoals"
                          value={skillForm.careerGoals}
                          onChange={(e) => setSkillForm(prev => ({ ...prev, careerGoals: e.target.value }))}
                          placeholder="promotion, career change, freelancing, consulting"
                          rows={3}
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={skillDevelopmentMutation.isPending}
                      >
                        {skillDevelopmentMutation.isPending ? "Generating Path..." : "Generate Learning Path"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Research Insights Tab */}
              <TabsContent value="research">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Research & Data Insights
                    </CardTitle>
                    <CardDescription>
                      Transform raw data into actionable research findings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleResearchSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="researchTopic">Research Topic</Label>
                        <Input
                          id="researchTopic"
                          value={researchForm.researchTopic}
                          onChange={(e) => setResearchForm(prev => ({ ...prev, researchTopic: e.target.value }))}
                          placeholder="Customer satisfaction analysis, market trends, etc."
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="dataTypes">Available Data Types (comma-separated)</Label>
                        <Textarea
                          id="dataTypes"
                          value={researchForm.dataTypes}
                          onChange={(e) => setResearchForm(prev => ({ ...prev, dataTypes: e.target.value }))}
                          placeholder="surveys, interviews, analytics, sales data, social media"
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="analysisGoals">Analysis Goals (comma-separated)</Label>
                        <Textarea
                          id="analysisGoals"
                          value={researchForm.analysisGoals}
                          onChange={(e) => setResearchForm(prev => ({ ...prev, analysisGoals: e.target.value }))}
                          placeholder="identify trends, predict outcomes, improve processes"
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="stakeholders">Key Stakeholders</Label>
                        <Input
                          id="stakeholders"
                          value={researchForm.stakeholders}
                          onChange={(e) => setResearchForm(prev => ({ ...prev, stakeholders: e.target.value }))}
                          placeholder="executives, product teams, marketing department"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="methodology">Research Methodology</Label>
                          <Select
                            value={researchForm.methodology}
                            onValueChange={(value) => setResearchForm(prev => ({ ...prev, methodology: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select methodology" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Quantitative">Quantitative</SelectItem>
                              <SelectItem value="Qualitative">Qualitative</SelectItem>
                              <SelectItem value="Mixed Methods">Mixed Methods</SelectItem>
                              <SelectItem value="Descriptive">Descriptive</SelectItem>
                              <SelectItem value="Exploratory">Exploratory</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="researchTimeline">Project Timeline</Label>
                          <Select
                            value={researchForm.timeline}
                            onValueChange={(value) => setResearchForm(prev => ({ ...prev, timeline: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                              <SelectItem value="1 month">1 month</SelectItem>
                              <SelectItem value="2-3 months">2-3 months</SelectItem>
                              <SelectItem value="6 months">6 months</SelectItem>
                              <SelectItem value="1 year">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={researchInsightsMutation.isPending}
                      >
                        {researchInsightsMutation.isPending ? "Generating Framework..." : "Generate Research Framework"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Generated Content */}
          <div className="space-y-6">
            {generatedContent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {generatedContent.title}
                    <Badge variant="secondary" className="ml-2">
                      {generatedContent.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{generatedContent.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Content Overview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Subject</Badge>
                      <span className="text-sm">{generatedContent.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{generatedContent.timeline}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{generatedContent.targetAudience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">{generatedContent.difficulty}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Modules/Phases */}
                  {generatedContent.modules.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Learning Modules
                      </h4>
                      <div className="space-y-2">
                        {generatedContent.modules.map((module, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-sm">{module}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Learning Objectives */}
                  {generatedContent.objectives.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Learning Objectives
                      </h4>
                      <div className="space-y-2">
                        {generatedContent.objectives.map((objective, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{objective}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activities */}
                  {generatedContent.activities.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Learning Activities
                      </h4>
                      <div className="space-y-2">
                        {generatedContent.activities.map((activity, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assessments */}
                  {generatedContent.assessments.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Assessment Methods
                      </h4>
                      <div className="space-y-2">
                        {generatedContent.assessments.map((assessment, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{assessment}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {generatedContent.resources.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Resources & Materials
                      </h4>
                      <div className="space-y-2">
                        {generatedContent.resources.map((resource, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{resource}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {generatedContent.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Implementation Recommendations
                      </h4>
                      <div className="space-y-2">
                        {generatedContent.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
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
                  <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    Generate Educational Content
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Select a content type and complete the form to generate comprehensive educational resources
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