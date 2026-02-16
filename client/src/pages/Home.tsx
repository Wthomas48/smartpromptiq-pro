import { useEffect, useRef } from "react";
import TopNavigation from "@/components/TopNavigation";
import AnimatedCounter from "@/components/AnimatedCounter";
import BrainLogo from "@/components/BrainLogo";
import { useLocation } from "wouter";
import BRAND from "@/config/brand";

export default function Home() {
  const [, setLocation] = useLocation();
  const heroStarsRef = useRef<HTMLDivElement>(null);
  const ctaStarsRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    setLocation("/signin?mode=signup");
  };

  const handleDemo = () => {
    setLocation("/signin");
  };

  const handleSignIn = () => {
    setLocation("/signin");
  };

  // Create animated stars
  const createStars = (container: HTMLElement, count = 50) => {
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star floating-star';
      const size = Math.random() * 4 + 2;
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 6 + 's';
      container.appendChild(star);
    }
  };

  useEffect(() => {
    if (heroStarsRef.current) createStars(heroStarsRef.current, 60);
    if (ctaStarsRef.current) createStars(ctaStarsRef.current, 40);
  }, []);

  return (
    <div className="min-h-screen" itemScope itemType="https://schema.org/WebPage">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BRAND.schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BRAND.webAppSchema) }}
      />

      <TopNavigation
        onGetStarted={handleGetStarted}
        onSignIn={handleSignIn}
      />

      <main role="main" id="main-content">

        {/* ================================================
            1) HERO SECTION
            ================================================ */}
        <section className="hero-section">
          <div className="stars-container" ref={heroStarsRef}></div>

          <div className="hero-content">
            <div className="hero-logo-section">
              <div className="flex items-center justify-center mb-4">
                <BrainLogo size={100} animate={true} variant="gradient" className="hero-brain-logo" />
              </div>
            </div>

            <h1 className="hero-title">
              Turn Ideas Into AI-Powered <br />
              <span className="gradient-text">Apps, Prompts & Workflows</span>
            </h1>

            <p className="hero-description" itemProp="description">
              The all-in-one platform where you learn prompt engineering, generate production-ready AI content, and build real applications — no coding required.
            </p>

            {/* 3 Outcome-Focused Bullet Benefits */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-white/90">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></span>
                <span>Launch AI apps in minutes, not months</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></span>
                <span>10x your content output with smart prompts</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></span>
                <span>Earn certifications that prove your AI skills</span>
              </div>
            </div>

            <div className="cta-buttons">
              <button onClick={handleGetStarted} className="btn btn-primary">
                Start Free — Build Your First AI App
              </button>
              <button onClick={handleDemo} className="btn btn-secondary">
                Try the Live Demo
              </button>
            </div>

            {/* Social Proof Line */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">
                  <AnimatedCounter end={47283} duration={2500} className="stat-number" />
                </div>
                <div className="stat-label">AI Prompts Generated</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  <AnimatedCounter end={8947} duration={2000} className="stat-number" />
                </div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  <AnimatedCounter end={98.7} decimals={1} suffix="%" duration={2200} className="stat-number" />
                </div>
                <div className="stat-label">Satisfaction Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  <AnimatedCounter end={57} duration={1800} className="stat-number" />
                </div>
                <div className="stat-label">Expert Courses</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            2) CHOOSE YOUR PATH
            ================================================ */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-4">
                <span className="text-sm font-semibold text-purple-700">FIND YOUR FIT</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                What Brings You Here?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                SmartPromptIQ works differently depending on your goal. Pick the path that fits you best.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Path 1: Learner */}
              <button
                onClick={() => setLocation('/academy')}
                className="group text-left bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                  I want to learn AI & prompt engineering
                </h3>
                <p className="text-sm text-gray-600">
                  57 courses, hands-on projects, and certifications to go from beginner to expert.
                </p>
                <div className="mt-4 text-sm font-semibold text-purple-600 flex items-center gap-1">
                  Explore Academy <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </button>

              {/* Path 2: Creator */}
              <button
                onClick={handleGetStarted}
                className="group text-left bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">✍️</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                  I want to generate better prompts & content
                </h3>
                <p className="text-sm text-gray-600">
                  Smart questionnaires and 100+ templates to produce expert-level prompts instantly.
                </p>
                <div className="mt-4 text-sm font-semibold text-blue-600 flex items-center gap-1">
                  Start Creating <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </button>

              {/* Path 3: Builder */}
              <button
                onClick={handleGetStarted}
                className="group text-left bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  I want to build AI-powered apps & workflows
                </h3>
                <p className="text-sm text-gray-600">
                  BuilderIQ generates complete app blueprints. Deploy chatbots and AI agents without code.
                </p>
                <div className="mt-4 text-sm font-semibold text-emerald-600 flex items-center gap-1">
                  Start Building <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </button>

              {/* Path 4: Team/Business */}
              <button
                onClick={() => setLocation('/pricing')}
                className="group text-left bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-700 transition-colors">
                  I want AI for my team or business
                </h3>
                <p className="text-sm text-gray-600">
                  Shared workspaces, team analytics, API access, and white-label solutions at scale.
                </p>
                <div className="mt-4 text-sm font-semibold text-orange-600 flex items-center gap-1">
                  View Plans <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* ================================================
            3) ACADEMY SECTION
            ================================================ */}
        <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900" itemScope itemType="https://schema.org/Course">
          <meta itemProp="provider" content="SmartPromptIQ" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div>
                <div className="inline-block px-4 py-2 bg-purple-500/20 rounded-full mb-4 border border-purple-500/30">
                  <span className="text-sm font-semibold text-purple-300">SMARTPROMPTIQ ACADEMY</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4" itemProp="name">
                  Master AI — From First Prompt <br />to Professional Certification
                </h2>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed" itemProp="description">
                  The most comprehensive AI education system available. Learn prompt engineering through structured courses, then immediately practice in our hands-on playground.
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400 text-sm font-bold">✓</span>
                    </span>
                    <span className="text-gray-200"><strong className="text-white">57 expert-led courses</strong> covering beginner to advanced prompt engineering</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400 text-sm font-bold">✓</span>
                    </span>
                    <span className="text-gray-200"><strong className="text-white">Live playground</strong> to test and refine your prompts in real time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400 text-sm font-bold">✓</span>
                    </span>
                    <span className="text-gray-200"><strong className="text-white">Professional certifications</strong> you can share on LinkedIn and resumes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400 text-sm font-bold">✓</span>
                    </span>
                    <span className="text-gray-200"><strong className="text-white">Real-world use cases</strong> — marketing, dev, sales, education, and more</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400 text-sm font-bold">✓</span>
                    </span>
                    <span className="text-gray-200"><strong className="text-white">Audio lessons & quizzes</strong> for every learning style</span>
                  </li>
                </ul>

                <button
                  onClick={() => setLocation('/academy')}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Explore the Academy &rarr;
                </button>
              </div>

              {/* Right: Visual Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                  <div className="text-4xl font-extrabold text-white mb-1">57</div>
                  <div className="text-sm text-purple-300">Expert Courses</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                  <div className="text-4xl font-extrabold text-white mb-1">555+</div>
                  <div className="text-sm text-purple-300">Interactive Lessons</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                  <div className="text-4xl font-extrabold text-white mb-1">10K+</div>
                  <div className="text-sm text-purple-300">Students Enrolled</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                  <div className="text-4xl font-extrabold text-white mb-1">4.9</div>
                  <div className="text-sm text-purple-300">Average Rating</div>
                </div>
                <div className="col-span-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
                  <p className="text-center text-purple-200 text-sm italic">
                    "This is not just education. This is not just tools. <strong className="text-white">This is a system.</strong>"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            4) PRO TOOLS SECTION
            ================================================ */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-4">
                <span className="text-sm font-semibold text-blue-700">PRO TOOLS</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                Stop Prompting. Start <span className="gradient-text">Producing.</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Generate production-ready prompts, build complete app blueprints, deploy AI chatbots, and create professional voiceovers — all from one dashboard.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Tool Card: Prompt Generator */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl mb-4">
                  ✨
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Prompt Generator</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Answer a few smart questions. Get expert-level prompts for marketing, dev, sales, education — any industry.
                </p>
                <div className="text-sm text-purple-600 font-medium">25+ categories &middot; Instant results</div>
              </div>

              {/* Tool Card: BuilderIQ */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-2xl mb-4">
                  🏗️
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">BuilderIQ</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Describe your idea in plain English. Get a complete app blueprint with features, architecture, and deployment plan.
                </p>
                <div className="text-sm text-blue-600 font-medium">Idea &rarr; Blueprint in seconds</div>
              </div>

              {/* Tool Card: AI Agents */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-2xl mb-4">
                  🤖
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Agents & Chatbots</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Create custom chatbots powered by GPT and Claude. Deploy to any website with a single embed code.
                </p>
                <div className="text-sm text-emerald-600 font-medium">No-code deployment</div>
              </div>

              {/* Tool Card: Templates */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-2xl mb-4">
                  📋
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">100+ Templates</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Battle-tested prompt templates for marketing, copywriting, development, HR, sales, and more. Ready to use.
                </p>
                <div className="text-sm text-orange-600 font-medium">Copy, customize, ship</div>
              </div>

              {/* Tool Card: Voice AI */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl mb-4">
                  🎙️
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Voice AI Studio</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Convert text to natural speech with 20+ premium AI voices. Perfect for podcasts, videos, and courses.
                </p>
                <div className="text-sm text-pink-600 font-medium">ElevenLabs + OpenAI voices</div>
              </div>

              {/* Tool Card: Team Collaboration */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl mb-4">
                  👥
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Team Workspaces</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Shared prompt libraries, usage analytics, role-based access, and API keys for your entire team.
                </p>
                <div className="text-sm text-violet-600 font-medium">Built for collaboration</div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Build with Pro Tools &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* ================================================
            5) FOUR PILLARS SECTION
            ================================================ */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-4">
                <span className="text-sm font-semibold text-purple-700">THE PLATFORM</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                Four Pillars. One Platform.
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to create, automate, learn, and scale with AI.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Pillar: Create */}
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-lg">
                  🎨
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create</h3>
                <p className="text-sm text-gray-600 mb-4">Turn ideas into polished AI-powered outputs.</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-purple-500">&#9679;</span> Production-ready prompts & content
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-purple-500">&#9679;</span> App blueprints from descriptions
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-purple-500">&#9679;</span> Professional voiceovers & audio
                  </li>
                </ul>
              </div>

              {/* Pillar: Automate */}
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-2xl mb-5 shadow-lg">
                  ⚡
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Automate</h3>
                <p className="text-sm text-gray-600 mb-4">Let AI handle the repetitive work.</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-blue-500">&#9679;</span> AI chatbots & agents on any site
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-blue-500">&#9679;</span> Smart workflows & optimization
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-blue-500">&#9679;</span> Batch processing & scheduling
                  </li>
                </ul>
              </div>

              {/* Pillar: Learn */}
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-2xl mb-5 shadow-lg">
                  📚
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Learn</h3>
                <p className="text-sm text-gray-600 mb-4">Build real AI skills with structured education.</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-emerald-500">&#9679;</span> 57 courses &middot; 555+ lessons
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-emerald-500">&#9679;</span> Certifications & progress tracking
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-emerald-500">&#9679;</span> Hands-on playground & quizzes
                  </li>
                </ul>
              </div>

              {/* Pillar: Scale */}
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-2xl mb-5 shadow-lg">
                  📈
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Scale</h3>
                <p className="text-sm text-gray-600 mb-4">Grow from solo user to enterprise team.</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-orange-500">&#9679;</span> Team workspaces & permissions
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-orange-500">&#9679;</span> Usage analytics & cost tracking
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-orange-500">&#9679;</span> API access & white-label options
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            6) HOW IT WORKS (simplified process)
            ================================================ */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-block px-4 py-2 bg-purple-500/20 rounded-full mb-4 border border-purple-500/30">
                <span className="text-sm font-semibold text-purple-300">HOW IT WORKS</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                From Idea to Output in <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Four Steps</span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-4 shadow-lg">1</div>
                <h3 className="text-lg font-bold text-white mb-2">Pick a Category</h3>
                <p className="text-sm text-gray-400">Marketing, dev, sales, education — choose your domain from 25+ categories.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-4 shadow-lg">2</div>
                <h3 className="text-lg font-bold text-white mb-2">Answer Smart Questions</h3>
                <p className="text-sm text-gray-400">Our AI adapts questions to your context so the output matches exactly what you need.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-4 shadow-lg">3</div>
                <h3 className="text-lg font-bold text-white mb-2">AI Generates Content</h3>
                <p className="text-sm text-gray-400">Get production-ready prompts, blueprints, or content in seconds — not hours.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-4 shadow-lg">4</div>
                <h3 className="text-lg font-bold text-white mb-2">Refine & Ship</h3>
                <p className="text-sm text-gray-400">Edit, export, or deploy. Share with your team or use directly in ChatGPT, Claude, and more.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            7) SOCIAL PROOF & USE CASES
            ================================================ */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-4">
                <span className="text-sm font-semibold text-purple-700">SUCCESS STORIES</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                Trusted by Teams That Ship
              </h2>
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1 mb-3 text-yellow-400 text-sm">★★★★★</div>
                <blockquote className="text-gray-700 mb-4 text-sm leading-relaxed">
                  "SmartPromptIQ cut our marketing strategy development from weeks to hours. Conversion rates increased 340% in 3 months. The ROI paid for itself in the first week."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">SC</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Sarah Chen</div>
                    <div className="text-xs text-gray-500">CMO, TechFlow Inc.</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1 mb-3 text-yellow-400 text-sm">★★★★★</div>
                <blockquote className="text-gray-700 mb-4 text-sm leading-relaxed">
                  "The team collaboration features are game-changing. Our product development cycle improved by 40% and cross-team alignment is seamless. Best investment we've made."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">MJ</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Marcus Johnson</div>
                    <div className="text-xs text-gray-500">Head of Product, DataSync Corp</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1 mb-3 text-yellow-400 text-sm">★★★★★</div>
                <blockquote className="text-gray-700 mb-4 text-sm leading-relaxed">
                  "As an educator, SmartPromptIQ revolutionized how I create learning materials. Student engagement increased 85% and course completion hit an all-time high of 94%."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-sm font-bold">ER</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Dr. Emily Rodriguez</div>
                    <div className="text-xs text-gray-500">Professor, Stanford University</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Use Cases */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Built for Every Use Case</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">🏢</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Agencies</h4>
                <p className="text-xs text-gray-500">White-label AI solutions for client delivery at scale</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">🎨</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Creators</h4>
                <p className="text-xs text-gray-500">Content, voiceovers, and marketing prompts 10x faster</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">🛒</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">E-commerce</h4>
                <p className="text-xs text-gray-500">Product descriptions, SEO content, and chatbots</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">📖</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Coaches</h4>
                <p className="text-xs text-gray-500">Course content, client materials, and AI assistants</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">👥</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Internal Teams</h4>
                <p className="text-xs text-gray-500">Shared prompts, workflows, and team analytics</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            8) PRICING OVERVIEW
            ================================================ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-4">
                <span className="text-sm font-semibold text-purple-700">PRICING</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                Start Free. Upgrade When Ready.
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                No credit card required. Every plan includes Academy access and Pro Tools. Pay only when you need more.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {/* Free */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Free</h3>
                <div className="text-3xl font-extrabold text-gray-900 mb-4">$0<span className="text-base font-normal text-gray-500">/mo</span></div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 10 AI prompts/month</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Academy preview</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Basic templates</li>
                </ul>
                <button
                  onClick={handleGetStarted}
                  className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-purple-400 hover:text-purple-700 transition-colors"
                >
                  Get Started
                </button>
              </div>

              {/* Pro - Highlighted */}
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-center text-white shadow-xl relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-orange-400 to-yellow-400 text-gray-900 text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
                <h3 className="text-lg font-bold mb-1">Pro</h3>
                <div className="text-3xl font-extrabold mb-4">$49<span className="text-base font-normal text-purple-200">/mo</span></div>
                <ul className="text-sm text-purple-100 space-y-2 mb-6 text-left">
                  <li className="flex items-center gap-2"><span className="text-green-300">✓</span> 200 AI prompts/month</li>
                  <li className="flex items-center gap-2"><span className="text-green-300">✓</span> Full Academy access (57 courses)</li>
                  <li className="flex items-center gap-2"><span className="text-green-300">✓</span> All Pro Tools + templates</li>
                  <li className="flex items-center gap-2"><span className="text-green-300">✓</span> Voice AI + AI Agents</li>
                </ul>
                <button
                  onClick={handleGetStarted}
                  className="w-full py-3 rounded-xl bg-white text-purple-700 font-bold hover:bg-gray-100 transition-colors"
                >
                  Start Pro Free Trial
                </button>
              </div>

              {/* Business */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Business</h3>
                <div className="text-3xl font-extrabold text-gray-900 mb-4">$149<span className="text-base font-normal text-gray-500">/mo</span></div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 1,000 AI prompts/month</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Team workspaces (5 seats)</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> API access + analytics</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Priority support</li>
                </ul>
                <button
                  onClick={() => setLocation('/pricing')}
                  className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-purple-400 hover:text-purple-700 transition-colors"
                >
                  View Business Plan
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setLocation('/pricing')}
                className="text-purple-600 font-semibold hover:text-purple-800 transition-colors"
              >
                Compare all 6 plans &rarr;
              </button>
              <p className="text-sm text-gray-500 mt-3">
                30-day money-back guarantee &middot; Cancel anytime &middot; No hidden fees
              </p>
            </div>
          </div>
        </section>

        {/* ================================================
            9) FINAL CTA SECTION
            ================================================ */}
        <section className="cta-section">
          <div className="stars-container" ref={ctaStarsRef}></div>

          <div className="cta-content">
            <h2 className="cta-title">Ready to Build Smarter with AI?</h2>
            <p className="cta-description" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
              Join thousands of creators, founders, and teams who use SmartPromptIQ to turn ideas into AI-powered results every day.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button onClick={handleGetStarted} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                Start Free — No Credit Card
              </button>
              <button onClick={handleDemo} className="bg-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-200">
                Try the Demo
              </button>
            </div>

            <div className="cta-trust-indicators">
              <div className="trust-stat">
                <div className="trust-number">8,900+</div>
                <div className="trust-label">Active Users</div>
              </div>
              <div className="trust-stat">
                <div className="trust-number">4.9/5</div>
                <div className="trust-label">User Rating</div>
              </div>
              <div className="trust-stat">
                <div className="trust-number">47K+</div>
                <div className="trust-label">Prompts Created</div>
              </div>
              <div className="trust-stat">
                <div className="trust-number">99.9%</div>
                <div className="trust-label">Uptime</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        {/* Chrome Extension Coming Soon */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-2xl border border-purple-500/30 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">
                🧠
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Chrome Extension
                  <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    COMING SOON
                  </span>
                </h3>
                <p className="text-sm text-gray-300">
                  Generate prompts on ChatGPT, Claude, Gemini & more
                </p>
              </div>
            </div>
            <button
              onClick={() => setLocation('/chrome-extension')}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-cyan-600 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.952 6.848a12.014 12.014 0 0 0 9.296-9.559zM12 8.182a3.818 3.818 0 1 0 0 7.636 3.818 3.818 0 0 0 0-7.636z"/>
              </svg>
              Learn More
            </button>
          </div>
        </div>

        <div className="footer-badges">
          <div className="footer-badge">Enterprise Security</div>
          <div className="footer-badge">GDPR Compliant</div>
          <div className="footer-badge">4.9/5 Rating</div>
          <div className="footer-badge">8,900+ Users</div>
        </div>
        <p>Trusted by creators, startups, and growing businesses worldwide</p>

        {/* Social Links */}
        <div className="flex justify-center gap-4 mt-6">
          <a
            href="https://discord.gg/smartpromptiq"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.36-.698.772-1.362 1.225-1.993a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.12-.094.246-.198.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.094.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Join Discord Community
          </a>
          <a
            href="https://www.youtube.com/@SmartPromptIQ"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#FF0000] hover:bg-[#CC0000] text-white rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            YouTube
          </a>
        </div>

        {/* Legal Links */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <a href="/privacy-policy" className="text-indigo-300 hover:text-white transition-colors">
            Privacy Policy
          </a>
          <span className="text-gray-500">|</span>
          <a href="/terms-of-service" className="text-indigo-300 hover:text-white transition-colors">
            Terms of Service
          </a>
          <span className="text-gray-500">|</span>
          <a href="/contact" className="text-indigo-300 hover:text-white transition-colors">
            Contact Us
          </a>
          <span className="text-gray-500">|</span>
          <a href="/support" className="text-indigo-300 hover:text-white transition-colors">
            Support
          </a>
        </div>

        <div className="text-xs opacity-60 mt-4" style={{ textAlign: 'center' }}>
          &copy; 2026 SmartPromptIQ&trade; — The Intelligent Prompt Engineering Platform
        </div>
      </footer>
    </div>
  );
}
