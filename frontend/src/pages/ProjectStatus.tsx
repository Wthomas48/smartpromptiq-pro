import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Clock, 
  Download, 
  Mail, 
  Sparkles,
  AlertCircle,
  Calendar,
  FileText,
  User,
  Building,
  Zap
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import BackButton from "@/components/BackButton";

interface ProjectDeliverables {
  projectId: string;
  clientName: string;
  prompts: string[];
  industry: string;
  customizations: string;
  deliveryDate: string;
  usage_instructions: string;
  support_contact: string;
  aiModel: string;
  metadata: {
    budget: number;
    urgency: string;
    processedAt: string;
  };
}

export default function ProjectStatus() {
  const params = useParams();
  const submissionId = params.id;
  const [progress, setProgress] = useState(25);

  // Fetch project status
  const { data: projectData, isLoading, error } = useQuery({
    queryKey: [`/api/starter-project/${submissionId}`],
    enabled: !!submissionId,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3
  });

  // Simulate progress updates based on time elapsed
  useEffect(() => {
    if (projectData?.success) {
      setProgress(100);
    } else {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 85));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [projectData]);

  const handleDownloadPDF = async () => {
    if (!projectData?.data) return;
    
    try {
      const response = await apiRequest("POST", "/api/generate-pdf", {
        submissionId,
        deliverables: projectData.data
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SmartPromptIQ-${submissionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
    }
  };

  const getStatusBadge = () => {
    if (error) return <Badge variant="destructive">Error</Badge>;
    if (projectData?.success) return <Badge className="bg-green-600">Completed</Badge>;
    return <Badge className="bg-blue-600">Processing</Badge>;
  };

  const getProjectTag = (budget: number) => {
    if (budget >= 99) return { name: "Enterprise", color: "bg-purple-600" };
    if (budget >= 79) return { name: "Pro", color: "bg-blue-600" };
    return { name: "Starter", color: "bg-green-600" };
  };

  const formatDeliveryTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="container mx-auto px-4 pt-20 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="container mx-auto px-4 pt-20 pb-16">
          <BackButton />
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Project not found or has expired. Please check your submission ID or contact support.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  const deliverables: ProjectDeliverables = projectData?.data;
  const isCompleted = projectData?.success && deliverables;
  const projectTag = deliverables ? getProjectTag(deliverables.metadata.budget) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-20 pb-16">
        <BackButton />
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Project Status
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Track your Starter Project progress
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Project #{submissionId}</span>
                  </CardTitle>
                  <CardDescription>
                    {isCompleted ? 'Your custom prompts are ready!' : 'AI is generating your custom prompts...'}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {getStatusBadge()}
                  {projectTag && (
                    <Badge className={projectTag.color}>
                      {projectTag.name}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Project Details */}
              {deliverables && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Client:</span>
                      <span className="text-sm">{deliverables.clientName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Industry:</span>
                      <span className="text-sm">{deliverables.industry}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">AI Model:</span>
                      <span className="text-sm">{deliverables.aiModel}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Prompts Generated:</span>
                      <span className="text-sm">{deliverables.prompts.length}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Delivered:</span>
                      <span className="text-sm">{formatDeliveryTime(deliverables.deliveryDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Urgency:</span>
                      <span className="text-sm capitalize">{deliverables.metadata.urgency}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isCompleted && (
                <div className="flex space-x-4 pt-4">
                  <Button onClick={handleDownloadPDF} className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = "/starter-project"}>
                    Order Another Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prompts Display */}
          {isCompleted && deliverables && (
            <Card>
              <CardHeader>
                <CardTitle>Your Custom Prompts</CardTitle>
                <CardDescription>
                  Ready-to-use prompts optimized for AI models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliverables.prompts.map((prompt, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">
                          Prompt {index + 1}
                          {deliverables.prompts.length > 1 && ` - Variation ${index + 1}`}
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(prompt)}
                        >
                          Copy
                        </Button>
                      </div>
                      <pre className="whitespace-pre-wrap font-mono text-sm bg-white dark:bg-gray-900 p-3 rounded border overflow-x-auto">
                        {prompt}
                      </pre>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Usage Instructions:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {deliverables.usage_instructions}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Status */}
          {!isCompleted && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Processing Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Project submitted and confirmed</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>AI generating custom prompts...</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-gray-500">Email delivery</span>
                  </div>
                </div>
                
                <Alert className="mt-6">
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    You'll receive an email with your custom prompts within 24-48 hours. 
                    This page will automatically update when your project is completed.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Have questions about your project or need modifications?
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> support@smartpromptiq.net</p>
                <p><strong>Response Time:</strong> Within 4 hours</p>
                <p><strong>Modifications:</strong> Free within 7 days of delivery</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}