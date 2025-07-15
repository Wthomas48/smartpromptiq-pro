import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Play, 
  HelpCircle, 
  Code, 
  Wrench, 
  History,
  ArrowLeft,
  ExternalLink,
  Lightbulb,
  Zap,
  Users,
  CreditCard,
  Shield,
  Settings
} from "lucide-react";
import BackButton from "@/components/BackButton";

export default function Documentation() {
  const [activeSection, setActiveSection] = useState("getting-started");

  const navigationItems = [
    { id: "getting-started", label: "Getting Started", icon: Play },
    { id: "how-to-use", label: "How to Use", icon: BookOpen },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "api-reference", label: "API Reference", icon: Code },
    { id: "troubleshooting", label: "Troubleshooting", icon: Wrench },
    { id: "release-notes", label: "Release Notes", icon: History }
  ];

  const faqItems = [
    {
      question: "What is Smart PromptIQ?",
      answer: "Smart PromptIQ is an AI-powered platform that transforms abstract ideas into detailed, actionable blueprints through intelligent questionnaires and advanced prompt generation. It serves business professionals, creative teams, and technical specialists across multiple domains."
    },
    {
      question: "How does the token system work?",
      answer: "Our token system is usage-based. Free users get 10 tokens, Pro users get 1000 tokens monthly, and Enterprise users get unlimited tokens. Each prompt generation typically uses 1-3 tokens depending on complexity."
    },
    {
      question: "What AI models does Smart PromptIQ use?",
      answer: "We use both OpenAI GPT-4o and Anthropic Claude Sonnet-4, with intelligent routing based on content type and complexity to provide the best results for each use case."
    },
    {
      question: "Can I collaborate with my team?",
      answer: "Yes! Smart PromptIQ supports team collaboration with workspace sharing, collaborative prompt development, and permission management for seamless teamwork."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade security with encrypted data storage, secure authentication via Replit Auth, and comply with industry security standards to protect your information."
    },
    {
      question: "Can I export my prompts?",
      answer: "Yes, you can export your prompts in multiple formats including text, JSON, and PDF. You can also organize them in your personal library for easy access and reuse."
    },
    {
      question: "What categories of prompts can I generate?",
      answer: "Smart PromptIQ supports multiple categories including Business Strategy, Product Development, Marketing, Education, Personal Development, and more. Each category has specialized questionnaires and templates."
    },
    {
      question: "How accurate are the AI-generated prompts?",
      answer: "Our prompts are highly accurate thanks to our multi-layer approach: intelligent questionnaires, advanced AI models, and customization options. The system learns from user feedback to continuously improve quality."
    }
  ];

  const apiEndpoints = [
    {
      method: "POST",
      endpoint: "/api/prompts/generate",
      description: "Generate a new prompt based on category and responses",
      parameters: "category, responses, customization"
    },
    {
      method: "GET",
      endpoint: "/api/prompts",
      description: "Retrieve user's saved prompts",
      parameters: "limit, offset, category"
    },
    {
      method: "POST",
      endpoint: "/api/prompts/refine",
      description: "Refine an existing prompt",
      parameters: "promptId, refinementInstructions"
    },
    {
      method: "GET",
      endpoint: "/api/suggestions/trending",
      description: "Get trending prompt suggestions",
      parameters: "category, limit"
    },
    {
      method: "GET",
      endpoint: "/api/subscription",
      description: "Get user subscription information",
      parameters: "none"
    }
  ];

  const troubleshootingItems = [
    {
      issue: "Prompt generation is slow",
      solution: "This can happen during peak usage. Try generating simpler prompts first, or wait a few minutes and try again. Check your internet connection and clear browser cache if the issue persists."
    },
    {
      issue: "Unable to save prompts",
      solution: "Ensure you're logged in and have sufficient storage quota. Try refreshing the page and attempting to save again. Contact support if the issue continues."
    },
    {
      issue: "API quota exceeded",
      solution: "You've reached your monthly token limit. Upgrade to a higher tier for more tokens, or wait until next month for your quota to reset."
    },
    {
      issue: "Login issues",
      solution: "Clear your browser cookies and cache, then try logging in again. Ensure you're using the correct credentials and check if there are any browser extensions blocking the login."
    },
    {
      issue: "Poor prompt quality",
      solution: "Provide more detailed responses in the questionnaire, use the customization options to specify tone and detail level, and try refining the prompt with additional instructions."
    }
  ];

  const releaseNotes = [
    {
      version: "1.3.0",
      date: "June 17, 2025",
      changes: [
        "Integrated secure admin access controls in navigation with modal authentication",
        "Added role-based permissions for admin functionality",
        "Enhanced mobile navigation with responsive hamburger menu",
        "Improved admin dashboard with comprehensive user management"
      ]
    },
    {
      version: "1.2.0",
      date: "June 15, 2025",
      changes: [
        "Added comprehensive admin dashboard with user management",
        "Integrated analytics and billing management",
        "Enhanced security with password reset functionality",
        "Improved user experience with better error handling"
      ]
    },
    {
      version: "1.1.0",
      date: "June 14, 2025",
      changes: [
        "Custom questionnaire feature with 4-step guided form",
        "Multi-format file upload support",
        "Enhanced AI model integration with batch processing",
        "Improved caching system for better performance"
      ]
    },
    {
      version: "1.0.0",
      date: "June 14, 2025",
      changes: [
        "Initial release of Smart PromptIQ platform",
        "Multi-category prompt generation",
        "User authentication and subscription management",
        "Team collaboration features"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Smart PromptIQ Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about using Smart PromptIQ to transform your ideas into actionable prompts
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          activeSection === item.id ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 border-r-2 border-indigo-500' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {/* Getting Started */}
              {activeSection === "getting-started" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Play className="w-6 h-6 text-indigo-600" />
                        <span>Getting Started</span>
                      </CardTitle>
                      <CardDescription>
                        Welcome to Smart PromptIQ! Let's get you up and running in minutes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Quick Start Guide</h3>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm">1</div>
                            <div>
                              <h4 className="font-medium">Sign Up & Login</h4>
                              <p className="text-gray-600 dark:text-gray-300">Create your account and log in to access all features.</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm">2</div>
                            <div>
                              <h4 className="font-medium">Choose Your Category</h4>
                              <p className="text-gray-600 dark:text-gray-300">Select from Marketing, Product Development, Financial Planning, Education, or Personal Development.</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm">3</div>
                            <div>
                              <h4 className="font-medium">Complete the Questionnaire</h4>
                              <p className="text-gray-600 dark:text-gray-300">Answer intelligent questions that help our AI understand your needs.</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm">4</div>
                            <div>
                              <h4 className="font-medium">Generate & Customize</h4>
                              <p className="text-gray-600 dark:text-gray-300">Get your AI-generated prompt and customize tone, detail level, and format.</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm">5</div>
                            <div>
                              <h4 className="font-medium">Save & Share</h4>
                              <p className="text-gray-600 dark:text-gray-300">Save your prompts to your library and share with your team.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start space-x-3">
                            <Lightbulb className="w-5 h-5 text-yellow-600 mt-1" />
                            <div>
                              <h4 className="font-medium">Intelligent Questionnaires</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Dynamic questions that adapt to your responses</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Zap className="w-5 h-5 text-blue-600 mt-1" />
                            <div>
                              <h4 className="font-medium">AI-Powered Generation</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Advanced language models for high-quality prompts</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Users className="w-5 h-5 text-green-600 mt-1" />
                            <div>
                              <h4 className="font-medium">Team Collaboration</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Share workspaces and collaborate on prompts</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Settings className="w-5 h-5 text-purple-600 mt-1" />
                            <div>
                              <h4 className="font-medium">Customization Engine</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Adjust tone, detail level, and format</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Ready to Start?</h4>
                        <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                          Jump right in and create your first prompt in under 2 minutes!
                        </p>
                        <Link href="/categories">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            Create Your First Prompt
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* How to Use */}
              {activeSection === "how-to-use" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                        <span>How to Use Smart PromptIQ</span>
                      </CardTitle>
                      <CardDescription>
                        Comprehensive guide to using all features of Smart PromptIQ effectively.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="basic">Basic Usage</TabsTrigger>
                          <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
                          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
                          <TabsTrigger value="tips">Pro Tips</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4">
                          <h3 className="text-lg font-semibold">Basic Prompt Generation</h3>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">1. Dashboard Overview</h4>
                              <p className="text-gray-600 dark:text-gray-300 mb-2">
                                Your dashboard shows your recent prompts, token usage, and quick access to categories.
                              </p>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                <li>View your prompt history and favorites</li>
                                <li>Monitor your token balance and usage</li>
                                <li>Access trending suggestions</li>
                                <li>Quick category navigation</li>
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">2. Selecting Categories</h4>
                              <p className="text-gray-600 dark:text-gray-300 mb-2">
                                Choose the category that best fits your project:
                              </p>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                <li><strong>Marketing:</strong> Social media campaigns, SEO strategies, brand development</li>
                                <li><strong>Product Development:</strong> MVP planning, UX design, competitive analysis</li>
                                <li><strong>Financial Planning:</strong> Revenue models, funding strategies, pitch decks</li>
                                <li><strong>Education:</strong> Course creation, skill development, research insights</li>
                                <li><strong>Personal Development:</strong> Goal setting, public speaking, networking</li>
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">3. Completing Questionnaires</h4>
                              <p className="text-gray-600 dark:text-gray-300 mb-2">
                                Our intelligent questionnaires adapt to your responses:
                              </p>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                <li>Answer all questions honestly and thoroughly</li>
                                <li>Provide specific details when possible</li>
                                <li>Questions adapt based on your previous answers</li>
                                <li>You can go back and modify responses</li>
                              </ul>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-4">
                          <h3 className="text-lg font-semibold">Advanced Features</h3>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Customization Options</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                <li><strong>Tone:</strong> Professional, casual, persuasive, technical</li>
                                <li><strong>Detail Level:</strong> Brief overview, detailed explanation, comprehensive guide</li>
                                <li><strong>Format:</strong> Bullet points, paragraphs, step-by-step instructions</li>
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Prompt Refinement</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                <li>Use the refine feature to improve generated prompts</li>
                                <li>Provide specific feedback for better results</li>
                                <li>Iterate multiple times for perfect prompts</li>
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Batch Processing</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                <li>Generate multiple prompts simultaneously</li>
                                <li>Optimize for cost and speed</li>
                                <li>Queue management for large requests</li>
                              </ul>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="collaboration" className="space-y-4">
                          <h3 className="text-lg font-semibold">Team Collaboration</h3>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Workspace Sharing</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                <li>Create shared workspaces for your team</li>
                                <li>Invite team members with specific permissions</li>
                                <li>Manage access levels (view, edit, admin)</li>
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Collaborative Editing</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                <li>Real-time collaboration on prompts</li>
                                <li>Comment and suggest improvements</li>
                                <li>Version history and rollback options</li>
                              </ul>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="tips" className="space-y-4">
                          <h3 className="text-lg font-semibold">Pro Tips</h3>
                          <div className="space-y-4">
                            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">💡 Best Practices</h4>
                              <ul className="list-disc list-inside text-sm text-green-800 dark:text-green-200 space-y-1">
                                <li>Be specific in your questionnaire responses</li>
                                <li>Use the customization options to match your brand voice</li>
                                <li>Save frequently used prompts as templates</li>
                                <li>Regularly review and refine your prompts</li>
                                <li>Collaborate with team members for better results</li>
                              </ul>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">⚡ Efficiency Tips</h4>
                              <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                <li>Use trending suggestions for inspiration</li>
                                <li>Batch similar prompts together</li>
                                <li>Take advantage of caching for repeated requests</li>
                                <li>Monitor your token usage to optimize costs</li>
                              </ul>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* FAQ */}
              {activeSection === "faq" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <HelpCircle className="w-6 h-6 text-indigo-600" />
                        <span>Frequently Asked Questions</span>
                      </CardTitle>
                      <CardDescription>
                        Common questions and answers about Smart PromptIQ.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {faqItems.map((item, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 dark:text-gray-300">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* API Reference */}
              {activeSection === "api-reference" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Code className="w-6 h-6 text-indigo-600" />
                        <span>API Reference</span>
                      </CardTitle>
                      <CardDescription>
                        Technical documentation for developers integrating with Smart PromptIQ.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Authentication</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            All API requests require authentication via session cookies or API tokens.
                          </p>
                          <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            Authorization: Bearer YOUR_API_TOKEN
                          </code>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Endpoints</h3>
                        <div className="space-y-4">
                          {apiEndpoints.map((endpoint, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                                  {endpoint.method}
                                </Badge>
                                <code className="text-sm font-mono">{endpoint.endpoint}</code>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {endpoint.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Parameters: {endpoint.parameters}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Rate Limits</h3>
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                          <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                            <li>Free tier: 100 requests per hour</li>
                            <li>Pro tier: 1000 requests per hour</li>
                            <li>Enterprise tier: 10000 requests per hour</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Troubleshooting */}
              {activeSection === "troubleshooting" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Wrench className="w-6 h-6 text-indigo-600" />
                        <span>Troubleshooting</span>
                      </CardTitle>
                      <CardDescription>
                        Solutions to common issues and problems.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {troubleshootingItems.map((item, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">
                            {item.issue}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {item.solution}
                          </p>
                        </div>
                      ))}

                      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Still Need Help?</h4>
                        <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                          If you can't find a solution here, our support team is ready to help!
                        </p>
                        <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                          Contact Support
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Release Notes */}
              {activeSection === "release-notes" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <History className="w-6 h-6 text-indigo-600" />
                        <span>Release Notes & Changelog</span>
                      </CardTitle>
                      <CardDescription>
                        Latest updates, new features, and improvements to Smart PromptIQ.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {releaseNotes.map((release, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">Version {release.version}</h3>
                            <Badge variant="outline">{release.date}</Badge>
                          </div>
                          <ul className="space-y-2">
                            {release.changes.map((change, changeIndex) => (
                              <li key={changeIndex} className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}