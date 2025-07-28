import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Rocket, Play } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="gradient-bg py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">
            Transform Ideas into
            <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent block">
              Actionable Blueprints
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed text-balance">
            Smart PromptIQ guides you through intelligent questionnaires to generate comprehensive, 
            AI-powered prompts for business strategies, creative briefs, and technical projects.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-slate-50 px-8 py-4 text-lg font-semibold shadow-2xl hover:scale-105 transition-all"
            >
              <Rocket className="mr-2" size={20} />
              Start Creating Now
            </Button>
            
            <Link href="/demo">
              <Button 
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 text-lg font-semibold shadow-2xl hover:scale-105 transition-all"
              >
                <Play className="mr-2" size={20} />
                Try Demo Without Signup
              </Button>
            </Link>
          </div>
          
          <p className="text-white/70 text-sm mt-6">
            No credit card required • See real AI results instantly
          </p>
        </div>
      </div>
    </section>
  );
}
