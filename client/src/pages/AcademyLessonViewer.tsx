import React, { useState, useEffect } from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import { apiRequest } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import LessonQuiz from '@/components/LessonQuiz';
import PromptPlayground from '@/components/PromptPlayground';
import HandsOnExercise from '@/components/HandsOnExercise';
import LessonAudioPlayer from '@/components/LessonAudioPlayer';
import LessonRatingFeedback from '@/components/LessonRatingFeedback';
import CertificateShareModal from '@/components/CertificateShareModal';
import AcademyFeatureLinks from '@/components/AcademyFeatureLinks';

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  order: number;
  isFree: boolean;
  videoUrl?: string;
  downloadUrl?: string;
  codeSnippet?: string;
  quizData?: any;
  exerciseData?: any;
  playgroundExamples?: any;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  lessons: Lesson[];
}

interface LessonData {
  lesson: Lesson;
  course: Course;
  progress: any;
  nextLesson: Lesson | null;
  previousLesson: Lesson | null;
}

const AcademyLessonViewer: React.FC = () => {
  const [, params] = useRoute('/academy/lesson/:lessonId');
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    if (params?.lessonId) {
      fetchLesson(params.lessonId);
    }
  }, [params?.lessonId]);

  const fetchLesson = async (lessonId: string) => {
    try {
      const response = await apiRequest('GET', `/api/academy/lesson/${lessonId}`);

      // Check if response is 401 Unauthorized
      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token expired or invalid');
        alert('Your session has expired. Please sign in again.');
        localStorage.clear();
        window.location.href = '/signin?redirect=' + window.location.pathname;
        return;
      }

      const result = await response.json();
      console.log('📚 Lesson API Response:', result);

      if (result.success) {
        console.log('✅ Lesson data:', result.data);
        setData(result.data);
        setIsCompleted(result.data.progress?.completed || false);
      } else {
        console.error('❌ Lesson fetch failed:', result.message);
        if (result.message?.includes('Access denied') || result.message?.includes('enroll')) {
          alert('⚠️ You need to enroll in this course first to access this lesson.');
          // Redirect to courses page
          setTimeout(() => {
            setLocation('/academy/courses');
          }, 500);
        } else if (result.message?.includes('Authentication')) {
          alert('Your session has expired. Please sign in again.');
          localStorage.clear();
          window.location.href = '/signin?redirect=' + window.location.pathname;
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching lesson:', error);
      // Handle enrollment/access errors gracefully
      if (error.message?.includes('Access denied') || error.message?.includes('enroll')) {
        alert('⚠️ You need to enroll in this course first to access this lesson.');
        setTimeout(() => {
          setLocation('/academy/courses');
        }, 500);
      } else if (error.message?.includes('Authentication')) {
        alert('Your session has expired. Please sign in again.');
        localStorage.clear();
        window.location.href = '/signin?redirect=' + window.location.pathname;
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsComplete = async () => {
    if (!data?.lesson.id) return;

    setMarkingComplete(true);
    try {
      const response = await apiRequest('POST', `/api/academy/progress/${data.lesson.id}`, {
        completed: true
      });
      const result = await response.json();

      if (result.success) {
        setIsCompleted(true);

        // Check if this is the last lesson in the current course
        const isLastLessonInCourse = !data.nextLesson || data.nextLesson.courseId !== data.lesson.courseId;

        if (isLastLessonInCourse) {
          // Show certificate sharing modal
          setShowCertificateModal(true);
        } else {
          // There's a next lesson in the same course
          alert('✅ Lesson completed! Great job! Moving to next lesson...');
          // Auto-navigate to next lesson after 2 seconds
          setTimeout(() => {
            setLocation(`/academy/lesson/${data.nextLesson!.id}`);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    } finally {
      setMarkingComplete(false);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="text-center px-4">
          <div className="max-w-2xl mx-auto">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
              <i className="fas fa-lock text-purple-500 text-5xl"></i>
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Sign In Required
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Please sign in to access lessons
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
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading lesson...</p>
          </div>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('🔍 Component render check:', {
    hasData: !!data,
    hasLesson: !!data?.lesson,
    hasCourse: !!data?.course,
    data: data
  });

  if (!data || !data.lesson || !data.course) {
    console.log('❌ Showing "Lesson Not Found" because:', {
      noData: !data,
      noLesson: !data?.lesson,
      noCourse: !data?.course
    });

    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Lesson Not Found</h1>
          <p className="text-gray-600 mb-6">This lesson could not be loaded.</p>
          <Link href="/academy/dashboard">
            <span className="text-purple-600 font-semibold hover:underline cursor-pointer">
              ← Back to Dashboard
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const { lesson, course, nextLesson, previousLesson } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      {/* Hero Section */}
      <div className={`relative pt-24 pb-8 bg-gradient-to-br ${getCategoryGradient(course.category)}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-white/80 mb-6">
            <Link href="/academy">
              <span className="hover:text-white transition cursor-pointer">Academy</span>
            </Link>
            <i className="fas fa-chevron-right text-sm"></i>
            <Link href="/academy/dashboard">
              <span className="hover:text-white transition cursor-pointer">My Courses</span>
            </Link>
            <i className="fas fa-chevron-right text-sm"></i>
            <Link href={`/academy/course/${course.slug}`}>
              <span className="hover:text-white transition cursor-pointer">{course.title}</span>
            </Link>
            <i className="fas fa-chevron-right text-sm"></i>
            <span className="text-white font-semibold">Lesson {lesson.order}</span>
          </div>

          {/* Lesson Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-bold text-sm">
                  Lesson {lesson.order}
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium text-sm">
                  <i className="fas fa-clock mr-2"></i>
                  {lesson.duration} min
                </span>
                {isCompleted && (
                  <span className="px-4 py-2 bg-green-500/90 backdrop-blur-sm rounded-full text-white font-bold text-sm">
                    <i className="fas fa-check-circle mr-2"></i>
                    Completed
                  </span>
                )}
              </div>
              <h1 className="text-5xl font-extrabold text-white mb-4">{lesson.title}</h1>
              {lesson.description && (
                <p className="text-xl text-white/90">{lesson.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Lesson Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
              {/* Video Player (if video exists) */}
              {lesson.videoUrl && (
                <div className="mb-8 rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <i className="fas fa-play-circle text-6xl mb-4 opacity-50"></i>
                      <p className="text-lg">Video Player</p>
                      <p className="text-sm text-gray-400 mt-2">{lesson.videoUrl}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Text-to-Speech Audio Player */}
              <LessonAudioPlayer content={lesson.content} lessonTitle={lesson.title} />

              {/* Lesson Content - Enhanced Typography */}
              <div className="prose prose-lg max-w-none
                              prose-headings:font-extrabold
                              prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
                              prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-7 prose-h2:text-purple-900
                              prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6 prose-h3:text-purple-800
                              prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-5 prose-h4:text-purple-700
                              prose-p:leading-loose prose-p:mb-6 prose-p:text-gray-700 prose-p:text-base
                              prose-ul:my-6 prose-ul:space-y-2
                              prose-ol:my-6 prose-ol:space-y-2
                              prose-li:leading-relaxed prose-li:text-gray-700
                              prose-strong:text-purple-900 prose-strong:font-bold
                              prose-code:bg-purple-50 prose-code:text-purple-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                              prose-pre:bg-gray-900 prose-pre:p-6 prose-pre:rounded-xl prose-pre:my-6
                              prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-6
                              prose-hr:my-8 prose-hr:border-gray-300
                              prose-a:text-purple-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline">
                <div
                  className="text-gray-800 leading-loose space-y-4"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </div>

              {/* Code Snippet */}
              {lesson.codeSnippet && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    <i className="fas fa-code mr-2 text-purple-600"></i>
                    Code Example
                  </h3>
                  <pre className="bg-gray-900 text-green-400 p-6 rounded-2xl overflow-x-auto">
                    <code>{lesson.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Downloads */}
              {lesson.downloadUrl && (
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    <i className="fas fa-download mr-2 text-purple-600"></i>
                    Download Resources
                  </h3>
                  <a
                    href={lesson.downloadUrl}
                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-all"
                  >
                    <i className="fas fa-file-download mr-2"></i>
                    Download Materials
                  </a>
                </div>
              )}

              {/* Apply What You've Learned - Links to Platform Features */}
              <AcademyFeatureLinks />
            </div>

            {/* Interactive Playground */}
            {lesson.playgroundExamples && (
              <div className="mb-8">
                <PromptPlayground
                  examples={JSON.parse(lesson.playgroundExamples)}
                />
              </div>
            )}

            {/* Hands-On Exercise */}
            {lesson.exerciseData && (
              <div className="mb-8">
                <HandsOnExercise
                  exercise={JSON.parse(lesson.exerciseData)}
                  onComplete={(completed) => {
                    if (completed) {
                      console.log('✅ Exercise completed!');
                    }
                  }}
                />
              </div>
            )}

            {/* Interactive Quiz */}
            {lesson.quizData && (
              <div className="mb-8">
                <LessonQuiz
                  questions={JSON.parse(lesson.quizData).questions}
                  onComplete={(score, totalPoints) => {
                    console.log(`Quiz completed: ${score}/${totalPoints} points`);
                    // Could save quiz score to progress here
                  }}
                />
              </div>
            )}

            {/* 5-Star Rating & Feedback */}
            {isCompleted && (
              <div className="mb-8">
                <LessonRatingFeedback
                  lessonId={lesson.id}
                  lessonTitle={lesson.title}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mb-8">
              {previousLesson ? (
                <Link href={`/academy/lesson/${previousLesson.id}`}>
                  <span className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:border-purple-600 hover:text-purple-600 transition-all cursor-pointer">
                    <i className="fas fa-arrow-left mr-2"></i>
                    Previous Lesson
                  </span>
                </Link>
              ) : (
                <div></div>
              )}

              {!isCompleted ? (
                <button
                  onClick={markAsComplete}
                  disabled={markingComplete}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg disabled:opacity-50"
                >
                  {markingComplete ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Marking Complete...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle mr-2"></i>
                      Mark as Complete
                    </>
                  )}
                </button>
              ) : nextLesson && nextLesson.courseId === lesson.courseId ? (
                <Link href={`/academy/lesson/${nextLesson.id}`}>
                  <span className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg cursor-pointer">
                    Next Lesson
                    <i className="fas fa-arrow-right ml-2"></i>
                  </span>
                </Link>
              ) : (
                <Link href={`/academy/course/${course.slug}`}>
                  <span className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg cursor-pointer">
                    <i className="fas fa-graduation-cap mr-2"></i>
                    Complete Course
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar: Course Outline */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-list-ul text-purple-600 mr-2"></i>
                Course Outline
              </h3>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {course.lessons.map((l, idx) => (
                  <Link key={l.id} href={`/academy/lesson/${l.id}`}>
                    <div
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        l.id === lesson.id
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-purple-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          l.id === lesson.id ? 'bg-white/20' : 'bg-white'
                        }`}>
                          <span className={l.id === lesson.id ? 'text-white' : 'text-purple-600'}>
                            {idx + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${
                            l.id === lesson.id ? 'text-white' : 'text-gray-900'
                          }`}>
                            {l.title}
                          </p>
                          <p className={`text-xs ${
                            l.id === lesson.id ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            {l.duration} min
                          </p>
                        </div>
                        {l.id === lesson.id && (
                          <i className="fas fa-play text-white text-sm"></i>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link href={`/academy/course/${course.slug}`}>
                  <span className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-center transition cursor-pointer">
                    <i className="fas fa-info-circle mr-2"></i>
                    Course Details
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Sharing Modal */}
      {data && (
        <CertificateShareModal
          isOpen={showCertificateModal}
          onClose={() => {
            setShowCertificateModal(false);
            // Navigate back to course page after closing
            setTimeout(() => {
              setLocation(`/academy/course/${data.course.slug}`);
            }, 500);
          }}
          courseName={data.course.title}
          courseId={data.course.id}
          certificateId={`CERT-${data.course.id}-${Date.now()}`}
          completedLessons={data.course.lessons.filter(l => l.id === lesson.id || data.progress?.completed).length}
          totalLessons={data.course.lessons.length}
        />
      )}
    </div>
  );
};

export default AcademyLessonViewer;
