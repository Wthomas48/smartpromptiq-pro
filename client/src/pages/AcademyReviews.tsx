import React, { useState } from 'react';
import AcademyNavigation from '@/components/AcademyNavigation';

const AcademyReviews: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 5 | 4 | 3>('all');

  const reviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'AI Engineer',
      company: 'TechCorp',
      avatar: '👩‍💻',
      rating: 5,
      date: '2 weeks ago',
      course: 'Advanced Prompt Engineering',
      review: 'This academy completely transformed how I approach AI prompting. The lessons are incredibly detailed, and the hands-on exercises really solidified my understanding. The audio feature is a game-changer for learning on the go!',
      helpful: 142
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Content Creator',
      company: 'CreativeHub',
      avatar: '👨‍🎨',
      rating: 5,
      date: '1 month ago',
      course: 'ChatGPT Mastery for Content Creation',
      review: 'Best investment I\'ve made in my career this year. The content is practical, up-to-date, and immediately applicable. I\'ve already seen a 3x improvement in my content quality. The quizzes with audio feedback make learning fun!',
      helpful: 98
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Marketing Manager',
      company: 'BrandBoost',
      avatar: '👩‍💼',
      rating: 5,
      date: '3 weeks ago',
      course: 'AI-Powered Marketing Campaigns',
      review: 'The structured curriculum and interactive playground are phenomenal. I can test prompts in real-time and see what works. The certificates are professionally designed and look great on LinkedIn. Highly recommend!',
      helpful: 87
    },
    {
      id: 4,
      name: 'David Park',
      role: 'Software Developer',
      company: 'CodeLabs',
      avatar: '👨‍💻',
      rating: 5,
      date: '1 week ago',
      course: 'Code Generation with AI',
      review: 'As a developer, I was skeptical about AI prompting courses, but this exceeded all expectations. The technical depth is impressive, and the code examples are production-ready. The progress tracking keeps me motivated!',
      helpful: 156
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      role: 'Data Scientist',
      company: 'DataInsights',
      avatar: '👩‍🔬',
      rating: 4,
      date: '2 months ago',
      course: 'Data Analysis with AI Assistants',
      review: 'Excellent course material and very comprehensive. The only reason I\'m not giving 5 stars is I wish there were more advanced data science-specific examples. Still, absolutely worth it for the fundamentals and techniques taught.',
      helpful: 73
    },
    {
      id: 6,
      name: 'James Wilson',
      role: 'Product Manager',
      company: 'InnovatePro',
      avatar: '👨‍💼',
      rating: 5,
      date: '3 days ago',
      course: 'Product Development with AI',
      review: 'This academy helped me integrate AI into our product roadmap effectively. The lessons on prompt engineering for product specs are invaluable. My team has adopted these techniques and we\'re shipping faster than ever!',
      helpful: 201
    },
    {
      id: 7,
      name: 'Amanda Foster',
      role: 'UX Designer',
      company: 'DesignStudio',
      avatar: '👩‍🎨',
      rating: 5,
      date: '1 month ago',
      course: 'AI for Design & Creativity',
      review: 'The creative applications taught here opened my eyes to new possibilities. The interactive exercises are brilliantly designed, and I love how the audio player lets me multitask while learning. Already recommended to my entire team!',
      helpful: 112
    },
    {
      id: 8,
      name: 'Robert Martinez',
      role: 'Business Analyst',
      company: 'AnalyticsCo',
      avatar: '👨‍💼',
      rating: 5,
      date: '2 weeks ago',
      course: 'Business Intelligence with AI',
      review: 'Clear, concise, and immediately actionable. The rating system at the end of each lesson shows they really care about feedback. I\'ve completed 12 courses so far and every single one has been top-notch quality.',
      helpful: 94
    },
    {
      id: 9,
      name: 'Jennifer Lee',
      role: 'Freelance Writer',
      company: 'Self-Employed',
      avatar: '✍️',
      rating: 5,
      date: '4 days ago',
      course: 'Writing Excellence with AI',
      review: 'This has revolutionized my writing process. I can now handle 2x more clients while maintaining quality. The prompt templates are gold, and the live playground lets me experiment before committing to a strategy. Worth every penny!',
      helpful: 167
    },
    {
      id: 10,
      name: 'Chris Anderson',
      role: 'Startup Founder',
      company: 'TechStart',
      avatar: '🚀',
      rating: 5,
      date: '1 week ago',
      course: 'AI Strategy for Startups',
      review: 'As a non-technical founder, this was exactly what I needed. The courses demystify AI and show practical applications for business. The certificate gave me credibility when pitching to investors. Can\'t recommend enough!',
      helpful: 189
    },
    {
      id: 11,
      name: 'Michelle Patel',
      role: 'Customer Success Manager',
      company: 'SupportPro',
      avatar: '👩‍💼',
      rating: 4,
      date: '3 weeks ago',
      course: 'Customer Service AI Automation',
      review: 'Great content and well-organized. The hands-on exercises really help cement the concepts. I deducted one star only because I encountered a small bug in the quiz section, but support fixed it quickly. Overall fantastic experience!',
      helpful: 61
    },
    {
      id: 12,
      name: 'Daniel Kim',
      role: 'SEO Specialist',
      company: 'RankHigher',
      avatar: '📈',
      rating: 5,
      date: '2 days ago',
      course: 'SEO Content Creation with AI',
      review: 'This is THE resource for AI-powered SEO. The strategies taught here helped me rank 15 articles in the top 3 positions. The audio feedback during quizzes keeps me engaged, and I love being able to rate lessons to help improve them!',
      helpful: 234
    }
  ];

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === filter);

  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const totalReviews = reviews.length;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <AcademyNavigation />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
              <i className="fas fa-star text-yellow-500 mr-3"></i>
              Student Reviews
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our students are saying about SmartPromptIQ Academy
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Ratings Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  <i className="fas fa-chart-bar mr-2 text-purple-600"></i>
                  Overall Rating
                </h3>

                {/* Average Rating */}
                <div className="text-center mb-6 pb-6 border-b border-gray-200">
                  <div className="text-6xl font-extrabold text-purple-600 mb-2">
                    {averageRating}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i key={star} className="fas fa-star text-yellow-400 text-xl"></i>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm font-medium">
                    Based on {totalReviews} reviews
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-3 mb-6">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                    const percentage = (count / totalReviews) * 100;

                    return (
                      <button
                        key={rating}
                        onClick={() => setFilter(filter === rating ? 'all' : rating as 5 | 4 | 3)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all ${
                          filter === rating ? 'bg-purple-100' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm font-semibold text-gray-700 w-6">{rating}</span>
                        <i className="fas fa-star text-yellow-400 text-xs"></i>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 w-8 text-right">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Filter Button */}
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-3 space-y-6">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100 hover:border-purple-300 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl">
                        {review.avatar}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{review.name}</h3>
                        <p className="text-sm text-gray-600">
                          {review.role} at {review.company}
                        </p>
                        <p className="text-sm text-purple-600 font-medium mt-1">
                          <i className="fas fa-graduation-cap mr-1"></i>
                          {review.course}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star text-lg ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      ></i>
                    ))}
                    <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                      <i className="fas fa-check-circle mr-1"></i>
                      Verified
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {review.review}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition">
                      <i className="fas fa-thumbs-up"></i>
                      <span className="font-medium">Helpful ({review.helpful})</span>
                    </button>
                    <div className="flex gap-3">
                      <button className="text-gray-600 hover:text-purple-600 transition">
                        <i className="fas fa-share-alt"></i>
                      </button>
                      <button className="text-gray-600 hover:text-purple-600 transition">
                        <i className="fas fa-flag"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* No Results */}
              {filteredReviews.length === 0 && (
                <div className="text-center py-12">
                  <i className="fas fa-search text-gray-400 text-6xl mb-4"></i>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No reviews found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filter to see more reviews
                  </p>
                  <button
                    onClick={() => setFilter('all')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    Show All Reviews
                  </button>
                </div>
              )}

              {/* Pagination */}
              {filteredReviews.length > 0 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-purple-600 hover:text-purple-600 transition">
                    <i className="fas fa-chevron-left mr-2"></i>
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-purple-600 border-2 border-purple-600 rounded-lg font-medium text-white">
                    1
                  </button>
                  <button className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-purple-600 hover:text-purple-600 transition">
                    2
                  </button>
                  <button className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-purple-600 hover:text-purple-600 transition">
                    3
                  </button>
                  <button className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-purple-600 hover:text-purple-600 transition">
                    Next
                    <i className="fas fa-chevron-right ml-2"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-extrabold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students already transforming their careers with AI
            </p>
            <div className="flex justify-center gap-4">
              <a href="/academy/courses">
                <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold hover:scale-105 transition-all shadow-lg">
                  <i className="fas fa-book-open mr-2"></i>
                  Browse Courses
                </button>
              </a>
              <a href="/signup">
                <button className="px-8 py-4 bg-yellow-500 text-gray-900 rounded-xl font-bold hover:scale-105 transition-all shadow-lg">
                  <i className="fas fa-rocket mr-2"></i>
                  Start Free Trial
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademyReviews;
