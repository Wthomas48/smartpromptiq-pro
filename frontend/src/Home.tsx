import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import BrainLogo, { BrainIcon } from './BrainLogo';
import { 
  Sparkles, 
  Zap, 
  Brain, 
  Rocket, 
  Users, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Shield,
  Target
} from 'lucide-react';
// At the top of Home.tsx, add:
import Navigation from './Navigation';

// Then wrap everything in:
return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
    <Navigation user={user} onAuthAction={handleAuthAction} />
    {/* rest of your content */}
  </div>
);
export default function Home() {
  const { isAuthenticated, user } = useAuth();
{isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="text-lg px-8 py-4">
                    <Link to="/prompt-builder">
                      <BrainIcon size={20} className="mr-2" />
                      Start Building Prompts
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4" asChild>
                    <Link to="/dashboard">
                      <Rocket className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </>
              ) : (
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Prompts",
      description: "Generate intelligent, context-aware prompts using advanced AI technology",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Get professional prompts in seconds, not hours of manual writing",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Purpose-Built Templates",
      description: "Industry-specific templates for marketing, development, education & more",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics & Insights",
      description: "Track performance and optimize your prompts with detailed analytics",
      color: "from-blue-500 to-indigo-500"
    }
  ];

  const benefits = [
    "Save 90% of time on prompt creation",
    "Increase AI response quality by 300%",
    "Access 500+ professional templates",
    "Team collaboration tools",
    "Advanced analytics dashboard",
    "Priority customer support"
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechCorp",
      content: "SmartPromptIQ transformed our content creation process. We're getting better AI responses and saving hours every week.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Product Manager",
      company: "StartupXYZ",
      content: "The templates are incredible. What used to take hours now takes minutes, and the quality is consistently excellent.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm">
              <div className="w-4 h-4 mr-2">
                <BrainLogo size={16} variant="minimal" />
              </div>
              Trusted by 10,000+ professionals
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Smart <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">PromptIQ</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              The world's most advanced prompt engineering platform. Generate professional, 
              high-converting prompts for any AI model in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="text-lg px-8 py-4">
                    <Link to="/dashboard">
                      <Rocket className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4" asChild>
                    <Link to="/templates">View Templates</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="text-lg px-8 py-4">
                    <BrainIcon size={20} className="mr-2" />
                    Start Free Trial
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                    <BrainIcon size={20} className="mr-2" />
                    View Demo
                  </Button>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">10,000+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose SmartPromptIQ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built the most comprehensive prompt engineering platform to help you get the best results from AI models.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Everything you need to create perfect prompts
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button size="lg" className="text-lg px-8 py-4">
                  <BrainIcon size={20} className="mr-2" />
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-indigo-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                    <p className="text-sm text-indigo-800 font-medium">
                      ✨ AI-generated prompt suggestion ready!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by professionals worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying about SmartPromptIQ
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to transform your AI workflow?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who are already creating better prompts with SmartPromptIQ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              <BrainIcon size={20} className="mr-2" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-indigo-600">
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-75">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}