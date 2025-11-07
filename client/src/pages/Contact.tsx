import React, { useState } from 'react';
import { apiRequest } from '@/config/api';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'general', label: 'General Inquiry', icon: 'fa-info-circle' },
    { value: 'support', label: 'Technical Support', icon: 'fa-life-ring' },
    { value: 'billing', label: 'Billing & Payments', icon: 'fa-credit-card' },
    { value: 'academy', label: 'Academy Questions', icon: 'fa-graduation-cap' },
    { value: 'feedback', label: 'Feedback & Suggestions', icon: 'fa-comment-alt' },
    { value: 'partnership', label: 'Partnership Opportunities', icon: 'fa-handshake' },
    { value: 'bug', label: 'Report a Bug', icon: 'fa-bug' },
    { value: 'other', label: 'Other', icon: 'fa-question-circle' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiRequest('POST', '/api/contact', formData);
      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: 'general',
          message: '',
        });
      } else {
        setError(result.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError('An error occurred. Please try emailing us directly at support@smartpromptiq.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
              <i className="fas fa-envelope text-purple-600 mr-3"></i>
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions or need support? We're here to help! Reach out to us through the form below or use one of our direct contact methods.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Direct Contact Methods */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  <i className="fas fa-phone text-purple-600 mr-2"></i>
                  Contact Information
                </h3>

                <div className="space-y-4">
                  {/* Email Support */}
                  <a
                    href="mailto:support@smartpromptiq.com"
                    className="block p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl hover:shadow-md transition-all border-2 border-purple-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-envelope text-white"></i>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Email Support</p>
                        <p className="text-purple-600 font-bold">support@smartpromptiq.com</p>
                      </div>
                    </div>
                  </a>

                  {/* Academy Email */}
                  <a
                    href="mailto:academy@smartpromptiq.com"
                    className="block p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:shadow-md transition-all border-2 border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-graduation-cap text-white"></i>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Academy Questions</p>
                        <p className="text-blue-600 font-bold">academy@smartpromptiq.com</p>
                      </div>
                    </div>
                  </a>

                  {/* Sales/Partnership */}
                  <a
                    href="mailto:sales@smartpromptiq.com"
                    className="block p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all border-2 border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-handshake text-white"></i>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Sales & Partnerships</p>
                        <p className="text-green-600 font-bold">sales@smartpromptiq.com</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-lg p-6 border-2 border-yellow-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  <i className="fas fa-clock text-yellow-600 mr-2"></i>
                  Response Time
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-green-500 mt-1"></i>
                    <span><strong>Email:</strong> Within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-green-500 mt-1"></i>
                    <span><strong>Contact Form:</strong> Within 48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-green-500 mt-1"></i>
                    <span><strong>Urgent Issues:</strong> Priority support for Pro/Enterprise</span>
                  </li>
                </ul>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  <i className="fas fa-business-time text-purple-600 mr-2"></i>
                  Business Hours
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex justify-between">
                    <span className="font-medium">Monday - Friday:</span>
                    <span>9 AM - 6 PM EST</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Saturday:</span>
                    <span>10 AM - 4 PM EST</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Sunday:</span>
                    <span className="text-red-600 font-semibold">Closed</span>
                  </p>
                  <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    * Emergency support available 24/7 for Enterprise customers
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  <i className="fas fa-link text-purple-600 mr-2"></i>
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <a href="/academy/faq" className="block text-purple-600 hover:underline text-sm">
                    <i className="fas fa-question-circle mr-2"></i>
                    FAQ
                  </a>
                  <a href="/academy/documentation" className="block text-purple-600 hover:underline text-sm">
                    <i className="fas fa-book mr-2"></i>
                    Documentation
                  </a>
                  <a href="/documentation" className="block text-purple-600 hover:underline text-sm">
                    <i className="fas fa-file-alt mr-2"></i>
                    Help Center
                  </a>
                  <a href="/pricing" className="block text-purple-600 hover:underline text-sm">
                    <i className="fas fa-tag mr-2"></i>
                    Pricing
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
                {submitted ? (
                  /* Success Message */
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className="fas fa-check text-green-600 text-4xl"></i>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Message Sent Successfully!
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                      Thank you for contacting us. We've received your message and will get back to you within 24-48 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg"
                    >
                      <i className="fas fa-envelope mr-2"></i>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  /* Contact Form */
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      <i className="fas fa-paper-plane text-purple-600 mr-2"></i>
                      Send Us a Message
                    </h2>

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-800">
                          <i className="fas fa-exclamation-circle"></i>
                          <span className="font-medium">{error}</span>
                        </div>
                      </div>
                    )}

                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                        <i className="fas fa-user text-purple-600 mr-2"></i>
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                        <i className="fas fa-envelope text-purple-600 mr-2"></i>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-bold text-gray-900 mb-2">
                        <i className="fas fa-tag text-purple-600 mr-2"></i>
                        Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-bold text-gray-900 mb-2">
                        <i className="fas fa-heading text-purple-600 mr-2"></i>
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Brief description of your inquiry"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-bold text-gray-900 mb-2">
                        <i className="fas fa-comment-alt text-purple-600 mr-2"></i>
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={8}
                        placeholder="Please provide as much detail as possible..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all resize-none"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500">
                          {formData.message.length} characters
                        </span>
                        {formData.message.length >= 50 && (
                          <span className="text-sm text-green-600 font-medium">
                            <i className="fas fa-check-circle mr-1"></i>
                            Good detail!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane mr-2"></i>
                            Send Message
                          </>
                        )}
                      </button>
                    </div>

                    {/* Privacy Notice */}
                    <p className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
                      <i className="fas fa-lock mr-1"></i>
                      Your information is secure and will only be used to respond to your inquiry.
                      We respect your privacy and will never share your data with third parties.
                    </p>
                  </form>
                )}
              </div>

              {/* Additional Help Section */}
              {!submitted && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FAQ Suggestion */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                    <i className="fas fa-question-circle text-blue-600 text-3xl mb-3"></i>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Check Our FAQ
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Many common questions are answered in our comprehensive FAQ section.
                    </p>
                    <a
                      href="/academy/faq"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                    >
                      View FAQ
                      <i className="fas fa-arrow-right ml-2"></i>
                    </a>
                  </div>

                  {/* Documentation Suggestion */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                    <i className="fas fa-book text-purple-600 text-3xl mb-3"></i>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Read Documentation
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Detailed guides and tutorials for using SmartPromptIQ and the Academy.
                    </p>
                    <a
                      href="/academy/documentation"
                      className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
                    >
                      View Docs
                      <i className="fas fa-arrow-right ml-2"></i>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default Contact;
