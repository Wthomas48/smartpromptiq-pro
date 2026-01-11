import { useEffect, useRef } from "react";
import TopNavigation from "@/components/TopNavigation";
import AnimatedCounter from "@/components/AnimatedCounter";
import BrainLogo from "@/components/BrainLogo";
import { useLocation } from "wouter";

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
      
      // Random size between 2-6px
      const size = Math.random() * 4 + 2;
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      
      // Random position
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      
      // Random animation delay
      star.style.animationDelay = Math.random() * 6 + 's';
      
      container.appendChild(star);
    }
  };

  useEffect(() => {
    if (heroStarsRef.current) createStars(heroStarsRef.current, 60);
    if (ctaStarsRef.current) createStars(ctaStarsRef.current, 40);
  }, []);

  return (
    <div className="min-h-screen">
      <TopNavigation 
        onGetStarted={handleGetStarted}
        onSignIn={handleSignIn}
      />
      
      <main>
        {/* Hero Section with Animated Stars */}
        <section className="hero-section">
          <div className="stars-container" ref={heroStarsRef}></div>
          
          <div className="hero-content">
            <div className="hero-logo-section">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <BrainLogo size={100} animate={true} variant="filled" className="hero-brain-logo" />
                <BrainLogo size={100} animate={true} variant="outline" className="hero-brain-logo-outline" />
              </div>
              <div className="hero-badge">The Complete AI Prompt Engineering & App Creation Platform</div>
            </div>

            <h1 className="hero-title">
              Learn the Skills, Use the Tools<br />
              <span className="gradient-text">Build Real Solutions</span>
            </h1>

            <p className="hero-description">
              SmartPromptIQ™ unifies deep AI education with done-for-you prompt systems.
              Master prompting through 57 courses and 555 lessons, then use BuilderIQ and Pro Tools
              to generate full app specifications, blueprints, prompts, and deployment strategies.
            </p>

            <p className="hero-tagline" style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', marginTop: '-0.5rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
              Your ideas deserve more than theory — they deserve creation.<br />
              <span style={{ fontWeight: 600 }}>Welcome to the future of intelligent building.</span>
            </p>

            <div className="cta-buttons">
              <button onClick={handleGetStarted} className="btn btn-primary">
                ✨ Start Building Smarter
              </button>
              <button onClick={handleDemo} className="btn btn-secondary">
                🎮 Launch the Demo
              </button>
            </div>
            
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
                <div className="stat-label">Success Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  <AnimatedCounter end={24} suffix="/7" duration={2800} className="stat-number" />
                </div>
                <div className="stat-label">Support Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* Two Superpowers Section - NEW */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-4">
                <span className="text-sm font-semibold text-purple-700">🎯 ONE PLATFORM, TWO SUPERPOWERS</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                The Only Platform Where <span className="gradient-text">Learning Meets Execution</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Stop switching between education platforms and execution tools. SmartPromptIQ gives you both in one seamless experience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-16">
              {/* Academy Card */}
              <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-100 rounded-3xl p-8 border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-3xl font-extrabold text-gray-900 mb-3">
                  SmartPromptIQ Academy
                </h3>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  Master prompt engineering with expert-led courses, interactive lessons, and earn professional certificates that prove your skills.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-700 text-base">
                    <i className="fas fa-check-circle text-green-500 mr-3 text-lg"></i>
                    <span><strong>57 expert courses</strong> from industry leaders</span>
                  </li>
                  <li className="flex items-center text-gray-700 text-base">
                    <i className="fas fa-check-circle text-green-500 mr-3 text-lg"></i>
                    <span><strong>555+ interactive lessons</strong> with hands-on practice</span>
                  </li>
                  <li className="flex items-center text-gray-700 text-base">
                    <i className="fas fa-check-circle text-green-500 mr-3 text-lg"></i>
                    <span><strong>Audio learning & quizzes</strong> for every style</span>
                  </li>
                  <li className="flex items-center text-gray-700 text-base">
                    <i className="fas fa-check-circle text-green-500 mr-3 text-lg"></i>
                    <span><strong>Professional certificates</strong> to share on LinkedIn</span>
                  </li>
                  <li className="flex items-center text-gray-700 text-base">
                    <i className="fas fa-check-circle text-green-500 mr-3 text-lg"></i>
                    <span><strong>Live playground</strong> to test your prompts</span>
                  </li>
                </ul>
                <div className="bg-white/70 backdrop-blur rounded-xl p-4 mb-6 border border-purple-200">
                  <p className="text-sm text-purple-800 font-semibold mb-2">🎯 Perfect for:</p>
                  <p className="text-gray-700 text-sm">
                    Students • Career changers • Professionals upskilling • Educators building AI knowledge
                  </p>
                </div>
                <button
                  onClick={() => setLocation('/academy')}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <i className="fas fa-graduation-cap mr-2"></i>
                  Explore Academy →
                </button>
              </div>

              {/* Pro Tools Card */}
              <div className="bg-gradient-to-br from-blue-50 via-cyan-100 to-blue-100 rounded-3xl p-8 border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-3xl font-extrabold text-gray-900 mb-3">
                  SmartPromptIQ Pro
                </h3>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  Generate production-ready AI prompts instantly with smart questionnaires, professional templates, and team collaboration tools.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-700 text-base">
                    <i className="fas fa-check-circle text-green-500 mr-3 text-lg"></i>
                    <span><strong>AI-powered generation</strong> with smart questionnaires</span>
                  </li>
                  <li className="flex items-center text-gray-700 text-base">
                    <i className="fas fa-check-circle text-green-500 mr-3 text-lg"></i>
                    <span><strong>50+ professional templates</strong> for every use case</span>
                  </li>
                  <li className="flex items-center text-gray-700 text-base">
                    <i className="fas fa-check-circle text-green-500 mr-3 text-lg"></i>
                    <span><strong>Team collaboration</strong> with shared workspaces</span>
                  </li>
                  <li className="flex items-center text-gray-700 text-base">
                    <i className="fas fa-check-circle text-green-500 mr-3 text-lg"></i>
                    <span><strong>API access</strong> for integrations & automation</span>
                  </li>
                  <li className="flex items-center text-gray-700 text-base">
                    <i className="fas fa-check-circle text-green-500 mr-3 text-lg"></i>
                    <span><strong>Advanced analytics</strong> to track performance</span>
                  </li>
                </ul>
                <div className="bg-white/70 backdrop-blur rounded-xl p-4 mb-6 border border-blue-200">
                  <p className="text-sm text-blue-800 font-semibold mb-2">🚀 Perfect for:</p>
                  <p className="text-gray-700 text-sm">
                    Agencies • Startups • Product teams • Consultants • Marketing teams executing campaigns
                  </p>
                </div>
                <button
                  onClick={() => setLocation('/pricing')}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <i className="fas fa-rocket mr-2"></i>
                  Try Pro Tools →
                </button>
              </div>
            </div>

            {/* Value Proposition Bar */}
            <div className="mt-16 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-center text-white shadow-2xl">
              <h4 className="text-2xl font-bold mb-3">✨ Get Both for Just $49/month</h4>
              <p className="text-lg text-purple-100 mb-6">
                Full Academy access (57 courses) + Pro Tools (200 AI prompts/month). One login. One platform. Zero friction.
              </p>
              <button
                onClick={() => setLocation('/pricing')}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg inline-flex items-center"
              >
                <i className="fas fa-star mr-2"></i>
                View All Plans & Pricing
              </button>
            </div>
          </div>
        </section>

        {/* Chrome Extension Section - NEW */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full mb-4 border border-orange-500/30">
                <span className="text-sm font-semibold text-orange-300">🧩 CHROME EXTENSION — COMING SOON</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                SmartPromptIQ <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">Everywhere You Work</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Access the full power of SmartPromptIQ directly in your browser — no tab switching, no context lost
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Extension Preview */}
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-2xl">
                      🧠
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">SmartPromptIQ Extension</h3>
                      <p className="text-gray-400 text-sm">v1.0 • Chrome Web Store</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                        <span>✓</span> Active on this page
                      </div>
                      <p className="text-gray-300 text-sm">Ready to generate prompts for any website or application</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold">
                        Generate Prompt
                      </button>
                      <button className="flex-1 bg-white/10 text-white py-2 px-4 rounded-lg text-sm font-semibold border border-white/20">
                        Open Dashboard
                      </button>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  FREE with Pro
                </div>
              </div>

              {/* Benefits List */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-2xl flex-shrink-0 border border-purple-500/30">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Instant Access Anywhere</h4>
                    <p className="text-gray-400">Generate prompts on any website — ChatGPT, Claude, Gemini, or your favorite AI tool. One click, instant results</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-2xl flex-shrink-0 border border-green-500/30">
                    🎯
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Context-Aware Generation</h4>
                    <p className="text-gray-400">The extension reads the page context and suggests the perfect prompts for your current task</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center text-2xl flex-shrink-0 border border-orange-500/30">
                    📚
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Your Prompt Library</h4>
                    <p className="text-gray-400">Access all your saved prompts, templates, and favorites instantly from any browser tab</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-2xl flex-shrink-0 border border-blue-500/30">
                    🔄
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Seamless Sync</h4>
                    <p className="text-gray-400">Everything syncs with your SmartPromptIQ account — prompts, history, and preferences across all devices</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center text-2xl flex-shrink-0 border border-pink-500/30">
                    🚀
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">One-Click Insert</h4>
                    <p className="text-gray-400">Generate and insert prompts directly into any text field — no copy-paste needed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon CTA */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-4 bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-4xl">🧩</div>
                <div className="text-left">
                  <h4 className="text-xl font-bold text-white">Get Early Access</h4>
                  <p className="text-gray-400">Be the first to know when the Chrome Extension launches</p>
                </div>
                <button
                  onClick={() => setLocation('/signin?mode=signup')}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 shadow-lg"
                >
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="section-header">
            <div className="section-badge">🚀 POWERFUL FEATURES</div>
            <h2 className="section-title">Everything You Need to <span className="gradient-text">Succeed</span></h2>
            <p className="section-description">
              Discover the revolutionary tools that make Smart PromptIQ the ultimate solution for generating AI-powered prompts and transforming your creative process into extraordinary results.
            </p>
          </div>

          {/* Professional Key Features - No Clickable Elements */}
          <div className="feature-categories-pro">
            <div className="category-card-pro marketing-gradient">
              <div className="category-header">
                <div className="category-icon-pro">🚀</div>
                <div className="category-badge">Core Feature</div>
              </div>
              <h3 className="category-title">AI-Powered Generation</h3>
              <p className="category-description">Revolutionary AI algorithms that understand context and generate perfect prompts tailored to your specific needs and industry requirements</p>
              <ul className="category-features">
                <li>✓ Context-Aware Intelligence</li>
                <li>✓ Industry-Specific Templates</li>
                <li>✓ Multi-Language Support</li>
                <li>✓ Real-Time Optimization</li>
              </ul>
              <div className="category-info-badge">
                Advanced AI Technology
              </div>
            </div>

            <div className="category-card-pro development-gradient">
              <div className="category-header">
                <div className="category-icon-pro">⚡</div>
                <div className="category-badge">Performance</div>
              </div>
              <h3 className="category-title">Lightning-Fast Processing</h3>
              <p className="category-description">Optimized infrastructure delivering results in seconds with 99.9% uptime and enterprise-grade security for your data</p>
              <ul className="category-features">
                <li>✓ Sub-2 Second Response Time</li>
                <li>✓ 99.9% Uptime Guarantee</li>
                <li>✓ Enterprise Security</li>
                <li>✓ Global CDN Network</li>
              </ul>
              <div className="category-info-badge">
                High Performance
              </div>
            </div>

            <div className="category-card-pro education-gradient">
              <div className="category-header">
                <div className="category-icon-pro">🎯</div>
                <div className="category-badge">Intelligence</div>
              </div>
              <h3 className="category-title">Smart Customization</h3>
              <p className="category-description">Intelligent questionnaire system that adapts to your responses and generates increasingly personalized and effective prompts</p>
              <ul className="category-features">
                <li>✓ Adaptive Questioning</li>
                <li>✓ Learning Algorithms</li>
                <li>✓ Personal Preferences</li>
                <li>✓ Continuous Improvement</li>
              </ul>
              <div className="category-info-badge">
                Smart Learning
              </div>
            </div>

            <div className="category-card-pro financial-gradient">
              <div className="category-header">
                <div className="category-icon-pro">📊</div>
                <div className="category-badge">Analytics</div>
              </div>
              <h3 className="category-title">Advanced Analytics</h3>
              <p className="category-description">Comprehensive insights into your prompt performance with detailed analytics, A/B testing, and ROI tracking capabilities</p>
              <ul className="category-features">
                <li>✓ Performance Tracking</li>
                <li>✓ A/B Testing Suite</li>
                <li>✓ ROI Measurements</li>
                <li>✓ Detailed Reports</li>
              </ul>
              <div className="category-info-badge">
                Data-Driven
              </div>
            </div>
          </div>
          
          {/* Complete Platform Capabilities - Informational Only */}
          <div className="pro-features-header">
            <h3 className="pro-features-title">Complete Platform Capabilities</h3>
            <p className="pro-features-subtitle">Comprehensive suite of professional tools for AI-powered content generation</p>
          </div>

          <div className="app-features-grid-pro">
            <div className="app-feature-card-pro dashboard-theme">
              <div className="feature-header-pro">
                <div className="feature-icon-pro gradient-bg-blue">🎨</div>
                <div className="feature-status">Creative Suite</div>
              </div>
              <h3 className="feature-title-pro">Creative Content Generation</h3>
              <p className="feature-description-pro">Advanced AI tools for generating marketing copy, social media content, blog posts, and creative briefs with professional-grade quality.</p>
              <div className="feature-metrics">
                <div className="metric"><span className="metric-value">50+</span> Content Types</div>
                <div className="metric"><span className="metric-value">12</span> Languages</div>
              </div>
              <div className="feature-info-pro">Professional Quality Output</div>
            </div>

            <div className="app-feature-card-pro templates-theme">
              <div className="feature-header-pro">
                <div className="feature-icon-pro gradient-bg-green">🧠</div>
                <div className="feature-status">Smart Intelligence</div>
              </div>
              <h3 className="feature-title-pro">Intelligent Questionnaires</h3>
              <p className="feature-description-pro">Dynamic question systems that learn from your responses and adapt to create increasingly personalized and effective prompts.</p>
              <div className="feature-metrics">
                <div className="metric"><span className="metric-value">AI-Driven</span> Logic</div>
                <div className="metric"><span className="metric-value">Adaptive</span> Learning</div>
              </div>
              <div className="feature-info-pro">Personalized Experience</div>
            </div>

            <div className="app-feature-card-pro teams-theme">
              <div className="feature-header-pro">
                <div className="feature-icon-pro gradient-bg-purple">⚙️</div>
                <div className="feature-status">Automation</div>
              </div>
              <h3 className="feature-title-pro">Workflow Automation</h3>
              <p className="feature-description-pro">Streamlined processes that automatically generate, refine, and optimize content based on your specific requirements and goals.</p>
              <div className="feature-metrics">
                <div className="metric"><span className="metric-value">Auto</span> Optimization</div>
                <div className="metric"><span className="metric-value">Smart</span> Workflows</div>
              </div>
              <div className="feature-info-pro">Efficiency Focused</div>
            </div>

            <div className="app-feature-card-pro analytics-theme">
              <div className="feature-header-pro">
                <div className="feature-icon-pro gradient-bg-orange">🔒</div>
                <div className="feature-status">Enterprise</div>
              </div>
              <h3 className="feature-title-pro">Security & Compliance</h3>
              <p className="feature-description-pro">Enterprise-grade security with GDPR compliance, data encryption, and comprehensive audit trails for business-critical operations.</p>
              <div className="feature-metrics">
                <div className="metric"><span className="metric-value">256-bit</span> Encryption</div>
                <div className="metric"><span className="metric-value">GDPR</span> Compliant</div>
              </div>
              <div className="feature-info-pro">Enterprise Ready</div>
            </div>

            <div className="app-feature-card-pro pricing-theme">
              <div className="feature-header-pro">
                <div className="feature-icon-pro gradient-bg-cyan">💡</div>
                <div className="feature-status">Innovation</div>
              </div>
              <h3 className="feature-title-pro">Continuous Innovation</h3>
              <p className="feature-description-pro">Regular updates with new features, improved AI models, and enhanced capabilities based on user feedback and industry trends.</p>
              <div className="feature-metrics">
                <div className="metric"><span className="metric-value">Weekly</span> Updates</div>
                <div className="metric"><span className="metric-value">Latest</span> AI Models</div>
              </div>
              <div className="feature-info-pro">Always Evolving</div>
            </div>

            <div className="app-feature-card-pro docs-theme">
              <div className="feature-header-pro">
                <div className="feature-icon-pro gradient-bg-pink">🌐</div>
                <div className="feature-status">Global</div>
              </div>
              <h3 className="feature-title-pro">Multi-Industry Support</h3>
              <p className="feature-description-pro">Specialized knowledge bases covering technology, healthcare, finance, education, marketing, and dozens of other industries.</p>
              <div className="feature-metrics">
                <div className="metric"><span className="metric-value">25+</span> Industries</div>
                <div className="metric"><span className="metric-value">Global</span> Standards</div>
              </div>
              <div className="feature-info-pro">Industry Expertise</div>
            </div>
          </div>
        </section>

        {/* Industry Solutions Section */}
        <section className="industry-solutions-section">
          <div className="section-header-pro">
            <div className="section-badge-pro">🏭 INDUSTRY EXPERTISE</div>
            <h2 className="section-title-pro">Specialized Solutions for <span className="gradient-text">Every Industry</span></h2>
            <p className="section-description-pro">
              Our AI understands the unique challenges and requirements of different industries, delivering specialized prompts that speak your business language.
            </p>
          </div>

          <div className="industry-grid">
            <div className="industry-card tech-industry">
              <div className="industry-icon">💻</div>
              <h3>Technology & Software</h3>
              <p>Technical documentation, API specifications, software architecture, and development workflows with precision.</p>
              <div className="industry-stats">
                <div className="stat">500+ Tech Companies</div>
                <div className="stat">95% Accuracy Rate</div>
              </div>
            </div>

            <div className="industry-card healthcare-industry">
              <div className="industry-icon">🏥</div>
              <h3>Healthcare & Medical</h3>
              <p>Compliance-ready content, medical protocols, patient education materials, and research documentation.</p>
              <div className="industry-stats">
                <div className="stat">HIPAA Compliant</div>
                <div className="stat">Medical Accuracy</div>
              </div>
            </div>

            <div className="industry-card finance-industry">
              <div className="industry-icon">💰</div>
              <h3>Finance & Banking</h3>
              <p>Regulatory compliance, financial analysis, investment strategies, and risk assessment documentation.</p>
              <div className="industry-stats">
                <div className="stat">SEC Compliant</div>
                <div className="stat">Risk Analysis</div>
              </div>
            </div>

            <div className="industry-card education-industry">
              <div className="industry-icon">🎓</div>
              <h3>Education & Training</h3>
              <p>Curriculum development, assessment creation, learning objectives, and educational content optimization.</p>
              <div className="industry-stats">
                <div className="stat">1000+ Educators</div>
                <div className="stat">Learning Focused</div>
              </div>
            </div>

            <div className="industry-card retail-industry">
              <div className="industry-icon">🛍️</div>
              <h3>Retail & E-commerce</h3>
              <p>Product descriptions, marketing campaigns, customer service protocols, and sales optimization strategies.</p>
              <div className="industry-stats">
                <div className="stat">300+ Brands</div>
                <div className="stat">Sales Boost</div>
              </div>
            </div>

            <div className="industry-card manufacturing-industry">
              <div className="industry-icon">🏭</div>
              <h3>Manufacturing & Industrial</h3>
              <p>Process documentation, quality control, safety protocols, and operational efficiency improvements.</p>
              <div className="industry-stats">
                <div className="stat">ISO Standards</div>
                <div className="stat">Safety First</div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Capabilities Section */}
        <section className="technical-capabilities-section">
          <div className="section-header-pro">
            <div className="section-badge-pro">⚡ TECHNICAL EXCELLENCE</div>
            <h2 className="section-title-pro">Cutting-Edge <span className="gradient-text">AI Technology</span></h2>
            <p className="section-description-pro">
              Built on the latest advances in artificial intelligence, natural language processing, and machine learning to deliver unprecedented results.
            </p>
          </div>

          <div className="technical-grid">
            <div className="tech-feature">
              <div className="tech-icon">🧠</div>
              <h3>Advanced NLP Engine</h3>
              <p>State-of-the-art natural language processing that understands context, tone, and intent with human-like comprehension.</p>
              <div className="tech-metrics">
                <div className="metric">99.2% Context Accuracy</div>
                <div className="metric">50+ Languages</div>
              </div>
            </div>

            <div className="tech-feature">
              <div className="tech-icon">🎯</div>
              <h3>Machine Learning Optimization</h3>
              <p>Continuously learning algorithms that improve with every interaction, personalizing output to your specific needs.</p>
              <div className="tech-metrics">
                <div className="metric">Real-time Learning</div>
                <div className="metric">Adaptive Models</div>
              </div>
            </div>

            <div className="tech-feature">
              <div className="tech-icon">⚡</div>
              <h3>High-Performance Computing</h3>
              <p>Cloud-native architecture with distributed processing ensuring lightning-fast response times and 99.9% uptime.</p>
              <div className="tech-metrics">
                <div className="metric">Sub-2s Response</div>
                <div className="metric">Global CDN</div>
              </div>
            </div>

            <div className="tech-feature">
              <div className="tech-icon">🔒</div>
              <h3>Enterprise Security</h3>
              <p>Military-grade encryption, compliance standards, and data protection protocols ensuring your information stays secure.</p>
              <div className="tech-metrics">
                <div className="metric">256-bit Encryption</div>
                <div className="metric">SOC2 Compliant</div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Overview Section */}
        <section className="process-overview-section">
          <div className="section-header-pro">
            <div className="section-badge-pro">🔄 HOW IT WORKS</div>
            <h2 className="section-title-pro">Simple Process, <span className="gradient-text">Powerful Results</span></h2>
            <p className="section-description-pro">
              Our intuitive workflow transforms your ideas into professional-grade prompts in just four simple steps.
            </p>
          </div>

          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Choose Your Category</h3>
                <p>Select from our comprehensive library of industry-specific categories and use cases tailored to your needs.</p>
                <div className="step-highlight">25+ Categories Available</div>
              </div>
            </div>

            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Answer Smart Questions</h3>
                <p>Our intelligent questionnaire adapts to your responses, asking the right questions to understand your requirements.</p>
                <div className="step-highlight">AI-Powered Questions</div>
              </div>
            </div>

            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>AI Generates Content</h3>
                <p>Advanced algorithms process your input and generate comprehensive, professional-quality prompts and content.</p>
                <div className="step-highlight">Instant Generation</div>
              </div>
            </div>

            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Refine & Perfect</h3>
                <p>Review, customize, and optimize the generated content with built-in editing tools and suggestions.</p>
                <div className="step-highlight">Professional Quality</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section */}
        <section className="testimonials-section-pro">
          <div className="section-header-pro">
            <div className="section-badge-pro">⭐ CUSTOMER SUCCESS STORIES</div>
            <h2 className="section-title-pro">Trusted by <span className="gradient-text">25,000+</span> Industry Leaders</h2>
            <p className="section-description-pro">
              See how businesses across industries are using Smart PromptIQ to accelerate growth, streamline workflows, and achieve unprecedented success with AI-powered solutions.
            </p>
          </div>

          {/* Company Logos */}
          <div className="company-logos">
            <div className="logo-text">TechFlow Inc.</div>
            <div className="logo-text">DataSync Corp</div>
            <div className="logo-text">Stanford University</div>
            <div className="logo-text">InnovateCorp</div>
            <div className="logo-text">GrowthLabs</div>
            <div className="logo-text">EdTech Solutions</div>
          </div>

          <div className="testimonials-grid-pro">
            <div className="testimonial-card-pro featured">
              <div className="testimonial-header">
                <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                <div className="testimonial-rating">5.0</div>
              </div>
              <blockquote className="testimonial-quote-pro">
                "SmartPromptIQ transformed our entire marketing strategy development from weeks to hours. The AI-powered prompts are incredibly detailed, actionable, and deliver real ROI. Our conversion rates increased by 340% in just 3 months."
              </blockquote>
              <div className="testimonial-metrics">
                <div className="metric"><span>340%</span> Conversion Increase</div>
                <div className="metric"><span>10x</span> Faster Strategy</div>
              </div>
              <div className="testimonial-author-pro">
                <div className="author-avatar">SC</div>
                <div className="author-info">
                  <div className="author-name">Sarah Chen</div>
                  <div className="author-title">Chief Marketing Officer</div>
                  <div className="author-company">TechFlow Inc. · Series B Startup</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card-pro">
              <div className="testimonial-header">
                <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                <div className="testimonial-rating">5.0</div>
              </div>
              <blockquote className="testimonial-quote-pro">
                "The team collaboration features are absolutely game-changing. Our product development cycle improved by 40% and cross-team alignment is now seamless. The ROI speaks for itself."
              </blockquote>
              <div className="testimonial-metrics">
                <div className="metric"><span>40%</span> Cycle Improvement</div>
                <div className="metric"><span>95%</span> Team Satisfaction</div>
              </div>
              <div className="testimonial-author-pro">
                <div className="author-avatar">MJ</div>
                <div className="author-info">
                  <div className="author-name">Marcus Johnson</div>
                  <div className="author-title">Head of Product</div>
                  <div className="author-company">DataSync Corp · Fortune 500</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card-pro">
              <div className="testimonial-header">
                <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                <div className="testimonial-rating">5.0</div>
              </div>
              <blockquote className="testimonial-quote-pro">
                "As an educator, SmartPromptIQ revolutionized how I create learning materials. Student engagement increased by 85%, and course completion rates hit an all-time high of 94%."
              </blockquote>
              <div className="testimonial-metrics">
                <div className="metric"><span>85%</span> More Engagement</div>
                <div className="metric"><span>94%</span> Completion Rate</div>
              </div>
              <div className="testimonial-author-pro">
                <div className="author-avatar">ER</div>
                <div className="author-info">
                  <div className="author-name">Dr. Emily Rodriguez</div>
                  <div className="author-title">Professor & Researcher</div>
                  <div className="author-company">Stanford University · Education</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <div className="trust-number">4.9/5</div>
              <div className="trust-label">Average Rating</div>
            </div>
            <div className="trust-item">
              <div className="trust-number">25,000+</div>
              <div className="trust-label">Active Users</div>
            </div>
            <div className="trust-item">
              <div className="trust-number">99.9%</div>
              <div className="trust-label">Uptime</div>
            </div>
            <div className="trust-item">
              <div className="trust-number">2.1M+</div>
              <div className="trust-label">Prompts Generated</div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section with Signup Options */}
        <section className="cta-section">
          <div className="stars-container" ref={ctaStarsRef}></div>

          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Creative Process?</h2>
            <p className="cta-description">
              Join thousands of innovative professionals, creative teams, and forward-thinking businesses who are already using Smart PromptIQ to revolutionize their workflow and achieve extraordinary results.
            </p>

            {/* Enhanced Signup Card */}
            <div className="signup-card-container">
              <div className="signup-card">
                <div className="signup-card-header">
                  <div className="signup-badge">🚀 Get Started Today</div>
                  <h3 className="signup-card-title">Choose Your Path</h3>
                  <p className="signup-card-description">Start creating amazing AI prompts in seconds</p>
                </div>

                <div className="signup-options">
                  <div className="signup-option primary">
                    <div className="option-header">
                      <div className="option-icon">✨</div>
                      <div className="option-title">Create Free Account</div>
                      <div className="option-badge">Most Popular</div>
                    </div>
                    <div className="option-description">Full access to all features with 10 free AI prompts</div>
                    <div className="option-features">
                      <div className="feature">✓ 15+ Categories</div>
                      <div className="feature">✓ AI-Powered Generation</div>
                      <div className="feature">✓ Save & Export</div>
                      <div className="feature">✓ No Credit Card Required</div>
                    </div>
                    <button onClick={handleGetStarted} className="option-button primary">
                      Create Free Account
                    </button>
                  </div>

                  <div className="signup-option secondary">
                    <div className="option-header">
                      <div className="option-icon">🔑</div>
                      <div className="option-title">Sign In</div>
                      <div className="option-badge">Existing User</div>
                    </div>
                    <div className="option-description">Access your account and continue creating</div>
                    <div className="option-features">
                      <div className="feature">✓ Access Saved Prompts</div>
                      <div className="feature">✓ View Generation History</div>
                      <div className="feature">✓ Resume Projects</div>
                      <div className="feature">✓ Account Dashboard</div>
                    </div>
                    <button onClick={handleSignIn} className="option-button secondary">
                      Sign In to Account
                    </button>
                  </div>
                </div>

                <div className="signup-guarantee">
                  <div className="guarantee-content">
                    <div className="guarantee-icon">🛡️</div>
                    <div className="guarantee-text">
                      <strong>30-Day Money Back Guarantee</strong>
                      <span>• No hidden fees • Cancel anytime • Full refund</span>
                    </div>
                  </div>
                </div>

                <div className="demo-option">
                  <div className="demo-divider">
                    <span>Or try before you commit</span>
                  </div>
                  <button onClick={handleDemo} className="demo-button">
                    🎮 Try Demo (No Signup Required)
                  </button>
                </div>
              </div>
            </div>

            <div className="cta-trust-indicators">
              <div className="trust-stat">
                <div className="trust-number">25,000+</div>
                <div className="trust-label">Active Users</div>
              </div>
              <div className="trust-stat">
                <div className="trust-number">4.9/5</div>
                <div className="trust-label">User Rating</div>
              </div>
              <div className="trust-stat">
                <div className="trust-number">2.1M+</div>
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
        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl border border-indigo-500/30 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-3xl">🧩</span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Chrome Extension
                <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full animate-pulse">
                  COMING SOON
                </span>
              </h3>
              <p className="text-sm text-indigo-200">
                Generate AI prompts anywhere on the web with one click
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-indigo-300">
            <span className="px-2 py-1 bg-indigo-800/50 rounded-full">Right-click prompt generation</span>
            <span className="px-2 py-1 bg-indigo-800/50 rounded-full">Save to your library</span>
            <span className="px-2 py-1 bg-indigo-800/50 rounded-full">Works on any website</span>
          </div>
        </div>

        <div className="footer-badges">
          <div className="footer-badge">Enterprise Security</div>
          <div className="footer-badge">GDPR Compliant</div>
          <div className="footer-badge">ISO 27001 Certified</div>
          <div className="footer-badge">4.9/5 Rating</div>
          <div className="footer-badge">25,000+ Users</div>
        </div>
        <p>Trusted by industry leaders and innovative companies worldwide</p>

        {/* Legal Links */}
        <div className="flex justify-center gap-6 mt-6 text-sm">
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
        </div>

        <div className="text-xs opacity-60 mt-4" style={{ textAlign: 'center' }}>
          © 2025 SmartPromptIQ™ — The Intelligent Prompt Engineering Platform
        </div>
      </footer>
    </div>
  );
}