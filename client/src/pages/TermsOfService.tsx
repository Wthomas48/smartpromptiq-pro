import React from 'react';
import { Link } from 'wouter';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-300 text-lg">
            Last Updated: January 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 text-gray-200 space-y-8">

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing or using SmartPromptIQ services, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Services</h2>
            <p className="leading-relaxed">
              SmartPromptIQ provides AI-powered SaaS tools, applications, and digital services. Features may change, improve, or be discontinued at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Accounts</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Users are responsible for maintaining account security</li>
              <li>You must provide accurate information</li>
              <li>We reserve the right to suspend or terminate accounts for misuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Subscriptions & Payments</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Certain features require paid subscriptions</li>
              <li>Fees are billed in advance</li>
              <li>Refunds are handled according to our posted billing terms</li>
              <li>Failure to pay may result in suspension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use</h2>
            <p className="leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Abuse or exploit the service</li>
              <li>Reverse engineer or resell the platform</li>
              <li>Use the service for unlawful activities</li>
              <li>Interfere with system security or integrity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content, software, branding, and trademarks are the property of SMARTPROMPTIQ SOLUTIONS LLC or its licensors. Users retain ownership of their own content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Termination</h2>
            <p className="leading-relaxed">
              We may suspend or terminate access at any time for violations of these terms. Users may cancel accounts at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimers</h2>
            <p className="leading-relaxed">
              Services are provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the maximum extent permitted by law, SmartPromptIQ shall not be liable for indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
            <p className="leading-relaxed">
              These terms are governed by the laws of the United States and the state in which SMARTPROMPTIQ SOLUTIONS LLC is registered.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
            <p className="leading-relaxed">
              We may update these Terms from time to time. Continued use constitutes acceptance of changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
            <div className="p-6 bg-white/5 rounded-xl space-y-3">
              <p className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <a href="mailto:support@smartpromptiq.com" className="text-purple-300 hover:text-purple-200 transition-colors">
                  support@smartpromptiq.com
                </a>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-2xl">🌐</span>
                <a href="https://smartpromptiq.com/support" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 transition-colors">
                  https://smartpromptiq.com/support
                </a>
              </p>
            </div>
          </section>

          {/* Support Section */}
          <section className="border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">SmartPromptIQ Support</h2>
            <p className="leading-relaxed text-lg text-purple-200 mb-6">
              We're here to help.
            </p>
            <div className="p-6 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl space-y-4">
              <p className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <span><strong>Email:</strong> <a href="mailto:support@smartpromptiq.com" className="text-purple-300 hover:text-purple-200 transition-colors">support@smartpromptiq.com</a></span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-2xl">🌐</span>
                <span><strong>Website:</strong> <a href="https://smartpromptiq.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 transition-colors">https://smartpromptiq.com</a></span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-2xl">🕒</span>
                <span><strong>Response Time:</strong> Typically within 24–48 business hours</span>
              </p>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              For account issues, billing questions, or technical support, please include your registered email address and a brief description of the issue.
            </p>
          </section>

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
