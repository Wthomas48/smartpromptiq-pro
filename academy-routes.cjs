/**
 * Academy API Routes for Railway Deployment
 * This file contains all Academy-related endpoints
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function(app) {
  console.log('📚 Registering Academy API routes...');

  /**
   * GET /api/academy/courses
   * Get all published courses (public course catalog)
   */
  app.get('/api/academy/courses', async (req, res) => {
    try {
      console.log('📚 Fetching Academy courses...');
      const { category, difficulty, accessTier } = req.query;

      const where = {
        isPublished: true,
      };

      if (category) where.category = category;
      if (difficulty) where.difficulty = difficulty;
      if (accessTier) where.accessTier = accessTier;

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

      console.log(`✅ Found ${courses.length} courses`);
      res.json({
        success: true,
        data: courses,
      });
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
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
  app.get('/api/academy/courses/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      console.log('📚 Fetching course:', slug);

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

      console.log(`✅ Course found: ${course.title} with ${course.lessons.length} lessons`);
      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      console.error('❌ Error fetching course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course',
        error: error.message,
      });
    }
  });

  /**
   * GET /api/academy/lesson/:lessonId
   * Get lesson content (accessible for free lessons)
   */
  app.get('/api/academy/lesson/:lessonId', async (req, res) => {
    try {
      const { lessonId } = req.params;
      console.log('📖 Fetching lesson:', lessonId);

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

      // Find next and previous lessons
      const currentIndex = lesson.course.lessons.findIndex((l) => l.id === lessonId);
      const nextLesson = currentIndex < lesson.course.lessons.length - 1
        ? lesson.course.lessons[currentIndex + 1]
        : null;
      const previousLesson = currentIndex > 0
        ? lesson.course.lessons[currentIndex - 1]
        : null;

      console.log(`✅ Lesson found: ${lesson.title}`);
      res.json({
        success: true,
        data: {
          lesson,
          course: lesson.course,
          nextLesson,
          previousLesson,
        },
      });
    } catch (error) {
      console.error('❌ Error fetching lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lesson',
        error: error.message,
      });
    }
  });

  console.log('✅ Academy API routes registered successfully');
};
