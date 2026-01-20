import React, { useState } from 'react';
import { Link } from 'wouter';

export default function Support() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support request:', formData);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Support & Help
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Get the help you need with multiple support channels and resources available 24/7.
          </p>
        </div>

        {/* Support Channels Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Live Chat Support */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-white mb-2">Live Chat Support</h3>
            <p className="text-gray-300 text-sm mb-4">
              Instant help for Pro and Business customers
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-cyan-400 font-semibold">24/7 for Business</span>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all">
              Start Chat
            </button>
          </div>

          {/* Email Support */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
            <p className="text-gray-300 text-sm mb-4">
              Detailed help for all users
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-cyan-400 font-semibold">24-48 hour response</span>
            </div>
            <a
              href="mailto:support@smartpromptiq.com"
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all text-center"
            >
              Send Email
            </a>
          </div>

          {/* Phone Support - PROMINENT */}
          <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-orange-500/50 hover:border-orange-400 transition-all">
            <div className="text-4xl mb-4">📞</div>
            <h3 className="text-xl font-bold text-white mb-2">Phone Support</h3>
            <p className="text-gray-300 text-sm mb-2">
              Direct phone support available
            </p>
            <p className="text-2xl font-bold text-orange-400 mb-4">
              727-304-5812
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-orange-300 font-semibold">Mon-Fri 9AM-6PM EST</span>
            </div>
            <a
              href="tel:+17273045812"
              className="block w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all text-center"
            >
              Call Now
            </a>
          </div>

          {/* Community Forum */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-2">Community Forum</h3>
            <p className="text-gray-300 text-sm mb-4">
              Connect with other users and get tips
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-green-400 font-semibold">Always open</span>
            </div>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20">
              Join Forum
            </button>
          </div>

          {/* Knowledge Base */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-white mb-2">Knowledge Base</h3>
            <p className="text-gray-300 text-sm mb-4">
              Comprehensive guides and tutorials
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-green-400 font-semibold">Always available</span>
            </div>
            <Link
              href="/documentation"
              className="block w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20 text-center"
            >
              Browse Articles
            </Link>
          </div>

          {/* Video Tutorials */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-bold text-white mb-2">Video Tutorials</h3>
            <p className="text-gray-300 text-sm mb-4">
              Step-by-step visual guides
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-green-400 font-semibold">On-demand</span>
            </div>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20">
              Watch Videos
            </button>
          </div>
        </div>

        {/* Support Hours & Priority Support */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Support Hours */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🕐</span>
              Support Hours
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-gray-300">Email Support</span>
                <span className="text-green-400 font-semibold">24/7</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-gray-300">Live Chat (Pro)</span>
                <span className="text-cyan-400 font-semibold">9 AM - 6 PM EST</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-gray-300">Live Chat (Business)</span>
                <span className="text-green-400 font-semibold">24/7</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-gray-300">Phone Support</span>
                <span className="text-orange-400 font-semibold">9 AM - 6 PM EST</span>
              </div>
              <div className="mt-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/30">
                <p className="text-orange-300 font-semibold flex items-center gap-2">
                  <span>📞</span>
                  Call us: 727-304-5812
                </p>
              </div>
            </div>
          </div>

          {/* Priority Support */}
          <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              Priority Support
            </h2>
            <p className="text-gray-300 mb-6">
              Get faster response times and priority handling with our Pro and Business plans.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-gray-200">
                <span className="text-green-400">✓</span>
                Dedicated support channel
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <span className="text-green-400">✓</span>
                Faster response times
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <span className="text-green-400">✓</span>
                Screen sharing support
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <span className="text-green-400">✓</span>
                Account manager (Business)
              </li>
            </ul>
            <Link
              href="/pricing"
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all text-center"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>

        {/* Enterprise Support */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-lg rounded-2xl p-8 border border-orange-500/30 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-3xl">🏢</span>
                Enterprise Support
              </h2>
              <p className="text-gray-300 max-w-xl">
                Large organization? Our enterprise support includes dedicated account management, custom training, and priority SLA guarantees.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+17273045812"
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all text-center"
              >
                📞 727-304-5812
              </a>
              <a
                href="mailto:enterprise@smartpromptiq.com"
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all text-center border border-white/20"
              >
                Contact Enterprise Sales
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <h4 className="font-semibold text-white mb-2">How do I reset my password?</h4>
              <p className="text-gray-300 text-sm">
                Click "Forgot Password" on the sign-in page, enter your email, and follow the reset link.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <h4 className="font-semibold text-white mb-2">How do I upgrade my plan?</h4>
              <p className="text-gray-300 text-sm">
                Go to Settings → Billing → Choose a new plan. Changes take effect immediately.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <h4 className="font-semibold text-white mb-2">Can I cancel my subscription?</h4>
              <p className="text-gray-300 text-sm">
                Yes, you can cancel anytime from your Billing settings. Access continues until the billing period ends.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <h4 className="font-semibold text-white mb-2">How do I export my prompts?</h4>
              <p className="text-gray-300 text-sm">
                Use the Export button in your Dashboard to download prompts in various formats.
              </p>
            </div>
          </div>
          <div className="text-center mt-6">
            <Link
              href="/academy/faq"
              className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
            >
              View All FAQs →
            </Link>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Submit a Support Request</h2>

          {submitted ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
              <p className="text-gray-300 mb-6">
                We've received your message and will respond within 24-48 hours.
              </p>
              <p className="text-orange-400 font-semibold mb-6">
                Need immediate help? Call us at 727-304-5812
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', category: 'general', message: '' });
                }}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="general" className="bg-slate-800">General Inquiry</option>
                    <option value="account" className="bg-slate-800">Account Issues</option>
                    <option value="billing" className="bg-slate-800">Billing Questions</option>
                    <option value="technical" className="bg-slate-800">Technical Support</option>
                    <option value="feature" className="bg-slate-800">Feature Request</option>
                    <option value="bug" className="bg-slate-800">Bug Report</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Brief description of your issue"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Please describe your issue in detail..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <p className="text-gray-400 text-sm">
                  Or call us directly: <a href="tel:+17273045812" className="text-orange-400 font-semibold hover:text-orange-300">727-304-5812</a>
                </p>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all"
                >
                  Submit Request
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
