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
            <a
              href="mailto:support@smartpromptiq.com?subject=Live%20Chat%20Request"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all text-center"
            >
              Start Chat
            </a>
          </div>

          {/* General Info Email */}
          <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-teal-500/50 hover:border-teal-400 transition-all">
            <div className="text-4xl mb-4">📬</div>
            <h3 className="text-xl font-bold text-white mb-2">General Inquiries</h3>
            <p className="text-gray-300 text-sm mb-2">
              Questions, feedback, or general info
            </p>
            <p className="text-xl font-bold text-teal-400 mb-4">
              info@smartdealsiq.com
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-teal-300 font-semibold">24-48 hour response</span>
            </div>
            <a
              href="mailto:info@smartdealsiq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all text-center"
            >
              Email: info@smartdealsiq.com
            </a>
          </div>

          {/* Email Support */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold text-white mb-2">Technical Support</h3>
            <p className="text-gray-300 text-sm mb-2">
              Technical help for all users
            </p>
            <p className="text-purple-400 font-semibold text-sm mb-4">
              support@smartpromptiq.com
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-cyan-400 font-semibold">24-48 hour response</span>
            </div>
            <a
              href="mailto:support@smartpromptiq.com"
              target="_blank"
              rel="noopener noreferrer"
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
              Call Now: 727-304-5812
            </a>
          </div>

          {/* Schedule a Call */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-white mb-2">Schedule a Call</h3>
            <p className="text-gray-300 text-sm mb-4">
              Book a time that works for you
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-cyan-400 font-semibold">Business hours</span>
            </div>
            <a
              href="mailto:support@smartpromptiq.com?subject=Schedule%20a%20Call%20Request&body=Hi%2C%20I%20would%20like%20to%20schedule%20a%20call.%0A%0APreferred%20Date%3A%20%0APreferred%20Time%3A%20%0APhone%20Number%3A%20%0ATopic%3A%20"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all text-center"
            >
              Schedule Call
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
            <a
              href="https://discord.gg/smartpromptiq"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-xl transition-all text-center"
            >
              Join Discord Community
            </a>
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
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all text-center"
            >
              Browse Articles
            </Link>
          </div>

          {/* Video Tutorials - YouTube */}
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30 hover:border-red-400 transition-all">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-bold text-white mb-2">Video Tutorials</h3>
            <p className="text-gray-300 text-sm mb-4">
              Step-by-step visual guides on YouTube
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-red-400 font-semibold">On-demand</span>
            </div>
            <a
              href="https://www.youtube.com/@SmartPromptIQ"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Watch on YouTube
            </a>
          </div>

          {/* Academy FAQ */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="text-4xl mb-4">❓</div>
            <h3 className="text-xl font-bold text-white mb-2">FAQ</h3>
            <p className="text-gray-300 text-sm mb-4">
              Answers to common questions
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-green-400 font-semibold">Always available</span>
            </div>
            <Link
              href="/academy/faq"
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all text-center"
            >
              View FAQ
            </Link>
          </div>

          {/* Contact Page */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="text-4xl mb-4">✉️</div>
            <h3 className="text-xl font-bold text-white mb-2">Contact Form</h3>
            <p className="text-gray-300 text-sm mb-4">
              Send us a detailed message
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-cyan-400 font-semibold">24-48 hour response</span>
            </div>
            <Link
              href="/contact"
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all text-center"
            >
              Open Contact Form
            </Link>
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
                <a href="tel:+17273045812" className="text-orange-300 font-semibold flex items-center gap-2 hover:text-orange-200 transition-colors">
                  <span>📞</span>
                  Call us: 727-304-5812
                </a>
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
                📞 Call: 727-304-5812
              </a>
              <a
                href="mailto:enterprise@smartpromptiq.com?subject=Enterprise%20Support%20Inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all text-center border border-white/20"
              >
                ✉️ enterprise@smartpromptiq.com
              </a>
            </div>
          </div>
        </div>

        {/* Quick Contact Bar */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-12 border border-white/10">
          <div className="flex flex-wrap justify-center items-center gap-6">
            <a
              href="tel:+17273045812"
              className="flex items-center gap-2 px-6 py-3 bg-orange-500/20 hover:bg-orange-500/30 rounded-xl text-orange-400 font-semibold transition-all border border-orange-500/30"
            >
              <span>📞</span>
              727-304-5812
            </a>
            <a
              href="mailto:info@smartdealsiq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-teal-500/20 hover:bg-teal-500/30 rounded-xl text-teal-400 font-semibold transition-all border border-teal-500/30"
            >
              <span>📬</span>
              info@smartdealsiq.com
            </a>
            <a
              href="mailto:support@smartpromptiq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-purple-400 font-semibold transition-all border border-purple-500/30"
            >
              <span>✉️</span>
              support@smartpromptiq.com
            </a>
            <a
              href="https://www.youtube.com/@SmartPromptIQ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 font-semibold transition-all border border-red-500/30"
            >
              <span>🎥</span>
              YouTube Tutorials
            </a>
            <a
              href="https://discord.gg/smartpromptiq"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-[#5865F2]/20 hover:bg-[#5865F2]/30 rounded-xl text-[#5865F2] font-semibold transition-all border border-[#5865F2]/30"
            >
              <span>💬</span>
              Discord Community
            </a>
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
                Need immediate help? Call us at <a href="tel:+17273045812" className="underline">727-304-5812</a>
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
