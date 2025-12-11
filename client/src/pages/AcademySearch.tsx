import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import AcademyNavigation from '@/components/AcademyNavigation';
import { apiRequest } from '@/config/api';

interface SearchResult {
  query: string;
  courses: {
    count: number;
    results: any[];
  };
  lessons: {
    count: number;
    results: any[];
  };
  totalResults: number;
}

const AcademySearch: React.FC = () => {
  const [location] = useLocation();
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'courses' | 'lessons'>('all');
  const [category, setCategory] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');

  // Extract query from URL
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, category, difficulty]);

  const performSearch = async () => {
    setLoading(true);
    try {
      let url = `/api/academy/search?q=${encodeURIComponent(query)}`;
      if (category !== 'all') url += `&category=${category}`;
      if (difficulty !== 'all') url += `&difficulty=${difficulty}`;

      const response = await apiRequest('GET', url);
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = filter === 'all' || filter === 'courses' ? results?.courses.results || [] : [];
  const filteredLessons = filter === 'all' || filter === 'lessons' ? results?.lessons.results || [] : [];
  const totalFiltered = (filter === 'courses' ? results?.courses.count : filter === 'lessons' ? results?.lessons.count : results?.totalResults) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      <AcademyNavigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 text-white/80 mb-6">
            <Link href="/academy">
              <span className="hover:text-white transition cursor-pointer">Academy</span>
            </Link>
            <i className="fas fa-chevron-right text-sm"></i>
            <span className="text-white font-semibold">Search Results</span>
          </div>

          <h1 className="text-5xl font-extrabold text-white mb-4">
            Search Results
          </h1>
          <p className="text-xl text-purple-100">
            {loading ? 'Searching...' : (
              results ? (
                <>
                  Found <strong>{results.totalResults}</strong> results for "<strong>{query}</strong>"
                </>
              ) : (
                'No query provided'
              )
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All', count: results?.totalResults || 0 },
                  { value: 'courses', label: 'Courses', count: results?.courses.count || 0 },
                  { value: 'lessons', label: 'Lessons', count: results?.lessons.count || 0 }
                ].map(({ value, label, count }) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value as any)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                      filter === value
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
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
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Level:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Searching...</p>
          </div>
        ) : !results || results.totalResults === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-search text-gray-400 text-4xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No results found</h2>
            <p className="text-gray-600 mb-8">
              We couldn't find anything matching "<strong>{query}</strong>"
            </p>
            <Link href="/academy/courses">
              <span className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-all cursor-pointer">
                Browse All Courses
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Courses */}
            {filteredCourses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-graduation-cap text-purple-600 mr-3"></i>
                  Courses ({results.courses.count})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course: any) => (
                    <Link key={course.id} href={`/academy/course/${course.slug}`}>
                      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-200 overflow-hidden h-full group cursor-pointer">
                        <div className={`h-32 bg-gradient-to-br ${
                          course.category === 'prompt-engineering' ? 'from-purple-500 to-purple-700' :
                          course.category === 'smartpromptiq' ? 'from-blue-500 to-blue-700' :
                          'from-indigo-500 to-indigo-700'
                        } p-6 flex items-end`}>
                          <h3 className="text-xl font-bold text-white">{course.title}</h3>
                        </div>
                        <div className="p-6">
                          <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <i className="fas fa-book text-purple-500"></i>
                              {course._count?.lessons || 0} lessons
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="fas fa-users text-purple-500"></i>
                              {course.enrollmentCount || 0} students
                            </span>
                            {course.difficulty && (
                              <span className="capitalize px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium text-xs">
                                {course.difficulty}
                              </span>
                            )}
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            {course.averageRating && (
                              <div className="flex items-center gap-1">
                                <i className="fas fa-star text-yellow-400"></i>
                                <span className="font-semibold">{course.averageRating.toFixed(1)}</span>
                              </div>
                            )}
                            <span className="text-purple-600 font-bold group-hover:translate-x-2 transition-transform flex items-center">
                              View Course
                              <i className="fas fa-arrow-right ml-2"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Lessons */}
            {filteredLessons.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-list text-indigo-600 mr-3"></i>
                  Lessons ({results.lessons.count})
                </h2>
                <div className="space-y-4">
                  {filteredLessons.map((lesson: any) => (
                    <Link key={lesson.id} href={`/academy/lesson/${lesson.id}`}>
                      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-200 p-6 group cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <i className="fas fa-file-alt text-2xl"></i>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">
                              Course: <span className="font-semibold text-gray-700">{lesson.course?.title}</span>
                            </p>
                            {lesson.description && (
                              <p className="text-gray-600 leading-relaxed line-clamp-2 mb-3">
                                {lesson.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <i className="fas fa-clock text-indigo-500"></i>
                                {lesson.duration} minutes
                              </span>
                              {lesson.isFree && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-xs">
                                  Free Preview
                                </span>
                              )}
                            </div>
                          </div>
                          <i className="fas fa-arrow-right text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all text-xl"></i>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademySearch;
