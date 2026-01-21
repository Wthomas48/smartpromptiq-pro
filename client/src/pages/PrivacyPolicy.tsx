import React from 'react';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-300 text-lg">
            Last Updated: January 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 text-gray-200 space-y-8">

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              SmartPromptIQ ("we," "our," or "us") is operated by SMARTPROMPTIQ SOLUTIONS LLC. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our websites, applications, and services, including smartpromptiq.com, smartpromptiq.net, and all SmartPromptIQ mobile and SaaS applications.
            </p>
            <p className="leading-relaxed mt-4">
              By using our services, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-purple-300 mb-3">a. Information You Provide</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
              <li>Name</li>
              <li>Email address</li>
              <li>Account credentials</li>
              <li>Payment-related information (processed securely by third-party providers)</li>
              <li>Support communications</li>
            </ul>

            <h3 className="text-xl font-semibold text-purple-300 mb-3">b. Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Device type and operating system</li>
              <li>App usage data and interactions</li>
              <li>Log files, diagnostics, and performance data</li>
              <li>IP address (for security and analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Analytics & Performance</h2>
            <p className="leading-relaxed">
              We use analytics tools to understand how users interact with our services, improve performance, fix errors, and enhance user experience. Analytics data is collected in an aggregated and anonymized manner and is not used to identify individual users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Email Communications</h2>
            <p className="leading-relaxed">
              Our platform allows vendors and users to enable email communications as part of app functionality. Emails are sent only when enabled by the user or vendor and are limited to transactional or service-related communications such as confirmations, notifications, and updates.
            </p>
            <p className="leading-relaxed mt-4 font-semibold text-purple-300">
              We do not send unsolicited marketing emails.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Payments</h2>
            <p className="leading-relaxed">
              Payments and subscriptions are processed through secure third-party payment processors. We do not store full payment card details on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Cookies & Tracking Technologies</h2>
            <p className="leading-relaxed mb-4">We may use cookies or similar technologies to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintain sessions</li>
              <li>Improve site functionality</li>
              <li>Analyze usage trends</li>
            </ul>
            <p className="leading-relaxed mt-4">
              You may disable cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Data Sharing</h2>
            <p className="leading-relaxed mb-4">
              We do not sell personal data. Information may be shared only with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Service providers (hosting, analytics, payments)</li>
              <li>Legal authorities when required by law</li>
              <li>Business transfers (mergers, acquisitions)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Data Security</h2>
            <p className="leading-relaxed">
              We implement reasonable administrative, technical, and physical safeguards to protect your information. However, no system is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. User Rights</h2>
            <p className="leading-relaxed mb-4">Depending on your location, you may have rights to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your data</li>
              <li>Request correction or deletion</li>
              <li>Withdraw consent</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Requests can be made through our support contact.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>
            <p className="leading-relaxed">
              SmartPromptIQ is not intended for children under 13. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Policy Scope</h2>
            <p className="leading-relaxed">
              This Privacy Policy applies to all applications, websites, and services operated by SMARTPROMPTIQ SOLUTIONS LLC, including current and future SmartPromptIQ-branded products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Chrome Extension Data Handling</h2>
            <div className="p-6 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-500/30 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🧩</span>
                <h3 className="text-xl font-semibold text-purple-300">SmartPromptIQ Browser Extension</h3>
              </div>
              <div className="space-y-4">
                <p className="leading-relaxed">
                  The SmartPromptIQ Browser Extension does <strong className="text-white">not</strong> collect, store, or transmit any personal information outside the user's browser. All processing of highlighted text occurs locally, and no data is sent to our servers unless the user explicitly chooses to paste or send it to a service.
                </p>
                <p className="leading-relaxed font-semibold text-green-400">
                  This extension does not use analytics or tracking technologies.
                </p>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-300">
                    For extension support or questions: {' '}
                    <a href="mailto:support@smartpromptiq.com" className="text-purple-300 hover:text-purple-200 transition-colors">
                      support@smartpromptiq.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Contact Us</h2>
            <div className="p-6 bg-white/5 rounded-xl space-y-3">
              <p className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <a href="mailto:support@smartpromptiq.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 transition-colors">
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
