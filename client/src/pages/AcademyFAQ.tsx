import React, { useState } from 'react';
import AcademyNavigation from '@/components/AcademyNavigation';
import { Link } from 'wouter';

const AcademyFAQ: React.FC = () => {
  const [openCategory, setOpenCategory] = useState<string>('general');
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);

  const toggleQuestion = (id: number) => {
    if (openQuestions.includes(id)) {
      setOpenQuestions(openQuestions.filter(q => q !== id));
    } else {
      setOpenQuestions([...openQuestions, id]);
    }
  };

  const categories = [
    { id: 'general', title: 'General', icon: 'fa-info-circle' },
    { id: 'account', title: 'Account & Billing', icon: 'fa-user-circle' },
    { id: 'courses', title: 'Courses & Learning', icon: 'fa-graduation-cap' },
    { id: 'technical', title: 'Technical', icon: 'fa-cog' },
    { id: 'certificates', title: 'Certificates', icon: 'fa-certificate' },
  ];

  const faqs = {
    general: [
      {
        id: 1,
        question: 'What is SmartPromptIQ Academy?',
        answer: 'SmartPromptIQ Academy is a comprehensive online learning platform dedicated to teaching AI prompt engineering. We offer 57 courses with 555+ lessons covering everything from beginner basics to advanced techniques for mastering AI interactions.'
      },
      {
        id: 2,
        question: 'Who is this academy for?',
        answer: 'The Academy is designed for anyone who wants to improve their AI prompting skills - from complete beginners to experienced professionals. Whether you\'re a content creator, developer, marketer, business owner, or AI enthusiast, we have courses tailored to your needs.'
      },
      {
        id: 3,
        question: 'Do I need prior experience with AI?',
        answer: 'No prior AI experience is required! Our beginner courses start with the fundamentals and gradually build up to advanced concepts. We have courses for all skill levels - beginner, intermediate, and advanced.'
      },
      {
        id: 4,
        question: 'How is the Academy different from free resources?',
        answer: 'Unlike scattered free resources, our Academy offers a structured curriculum with interactive quizzes, hands-on exercises, a live prompt playground, audio learning features, progress tracking, and professional certificates. All content is created and regularly updated by AI experts.'
      },
      {
        id: 5,
        question: 'Can I access courses on mobile devices?',
        answer: 'Yes! The Academy is fully responsive and works seamlessly on desktop, tablet, and mobile devices. You can learn anywhere, anytime. The audio player feature is especially convenient for mobile learning.'
      },
    ],
    account: [
      {
        id: 6,
        question: 'How do I create an account?',
        answer: 'Click the "Start Free" or "Sign Up" button at the top right of any page. Fill in your email and password, and you\'ll have immediate access to free courses. You can upgrade to Pro or Enterprise at any time.'
      },
      {
        id: 7,
        question: 'What subscription tiers are available?',
        answer: 'We offer six tiers: Free ($0 - 3 courses), Starter ($19/mo - basic creative tools), Academy+ ($29/mo - all 57 courses with certificates), Pro ($49/mo - full platform), Team Pro ($99/mo - teams of 2-5), and Enterprise ($299/mo - unlimited). Full Academy access starts at Academy+.'
      },
      {
        id: 8,
        question: 'How do I upgrade my subscription?',
        answer: 'Visit the main Pricing page (not in the Academy) and select your desired plan. Your Academy access will automatically upgrade once your payment is processed. All course progress is retained when you upgrade.'
      },
      {
        id: 9,
        question: 'Can I cancel my subscription?',
        answer: 'Yes, you can cancel anytime from your account settings. You\'ll retain access until the end of your billing period. Completed courses and certificates remain in your account even after cancellation.'
      },
      {
        id: 10,
        question: 'Do you offer refunds?',
        answer: 'We offer a 14-day money-back guarantee for Pro and Enterprise subscriptions. If you\'re not satisfied, contact support@smartpromptiq.com within 14 days of purchase for a full refund.'
      },
    ],
    courses: [
      {
        id: 11,
        question: 'How many courses are available?',
        answer: 'We currently offer 57 comprehensive courses with 555+ lessons. New courses are added regularly based on the latest AI developments and user feedback. Pro subscribers get unlimited access to all courses.'
      },
      {
        id: 12,
        question: 'How long are the courses?',
        answer: 'Course lengths vary from 2 to 6 hours depending on the topic. Each course contains 8-12 lessons with rich content (2,000-4,000 words per lesson), quizzes, exercises, and interactive playgrounds.'
      },
      {
        id: 13,
        question: 'Can I learn at my own pace?',
        answer: 'Absolutely! All courses are self-paced. You can start, pause, and resume anytime. Your progress is automatically saved, and you have lifetime access to enrolled courses (as long as your subscription is active).'
      },
      {
        id: 14,
        question: 'What are the interactive features?',
        answer: 'Each lesson includes: rich text content with audio narration, interactive quizzes with instant feedback and audio cues, hands-on exercises with checkpoints, live prompt playground for experimentation, and a 5-star rating system to help us improve.'
      },
      {
        id: 15,
        question: 'How does the audio player work?',
        answer: 'Click "Play Lesson" on any lesson to hear the content read aloud using text-to-speech technology. You can control playback speed (0.75x to 1.5x), pause/resume, and track progress. Perfect for learning while commuting or multitasking!'
      },
      {
        id: 16,
        question: 'What is the live playground?',
        answer: 'The playground is an interactive environment where you can test prompts in real-time. It includes example prompts, tips, and a challenge mode. You can experiment with different prompt structures before using them in production.'
      },
      {
        id: 17,
        question: 'How do quizzes work?',
        answer: 'Each lesson includes a quiz with 5 questions (multiple choice, true/false, or fill-in-blank). You need 70% to pass. You get instant feedback with explanations and audio cues (success/error sounds). You can retake quizzes unlimited times.'
      },
      {
        id: 18,
        question: 'Can I download course materials?',
        answer: 'Course content is available online 24/7. While direct downloads aren\'t available (to protect intellectual property), you can access everything anytime with your active subscription. Certificates can be downloaded as PDFs.'
      },
    ],
    technical: [
      {
        id: 19,
        question: 'Which browsers are supported?',
        answer: 'The Academy works best on Chrome, Firefox, Safari, and Edge (latest versions). The audio features require modern browser support for Web Speech API and Web Audio API. We recommend Chrome for the best experience.'
      },
      {
        id: 20,
        question: 'Why isn\'t text-to-speech working?',
        answer: 'Text-to-speech requires a modern browser with Web Speech API support. If it\'s not working: 1) Update your browser to the latest version, 2) Try Chrome or Edge, 3) Check if your browser allows audio playback, 4) Disable any extensions that block audio.'
      },
      {
        id: 21,
        question: 'Can I mute the audio feedback sounds?',
        answer: 'Yes! Look for the "Sound On/Muted" toggle button in quizzes and exercises. Your preference is saved in your browser. You can mute quiz sounds while still using the text-to-speech lesson player.'
      },
      {
        id: 22,
        question: 'Is my progress saved automatically?',
        answer: 'Yes! All progress (completed lessons, quiz scores, exercise submissions, ratings) is automatically saved to your account. You can switch devices and pick up exactly where you left off.'
      },
      {
        id: 23,
        question: 'What if I encounter a bug?',
        answer: 'We test thoroughly, but bugs can slip through. Please report any issues to support@smartpromptiq.com with: your browser/device info, what you were doing when the bug occurred, and screenshots if possible. We typically respond within 24 hours.'
      },
      {
        id: 24,
        question: 'Do you have an API?',
        answer: 'Currently, the Academy is web-only. We\'re exploring mobile apps and API access for Enterprise customers. If you\'re interested in API access, contact our sales team at sales@smartpromptiq.com.'
      },
    ],
    certificates: [
      {
        id: 25,
        question: 'How do I earn a certificate?',
        answer: 'To earn a certificate: 1) Complete all lessons in a course, 2) Pass all quizzes with 70% or higher, 3) Submit all hands-on exercises. Certificates are automatically generated and appear in your dashboard.'
      },
      {
        id: 26,
        question: 'Are certificates available for free users?',
        answer: 'No, certificates are only available for Academy+ ($29/mo) and higher subscribers. This ensures certificate integrity and value. Upgrade to Academy+ to unlock certificates for all 57 completed courses.'
      },
      {
        id: 27,
        question: 'Can I share certificates on LinkedIn?',
        answer: 'Yes! Download your certificate as a PDF and upload it to LinkedIn under "Licenses & Certifications." We also provide a shareable certificate URL you can add to your profile, resume, or portfolio.'
      },
      {
        id: 28,
        question: 'Do certificates expire?',
        answer: 'No, our certificates don\'t expire. Once earned, they\'re yours forever. However, we recommend retaking courses every 12-18 months to stay updated with the latest AI developments.'
      },
      {
        id: 29,
        question: 'Are the certificates accredited?',
        answer: 'Our certificates are industry-recognized credentials from SmartPromptIQ, a leading AI education platform. While not accredited by traditional education bodies, they\'re valued by employers in tech, marketing, and creative industries.'
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <AcademyNavigation />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
              <i className="fas fa-question-circle text-purple-600 mr-3"></i>
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about SmartPromptIQ Academy
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for answers..."
                className="w-full px-6 py-4 pl-14 border-2 border-purple-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all text-lg"
              />
              <i className="fas fa-search absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  <i className="fas fa-folder mr-2 text-purple-600"></i>
                  Categories
                </h3>
                <nav className="space-y-2">
                  {categories.map((category) => {
                    const questionCount = faqs[category.id as keyof typeof faqs].length;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setOpenCategory(category.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between ${
                          openCategory === category.id
                            ? 'bg-purple-600 text-white font-semibold'
                            : 'text-gray-700 hover:bg-purple-50'
                        }`}
                      >
                        <span>
                          <i className={`fas ${category.icon} mr-2`}></i>
                          {category.title}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          openCategory === category.id
                            ? 'bg-purple-700'
                            : 'bg-gray-200'
                        }`}>
                          {questionCount}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                {/* Quick Links */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">
                    Quick Links
                  </h4>
                  <div className="space-y-2">
                    <Link href="/academy/documentation">
                      <span className="block text-sm text-purple-600 hover:underline cursor-pointer">
                        <i className="fas fa-book mr-2"></i>
                        Documentation
                      </span>
                    </Link>
                    <a href="mailto:support@smartpromptiq.com" className="block text-sm text-purple-600 hover:underline">
                      <i className="fas fa-envelope mr-2"></i>
                      Contact Support
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <i className={`fas ${categories.find(c => c.id === openCategory)?.icon} text-purple-600 mr-3`}></i>
                  {categories.find(c => c.id === openCategory)?.title}
                </h2>

                <div className="space-y-4">
                  {faqs[openCategory as keyof typeof faqs].map((faq) => (
                    <div
                      key={faq.id}
                      className="border-2 border-gray-200 rounded-xl overflow-hidden transition-all hover:border-purple-300"
                    >
                      <button
                        onClick={() => toggleQuestion(faq.id)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left bg-gray-50 hover:bg-purple-50 transition-all"
                      >
                        <span className="font-bold text-gray-900 pr-4">
                          {faq.question}
                        </span>
                        <i className={`fas fa-chevron-${openQuestions.includes(faq.id) ? 'up' : 'down'} text-purple-600`}></i>
                      </button>

                      {openQuestions.includes(faq.id) && (
                        <div className="px-6 py-4 bg-white border-t-2 border-gray-200">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Still Have Questions */}
              <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
                <i className="fas fa-life-ring text-5xl mb-4"></i>
                <h3 className="text-2xl font-extrabold mb-2">
                  Still have questions?
                </h3>
                <p className="text-purple-100 mb-6">
                  Our support team is here to help you succeed
                </p>
                <div className="flex justify-center gap-4">
                  <a href="mailto:support@smartpromptiq.com">
                    <button className="px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:scale-105 transition-all shadow-lg">
                      <i className="fas fa-envelope mr-2"></i>
                      Email Support
                    </button>
                  </a>
                  <Link href="/academy/documentation">
                    <button className="px-6 py-3 bg-purple-800 text-white rounded-lg font-bold hover:scale-105 transition-all">
                      <i className="fas fa-book mr-2"></i>
                      View Docs
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademyFAQ;
