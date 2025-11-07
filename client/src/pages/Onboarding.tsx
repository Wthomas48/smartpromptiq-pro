import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Rocket,
  Sparkles,
  Users,
  CheckCircle,
  ArrowRight,
  Map
} from 'lucide-react';

type UserIntent = 'learn' | 'build' | 'both' | 'explore' | null;
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | null;
type TeamSize = 'solo' | 'small' | 'medium' | 'large' | null;

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intent' | 'details'>('intent');
  const [intent, setIntent] = useState<UserIntent>(null);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(null);
  const [teamSize, setTeamSize] = useState<TeamSize>(null);

  const handleIntentSelect = (selectedIntent: UserIntent) => {
    setIntent(selectedIntent);

    // If user selects explore, go directly to demo
    if (selectedIntent === 'explore') {
      setLocation('/demo');
      return;
    }

    // Otherwise, move to details step
    setStep('details');
  };

  const handleComplete = () => {
    // Route based on intent and details
    if (intent === 'learn') {
      // Learners - route based on experience level
      if (experienceLevel === 'beginner') {
        setLocation('/academy?onboarding=true&recommended=free');
      } else {
        setLocation('/pricing?recommended=academy&onboarding=true');
      }
    } else if (intent === 'build') {
      // Builders - route based on team size
      if (teamSize === 'solo') {
        setLocation('/pricing?recommended=pro&onboarding=true');
      } else if (teamSize === 'small') {
        setLocation('/pricing?recommended=team&onboarding=true');
      } else {
        setLocation('/pricing?recommended=enterprise&onboarding=true');
      }
    } else if (intent === 'both') {
      // Both - always recommend Pro
      setLocation('/pricing?recommended=pro&highlight=both&onboarding=true');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">

        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${step === 'intent' ? 'bg-indigo-600' : 'bg-indigo-400'}`}></div>
          <div className="w-16 h-1 bg-gray-300"></div>
          <div className={`w-3 h-3 rounded-full ${step === 'details' ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
        </div>

        {step === 'intent' && (
          <Card className="bg-white shadow-2xl border-none">
            <CardContent className="p-8 md:p-12">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
                  Welcome to SmartPromptIQ! 👋
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  We're a 2-in-1 platform: <strong className="text-purple-600">AI Education</strong> + <strong className="text-blue-600">Pro Tools</strong>.
                  <br />Let's find the perfect starting point for you.
                </p>
              </div>

              {/* Intent Options */}
              <div className="space-y-4">
                {/* Learn Option */}
                <button
                  onClick={() => handleIntentSelect('learn')}
                  className="w-full text-left p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                      <GraduationCap className="w-7 h-7 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          I want to learn prompt engineering
                        </h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        Take me to the Academy - 57 courses, 555+ lessons, certificates, and hands-on learning
                      </p>
                      <div className="mt-3 flex items-center text-sm text-purple-600 font-medium">
                        <span>Best for: Students, career changers, upskilling</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all ml-4" />
                  </div>
                </button>

                {/* Build Option */}
                <button
                  onClick={() => handleIntentSelect('build')}
                  className="w-full text-left p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                      <Rocket className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          I need to generate AI prompts for my work
                        </h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        Show me the Pro tools - templates, generators, team collaboration, API access
                      </p>
                      <div className="mt-3 flex items-center text-sm text-blue-600 font-medium">
                        <span>Best for: Agencies, startups, product teams, consultants</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all ml-4" />
                  </div>
                </button>

                {/* Both Option - Featured */}
                <button
                  onClick={() => handleIntentSelect('both')}
                  className="w-full text-left p-6 border-2 border-indigo-400 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-500 text-white border-none">Most Popular</Badge>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 pr-20">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          Both! I want to learn AND build
                        </h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        Perfect! Get full Academy access + Pro tools in one platform. Learn theory, apply immediately.
                      </p>
                      <div className="mt-3 flex items-center text-sm text-indigo-600 font-medium">
                        <span>Best for: Professionals who want complete mastery + execution</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-all ml-4" />
                  </div>
                </button>

                {/* Explore Option */}
                <button
                  onClick={() => handleIntentSelect('explore')}
                  className="w-full text-left p-6 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-gray-200 transition-colors">
                      <Map className="w-7 h-7 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                          I'm not sure yet - show me around
                        </h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        No problem! Take a quick tour and try our interactive demo
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-all ml-4" />
                  </div>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Free to start</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>10,000+ students enrolled</span>
                  </div>
                </div>

                {/* Skip Onboarding Link */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setLocation('/dashboard')}
                    className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                  >
                    Skip onboarding and explore on my own
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'details' && intent === 'learn' && (
          <Card className="bg-white shadow-2xl border-none">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
                  Great! The Academy is perfect for you.
                </h2>
                <p className="text-lg text-gray-600">
                  Quick question: What's your experience level with AI and prompt engineering?
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <button
                  onClick={() => setExperienceLevel('beginner')}
                  className={`w-full p-6 border-2 rounded-xl transition-all ${
                    experienceLevel === 'beginner'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Complete beginner</h3>
                    <p className="text-gray-600">New to AI and prompts - starting from scratch</p>
                    <p className="text-sm text-purple-600 font-medium mt-2">
                      → We'll start you with free fundamentals courses
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setExperienceLevel('intermediate')}
                  className={`w-full p-6 border-2 rounded-xl transition-all ${
                    experienceLevel === 'intermediate'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Some experience</h3>
                    <p className="text-gray-600">Familiar with basics, want to deepen knowledge</p>
                    <p className="text-sm text-purple-600 font-medium mt-2">
                      → Academy Only ($29/mo) recommended for full access
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setExperienceLevel('advanced')}
                  className={`w-full p-6 border-2 rounded-xl transition-all ${
                    experienceLevel === 'advanced'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Advanced / Professional</h3>
                    <p className="text-gray-600">Teaching, consulting, or building advanced systems</p>
                    <p className="text-sm text-purple-600 font-medium mt-2">
                      → Pro tier recommended (Academy + execution tools)
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('intent')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!experienceLevel}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'details' && intent === 'build' && (
          <Card className="bg-white shadow-2xl border-none">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mb-4">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
                  Perfect! The Pro tools are designed for you.
                </h2>
                <p className="text-lg text-gray-600">
                  What's your team size?
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <button
                  onClick={() => setTeamSize('solo')}
                  className={`w-full p-6 border-2 rounded-xl transition-all ${
                    teamSize === 'solo'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Solo freelancer or consultant</h3>
                    <p className="text-gray-600">Just me working independently</p>
                    <p className="text-sm text-blue-600 font-medium mt-2">
                      → Pro ($49/mo): Full Academy + 200 AI prompts/month
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setTeamSize('small')}
                  className={`w-full p-6 border-2 rounded-xl transition-all ${
                    teamSize === 'small'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Small team (2-5 people)</h3>
                    <p className="text-gray-600">Small agency or startup team</p>
                    <p className="text-sm text-blue-600 font-medium mt-2">
                      → Team Pro ($99/mo): 1,000 prompts + collaboration tools
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setTeamSize('medium')}
                  className={`w-full p-6 border-2 rounded-xl transition-all ${
                    teamSize === 'medium'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Growing business (6-20 people)</h3>
                    <p className="text-gray-600">Scaling team with collaboration needs</p>
                    <p className="text-sm text-blue-600 font-medium mt-2">
                      → Team Pro or Enterprise - we'll help you choose
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setTeamSize('large')}
                  className={`w-full p-6 border-2 rounded-xl transition-all ${
                    teamSize === 'large'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Large organization (20+ people)</h3>
                    <p className="text-gray-600">Enterprise needs with custom requirements</p>
                    <p className="text-sm text-blue-600 font-medium mt-2">
                      → Enterprise ($299+/mo): Unlimited users, custom branding
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('intent')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!teamSize}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'details' && intent === 'both' && (
          <Card className="bg-white shadow-2xl border-none">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
                  The perfect combo! Here's what we recommend:
                </h2>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 mb-8 border-2 border-indigo-200">
                <div className="flex items-start mb-6">
                  <div className="flex-shrink-0">
                    <Badge className="bg-indigo-600 text-white text-lg px-4 py-2">Recommended</Badge>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro Plan - $49/month</h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-purple-700 mb-3">📚 Full Academy Access:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>All 57 courses</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>555+ lessons</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Professional certificates</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-700 mb-3">⚡ Pro Tools:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>200 AI prompts/month</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>50+ templates</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-indigo-200">
                  <p className="text-sm text-indigo-800 font-semibold mb-1">💡 Why this works:</p>
                  <p className="text-gray-700 text-sm">
                    Learn the theory in courses, then immediately apply it with Pro tools. One platform, zero friction.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('intent')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  View Pro Pricing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
