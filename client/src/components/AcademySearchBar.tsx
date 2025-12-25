import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/config/api';

interface SearchResult {
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

const AcademySearchBar: React.FC = () => {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) return;

    setLoading(true);
    try {
      const response = await apiRequest('GET', `/api/academy/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length >= 2) {
      setLocation(`/academy/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleResultClick = (type: 'course' | 'lesson', slug?: string, lessonId?: string) => {
    setIsOpen(false);
    setQuery('');

    if (type === 'course' && slug) {
      setLocation(`/academy/course/${slug}`);
    } else if (type === 'lesson' && lessonId) {
      setLocation(`/academy/lesson/${lessonId}`);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses and lessons..."
            className="w-full md:w-80 px-4 py-2 pl-10 pr-10 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
          />
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

          {loading && (
            <i className="fas fa-spinner fa-spin absolute right-3 top-1/2 -translate-y-1/2 text-purple-600"></i>
          )}

          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults(null);
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && results && (
        <div className="absolute top-full mt-2 w-full md:w-[600px] max-h-[600px] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
          {results.totalResults === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-search text-gray-300 text-4xl mb-4"></i>
              <p className="text-gray-600 font-medium">No results found for "{query}"</p>
              <p className="text-sm text-gray-500 mt-2">Try different keywords</p>
            </div>
          ) : (
            <div className="p-4">
              {/* Results Summary */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  Found <strong className="text-purple-600">{results.totalResults}</strong> results
                  {results.courses.count > 0 && (
                    <span className="ml-2">
                      ({results.courses.count} course{results.courses.count !== 1 ? 's' : ''}, {results.lessons.count} lesson{results.lessons.count !== 1 ? 's' : ''})
                    </span>
                  )}
                </p>
              </div>

              {/* Courses */}
              {results.courses.count > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center">
                    <i className="fas fa-graduation-cap text-purple-600 mr-2"></i>
                    Courses ({results.courses.count})
                  </h3>
                  <div className="space-y-2">
                    {(results.courses?.results || []).slice(0, 5).map((course: any) => (
                      <button
                        key={course.id}
                        onClick={() => handleResultClick('course', course.slug)}
                        className="w-full text-left p-3 rounded-xl hover:bg-purple-50 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                            course.category === 'prompt-engineering' ? 'from-purple-400 to-indigo-500' :
                            course.category === 'smartpromptiq' ? 'from-blue-400 to-cyan-500' :
                            'from-indigo-400 to-purple-500'
                          } flex items-center justify-center text-white flex-shrink-0`}>
                            <i className="fas fa-book text-lg"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                              {course.title}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <i className="fas fa-book-open"></i>
                                {course._count?.lessons || 0} lessons
                              </span>
                              <span className="flex items-center gap-1">
                                <i className="fas fa-users"></i>
                                {course.enrollmentCount || 0} enrolled
                              </span>
                              {course.difficulty && (
                                <span className="capitalize px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                                  {course.difficulty}
                                </span>
                              )}
                            </div>
                          </div>
                          <i className="fas fa-arrow-right text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all"></i>
                        </div>
                      </button>
                    ))}
                  </div>
                  {results.courses.count > 5 && (
                    <button
                      onClick={() => setLocation(`/academy/search?q=${encodeURIComponent(query)}`)}
                      className="mt-3 text-sm text-purple-600 font-semibold hover:underline"
                    >
                      View all {results.courses.count} courses →
                    </button>
                  )}
                </div>
              )}

              {/* Lessons */}
              {results.lessons.count > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center">
                    <i className="fas fa-list text-indigo-600 mr-2"></i>
                    Lessons ({results.lessons.count})
                  </h3>
                  <div className="space-y-2">
                    {(results.lessons?.results || []).slice(0, 5).map((lesson: any) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleResultClick('lesson', undefined, lesson.id)}
                        className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <i className="fas fa-file-alt"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                              {lesson.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              From: <span className="font-medium text-gray-700">{lesson.course?.title}</span>
                            </p>
                            {lesson.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                {lesson.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <i className="fas fa-clock"></i>
                                {lesson.duration} min
                              </span>
                              {lesson.isFree && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                                  Free Preview
                                </span>
                              )}
                            </div>
                          </div>
                          <i className="fas fa-arrow-right text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"></i>
                        </div>
                      </button>
                    ))}
                  </div>
                  {results.lessons.count > 5 && (
                    <button
                      onClick={() => setLocation(`/academy/search?q=${encodeURIComponent(query)}`)}
                      className="mt-3 text-sm text-indigo-600 font-semibold hover:underline"
                    >
                      View all {results.lessons.count} lessons →
                    </button>
                  )}
                </div>
              )}

              {/* View All Results Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setLocation(`/academy/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg"
                >
                  View All {results.totalResults} Results
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademySearchBar;
