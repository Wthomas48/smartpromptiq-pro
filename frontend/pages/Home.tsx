import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import QuickStart from "@/components/QuickStart";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/Logo";
import {
  WandSparkles,
  SlidersHorizontal,
  Save,
  TrendingUp,
  Users,
  Brain,
} from "lucide-react";

export default function Home() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: Brain,
      title: "Intelligent Questionnaires",
      description:
        "Dynamic question flows that adapt based on your responses, ensuring we capture exactly what you need.",
      gradient: "from-blue-50 to-indigo-50",
      iconBg: "bg-blue-500",
    },
    {
      icon: WandSparkles,
      title: "AI-Powered Generation",
      description:
        "Advanced language models create comprehensive, detailed prompts tailored to your specific requirements.",
      gradient: "from-violet-50 to-purple-50",
      iconBg: "bg-violet-500",
    },
    {
      icon: SlidersHorizontal,
      title: "Full Customization",
      description:
        "Adjust tone, detail level, format, and style to match your exact preferences and brand voice.",
      gradient: "from-emerald-50 to-teal-50",
      iconBg: "bg-emerald-500",
    },
    {
      icon: Save,
      title: "Prompt Library",
      description:
        "Save, organize, and reuse your favorite prompts with powerful search and categorization features.",
      gradient: "from-amber-50 to-orange-50",
      iconBg: "bg-amber-500",
    },
    {
      icon: TrendingUp,
      title: "Usage Analytics",
      description:
        "Track your prompt usage, performance metrics, and identify your most effective templates.",
      gradient: "from-rose-50 to-pink-50",
      iconBg: "bg-rose-500",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Share prompts with team members, collaborate on projects, and maintain consistent quality across your organization.",
      gradient: "from-cyan-50 to-blue-50",
      iconBg: "bg-cyan-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main>
        <HeroSection onGetStarted={handleGetStarted} />

        {/* Quick Start Demo Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <QuickStart />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Powerful Features for Every Use Case
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Smart PromptIQ combines intelligent questionnaires with
                AI-powered generation to create the most relevant and actionable
                prompts for your specific needs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`feature-card p-6 bg-gradient-to-br ${feature.gradient} border border-opacity-20`}
                >
                  <CardContent className="p-0">
                    <div
                      className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center mb-4 animate-float`}
                    >
                      <feature.icon className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-balance leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Logo size={32} />
                <span className="text-xl font-bold">Smart PromptIQ</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Transform your ideas into actionable blueprints with AI-powered
                prompt generation tailored to your specific needs and industry
                requirements.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 Smart PromptIQ. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a
                href="#"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
