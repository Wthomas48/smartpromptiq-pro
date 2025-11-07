import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import emailService from '../services/emailService';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================

/**
 * GET /api/academy/courses
 * Get all published courses (public course catalog)
 */
router.get('/courses', async (req: Request, res: Response) => {
  try {
    const { category, difficulty, accessTier } = req.query;

    const where: any = {
      isPublished: true,
    };

    if (category) where.category = category as string;
    if (difficulty) where.difficulty = difficulty as string;
    if (accessTier) where.accessTier = accessTier as string;

    const courses = await prisma.course.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: {
            lessons: true,
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: courses,
    });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message,
    });
  }
});

/**
 * GET /api/academy/courses/:slug
 * Get single course by slug with lessons
 */
router.get('/courses/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            order: true,
            isFree: true,
            // Don't include content yet - requires enrollment
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message,
    });
  }
});

// ============================================
// AUTHENTICATED ROUTES (Auth middleware required)
// ============================================
// Note: Add your auth middleware before these routes in server.ts

/**
 * GET /api/academy/my-courses
 * Get user's enrolled courses
 */
router.get('/my-courses', authenticate, async (req: Request, res: Response) => {
  try {
    // @ts-ignore - userId comes from auth middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error: any) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled courses',
      error: error.message,
    });
  }
});

/**
 * POST /api/academy/enroll
 * Enroll user in a course
 */
router.post('/enroll', authenticate, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { courseId, enrollmentType, paymentId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course',
        data: existingEnrollment,
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        enrollmentType: enrollmentType || 'free',
        paymentId,
        status: 'active',
      },
      include: {
        course: {
          include: {
            lessons: {
              where: { isPublished: true },
            },
          },
        },
      },
    });

    // Update course enrollment count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        enrollmentCount: {
          increment: 1,
        },
      },
    });

    // Get user details for email
    // @ts-ignore
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Send enrollment confirmation email (non-blocking)
    if (user) {
      console.log(`📧 Sending enrollment email to ${user.email} for course: ${enrollment.course.title}`);

      setImmediate(async () => {
        try {
          await emailService.sendAcademyEnrollmentEmail(
            user.email,
            user.firstName || 'Student',
            {
              title: enrollment.course.title,
              slug: enrollment.course.slug,
              lessonCount: enrollment.course.lessons.length,
              duration: enrollment.course.duration,
              difficulty: enrollment.course.difficulty,
              instructor: enrollment.course.instructor || undefined,
            }
          );
          console.log(`✅ Enrollment email sent to ${user.email}`);
        } catch (error) {
          console.error(`❌ Failed to send enrollment email to ${user.email}:`, error);
          // Email failure doesn't affect enrollment success
        }
      });
    }

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment,
    });
  } catch (error: any) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: error.message,
    });
  }
});

/**
 * GET /api/academy/lesson/:lessonId
 * Get lesson content (requires enrollment or free lesson)
 * NOTE: Free lessons can be accessed without authentication
 */
router.get('/lesson/:lessonId', async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;

    // Get auth token if present (optional for free lessons)
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    let userId: string | null = null;

    // Try to authenticate if token present
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
      } catch (err) {
        // Invalid token - continue as unauthenticated user
        console.log('Invalid token, continuing as unauthenticated user');
      }
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Check access
    // Free lessons are accessible to everyone (even unauthenticated users)
    // Paid lessons require enrollment
    let hasAccess = lesson.isFree;

    if (!hasAccess && userId) {
      // Only check enrollment if user is authenticated
      hasAccess = await checkCourseAccess(userId, lesson.courseId);
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: lesson.isFree
          ? 'This lesson is free but you must sign in to track your progress.'
          : 'Access denied. Please enroll in this course to access this lesson.',
        requiresAuth: !userId,
        requiresEnrollment: !lesson.isFree,
      });
    }

    // Get user's progress for this lesson (only if authenticated)
    let progress = null;
    if (userId) {
      progress = await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
      });
    }

    // Find next and previous lessons
    const currentIndex = lesson.course.lessons.findIndex((l) => l.id === lessonId);
    const nextLesson = currentIndex < lesson.course.lessons.length - 1
      ? lesson.course.lessons[currentIndex + 1]
      : null;
    const previousLesson = currentIndex > 0
      ? lesson.course.lessons[currentIndex - 1]
      : null;

    res.json({
      success: true,
      data: {
        lesson,
        course: lesson.course,
        progress,
        nextLesson,
        previousLesson,
      },
    });
  } catch (error: any) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson',
      error: error.message,
    });
  }
});

/**
 * POST /api/academy/progress/:lessonId
 * Update lesson progress
 */
router.post('/progress/:lessonId', authenticate, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { lessonId } = req.params;
    const { completed, timeSpent, lastPosition, quizScore, userNotes } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        completed,
        timeSpent: timeSpent ? { increment: timeSpent } : undefined,
        lastPosition,
        quizScore,
        userNotes,
        completedAt: completed ? new Date() : undefined,
      },
      create: {
        userId,
        lessonId,
        completed: completed || false,
        timeSpent: timeSpent || 0,
        lastPosition,
        quizScore,
        userNotes,
        completedAt: completed ? new Date() : undefined,
      },
    });

    // Update enrollment progress
    await updateEnrollmentProgress(userId, lessonId);

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: progress,
    });
  } catch (error: any) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message,
    });
  }
});

/**
 * GET /api/academy/admin/stats
 * Get academy analytics for admin dashboard (requires admin auth)
 */
router.get('/admin/stats', authenticate, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user is admin
    // @ts-ignore
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    // Get academy statistics
    const [
      totalCourses,
      publishedCourses,
      totalEnrollments,
      activeEnrollments,
      completedCourses,
      totalCertificates,
      totalLessons,
      recentEnrollments,
      topCourses,
    ] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: 'active' } }),
      prisma.enrollment.count({ where: { status: 'completed' } }),
      prisma.certificate.count(),
      prisma.lesson.count({ where: { isPublished: true } }),
      prisma.enrollment.findMany({
        take: 10,
        orderBy: { enrolledAt: 'desc' },
        include: {
          course: true,
        },
      }),
      prisma.course.findMany({
        take: 5,
        orderBy: { enrollmentCount: 'desc' },
        where: { isPublished: true },
        include: {
          _count: {
            select: {
              enrollments: true,
              reviews: true,
            },
          },
        },
      }),
    ]);

    // Get enrollment growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEnrollmentCount = await prisma.enrollment.count({
      where: {
        enrolledAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get completion rate
    const completionRate = totalEnrollments > 0
      ? Math.round((completedCourses / totalEnrollments) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalCourses,
          publishedCourses,
          totalEnrollments,
          activeEnrollments,
          completedCourses,
          totalCertificates,
          totalLessons,
          completionRate,
          recentEnrollments: recentEnrollmentCount,
        },
        recentActivity: recentEnrollments,
        topCourses,
      },
    });
  } catch (error: any) {
    console.error('Error fetching academy admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch academy statistics',
      error: error.message,
    });
  }
});

/**
 * POST /api/academy/lesson/:lessonId/rating
 * Submit or update lesson rating and feedback
 */
router.post('/lesson/:lessonId/rating', authenticate, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { lessonId } = req.params;
    const { rating, feedback } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars',
      });
    }

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Check if user has access to this lesson (enrolled or free)
    const hasAccess = lesson.isFree || await checkCourseAccess(userId, lesson.courseId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to rate lessons',
      });
    }

    // Create or update rating in lessonProgress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        rating,
        feedback: feedback || null,
      },
      create: {
        userId,
        lessonId,
        rating,
        feedback: feedback || null,
        completed: false,
      },
    });

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating: progress.rating,
        feedback: progress.feedback,
      },
    });
  } catch (error: any) {
    console.error('Error submitting lesson rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message,
    });
  }
});

/**
 * GET /api/academy/dashboard
 * Get user's academy dashboard data
 */
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Get user's enrollments with progress
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: {
              where: { isPublished: true },
            },
          },
        },
      },
    });

    // Get overall progress stats
    const totalLessonsCompleted = await prisma.lessonProgress.count({
      where: {
        userId,
        completed: true,
      },
    });

    // Get certificates
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
    });

    // Get recent activity
    const recentProgress = await prisma.lessonProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        lesson: {
          include: {
            course: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        enrollments,
        stats: {
          coursesEnrolled: enrollments.length,
          coursesCompleted: enrollments.filter((e) => e.status === 'completed').length,
          lessonsCompleted: totalLessonsCompleted,
          certificatesEarned: certificates.length,
        },
        certificates,
        recentActivity: recentProgress,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user has access to a course
 * Requires both:
 * 1. Active enrollment OR course is free
 * 2. Appropriate subscription tier for the course accessTier
 */
async function checkCourseAccess(userId: string, courseId: string): Promise<boolean> {
  try {
    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { accessTier: true },
    });

    if (!course) return false;

    // Get user subscription tier
    // @ts-ignore
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    if (!user) return false;

    // Check subscription tier access
    const hasSubscriptionAccess = checkSubscriptionAccess(user.subscriptionTier, course.accessTier);

    if (!hasSubscriptionAccess) {
      console.log(`❌ Access denied: User tier "${user.subscriptionTier}" cannot access course with accessTier "${course.accessTier}"`);
      return false;
    }

    // Check enrollment status
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    const hasEnrollment = enrollment?.status === 'active';

    console.log(`✅ Access check: User ${userId} has tier "${user.subscriptionTier}", course requires "${course.accessTier}", enrollment: ${hasEnrollment}`);

    return hasEnrollment;
  } catch (error) {
    console.error('Error checking course access:', error);
    return false;
  }
}

/**
 * Check if a user's subscription tier allows access to a course's access tier
 */
function checkSubscriptionAccess(userTier: string, courseAccessTier: string): boolean {
  // Free tier: Only free courses
  if (userTier === 'free') {
    return courseAccessTier === 'free';
  }

  // Academy tier: Free + Academy courses
  if (userTier === 'academy' || userTier === 'starter') {
    return courseAccessTier === 'free' || courseAccessTier === 'academy';
  }

  // Pro tier and above: Access to all courses (free, academy, pro, certification)
  if (userTier === 'pro' || userTier === 'business' || userTier === 'enterprise') {
    return true;
  }

  // Default deny
  return false;
}

/**
 * Update enrollment progress based on completed lessons
 */
async function updateEnrollmentProgress(userId: string, lessonId: string) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            lessons: {
              where: { isPublished: true },
            },
          },
        },
      },
    });

    if (!lesson) return;

    const totalLessons = lesson.course.lessons.length;
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId,
        lessonId: {
          in: lesson.course.lessons.map((l) => l.id),
        },
        completed: true,
      },
    });

    const progressPercentage = (completedLessons / totalLessons) * 100;
    const isNewlyCompleted = progressPercentage === 100;

    // Check if enrollment was previously completed
    const currentEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId,
        },
      },
    });

    const wasAlreadyCompleted = currentEnrollment?.status === 'completed';

    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId,
        },
      },
      data: {
        progress: progressPercentage,
        completedAt: progressPercentage === 100 ? new Date() : null,
        status: progressPercentage === 100 ? 'completed' : 'active',
        lastAccessedAt: new Date(),
      },
    });

    // If course just completed, create certificate and send email
    if (isNewlyCompleted && !wasAlreadyCompleted) {
      await handleCourseCompletion(userId, lesson.courseId, lesson.course.title);
    }
  } catch (error) {
    console.error('Error updating enrollment progress:', error);
  }
}

/**
 * Handle course completion - create certificate and send email
 */
async function handleCourseCompletion(userId: string, courseId: string, courseTitle: string) {
  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) return;

    // Get total lessons completed and time spent
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          where: { isPublished: true },
        },
      },
    });

    if (!course) return;

    const lessonProgressData = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: {
          in: course.lessons.map((l) => l.id),
        },
      },
    });

    const totalTimeSpent = lessonProgressData.reduce((sum, lp) => sum + (lp.timeSpent || 0), 0);
    const timeInHours = Math.round(totalTimeSpent / 60);

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        courseTitle,
        studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        issuedAt: new Date(),
      },
    });

    console.log(`🏆 Certificate created for ${user.email} - Course: ${courseTitle}`);

    // Send certificate email (non-blocking)
    setImmediate(async () => {
      try {
        await emailService.sendAcademyCertificateEmail(
          user.email,
          user.firstName || 'Student',
          {
            courseTitle,
            certificateId: certificate.id,
            completionDate: certificate.issuedAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            lessonsCompleted: course.lessons.length,
            timeSpent: timeInHours || 1,
          }
        );
        console.log(`✅ Certificate email sent to ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to send certificate email to ${user.email}:`, error);
      }
    });
  } catch (error) {
    console.error('Error handling course completion:', error);
  }
}

export default router;
