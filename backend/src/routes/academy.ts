import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import emailService from '../services/emailService';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/academy/seed-courses
 * Seeds academy courses - protected by secret
 */
router.post('/seed-courses', async (req: Request, res: Response) => {
  try {
    const { secret } = req.body;
    const seedSecret = process.env.ADMIN_SEED_SECRET || process.env.JWT_SECRET;

    if (!secret || secret !== seedSecret) {
      return res.status(403).json({ success: false, message: 'Invalid secret' });
    }

    // Clear and reseed
    await prisma.courseReview.deleteMany();
    await prisma.lessonProgress.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.course.deleteMany();

    const courses = [
      { title: 'Prompt Writing 101', slug: 'prompt-writing-101', description: 'Master the fundamentals of prompt engineering.', category: 'prompt-engineering', difficulty: 'beginner', duration: 180, accessTier: 'free', priceUSD: 0, isPublished: true, order: 1, instructor: 'Dr. Sarah Chen', tags: 'fundamentals,beginner,free', averageRating: 4.9, reviewCount: 1234 },
      { title: 'Introduction to AI Prompting', slug: 'introduction-to-ai-prompting', description: 'Understand how AI language models work.', category: 'prompt-engineering', difficulty: 'beginner', duration: 120, accessTier: 'free', priceUSD: 0, isPublished: true, order: 2, instructor: 'Prof. Michael Zhang', tags: 'ai-basics,beginner,free', averageRating: 4.8, reviewCount: 892 },
      { title: 'AI Agents Fundamentals', slug: 'ai-agents-fundamentals', description: 'Core concepts of AI agents and automation.', category: 'smartpromptiq', difficulty: 'beginner', duration: 25, accessTier: 'free', priceUSD: 0, isPublished: true, order: 3, instructor: 'Alex Thompson', tags: 'agents,fundamentals,free', averageRating: 4.8, reviewCount: 1523, enrollmentCount: 3200 },
      { title: 'AI Agents Masterclass', slug: 'ai-agents-masterclass', description: 'Learn to build, deploy, and monetize AI chatbots for any website. From basics to advanced automation.', category: 'smartpromptiq', difficulty: 'intermediate', duration: 30, accessTier: 'free', priceUSD: 0, isPublished: true, order: 4, instructor: 'Alex Thompson', tags: 'agents,chatbots,automation,free,featured', averageRating: 4.9, reviewCount: 2847, enrollmentCount: 2847 },
      { title: 'SmartPromptIQ Product Tour', slug: 'smartpromptiq-product-tour', description: 'Complete walkthrough of SmartPromptIQ platform features.', category: 'smartpromptiq', difficulty: 'beginner', duration: 90, accessTier: 'free', priceUSD: 0, isPublished: true, order: 5, instructor: 'Emma Rodriguez', tags: 'platform,tutorial,free', averageRating: 4.9, reviewCount: 567 },
      { title: 'SmartPromptIQ Basics', slug: 'smartpromptiq-basics', description: 'Getting the most from your SmartPromptIQ subscription.', category: 'smartpromptiq', difficulty: 'beginner', duration: 240, accessTier: 'smartpromptiq_included', priceUSD: 0, isPublished: true, order: 6, instructor: 'David Kim', tags: 'platform,basics,included', averageRating: 4.9, reviewCount: 445 },
      { title: 'Advanced Prompt Patterns', slug: 'advanced-prompt-patterns', description: 'Master sophisticated prompt design patterns.', category: 'prompt-engineering', difficulty: 'advanced', duration: 480, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 10, instructor: 'Dr. James Wilson', tags: 'advanced,patterns,pro', averageRating: 4.9, reviewCount: 723 },
      { title: 'Certified Prompt Engineer (CPE)', slug: 'certified-prompt-engineer-cpe', description: 'Complete certification program with exam.', category: 'certification', difficulty: 'advanced', duration: 2400, accessTier: 'certification', priceUSD: 29900, isPublished: true, order: 20, instructor: 'Multiple Experts', tags: 'certification,professional,exam', averageRating: 4.9, reviewCount: 1567 },
    ];

    for (const c of courses) { await prisma.course.create({ data: c }); }

    // Add lessons for AI Agents Masterclass
    const mc = await prisma.course.findUnique({ where: { slug: 'ai-agents-masterclass' } });
    if (mc) {
      const lessons = [
        { title: 'Welcome to AI Agents', description: 'Introduction to AI agents and what you will learn', content: '# Welcome to AI Agents Masterclass!\n\nIn this course you will learn to build, deploy, and monetize AI chat agents.', duration: 5, order: 1, isFree: true },
        { title: 'Creating Your First AI Agent', description: 'Step-by-step guide to creating your first agent', content: '# Creating Your First AI Agent\n\n1. Go to AI Agents section\n2. Click Create Agent\n3. Fill in the details\n4. Get your API key', duration: 6, order: 2, isFree: true },
        { title: 'Writing Effective System Prompts', description: 'Master the CRISP framework for system prompts', content: '# Writing Effective System Prompts\n\n## The CRISP Framework\n\n- **C**ontext\n- **R**ole\n- **I**nstructions\n- **S**cope\n- **P**ersonality', duration: 7, order: 3, isFree: true },
        { title: 'Embedding Agents on Your Website', description: 'Technical guide to adding agents to any site', content: '# Embedding Agents\n\nAdd this script to your website:\n\n```html\n<script src="https://smartpromptiq.com/widget.js" data-agent="your-slug"></script>\n```', duration: 5, order: 4, isFree: true },
        { title: 'Advanced Features', description: 'Voice, analytics, and customization', content: '# Advanced Features\n\n- Voice capabilities\n- Analytics dashboard\n- Custom styling\n- Rate limiting', duration: 4, order: 5, isFree: true },
        { title: 'Monetization Strategies', description: 'Turn your agents into revenue', content: '# Monetization Strategies\n\n1. Sell as a service\n2. Lead generation\n3. Customer support savings\n4. Premium chat tiers', duration: 3, order: 6, isFree: true },
      ];
      for (const l of lessons) {
        await prisma.lesson.create({ data: { courseId: mc.id, ...l, isPublished: true } });
      }
    }

    const count = await prisma.course.count();
    res.json({ success: true, message: `Seeded ${count} courses`, count });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

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
 * GET /api/academy/search
 * Search courses and lessons
 * IMPORTANT: Must be defined BEFORE /courses/:slug to avoid route collision
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, category, difficulty, accessTier } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const searchTerm = q.trim().toLowerCase();

    // Build filter conditions
    // Note: SQLite doesn't support mode: 'insensitive', so we use contains which is case-sensitive
    // Production (PostgreSQL) should use mode: 'insensitive' for case-insensitive search
    const courseWhere: any = {
      isPublished: true,
      OR: [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { tags: { contains: searchTerm } },
        { instructor: { contains: searchTerm } },
      ],
    };

    if (category) courseWhere.category = category;
    if (difficulty) courseWhere.difficulty = difficulty;
    if (accessTier) courseWhere.accessTier = accessTier;

    // Search courses and lessons in parallel
    const [courses, lessons] = await Promise.all([
      prisma.course.findMany({
        where: courseWhere,
        include: {
          _count: {
            select: {
              lessons: true,
              enrollments: true,
            },
          },
        },
        take: 20, // Limit results
        orderBy: [
          { enrollmentCount: 'desc' },
          { averageRating: 'desc' },
        ],
      }),
      prisma.lesson.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { content: { contains: searchTerm } },
          ],
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
            },
          },
        },
        take: 20,
      }),
    ]);

    res.json({
      success: true,
      data: {
        query: searchTerm,
        courses: {
          count: courses.length,
          results: courses,
        },
        lessons: {
          count: lessons.length,
          results: lessons,
        },
        totalResults: courses.length + lessons.length,
      },
    });
  } catch (error: any) {
    console.error('Error searching:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
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
