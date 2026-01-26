import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Users, Star, Zap } from 'lucide-react';

interface PublicLandingLayoutProps {
  children: React.ReactNode;
  heroGradient?: string;
}

/**
 * PublicLandingLayout - SEO-optimized layout wrapper for public landing pages
 * Shows navigation, hero section styling, and CTA when user is not logged in
 */
const PublicLandingLayout: React.FC<PublicLandingLayoutProps> = ({
  children,
  heroGradient = 'from-indigo-600 via-purple-600 to-cyan-600'
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* SEO-Optimized Public Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <a className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${heroGradient} flex items-center justify-center`}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  SmartPromptIQ
                </span>
              </a>
            </Link>

            {/* Navigation Links - SEO Internal Linking */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/academy">
                <a className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                  Academy
                </a>
              </Link>
              <Link href="/templates">
                <a className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                  Templates
                </a>
              </Link>
              <Link href="/builderiq">
                <a className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                  BuilderIQ
                </a>
              </Link>
              <Link href="/agents">
                <a className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                  AI Agents
                </a>
              </Link>
              <Link href="/voice">
                <a className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                  Voice AI
                </a>
              </Link>
              <Link href="/marketplace">
                <a className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                  Marketplace
                </a>
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="ghost" className="hidden sm:flex">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className={`bg-gradient-to-r ${heroGradient} hover:opacity-90 text-white`}>
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main role="main" id="main-content">
        {children}
      </main>

      {/* SEO-Optimized Footer with Internal Links */}
      <footer className="bg-gray-900 text-gray-300 py-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 pb-12 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold">10,000+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="font-semibold">99.9% Uptime</span>
            </div>
          </div>

          {/* Footer Links - SEO Internal Linking */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="/templates"><a className="hover:text-white transition-colors">Prompt Templates</a></Link></li>
                <li><Link href="/builderiq"><a className="hover:text-white transition-colors">App Builder</a></Link></li>
                <li><Link href="/agents"><a className="hover:text-white transition-colors">AI Agents</a></Link></li>
                <li><Link href="/voice"><a className="hover:text-white transition-colors">Voice AI</a></Link></li>
                <li><Link href="/marketplace"><a className="hover:text-white transition-colors">Marketplace</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Learning</h3>
              <ul className="space-y-2">
                <li><Link href="/academy"><a className="hover:text-white transition-colors">Academy</a></Link></li>
                <li><Link href="/academy/courses"><a className="hover:text-white transition-colors">All Courses</a></Link></li>
                <li><Link href="/academy/paths"><a className="hover:text-white transition-colors">Learning Paths</a></Link></li>
                <li><Link href="/documentation"><a className="hover:text-white transition-colors">Documentation</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/pricing"><a className="hover:text-white transition-colors">Pricing</a></Link></li>
                <li><Link href="/contact"><a className="hover:text-white transition-colors">Contact</a></Link></li>
                <li><Link href="/support"><a className="hover:text-white transition-colors">Support</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy-policy"><a className="hover:text-white transition-colors">Privacy Policy</a></Link></li>
                <li><Link href="/terms-of-service"><a className="hover:text-white transition-colors">Terms of Service</a></Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-500 pt-8 border-t border-gray-800">
            <p>&copy; {new Date().getFullYear()} SmartPromptIQ. All rights reserved.</p>
            <p className="mt-2 text-sm">The AI-powered prompt engineering platform for professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLandingLayout;
