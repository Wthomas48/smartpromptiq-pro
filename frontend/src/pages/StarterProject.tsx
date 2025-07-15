import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  Rocket, 
  Sparkles,
  User,
  Building,
  Target,
  MessageSquare
} from "lucide-react";
import BackButton from "@/components/BackButton";

// Form validation schema
const starterProjectSchema = z.object({
  userName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  promptTopic: z.string().min(10, "Please describe your prompt topic (minimum 10 characters)"),
  industry: z.string().min(1, "Please select an industry"),
  context: z.string().optional(),
  customizationNotes: z.string().optional(),
  urgency: z.enum(["standard", "priority"], { required_error: "Please select delivery timeframe" }),
  budget: z.enum(["49", "79", "99"], { required_error: "Please select a package" })
});

type StarterProjectForm = z.infer<typeof starterProjectSchema>;

// Industry options
const industries = [
  "Technology & Software",
  "Healthcare & Medical",
  "Finance & Banking",
  "E-commerce & Retail",
  "Education & Training",
  "Marketing & Advertising",
  "Real Estate",
  "Manufacturing",
  "Consulting",
  "Entertainment & Media",
  "Food & Beverage",
  "Travel & Tourism",
  "Non-profit",
  "Government",
  "Other"
];

// Package options
const packages = [
  {
    value: "49",
    name: "Standard Package",
    price: 49,
    features: ["Single prompt generation", "Basic customization", "48-hour delivery", "Email support"]
  },
  {
    value: "79",
    name: "Enhanced Package",
    price: 79,
    features: ["3 prompt variations", "Advanced customization", "24-hour delivery", "Priority support"]
  },
  {
    value: "99",
    name: "Premium Package", 
    price: 99,
    features: ["5 prompt variations", "Expert customization", "12-hour delivery", "Phone support"]
  }
];

export default function StarterProject() {
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [submissionId, setSubmissionId] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<StarterProjectForm>({
    resolver: zodResolver(starterProjectSchema),
    defaultValues: {
      userName: "",
      email: "",
      promptTopic: "",
      industry: "",
      context: "",
      customizationNotes: "",
      urgency: "standard",
      budget: "49"
    }
  });

  const submitProjectMutation = useMutation({
    mutationFn: async (data: StarterProjectForm) => {
      const response = await apiRequest("POST", "/api/process-starter", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      setSubmissionStatus("success");
      setSubmissionId(data.submissionId);
      toast({
        title: "Project Submitted Successfully!",
        description: "We'll begin processing your request and send updates to your email.",
      });
      form.reset();
    },
    onError: (error: any) => {
      setSubmissionStatus("error");
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: StarterProjectForm) => {
    submitProjectMutation.mutate(data);
  };

  if (submissionStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-20 pb-16">
          <div className="max-w-2xl mx-auto">
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-green-800 dark:text-green-200">
                  Project Submitted Successfully!
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  Submission ID: #{submissionId}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-green-700 dark:text-green-300">
                    <Mail className="w-5 h-5" />
                    <span>Confirmation email sent to your inbox</span>
                  </div>
                  <div className="flex items-center space-x-3 text-green-700 dark:text-green-300">
                    <Sparkles className="w-5 h-5" />
                    <span>AI prompt generation initiated</span>
                  </div>
                  <div className="flex items-center space-x-3 text-green-700 dark:text-green-300">
                    <Clock className="w-5 h-5" />
                    <span>Delivery within 48 hours</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">Track Your Project</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Monitor progress and download your prompts when ready
                  </p>
                  <Button 
                    onClick={() => window.location.href = `/project-status/${submissionId}`}
                    variant="outline"
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    View Project Status
                  </Button>
                </div>
                
                <div className="pt-4 space-y-2">
                  <Button 
                    onClick={() => window.location.href = "/"} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Return to Home
                  </Button>
                  <Button 
                    onClick={() => window.location.href = "/billing"} 
                    variant="outline"
                    className="w-full"
                  >
                    Upgrade to Pro for Unlimited Prompts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-20 pb-16">
        <BackButton />
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Starter Project Request
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get a professionally crafted prompt delivered within 48 hours
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Package Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Choose Package
            </h2>
            {packages.map((pkg) => (
              <Card 
                key={pkg.value}
                className={`cursor-pointer transition-all duration-200 ${
                  form.watch("budget") === pkg.value 
                    ? "ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20" 
                    : "hover:shadow-md"
                }`}
                onClick={() => form.setValue("budget", pkg.value as "49" | "79" | "99")}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription className="text-2xl font-bold text-orange-600">
                        ${pkg.price}
                      </CardDescription>
                    </div>
                    {form.watch("budget") === pkg.value && (
                      <CheckCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Project Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  <span>Project Details</span>
                </CardTitle>
                <CardDescription>
                  Tell us about your prompt requirements
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Contact Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="userName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span>Your Name *</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Mail className="w-4 h-4" />
                              <span>Email Address *</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Project Details */}
                    <FormField
                      control={form.control}
                      name="promptTopic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span>Prompt Topic or Goal *</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what you want the prompt to achieve..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Building className="w-4 h-4" />
                              <span>Industry *</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {industries.map((industry) => (
                                  <SelectItem key={industry} value={industry}>
                                    {industry}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="urgency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>Delivery Timeframe *</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="standard">48 hours (Standard)</SelectItem>
                                <SelectItem value="priority">24 hours (+$20)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="context"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Context</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any specific background information or constraints..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customizationNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>Customization Notes</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tone, style, format preferences..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {submissionStatus === "error" && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          There was an error submitting your project. Please try again.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      disabled={submitProjectMutation.isPending}
                    >
                      {submitProjectMutation.isPending ? (
                        "Processing..."
                      ) : (
                        `Submit Project - $${form.watch("budget")}`
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}