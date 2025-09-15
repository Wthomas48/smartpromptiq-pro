import { useEffect, useRef } from "react";
import TopNavigation from "@/components/TopNavigation";
import AnimatedCounter from "@/components/AnimatedCounter";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const heroStarsRef = useRef<HTMLDivElement>(null);
  const ctaStarsRef = useRef<HTMLDivElement>(null);
  
  const handleGetStarted = () => {
    setLocation("/signin");
  };

  const handleDemo = () => {
    setLocation("/demo");
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
            <div className="hero-badge">Revolutionary AI-Powered Platform</div>
            
            <h1 className="hero-title">
              Transform Ideas into<br />
              <span className="gradient-text">AI-Powered Blueprints</span>
            </h1>
            
            <p className="hero-description">
              Smart PromptIQ revolutionizes how you create. Our intelligent questionnaires guide you through generating comprehensive, AI-powered prompts for business strategies, creative briefs, and technical projects—transforming your ideas into actionable blueprints that drive results.
            </p>
            
            <div className="cta-buttons">
              <button onClick={handleGetStarted} className="btn btn-primary">
                ✨ Start Creating Magic
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

        {/* CTA Section */}
        <section className="cta-section">
          <div className="stars-container" ref={ctaStarsRef}></div>
          
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Creative Process?</h2>
            <p className="cta-description">
              Join thousands of innovative professionals, creative teams, and forward-thinking businesses who are already using Smart PromptIQ to revolutionize their workflow and achieve extraordinary results.
            </p>
            
            <div className="cta-buttons-group">
              <button onClick={handleGetStarted} className="btn btn-primary pulse-animation">Start Free Trial</button>
            </div>
            
            <div className="cta-features">
              <div className="cta-feature">✓ No credit card required</div>
              <div className="cta-feature">✓ 14-day free trial</div>
              <div className="cta-feature">✓ Cancel anytime</div>
            </div>
            
            <div className="cta-guarantee">
              <div className="guarantee-badge">💯 30-Day Money Back Guarantee</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-badges">
          <div className="footer-badge">Enterprise Security</div>
          <div className="footer-badge">GDPR Compliant</div>
          <div className="footer-badge">ISO 27001 Certified</div>
          <div className="footer-badge">4.9/5 Rating</div>
          <div className="footer-badge">25,000+ Users</div>
        </div>
        <p>Trusted by industry leaders and innovative companies worldwide</p>
      </footer>
    </div>
  );
}