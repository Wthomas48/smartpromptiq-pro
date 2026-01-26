import React from 'react';
import { Link, useLocation } from 'wouter';
import AcademyNavigation from '@/components/AcademyNavigation';
import SectionLanding from '@/components/SectionLanding';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap } from 'lucide-react';

// SEO-optimized content for public landing
const academyLandingContent = {
  title: 'SmartPromptIQ Academy',
  definition: 'SmartPromptIQ Academy is a comprehensive online learning platform for AI prompt engineering, offering 50+ expert-led courses, hands-on projects, and industry-recognized certifications. Master the art of writing effective AI prompts to boost productivity, automate workflows, and build AI-powered applications.',
  whatItsFor: 'SmartPromptIQ Academy is designed to teach you how to communicate effectively with AI systems like ChatGPT, Claude, and Gemini. Our structured curriculum covers everything from basic prompt writing to advanced techniques like chain-of-thought prompting, few-shot learning, and building custom AI agents. Whether you want to enhance your career, start a business, or simply become more productive, our courses provide the practical skills you need.',
  whoItsFor: [
    'Marketers and content creators seeking to leverage AI for faster, better content production',
    'Developers and engineers wanting to build AI-powered applications and automate workflows',
    'Business professionals looking to increase productivity with AI tools and automation',
    'Students and career changers entering the growing field of AI and prompt engineering',
    'Entrepreneurs building AI-driven products and services',
    'Anyone curious about harnessing AI to accomplish more with less effort'
  ],
  howItHelps: [
    'Learn prompt engineering from industry experts with real-world experience',
    'Practice with interactive exercises and get AI-powered feedback on your prompts',
    'Earn recognized certifications to showcase your AI skills to employers',
    'Access 50+ courses covering marketing, development, business, and creative applications',
    'Join a community of 10,000+ learners sharing knowledge and best practices',
    'Build a portfolio of AI projects to demonstrate your capabilities'
  ],
  internalLinks: [
    { label: 'Browse All Courses', href: '/academy/courses', description: 'Explore our full catalog of 50+ prompt engineering courses' },
    { label: 'Learning Paths', href: '/academy/paths', description: 'Follow structured paths from beginner to expert' },
    { label: 'Prompt Templates', href: '/templates', description: 'Access 100+ ready-to-use prompt templates' },
    { label: 'BuilderIQ App Builder', href: '/builderiq', description: 'Build AI-powered apps with our no-code platform' },
    { label: 'AI Agents', href: '/agents', description: 'Create custom AI chatbots for your website' },
    { label: 'Marketplace', href: '/marketplace', description: 'Buy and sell professional prompt templates' }
  ],
  stats: [
    { label: 'Active Students', value: '10,000+' },
    { label: 'Expert Courses', value: '50+' },
    { label: 'Average Rating', value: '4.9/5' },
    { label: 'Certified Graduates', value: '5,000+' }
  ],
  faqs: [
    {
      question: 'What is prompt engineering and why should I learn it?',
      answer: 'Prompt engineering is the skill of crafting effective instructions for AI systems to get optimal results. As AI becomes integral to business operations, professionals who can effectively communicate with AI tools like ChatGPT have a significant competitive advantage. Studies show prompt engineers can increase productivity by 40-60%.'
    },
    {
      question: 'Do I need coding experience to take these courses?',
      answer: 'No coding experience is required for most courses. SmartPromptIQ Academy is designed for beginners and professionals alike. Our courses range from basic prompt writing to advanced technical implementations, with clear prerequisites listed for each course.'
    },
    {
      question: 'Are the certifications recognized by employers?',
      answer: 'Yes, SmartPromptIQ certifications are recognized across the industry. Our curriculum is developed with input from AI professionals at leading tech companies. Many of our certified graduates have successfully used their credentials to advance their careers or land new positions.'
    },
    {
      question: 'How long does it take to complete a certification?',
      answer: 'Most certification paths take 4-8 weeks to complete when studying 5-10 hours per week. Self-paced learning allows you to go faster or slower based on your schedule. Each course includes practical exercises that reinforce learning through hands-on practice.'
    },
    {
      question: 'Can I try courses for free before subscribing?',
      answer: 'Yes! We offer several free courses including "SmartPromptIQ Basics" and "Introduction to AI Prompting" that you can start immediately. These courses give you a taste of our teaching methodology and help you decide if our platform is right for you.'
    },
    {
      question: 'What makes SmartPromptIQ Academy different from other AI courses?',
      answer: 'Unlike generic AI courses, SmartPromptIQ Academy focuses specifically on practical prompt engineering with hands-on exercises. Our interactive Prompt Lab lets you test prompts in real-time with AI-powered feedback. Plus, our courses are constantly updated to reflect the latest AI capabilities and best practices.'
    }
  ]
};

const Academy: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // If user is authenticated, redirect to academy dashboard
  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/academy/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Show SEO-optimized public landing for non-authenticated users
  if (!isAuthenticated) {
    return (
      <SectionLanding
        title={academyLandingContent.title}
        definition={academyLandingContent.definition}
        whatItsFor={academyLandingContent.whatItsFor}
        whoItsFor={academyLandingContent.whoItsFor}
        howItHelps={academyLandingContent.howItHelps}
        internalLinks={academyLandingContent.internalLinks}
        heroGradient="from-purple-600 via-indigo-600 to-purple-700"
        ctaText="Start Learning Free"
        ctaHref="/academy/signup"
        secondaryCtaText="Browse Courses"
        secondaryCtaHref="/academy/courses"
        stats={academyLandingContent.stats}
        faqs={academyLandingContent.faqs}
        icon={<GraduationCap className="w-8 h-8 text-white" />}
      />
    );
  }

  // Authenticated users see the original academy experience
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Academy Navigation */}
      <AcademyNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-purple-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">10,247 students enrolled this month</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                Master Prompt Engineering.
                <br />
                <span className="text-purple-200">Build AI Systems That Work.</span>
              </h1>
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Learn from industry experts. Get hands-on with real AI tools. Earn recognized certifications. Join the fastest-growing community of AI prompt engineers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/academy/signup">
                  <span className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-50 transition shadow-lg flex items-center justify-center cursor-pointer">
                    <i className="fas fa-rocket mr-2"></i>
                    Start Learning Free
                  </span>
                </Link>
                <Link href="/academy/courses">
                  <span className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition flex items-center justify-center cursor-pointer">
                    <i className="fas fa-book-open mr-2"></i>
                    Browse Courses
                  </span>
                </Link>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check-circle text-green-300"></i>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check-circle text-green-300"></i>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-800">Prompt Lab</h3>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      Live Demo
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                    <div className="text-gray-500 mb-2"># Your Prompt</div>
                    <div className="text-gray-800">
                      Create a comprehensive marketing strategy for a sustainable fashion brand targeting Gen Z consumers...
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-3 rounded-lg font-semibold">
                      <i className="fas fa-play mr-2"></i>Execute
                    </button>
                    <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <i className="fas fa-cog"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">10K+</div>
              <div className="text-gray-600 mt-2 font-medium">Active Students</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">50+</div>
              <div className="text-gray-600 mt-2 font-medium">Expert Courses</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">4.9</div>
              <div className="text-gray-600 mt-2 font-medium">Average Rating</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">5K+</div>
              <div className="text-gray-600 mt-2 font-medium">Certified Graduates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Why SmartPromptIQ™ Academy?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The most comprehensive, hands-on prompt engineering education platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-6 text-2xl">
                <i className="fas fa-laptop-code"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Interactive Prompt Lab</h3>
              <p className="text-gray-600">Write, test, and execute prompts in real-time. Get instant AI-powered feedback.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6 text-2xl">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Industry Certifications</h3>
              <p className="text-gray-600">Earn recognized credentials that boost your career.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-6 text-2xl">
                <i className="fas fa-project-diagram"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-World Projects</h3>
              <p className="text-gray-600">Build actual AI systems with guided projects.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-6 text-2xl">
                <i className="fas fa-brain"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Feedback</h3>
              <p className="text-gray-600">Get detailed analysis with specific suggestions for improvement.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center mb-6 text-2xl">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Community</h3>
              <p className="text-gray-600">Join Discord, attend live Q&As, collaborate with peers.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-6 text-2xl">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Tracking</h3>
              <p className="text-gray-600">Visual roadmaps, XP system, and performance analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Ready to Master AI Prompting?
          </h2>
          <p className="text-xl text-purple-100 mb-12">
            Join 10,000+ engineers building the future with AI. Start learning today—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/academy/signup">
              <span className="bg-white text-purple-600 px-10 py-5 rounded-lg font-bold text-xl hover:bg-gray-50 transition shadow-2xl cursor-pointer inline-block">
                <i className="fas fa-rocket mr-2"></i>
                Get Started Free
              </span>
            </Link>
            <Link href="/academy/signin">
              <span className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-lg font-bold text-xl hover:bg-white/10 transition cursor-pointer inline-block">
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In
              </span>
            </Link>
          </div>
          <p className="text-purple-200 mt-8 text-sm">
            ✓ Free courses available • ✓ No credit card required • ✓ Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default Academy;
