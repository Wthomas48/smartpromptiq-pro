import React, { useState, useEffect } from 'react';
import { Link, useRoute } from 'wouter';
import AcademyNavigation from '@/components/AcademyNavigation';
import { apiRequest } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  isFree: boolean;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  accessTier: string;
  priceUSD: number;
  instructor: string;
  averageRating: number;
  reviewCount: number;
  enrollmentCount: number;
  lessons: Lesson[];
  tags: string;
  seoDescription?: string;
}

// Generate SEO-optimized definition for Google AI Overview
const generateSEODefinition = (course: Course): string => {
  const categoryDescriptions: { [key: string]: string } = {
    'prompt-engineering': 'Prompt engineering is the process of designing structured instructions that guide AI systems to produce accurate, consistent, and useful outputs.',
    'smartpromptiq': 'SmartPromptIQ platform mastery enables professionals to leverage AI-powered prompt optimization, intelligent routing, and workflow automation.',
    'devops': 'DevOps with AI combines continuous integration, deployment automation, and AI-assisted infrastructure management for efficient software delivery.',
    'design': 'AI-powered design transforms creative workflows through automated asset generation, intelligent prototyping, and data-driven design decisions.',
    'finance': 'AI in finance enables algorithmic trading, risk analysis, portfolio optimization, and automated financial modeling with machine learning.',
    'marketing': 'AI marketing leverages machine learning for content creation, audience targeting, campaign optimization, and predictive analytics.',
    'data': 'AI-driven data analysis combines statistical methods with machine learning for insights extraction, visualization, and decision support.',
    'development': 'AI-assisted development accelerates coding through intelligent code generation, automated testing, debugging, and documentation.',
    'business': 'AI for business automates workflows, enhances customer experiences, and provides data-driven insights for strategic decisions.',
    'healthcare': 'AI in healthcare supports clinical decision-making, medical research, patient care optimization, and health data analysis.',
    'education': 'AI in education personalizes learning experiences, automates assessment, and creates adaptive educational content.',
    'certification': 'Professional AI certification validates expertise in prompt engineering, demonstrating competency to employers and clients.',
    'research': 'AI research methods accelerate scientific discovery through automated literature review, hypothesis generation, and data analysis.',
    'creative': 'Creative AI empowers writers, artists, and storytellers with intelligent content generation and narrative assistance.',
    'events': 'Live AI workshops provide hands-on training, real-time Q&A, and collaborative learning with industry experts.',
    'resources': 'AI learning resources include templates, tools, and reference materials for continuous skill development.',
  };

  const baseDescription = categoryDescriptions[course.category] ||
    `${course.title} provides comprehensive training in AI and prompt engineering techniques.`;

  return `${baseDescription} SmartPromptIQ Academy's "${course.title}" course teaches these skills through ${course.lessons?.length || 0} practical lessons designed for ${course.difficulty}-level learners.`;
};

const AcademyCourseDetail: React.FC = () => {
  const [, params] = useRoute('/academy/course/:slug');
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  useEffect(() => {
    if (params?.slug) {
      fetchCourse(params.slug);
    }
  }, [params?.slug]);

  useEffect(() => {
    if (course?.id && isAuthenticated) {
      checkEnrollmentStatus();
    }
  }, [course?.id, isAuthenticated]);

  const fetchCourse = async (slug: string) => {
    try {
      const response = await apiRequest('GET', `/api/academy/courses/${slug}`);
      const data = await response.json();
      if (data.success) {
        setCourse(data.data);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!course?.id) return;

    setCheckingEnrollment(true);
    try {
      // Only check enrollment if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('📊 No token - user not logged in, assuming not enrolled');
        setIsEnrolled(false);
        setCheckingEnrollment(false);
        return;
      }

      const response = await apiRequest('GET', '/api/academy/my-courses');
      const data = await response.json();

      if (data.success) {
        const enrolled = data.data.some((enrollment: any) =>
          enrollment.course.id === course.id || enrollment.courseId === course.id
        );
        setIsEnrolled(enrolled);
        console.log('📊 Enrollment status:', { courseId: course.id, enrolled });
      }
    } catch (error: any) {
      console.error('Error checking enrollment:', error);
      // If token is invalid, clear it and assume not enrolled
      if (error?.message?.includes('Invalid token') || error?.message?.includes('401')) {
        console.log('📊 Invalid token - clearing and assuming not enrolled');
        localStorage.removeItem('token');
      }
      setIsEnrolled(false);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleEnroll = async () => {
    // Double-check authentication
    const token = localStorage.getItem('token');
    console.log('🔍 Enrollment check:', {
      isAuthenticated,
      hasToken: !!token,
      tokenPreview: token?.substring(0, 20) + '...'
    });

    if (!isAuthenticated || !token) {
      console.log('⚠️ Not authenticated, redirecting to Academy sign in...');
      window.location.href = '/academy/signin?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    try {
      console.log('📤 Sending enrollment request...');
      const response = await apiRequest('POST', '/api/academy/enroll', {
        courseId: course?.id,
        enrollmentType: course?.accessTier === 'free' ? 'free' : 'purchased'
      });
      const data = await response.json();
      console.log('📥 Enrollment response:', data);

      if (data.success) {
        console.log('✅ Enrollment successful!');
        setIsEnrolled(true);
        setShowEnrollModal(true);
      } else {
        // Check if already enrolled
        if (data.message?.includes('Already enrolled')) {
          console.log('ℹ️ Already enrolled, updating UI...');
          setIsEnrolled(true);
          window.location.href = '/academy/dashboard';
        } else {
          alert('Enrollment failed: ' + (data.message || 'Unknown error'));
        }
      }
    } catch (error: any) {
      console.error('❌ Enroll error:', error);

      // Show user-friendly error
      if (error.message?.includes('Authentication required')) {
        alert('Your session has expired. Please sign in again.');
        localStorage.clear();
        window.location.href = '/signin?redirect=' + window.location.pathname;
      } else if (error.message?.includes('Already enrolled')) {
        console.log('ℹ️ Already enrolled, redirecting to dashboard...');
        setIsEnrolled(true);
        window.location.href = '/academy/dashboard';
      } else {
        alert('Failed to enroll: ' + error.message);
      }
    }
  };

  const getCategoryGradient = (category: string) => {
    const gradients: { [key: string]: string } = {
      'prompt-engineering': 'from-purple-500 via-purple-600 to-indigo-600',
      'smartpromptiq': 'from-blue-500 via-blue-600 to-cyan-600',
      'devops': 'from-green-500 via-green-600 to-teal-600',
      'design': 'from-pink-500 via-pink-600 to-rose-600',
      'finance': 'from-orange-500 via-orange-600 to-red-600',
      'marketing': 'from-purple-500 via-pink-500 to-red-500',
      'data': 'from-indigo-500 via-blue-500 to-cyan-500',
      'development': 'from-emerald-500 via-green-600 to-teal-600',
      'certification': 'from-yellow-500 via-amber-500 to-orange-500',
    };
    return gradients[category] || 'from-indigo-500 to-indigo-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AcademyNavigation />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AcademyNavigation />
        <div className="pt-32 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Course Not Found</h1>
          <Link href="/academy/courses">
            <span className="text-purple-600 font-semibold hover:underline cursor-pointer">
              ← Back to Courses
            </span>
          </Link>
        </div>
      </div>
    );
  }

  // Set document title and meta for SEO
  useEffect(() => {
    if (course) {
      document.title = `${course.title} | SmartPromptIQ Academy - Learn AI & Prompt Engineering`;

      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', generateSEODefinition(course));
    }
  }, [course]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50" itemScope itemType="https://schema.org/Course">
      <AcademyNavigation />

      {/* Hero Section - EPIC! */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(course.category)}`}></div>

        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-white/80 mb-8">
            <Link href="/academy"><span className="hover:text-white transition cursor-pointer">Academy</span></Link>
            <i className="fas fa-chevron-right text-sm"></i>
            <Link href="/academy/courses"><span className="hover:text-white transition cursor-pointer">Courses</span></Link>
            <i className="fas fa-chevron-right text-sm"></i>
            <span className="text-white font-semibold">{course.title}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left: Course Info */}
            <div className="lg:col-span-2">
              {/* Title */}
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight" itemProp="name">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-2xl text-white/90 mb-8 leading-relaxed" itemProp="abstract">
                {course.description}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-clock text-xl"></i>
                  <span className="font-bold">{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-book text-xl"></i>
                  <span className="font-bold">{course.lessons?.length || 0} lessons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-users text-xl"></i>
                  <span className="font-bold">{course.enrollmentCount.toLocaleString()} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-star text-yellow-300 text-xl"></i>
                  <span className="font-bold">{course.averageRating?.toFixed(1) || 'New'}</span>
                </div>
              </div>

              {/* Tags */}
              {course.tags && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {course.tags.split(',').map((tag, idx) => (
                    <span key={idx} className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Enroll Card - STICKY! */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-white/50">
                  {/* Price */}
                  <div className="text-center mb-8">
                    {course.accessTier === 'free' ? (
                      <div>
                        <div className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                          FREE
                        </div>
                        <p className="text-gray-600">Forever</p>
                      </div>
                    ) : course.accessTier === 'certification' ? (
                      <div>
                        <div className="text-5xl font-extrabold text-gray-900 mb-2">
                          ${(course.priceUSD / 100).toFixed(0)}
                        </div>
                        <p className="text-gray-600">One-time payment</p>
                      </div>
                    ) : course.accessTier === 'academy' ? (
                      <div>
                        <div className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                          $29/mo
                        </div>
                        <p className="text-gray-600">Academy subscription required</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                          $49/mo
                        </div>
                        <p className="text-gray-600">Pro subscription required</p>
                      </div>
                    )}
                  </div>

                  {/* Enroll Button */}
                  <button
                    onClick={isEnrolled ? () => window.location.href = '/academy/dashboard' : handleEnroll}
                    disabled={checkingEnrollment}
                    className={`w-full py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-lg hover:shadow-2xl mb-4 ${
                      checkingEnrollment
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isEnrolled
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    }`}
                  >
                    {checkingEnrollment ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Checking...
                      </>
                    ) : isEnrolled ? (
                      <>
                        <i className="fas fa-check-circle mr-2"></i>
                        Continue Learning
                      </>
                    ) : (
                      <>
                        <i className="fas fa-graduation-cap mr-2"></i>
                        Enroll Now
                      </>
                    )}
                  </button>

                  {/* View Plans Link - for users who need to upgrade */}
                  {!isEnrolled && course.accessTier !== 'free' && (
                    <Link
                      href={`/pricing?recommended=${course.accessTier === 'academy' ? 'academy' : 'pro'}`}
                    >
                      <span className="block w-full py-3 text-center text-purple-600 font-semibold hover:text-purple-800 transition cursor-pointer text-sm">
                        <i className="fas fa-info-circle mr-2"></i>
                        View Subscription Plans
                      </span>
                    </Link>
                  )}

                  {/* What's Included */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-500 mt-1"></i>
                      <span className="text-gray-700 font-medium">Lifetime access</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-500 mt-1"></i>
                      <span className="text-gray-700 font-medium">Certificate of completion</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-500 mt-1"></i>
                      <span className="text-gray-700 font-medium">Downloadable resources</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-500 mt-1"></i>
                      <span className="text-gray-700 font-medium">Community access</span>
                    </div>
                  </div>

                  {/* Share */}
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Share this course:</p>
                    <div className="flex items-center space-x-3">
                      <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                        <i className="fab fa-twitter"></i>
                      </button>
                      <button className="flex-1 py-3 bg-blue-800 text-white rounded-xl hover:bg-blue-900 transition">
                        <i className="fab fa-linkedin"></i>
                      </button>
                      <button className="flex-1 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition">
                        <i className="fas fa-link"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instructor Card */}
                {course.instructor && (
                  <div className="mt-6 bg-white rounded-2xl shadow-lg p-6" itemProp="instructor" itemScope itemType="https://schema.org/Person">
                    <p className="text-sm text-gray-500 mb-3 font-medium">Instructor</p>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {course.instructor.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg" itemProp="name">{course.instructor}</h4>
                        <p className="text-sm text-gray-600" itemProp="jobTitle">Expert Instructor</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Featured Snippet - Google AI Overview Target */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Definition Box - Optimized for Featured Snippets */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-lightbulb text-white text-xl"></i>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  What is {course.title}?
                </h2>
                <p className="text-gray-700 leading-relaxed" itemProp="description">
                  {generateSEODefinition(course)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Facts - Structured for Google */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600">{course.lessons?.length || 0}</div>
              <div className="text-sm text-gray-600">Lessons</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.floor(course.duration / 60)}h {course.duration % 60}m</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600 capitalize">{course.difficulty}</div>
              <div className="text-sm text-gray-600">Level</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600">{course.enrollmentCount.toLocaleString()}+</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Schema.org Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": course.title,
            "description": generateSEODefinition(course),
            "provider": {
              "@type": "Organization",
              "name": "SmartPromptIQ Academy",
              "sameAs": "https://smartpromptiq.com"
            },
            "instructor": {
              "@type": "Person",
              "name": course.instructor
            },
            "educationalLevel": course.difficulty,
            "numberOfLessons": course.lessons?.length || 0,
            "timeRequired": `PT${Math.floor(course.duration / 60)}H${course.duration % 60}M`,
            "aggregateRating": course.averageRating ? {
              "@type": "AggregateRating",
              "ratingValue": course.averageRating,
              "reviewCount": course.reviewCount,
              "bestRating": 5
            } : undefined,
            "offers": {
              "@type": "Offer",
              "price": course.accessTier === 'free' ? 0 : (course.priceUSD / 100),
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "hasCourseInstance": {
              "@type": "CourseInstance",
              "courseMode": "online",
              "courseWorkload": `PT${Math.floor(course.duration / 60)}H${course.duration % 60}M`
            },
            "about": [
              course.category.replace('-', ' '),
              "AI",
              "prompt engineering",
              "artificial intelligence"
            ],
            "teaches": course.tags?.split(',').map(t => t.trim()) || []
          })
        }}
      />

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left: Lessons */}
          <div className="lg:col-span-2 space-y-8">
            {/* Lessons Section */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <i className="fas fa-list-ul text-purple-600 mr-3"></i>
                Course Curriculum
              </h2>

              <div className="space-y-3">
                {course.lessons && course.lessons.length > 0 ? (
                  course.lessons.map((lesson, idx) => (
                    <div key={lesson.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 transition-all">
                      <button
                        onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-purple-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 flex-1 text-left">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center font-bold text-purple-700">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{lesson.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span><i className="fas fa-clock mr-1"></i>{lesson.duration} min</span>
                              {lesson.isFree && (
                                <span className="text-green-600 font-semibold">
                                  <i className="fas fa-unlock mr-1"></i>Free Preview
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <i className={`fas fa-chevron-down text-gray-400 transition-transform ${expandedLesson === lesson.id ? 'rotate-180' : ''}`}></i>
                      </button>

                      {expandedLesson === lesson.id && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          {lesson.description && (
                            <p className="text-gray-700 mb-4">{lesson.description}</p>
                          )}
                          {/* Start Lesson Button */}
                          {(isEnrolled || lesson.isFree) ? (
                            <Link href={`/academy/lesson/${lesson.id}`}>
                              <span className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-all cursor-pointer">
                                <i className="fas fa-play mr-2"></i>
                                Start Lesson
                              </span>
                            </Link>
                          ) : (
                            <div className="flex items-center space-x-3 text-gray-500">
                              <i className="fas fa-lock"></i>
                              <span className="text-sm font-medium">Enroll to access this lesson</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Lessons coming soon...</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Course Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Course Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Level</span>
                  <span className="font-bold text-purple-600 capitalize">{course.difficulty}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Duration</span>
                  <span className="font-bold text-gray-900">{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Lessons</span>
                  <span className="font-bold text-gray-900">{course.lessons?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 font-medium">Category</span>
                  <span className="font-bold text-gray-900 capitalize">{course.category.replace('-', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 max-w-md mx-4 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check text-white text-4xl"></i>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-4">You're Enrolled!</h3>
            <p className="text-gray-600 mb-8 text-lg">
              Start learning right away. Access your course from your dashboard.
            </p>
            <Link href="/academy/dashboard">
              <span className="block w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-all cursor-pointer">
                Go to Dashboard
              </span>
            </Link>
            <button
              onClick={() => setShowEnrollModal(false)}
              className="mt-4 text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Animations CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}} />
    </div>
  );
};

export default AcademyCourseDetail;
