import React from 'react';
import { Link } from 'wouter';
import AcademyNavigation from '@/components/AcademyNavigation';

const Academy: React.FC = () => {
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
                <Link href="/academy/courses">
                  <span className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-50 transition shadow-lg flex items-center justify-center cursor-pointer">
                    <i className="fas fa-rocket mr-2"></i>
                    Start Learning Free
                  </span>
                </Link>
                <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition flex items-center justify-center">
                  <i className="fas fa-play-circle mr-2"></i>
                  Watch Demo
                </button>
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
              Why SmartPromptIQ Academy?
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
            <Link href="/academy/courses">
              <span className="bg-white text-purple-600 px-10 py-5 rounded-lg font-bold text-xl hover:bg-gray-50 transition shadow-2xl cursor-pointer inline-block">
                <i className="fas fa-rocket mr-2"></i>
                Browse Courses
              </span>
            </Link>
            <Link href="/academy/dashboard">
              <span className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-lg font-bold text-xl hover:bg-white/10 transition cursor-pointer inline-block">
                <i className="fas fa-graduation-cap mr-2"></i>
                My Dashboard
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
