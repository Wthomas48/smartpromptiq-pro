import React, { useState } from 'react';
import { Link } from 'wouter';

const AcademyDocumentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: 'fa-rocket' },
    { id: 'how-to-use', title: 'How to Use', icon: 'fa-book-open' },
    { id: 'features', title: 'Features', icon: 'fa-star' },
    { id: 'pricing', title: 'Pricing & Plans', icon: 'fa-tag' },
    { id: 'course-structure', title: 'Course Structure', icon: 'fa-sitemap' },
    { id: 'progress-tracking', title: 'Progress Tracking', icon: 'fa-chart-line' },
    { id: 'certificates', title: 'Certificates', icon: 'fa-certificate' },
    { id: 'support', title: 'Support', icon: 'fa-life-ring' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for fixed nav
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
              <i className="fas fa-book text-purple-600 mr-3"></i>
              Academy Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about SmartPromptIQ Academy - from getting started to mastering AI prompts
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  <i className="fas fa-list mr-2 text-purple-600"></i>
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        activeSection === section.id
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'text-gray-700 hover:bg-purple-50'
                      }`}
                    >
                      <i className={`fas ${section.icon} mr-2`}></i>
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-12">
              {/* Getting Started */}
              <section id="getting-started" className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-rocket text-purple-600 mr-3"></i>
                  Getting Started
                </h2>
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-lg">
                    Welcome to SmartPromptIQ Academy! We're excited to help you master the art and science of AI prompt engineering.
                  </p>

                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      Quick Start Guide
                    </h3>
                    <ol className="space-y-3 list-decimal list-inside">
                      <li className="font-medium"><strong>Create an Account:</strong> Sign up for free at the top right</li>
                      <li className="font-medium"><strong>Browse Courses:</strong> Explore our catalog of 57 comprehensive courses</li>
                      <li className="font-medium"><strong>Enroll:</strong> Click "Enroll Now" on any course that interests you</li>
                      <li className="font-medium"><strong>Start Learning:</strong> Access lessons, quizzes, and hands-on exercises</li>
                      <li className="font-medium"><strong>Track Progress:</strong> Monitor your completion and earn certificates</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Link href="/academy/courses">
                      <div className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl cursor-pointer hover:scale-105 transition-all shadow-lg">
                        <i className="fas fa-book-open text-3xl mb-3"></i>
                        <h4 className="text-xl font-bold mb-2">Browse Courses</h4>
                        <p className="text-purple-100">Explore 57 courses with 555+ lessons</p>
                      </div>
                    </Link>
                    <Link href="/signup">
                      <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl cursor-pointer hover:scale-105 transition-all shadow-lg">
                        <i className="fas fa-user-plus text-3xl mb-3"></i>
                        <h4 className="text-xl font-bold mb-2">Create Account</h4>
                        <p className="text-green-100">Start your learning journey today</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </section>

              {/* How to Use */}
              <section id="how-to-use" className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-book-open text-purple-600 mr-3"></i>
                  How to Use the Academy
                </h2>
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        <i className="fas fa-play-circle text-blue-600 mr-2"></i>
                        Taking Lessons
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Read through comprehensive lesson content</li>
                        <li>• Use the audio player to listen to lessons</li>
                        <li>• Try code examples in the interactive playground</li>
                        <li>• Complete hands-on exercises with checkpoints</li>
                        <li>• Test your knowledge with quizzes</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        <i className="fas fa-tasks text-green-600 mr-2"></i>
                        Completing Courses
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Mark lessons as complete when finished</li>
                        <li>• Rate lessons to help us improve content</li>
                        <li>• Track your progress on the dashboard</li>
                        <li>• Complete all lessons to earn a certificate</li>
                        <li>• Review anytime - unlimited access</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        <i className="fas fa-headphones text-purple-600 mr-2"></i>
                        Audio Features
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Listen to lessons with text-to-speech</li>
                        <li>• Adjust playback speed (0.75x - 1.5x)</li>
                        <li>• Hear audio feedback on quiz answers</li>
                        <li>• Mute sounds anytime with toggle button</li>
                        <li>• Learn while multitasking</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        <i className="fas fa-star text-orange-600 mr-2"></i>
                        Interactive Elements
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Take quizzes with instant feedback</li>
                        <li>• Complete hands-on coding exercises</li>
                        <li>• Test prompts in live playground</li>
                        <li>• Rate lessons with 5-star system</li>
                        <li>• Leave detailed feedback</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Features */}
              <section id="features" className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-star text-purple-600 mr-3"></i>
                  Platform Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-book text-white text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">57 Courses</h3>
                    <p className="text-gray-600">Comprehensive curriculum covering all aspects of AI prompting</p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-list text-white text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">555+ Lessons</h3>
                    <p className="text-gray-600">In-depth lessons with rich content and examples</p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-headphones text-white text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Audio Learning</h3>
                    <p className="text-gray-600">Text-to-speech for hands-free learning</p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
                    <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-code text-white text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Live Playground</h3>
                    <p className="text-gray-600">Test and experiment with prompts in real-time</p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200">
                    <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-graduation-cap text-white text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Quizzes & Exercises</h3>
                    <p className="text-gray-600">Interactive assessments with audio feedback</p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200">
                    <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-certificate text-white text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Certificates</h3>
                    <p className="text-gray-600">Earn certificates upon course completion</p>
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section id="pricing" className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-tag text-purple-600 mr-3"></i>
                  Pricing & Access Plans
                </h2>
                <div className="space-y-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    SmartPromptIQ offers 6 flexible pricing tiers to suit your needs. Academy access is included based on your subscription tier.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Free Tier */}
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border-2 border-gray-300 hover:scale-105 transition-all">
                      <div className="text-center mb-3">
                        <i className="fas fa-gift text-3xl text-gray-600 mb-2"></i>
                        <h3 className="text-xl font-bold text-gray-900">Free</h3>
                        <p className="text-2xl font-extrabold text-gray-600 mt-1">$0<span className="text-sm font-normal">/mo</span></p>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 mb-4">
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>3 free Academy courses</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>5 AI prompts/month</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>5 voice generations</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-times text-red-500 mr-2 mt-1"></i>
                          <span>No certificates</span>
                        </li>
                      </ul>
                      <Link href="/signup">
                        <button className="w-full py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition text-sm">
                          Start Free
                        </button>
                      </Link>
                    </div>

                    {/* Starter Tier */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-300 hover:scale-105 transition-all">
                      <div className="text-center mb-3">
                        <i className="fas fa-rocket text-3xl text-blue-600 mb-2"></i>
                        <h3 className="text-xl font-bold text-gray-900">Starter</h3>
                        <p className="text-2xl font-extrabold text-blue-600 mt-1">$19<span className="text-sm font-normal">/mo</span></p>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 mb-4">
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>50 AI prompts/month</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>50 voice generations</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>10 music tracks</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>HD video export</span>
                        </li>
                      </ul>
                      <Link href="/pricing">
                        <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm">
                          Get Starter
                        </button>
                      </Link>
                    </div>

                    {/* Academy+ Tier */}
                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-5 border-2 border-teal-400 hover:scale-105 transition-all relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          FOR LEARNERS
                        </span>
                      </div>
                      <div className="text-center mb-3">
                        <i className="fas fa-graduation-cap text-3xl text-teal-600 mb-2"></i>
                        <h3 className="text-xl font-bold text-gray-900">Academy+</h3>
                        <p className="text-2xl font-extrabold text-teal-600 mt-1">$29<span className="text-sm font-normal">/mo</span></p>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 mb-4">
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span><strong>All 57 courses</strong> (555+ lessons)</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>100 AI prompts/month</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>Certificates</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>Audio learning</span>
                        </li>
                      </ul>
                      <Link href="/pricing">
                        <button className="w-full py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition text-sm">
                          Get Academy+
                        </button>
                      </Link>
                    </div>

                    {/* Pro Tier */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border-4 border-indigo-500 hover:scale-105 transition-all relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          MOST POPULAR
                        </span>
                      </div>
                      <div className="text-center mb-3">
                        <i className="fas fa-star text-3xl text-indigo-600 mb-2"></i>
                        <h3 className="text-xl font-bold text-gray-900">Pro</h3>
                        <p className="text-2xl font-extrabold text-indigo-600 mt-1">$49<span className="text-sm font-normal">/mo</span></p>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 mb-4">
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>200 AI prompts/month</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>200 voice generations</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>Commercial license</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>Priority support</span>
                        </li>
                      </ul>
                      <Link href="/pricing">
                        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-sm">
                          Upgrade to Pro
                        </button>
                      </Link>
                    </div>

                    {/* Team Pro Tier */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-400 hover:scale-105 transition-all">
                      <div className="text-center mb-3">
                        <i className="fas fa-users text-3xl text-purple-600 mb-2"></i>
                        <h3 className="text-xl font-bold text-gray-900">Team Pro</h3>
                        <p className="text-2xl font-extrabold text-purple-600 mt-1">$99<span className="text-sm font-normal">/mo</span></p>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 mb-4">
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>1,000 AI prompts/month</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>2-5 team members</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>4K video export</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>API access</span>
                        </li>
                      </ul>
                      <Link href="/pricing">
                        <button className="w-full py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm">
                          Get Team Pro
                        </button>
                      </Link>
                    </div>

                    {/* Enterprise Tier */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-400 hover:scale-105 transition-all">
                      <div className="text-center mb-3">
                        <i className="fas fa-crown text-3xl text-amber-600 mb-2"></i>
                        <h3 className="text-xl font-bold text-gray-900">Enterprise</h3>
                        <p className="text-2xl font-extrabold text-amber-600 mt-1">$299<span className="text-sm font-normal">/mo</span></p>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 mb-4">
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>5,000+ prompts/month</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>Unlimited team members</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>White-label options</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          <span>Dedicated manager</span>
                        </li>
                      </ul>
                      <Link href="/pricing">
                        <button className="w-full py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition text-sm">
                          Contact Sales
                        </button>
                      </Link>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 mt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                      Important: Academy Access
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Your Academy access is determined by your <strong>SmartPromptIQ main subscription tier</strong>.
                      Full Academy access (all 57 courses with certificates) is available on <strong>Academy+ ($29/mo)</strong> and above.
                      Visit the <Link href="/pricing"><span className="text-purple-600 font-semibold hover:underline cursor-pointer">main pricing page</span></Link> to upgrade.
                    </p>
                  </div>
                </div>
              </section>

              {/* Course Structure */}
              <section id="course-structure" className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-sitemap text-purple-600 mr-3"></i>
                  Course Structure
                </h2>
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-lg">
                    Each course in the Academy is carefully structured to provide a comprehensive learning experience.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        <i className="fas fa-layer-group text-purple-600 mr-2"></i>
                        Course Components
                      </h3>
                      <ul className="space-y-2">
                        <li><strong>Lessons:</strong> 8-12 lessons per course</li>
                        <li><strong>Duration:</strong> 2-6 hours per course</li>
                        <li><strong>Content:</strong> 2,000-4,000 words per lesson</li>
                        <li><strong>Quizzes:</strong> 5 questions per lesson</li>
                        <li><strong>Exercises:</strong> Hands-on practice tasks</li>
                        <li><strong>Examples:</strong> Real-world code samples</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        <i className="fas fa-signal text-green-600 mr-2"></i>
                        Difficulty Levels
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-center">
                          <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-semibold mr-2">Beginner</span>
                          <span className="text-sm">No prior knowledge needed</span>
                        </li>
                        <li className="flex items-center">
                          <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-semibold mr-2">Intermediate</span>
                          <span className="text-sm">Basic understanding required</span>
                        </li>
                        <li className="flex items-center">
                          <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-semibold mr-2">Advanced</span>
                          <span className="text-sm">Expert-level content</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Progress Tracking */}
              <section id="progress-tracking" className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-chart-line text-purple-600 mr-3"></i>
                  Progress Tracking
                </h2>
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-lg">
                    Monitor your learning journey with our comprehensive progress tracking system.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                      <i className="fas fa-check-circle text-4xl text-blue-600 mb-3"></i>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Completion Status</h3>
                      <p className="text-sm text-gray-600">Track completed lessons and courses</p>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <i className="fas fa-clock text-4xl text-green-600 mb-3"></i>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Time Spent</h3>
                      <p className="text-sm text-gray-600">Monitor hours invested in learning</p>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                      <i className="fas fa-trophy text-4xl text-purple-600 mb-3"></i>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Quiz Scores</h3>
                      <p className="text-sm text-gray-600">View your assessment performance</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Certificates */}
              <section id="certificates" className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-certificate text-purple-600 mr-3"></i>
                  Course Certificates
                </h2>
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-lg">
                    Earn professional certificates upon completing courses to showcase your expertise.
                  </p>

                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      <i className="fas fa-award text-yellow-600 mr-2"></i>
                      How to Earn a Certificate
                    </h3>
                    <ol className="space-y-3 list-decimal list-inside">
                      <li className="font-medium">Complete all lessons in a course</li>
                      <li className="font-medium">Pass all quizzes with 70% or higher</li>
                      <li className="font-medium">Submit all hands-on exercises</li>
                      <li className="font-medium">Your certificate will be automatically generated</li>
                      <li className="font-medium">Download or share on LinkedIn</li>
                    </ol>
                  </div>

                  <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                    <strong>Note:</strong> Certificates are only available for Pro and Enterprise subscribers.
                  </p>
                </div>
              </section>

              {/* Support */}
              <section id="support" className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-life-ring text-purple-600 mr-3"></i>
                  Support & Help
                </h2>
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-lg">
                    Need help? We're here to support your learning journey.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/academy/faq">
                      <div className="p-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl cursor-pointer hover:scale-105 transition-all shadow-lg">
                        <i className="fas fa-question-circle text-3xl mb-3"></i>
                        <h4 className="text-xl font-bold mb-2">FAQ</h4>
                        <p className="text-blue-100">Find answers to common questions</p>
                      </div>
                    </Link>

                    <a href="mailto:support@smartpromptiq.com">
                      <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl cursor-pointer hover:scale-105 transition-all shadow-lg">
                        <i className="fas fa-envelope text-3xl mb-3"></i>
                        <h4 className="text-xl font-bold mb-2">Email Support</h4>
                        <p className="text-green-100">support@smartpromptiq.com</p>
                      </div>
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
    </div>
  );
};

export default AcademyDocumentation;
