import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import AcademyNavigation from '@/components/AcademyNavigation';
import { apiRequest } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

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
  _count: {
    lessons: number;
  };
}

const AcademyCourses: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiRequest('GET', '/api/academy/courses');
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesFilter = filter === 'all' || course.accessTier === filter;
    const matchesCategory = category === 'all' || course.category === category;
    return matchesFilter && matchesCategory;
  });

  const getTierBadge = (tier: string) => {
    const badges = {
      free: { color: 'bg-green-100 text-green-700', label: 'FREE' },
      smartpromptiq_included: { color: 'bg-blue-100 text-blue-700', label: 'INCLUDED' },
      pro: { color: 'bg-purple-100 text-purple-700', label: 'PRO' },
      certification: { color: 'bg-yellow-100 text-yellow-700', label: 'CERTIFICATION' },
    };
    const badge = badges[tier as keyof typeof badges] || badges.free;
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'text-green-600',
      intermediate: 'text-yellow-600',
      advanced: 'text-orange-600',
      expert: 'text-red-600',
    };
    return colors[difficulty as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AcademyNavigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {user?.firstName && (
            <p className="text-purple-100 text-lg mb-2 font-medium">
              Welcome back, {user.firstName}! 👋
            </p>
          )}
          <h1 className="text-5xl font-extrabold text-white mb-4">
            Course Catalog
          </h1>
          <p className="text-xl text-purple-100">
            Choose from {courses.length} expert-led courses. Start learning today!
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4">
            {/* Access Tier Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Access:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Courses</option>
                <option value="free">Free</option>
                <option value="smartpromptiq_included">SmartPromptIQ Included</option>
                <option value="pro">Pro</option>
                <option value="certification">Certifications</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="prompt-engineering">Prompt Engineering</option>
                <option value="smartpromptiq">SmartPromptIQ</option>
                <option value="devops">DevOps</option>
                <option value="design">Design</option>
                <option value="finance">Finance & Trading</option>
                <option value="marketing">Marketing</option>
                <option value="data">Data & Analytics</option>
                <option value="development">Development</option>
                <option value="certification">Certifications</option>
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredCourses.length}</span> courses
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-search text-gray-400 text-4xl mb-4"></i>
            <p className="text-gray-600">No courses found matching your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Link key={course.id} href={`/academy/course/${course.slug}`}>
                <a className="block">
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 overflow-hidden h-full">
                    {/* Course Header */}
                    <div className={`h-32 bg-gradient-to-br ${
                      course.category === 'prompt-engineering'
                        ? 'from-purple-500 to-purple-700'
                        : course.category === 'smartpromptiq'
                        ? 'from-blue-500 to-blue-700'
                        : course.category === 'devops'
                        ? 'from-green-500 to-green-700'
                        : course.category === 'design'
                        ? 'from-pink-500 to-pink-700'
                        : course.category === 'finance'
                        ? 'from-orange-500 to-orange-700'
                        : 'from-indigo-500 to-indigo-700'
                    } p-6 flex items-end relative`}>
                      <div className="absolute top-4 right-4">
                        {getTierBadge(course.accessTier)}
                      </div>
                      <h3 className="text-xl font-bold text-white">{course.title}</h3>
                    </div>

                    {/* Course Body */}
                    <div className="p-6 space-y-4">
                      {/* Course Stats - Better spacing */}
                      <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <i className="fas fa-clock text-purple-500"></i>
                          <span className="font-medium">{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <i className="fas fa-book text-purple-500"></i>
                          <span className="font-medium">{course._count.lessons} lessons</span>
                        </span>
                        <span className={`flex items-center gap-1.5 capitalize font-medium ${getDifficultyColor(course.difficulty)}`}>
                          <i className="fas fa-signal"></i>
                          {course.difficulty}
                        </span>
                      </div>

                      {/* Description - More space, better line height */}
                      <p className="text-gray-700 leading-relaxed min-h-[4.5rem]">
                        {course.description.length > 120
                          ? course.description.substring(0, 120) + '...'
                          : course.description}
                      </p>

                      {/* Instructor - More prominent */}
                      {course.instructor && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-100">
                          <i className="fas fa-user-circle text-purple-500 text-base"></i>
                          <span className="font-medium">{course.instructor}</span>
                        </div>
                      )}

                      {/* Rating and CTA - Better spacing */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        {course.averageRating ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`fas fa-star text-sm ${
                                    i < Math.floor(course.averageRating)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                ></i>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                              {course.averageRating.toFixed(1)} ({course.reviewCount})
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">New course</span>
                        )}

                        <span className="text-purple-600 font-bold hover:text-purple-700 transition-colors">
                          View Course →
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            We're constantly adding new courses. Request a topic and we'll create it!
          </p>
          <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition">
            <i className="fas fa-lightbulb mr-2"></i>
            Request a Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademyCourses;
