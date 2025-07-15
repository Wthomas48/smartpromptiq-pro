import React from 'react';
import { Link } from 'react-router-dom';
import BrainLogo from './BrainLogo';
import { 
  Twitter, 
  Github, 
  Linkedin, 
  Mail,
  Globe,
  Shield,
  Heart
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    product: {
      title: 'Product',
      links: [
        { name: 'Features', href: '/features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Templates', href: '/templates' },
        { name: 'API', href: '/api' },
        { name: 'Integrations', href: '/integrations' }
      ]
    },
    company: {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Contact', href: '/contact' }
      ]
    },
    resources: {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs' },
        { name: 'Help Center', href: '/help' },
        { name: 'Community', href: '/community' },
        { name: 'Guides', href: '/guides' },
        { name: 'Examples', href: '/examples' }
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'GDPR', href: '/gdpr' },
        { name: 'Security', href: '/security' }
      ]
    }
  };

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/smartpromptiq', icon: Twitter },
    { name: 'GitHub', href: 'https://github.com/smartpromptiq', icon: Github },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/smartpromptiq', icon: Linkedin },
    { name: 'Email', href: 'mailto:hello@smartpromptiq.com', icon: Mail }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <BrainLogo size={32} variant="full" className="text-white" />
            </div>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              The world's most advanced prompt engineering platform. Create professional, 
              high-converting prompts for any AI model in seconds.
            </p>
            
            {/* Trust Indicators */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Trusted by 10,000+ professionals worldwide</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <h4 className="text-sm font-semibold text-gray-300 mb-4">Follow us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                      aria-label={social.name}
                      target={social.href.startsWith('http') ? '_blank' : '_self'}
                      rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-white mb-2">
                Stay updated with SmartPromptIQ
              </h3>
              <p className="text-gray-400 text-sm">
                Get the latest updates, tips, and insights delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors duration-200 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-gray-400 text-sm">
              <p className="mb-2 md:mb-0">
                © {currentYear} SmartPromptIQ. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                Made with <Heart className="w-4 h-4 text-red-400" fill="currentColor" /> for AI enthusiasts
              </span>
            </div>
          </div>
          
          {/* Additional Legal Links */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex flex-wrap gap-6 text-xs text-gray-500">
              <span>🇺🇸 United States (English)</span>
              <Link to="/accessibility" className="hover:text-gray-400 transition-colors">
                Accessibility
              </Link>
              <Link to="/status" className="hover:text-gray-400 transition-colors">
                System Status
              </Link>
              <Link to="/sitemap" className="hover:text-gray-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}