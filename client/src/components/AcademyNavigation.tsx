import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import AcademySearchBar from './AcademySearchBar';

const AcademyNavigation: React.FC = () => {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/academy">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <i className="fas fa-brain text-white text-xl"></i>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                SmartPromptIQ™ Academy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Bar */}
            <AcademySearchBar />

            <Link href="/academy/courses">
              <span
                className={`font-medium transition cursor-pointer ${
                  isActive('/academy/courses')
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                Courses
              </span>
            </Link>
            <Link href="/academy/documentation">
              <span
                className={`font-medium transition cursor-pointer ${
                  isActive('/academy/documentation')
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                Documentation
              </span>
            </Link>
            <Link href="/academy/reviews">
              <span
                className={`font-medium transition cursor-pointer ${
                  isActive('/academy/reviews')
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                Reviews
              </span>
            </Link>
            <Link href="/academy/faq">
              <span
                className={`font-medium transition cursor-pointer ${
                  isActive('/academy/faq')
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                FAQ
              </span>
            </Link>
            <Link href="/contact">
              <span
                className={`font-medium transition cursor-pointer ${
                  isActive('/contact')
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                Contact
              </span>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/academy/dashboard">
                  <span className="text-gray-700 hover:text-purple-600 font-medium transition flex items-center space-x-2 cursor-pointer">
                    <i className="fas fa-graduation-cap"></i>
                    <span>My Learning</span>
                  </span>
                </Link>
                <Link href="/dashboard">
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer inline-block">
                    Main App
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/academy/signin">
                  <span className="text-gray-700 hover:text-purple-600 font-medium transition cursor-pointer">
                    Sign In
                  </span>
                </Link>
                <Link href="/academy/signup">
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer inline-block">
                    Start Free
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="/academy/courses">
                <span className="text-gray-700 hover:text-purple-600 font-medium transition cursor-pointer">
                  Courses
                </span>
              </Link>
              <Link href="/academy/documentation">
                <span className="text-gray-700 hover:text-purple-600 font-medium transition cursor-pointer">
                  Documentation
                </span>
              </Link>
              <Link href="/academy/reviews">
                <span className="text-gray-700 hover:text-purple-600 font-medium transition cursor-pointer">
                  Reviews
                </span>
              </Link>
              <Link href="/academy/faq">
                <span className="text-gray-700 hover:text-purple-600 font-medium transition cursor-pointer">
                  FAQ
                </span>
              </Link>
              <Link href="/contact">
                <span className="text-gray-700 hover:text-purple-600 font-medium transition cursor-pointer">
                  Contact
                </span>
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link href="/academy/dashboard">
                      <span className="block text-gray-700 hover:text-purple-600 font-medium cursor-pointer">
                        My Learning
                      </span>
                    </Link>
                    <Link href="/dashboard">
                      <span className="block bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold text-center cursor-pointer">
                        Main App
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/academy/signin">
                      <span className="block text-gray-700 hover:text-purple-600 font-medium cursor-pointer">
                        Sign In
                      </span>
                    </Link>
                    <Link href="/academy/signup">
                      <span className="block bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold text-center cursor-pointer">
                        Start Free
                      </span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AcademyNavigation;
