import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import AcademyNavigation from '@/components/AcademyNavigation';
import { apiRequest } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

interface EnrolledCourse {
  id: string;
  courseId: string;
  progress: number;
  enrolledAt: string;
  course: {
    title: string;
    slug: string;
    category: string;
    duration: number;
    lessons: any[];
  };
}

interface DashboardData {
  enrollments: EnrolledCourse[];
  stats: {
    coursesEnrolled: number;
    coursesCompleted: number;
    lessonsCompleted: number;
    certificatesEarned: number;
  };
  certificates: any[];
  recentActivity: any[];
}

const AcademyDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated]);

  const fetchDashboard = async () => {
    try {
      const response = await apiRequest('GET', '/api/academy/dashboard');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryGradient = (category: string) => {
    const gradients: { [key: string]: string } = {
      'prompt-engineering': 'from-purple-500 to-indigo-600',
      'smartpromptiq': 'from-blue-500 to-cyan-600',
      'devops': 'from-green-500 to-teal-600',
      'design': 'from-pink-500 to-rose-600',
      'finance': 'from-orange-500 to-red-600',
      'marketing': 'from-purple-500 to-pink-500',
      'data': 'from-indigo-500 to-cyan-500',
      'development': 'from-emerald-500 to-teal-600',
    };
    return gradients[category] || 'from-indigo-500 to-purple-600';
  };

  const ProgressRing = ({ progress, size = 120 }: { progress: number; size?: number }) => {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
        <AcademyNavigation />
        <div className="pt-32 text-center px-4">
          <div className="max-w-2xl mx-auto">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
              <i className="fas fa-lock text-purple-500 text-5xl"></i>
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Sign In Required
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Please sign in to access your learning dashboard
            </p>
            <Link href="/signin">
              <span className="inline-block px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-lg cursor-pointer">
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
        <AcademyNavigation />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      <AcademyNavigation />

      {/* Hero Header */}
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Welcome back, {user?.username || 'Student'}! 👋
              </h1>
              <p className="text-xl text-gray-600">Continue your learning journey</p>
            </div>
            <Link href="/academy/courses">
              <span className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg cursor-pointer inline-block">
                <i className="fas fa-plus mr-2"></i>
                Browse Courses
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards - GORGEOUS! */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Courses Enrolled', value: data?.stats.coursesEnrolled || 0, icon: 'graduation-cap', gradient: 'from-purple-500 to-indigo-600', iconBg: 'from-purple-100 to-purple-200' },
            { label: 'Completed', value: data?.stats.coursesCompleted || 0, icon: 'check-circle', gradient: 'from-green-500 to-emerald-600', iconBg: 'from-green-100 to-green-200' },
            { label: 'Lessons Done', value: data?.stats.lessonsCompleted || 0, icon: 'book', gradient: 'from-blue-500 to-cyan-600', iconBg: 'from-blue-100 to-blue-200' },
            { label: 'Certificates', value: data?.stats.certificatesEarned || 0, icon: 'award', gradient: 'from-yellow-500 to-orange-600', iconBg: 'from-yellow-100 to-yellow-200' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                <i className={`fas fa-${stat.icon} text-2xl text-${stat.gradient.split(' ')[0].replace('from-', '').replace('-500', '-600')}`}></i>
              </div>
              <div className={`text-4xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Enrolled Courses */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
                  <i className="fas fa-book-open text-purple-600 mr-3"></i>
                  Continue Learning
                </h2>
              </div>

              {data?.enrollments && data.enrollments.length > 0 ? (
                <div className="space-y-6">
                  {data.enrollments.map((enrollment) => (
                    <Link key={enrollment.id} href={`/academy/course/${enrollment.course.slug}`}>
                      <div className="block group cursor-pointer">
                        <div className="border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-lg transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                                {enrollment.course.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span><i className="fas fa-clock mr-1"></i>{Math.floor(enrollment.course.duration / 60)}h {enrollment.course.duration % 60}m</span>
                                <span><i className="fas fa-book mr-1"></i>{enrollment.course.lessons?.length || 0} lessons</span>
                              </div>
                            </div>
                            <ProgressRing progress={enrollment.progress} size={80} />
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-1000 rounded-full"
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>

                          {/* CTA */}
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              Started {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </span>
                            <span className="text-purple-600 font-bold group-hover:translate-x-2 transition-transform flex items-center">
                              Continue
                              <i className="fas fa-arrow-right ml-2"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-graduation-cap text-purple-500 text-4xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No courses yet</h3>
                  <p className="text-gray-600 mb-8">Start learning by enrolling in a course</p>
                  <Link href="/academy/courses">
                    <span className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-all cursor-pointer">
                      Browse Courses
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Achievements & Certificates */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <i className="fas fa-trophy text-yellow-500 mr-3"></i>
                Achievements
              </h3>

              <div className="space-y-4">
                {[
                  { icon: 'fa-fire', label: 'Streak', value: '7 days', color: 'from-orange-500 to-red-500', unlocked: true },
                  { icon: 'fa-star', label: 'First Course', value: 'Completed', color: 'from-yellow-500 to-orange-500', unlocked: data && data.stats.coursesCompleted > 0 },
                  { icon: 'fa-bolt', label: 'Fast Learner', value: 'Locked', color: 'from-gray-400 to-gray-500', unlocked: false },
                  { icon: 'fa-medal', label: 'Top Student', value: 'Locked', color: 'from-gray-400 to-gray-500', unlocked: false }
                ].map((achievement, idx) => (
                  <div key={idx} className={`flex items-center space-x-4 p-4 rounded-xl ${achievement.unlocked ? 'bg-gradient-to-r from-purple-50 to-indigo-50' : 'bg-gray-50 opacity-50'}`}>
                    <div className={`w-12 h-12 bg-gradient-to-br ${achievement.color} rounded-xl flex items-center justify-center`}>
                      <i className={`fas ${achievement.icon} text-white text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{achievement.label}</div>
                      <div className="text-sm text-gray-500">{achievement.value}</div>
                    </div>
                    {achievement.unlocked && (
                      <i className="fas fa-check-circle text-green-500 text-xl"></i>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <i className="fas fa-certificate mr-3"></i>
                Certificates
              </h3>
              <div className="text-5xl font-extrabold mb-2">
                {data?.stats.certificatesEarned || 0}
              </div>
              <p className="text-purple-100 mb-6">Earned so far</p>
              <Link href="/academy/certificates">
                <span className="block w-full py-3 bg-white text-purple-600 rounded-xl font-bold text-center hover:bg-purple-50 transition cursor-pointer">
                  View All
                </span>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link href="/academy/courses">
                  <span className="block py-3 px-4 bg-gray-50 hover:bg-purple-50 rounded-xl font-medium text-gray-700 hover:text-purple-600 transition cursor-pointer">
                    <i className="fas fa-book mr-2"></i>
                    Browse Courses
                  </span>
                </Link>
                <Link href="/academy">
                  <span className="block py-3 px-4 bg-gray-50 hover:bg-purple-50 rounded-xl font-medium text-gray-700 hover:text-purple-600 transition cursor-pointer">
                    <i className="fas fa-home mr-2"></i>
                    Academy Home
                  </span>
                </Link>
                <Link href="/settings">
                  <span className="block py-3 px-4 bg-gray-50 hover:bg-purple-50 rounded-xl font-medium text-gray-700 hover:text-purple-600 transition cursor-pointer">
                    <i className="fas fa-cog mr-2"></i>
                    Settings
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademyDashboard;
