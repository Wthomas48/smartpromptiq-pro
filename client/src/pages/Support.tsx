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
    // In production, this would send to your backend
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
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            SmartPromptIQ Support
          </h1>
          <p className="text-xl text-purple-200">
            We're here to help.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-lg font-bold text-white mb-2">Email Us</h3>
            <a
              href="mailto:support@smartpromptiq.com"
              className="text-purple-300 hover:text-purple-200 transition-colors"
            >
              support@smartpromptiq.com
            </a>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🕒</div>
            <h3 className="text-lg font-bold text-white mb-2">Response Time</h3>
            <p className="text-gray-300">
              Typically within 24–48 business hours
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-bold text-white mb-2">Documentation</h3>
            <Link href="/documentation" className="text-purple-300 hover:text-purple-200 transition-colors">
              View Docs
            </Link>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">How do I reset my password?</h4>
              <p className="text-gray-300 text-sm">
                Click "Forgot Password" on the sign-in page, enter your email, and follow the reset link.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">How do I upgrade my plan?</h4>
              <p className="text-gray-300 text-sm">
                Go to Settings → Billing → Choose a new plan. Changes take effect immediately.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Can I cancel my subscription?</h4>
              <p className="text-gray-300 text-sm">
                Yes, you can cancel anytime from your Billing settings. Access continues until the billing period ends.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">How do I export my prompts?</h4>
              <p className="text-gray-300 text-sm">
                Use the Export button in your Dashboard to download prompts in various formats.
              </p>
            </div>
          </div>
        </div>

        {/* Support Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Submit a Support Request</h2>

          {submitted ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
              <p className="text-gray-300 mb-6">
                We've received your message and will respond within 24–48 business hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', category: 'general', message: '' });
                }}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Please describe your issue in detail. Include your registered email address if different from above."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
                >
                  Submit Request
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-sm text-gray-400 text-center">
            For account issues, billing questions, or technical support, please include your registered email address and a brief description of the issue.
          </p>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Additional Resources</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/documentation" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
              Documentation
            </Link>
            <Link href="/academy/faq" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
              Academy FAQ
            </Link>
            <Link href="/pricing" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
              Pricing
            </Link>
            <Link href="/privacy-policy" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
              Terms of Service
            </Link>
          </div>
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
