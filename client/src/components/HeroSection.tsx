import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Rocket, Play } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="gradient-bg py-20 relative overflow-hidden" id="main-content" aria-labelledby="hero-heading">
      <div className="absolute inset-0 bg-black/10" aria-hidden="true"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <header className="animate-fade-in">
          <h1 id="hero-heading" className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">
            Transform Ideas into
            <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent block">
              Actionable Blueprints
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed text-balance">
            SmartPromptIQ™ guides you through intelligent questionnaires to generate comprehensive, 
            AI-powered prompts for business strategies, creative briefs, and technical projects.
          </p>
          
          <nav className="flex flex-col sm:flex-row gap-4 justify-center items-center" aria-label="Primary actions">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-slate-50 px-8 py-4 text-lg font-semibold shadow-2xl hover:scale-105 transition-all focus:ring-4 focus:ring-white/30"
              aria-describedby="cta-description"
            >
              <Rocket className="mr-2" size={20} aria-hidden="true" />
              Start Creating Now
            </Button>
            
            <Link href="/demo" aria-label="Try our demo without signing up">
              <Button 
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 text-lg font-semibold shadow-2xl hover:scale-105 transition-all focus:ring-4 focus:ring-white/30"
              >
                <Play className="mr-2" size={20} aria-hidden="true" />
                Try Demo Without Signup
              </Button>
            </Link>
          </nav>
          
          <p id="cta-description" className="text-white/70 text-sm mt-6">
            No credit card required • See real AI results instantly
          </p>
        </header>
      </div>
    </section>
  );
}
