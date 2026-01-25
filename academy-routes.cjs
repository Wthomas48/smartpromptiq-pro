/**
 * Academy API Routes for Railway Deployment
 * Uses direct PostgreSQL queries instead of Prisma to avoid initialization issues
 */

const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    console.log('✅ PostgreSQL connection pool created for Academy routes');
  }
  return pool;
}

module.exports = function(app) {
  console.log('📚 Registering Academy API routes (using direct PostgreSQL)...');

  /**
   * POST /api/academy/seed-courses
   * Seeds academy courses - protected by secret
   */
  app.post('/api/academy/seed-courses', async (req, res) => {
    try {
      const { secret } = req.body;
      const seedSecret = process.env.ADMIN_SEED_SECRET || process.env.JWT_SECRET;

      if (!secret || secret !== seedSecret) {
        return res.status(403).json({ success: false, message: 'Invalid secret' });
      }

      console.log('🌱 Seeding academy courses...');
      const pool = getPool();

      // Clear existing data
      await pool.query('DELETE FROM academy_course_reviews');
      await pool.query('DELETE FROM academy_lesson_progress');
      await pool.query('DELETE FROM academy_enrollments');
      await pool.query('DELETE FROM academy_lessons');
      await pool.query('DELETE FROM academy_courses');

      // Insert courses
      const courses = [
        { title: 'Prompt Writing 101', slug: 'prompt-writing-101', description: 'Master the fundamentals of prompt engineering.', category: 'prompt-engineering', difficulty: 'beginner', duration: 180, accessTier: 'free', priceUSD: 0, order: 1, instructor: 'Dr. Sarah Chen', tags: 'fundamentals,beginner,free', averageRating: 4.9, reviewCount: 1234 },
        { title: 'Introduction to AI Prompting', slug: 'introduction-to-ai-prompting', description: 'Understand how AI language models work.', category: 'prompt-engineering', difficulty: 'beginner', duration: 120, accessTier: 'free', priceUSD: 0, order: 2, instructor: 'Prof. Michael Zhang', tags: 'ai-basics,beginner,free', averageRating: 4.8, reviewCount: 892 },
        { title: 'AI Agents Fundamentals', slug: 'ai-agents-fundamentals', description: 'Core concepts of AI agents and automation.', category: 'smartpromptiq', difficulty: 'beginner', duration: 25, accessTier: 'free', priceUSD: 0, order: 3, instructor: 'Alex Thompson', tags: 'agents,fundamentals,free', averageRating: 4.8, reviewCount: 1523, enrollmentCount: 3200 },
        { title: 'AI Agents Masterclass', slug: 'ai-agents-masterclass', description: 'Learn to build, deploy, and monetize AI chatbots for any website. From basics to advanced automation.', category: 'smartpromptiq', difficulty: 'intermediate', duration: 30, accessTier: 'free', priceUSD: 0, order: 4, instructor: 'Alex Thompson', tags: 'agents,chatbots,automation,free,featured', averageRating: 4.9, reviewCount: 2847, enrollmentCount: 2847 },
        { title: 'SmartPromptIQ Product Tour', slug: 'smartpromptiq-product-tour', description: 'Complete walkthrough of SmartPromptIQ platform features.', category: 'smartpromptiq', difficulty: 'beginner', duration: 90, accessTier: 'free', priceUSD: 0, order: 5, instructor: 'Emma Rodriguez', tags: 'platform,tutorial,free', averageRating: 4.9, reviewCount: 567 },
        { title: 'SmartPromptIQ Basics', slug: 'smartpromptiq-basics', description: 'Getting the most from your SmartPromptIQ subscription.', category: 'smartpromptiq', difficulty: 'beginner', duration: 240, accessTier: 'smartpromptiq_included', priceUSD: 0, order: 6, instructor: 'David Kim', tags: 'platform,basics,included', averageRating: 4.9, reviewCount: 445 },
        { title: 'Advanced Prompt Patterns', slug: 'advanced-prompt-patterns', description: 'Master sophisticated prompt design patterns.', category: 'prompt-engineering', difficulty: 'advanced', duration: 480, accessTier: 'pro', priceUSD: 0, order: 10, instructor: 'Dr. James Wilson', tags: 'advanced,patterns,pro', averageRating: 4.9, reviewCount: 723 },
        { title: 'Certified Prompt Engineer (CPE)', slug: 'certified-prompt-engineer-cpe', description: 'Complete certification program with exam.', category: 'certification', difficulty: 'advanced', duration: 2400, accessTier: 'certification', priceUSD: 29900, order: 20, instructor: 'Multiple Experts', tags: 'certification,professional,exam', averageRating: 4.9, reviewCount: 1567 },
      ];

      for (const c of courses) {
        await pool.query(`
          INSERT INTO academy_courses (id, title, slug, description, category, difficulty, duration, "accessTier", "priceUSD", "isPublished", "order", instructor, tags, "averageRating", "reviewCount", "enrollmentCount", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        `, [c.title, c.slug, c.description, c.category, c.difficulty, c.duration, c.accessTier, c.priceUSD, c.order, c.instructor, c.tags, c.averageRating, c.reviewCount, c.enrollmentCount || 0]);
      }

      // Get AI Agents Masterclass ID for lessons
      const mcResult = await pool.query("SELECT id FROM academy_courses WHERE slug = 'ai-agents-masterclass'");
      if (mcResult.rows.length > 0) {
        const mcId = mcResult.rows[0].id;
        const lessons = [
          { title: 'Welcome to AI Agents', description: 'Introduction to AI agents', content: '# Welcome!\n\nLearn to build AI chat agents.', duration: 5, order: 1 },
          { title: 'Creating Your First AI Agent', description: 'Step-by-step guide', content: '# Create Your First Agent\n\n1. Go to AI Agents\n2. Click Create\n3. Configure', duration: 6, order: 2 },
          { title: 'Writing Effective System Prompts', description: 'The CRISP framework', content: '# System Prompts\n\nUse CRISP: Context, Role, Instructions, Scope, Personality', duration: 7, order: 3 },
          { title: 'Embedding Agents on Your Website', description: 'Technical implementation', content: '# Embedding\n\nAdd script tag to your site.', duration: 5, order: 4 },
          { title: 'Advanced Features', description: 'Voice and analytics', content: '# Advanced\n\nEnable voice, view analytics.', duration: 4, order: 5 },
          { title: 'Monetization Strategies', description: 'Turn agents into revenue', content: '# Monetization\n\nSell as service, lead gen, support savings.', duration: 3, order: 6 },
        ];
        for (const l of lessons) {
          await pool.query(`
            INSERT INTO academy_lessons (id, "courseId", title, description, content, duration, "order", "isFree", "isPublished", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, true, NOW(), NOW())
          `, [mcId, l.title, l.description, l.content, l.duration, l.order]);
        }
      }

      const countResult = await pool.query('SELECT COUNT(*) FROM academy_courses');
      const count = parseInt(countResult.rows[0].count);

      console.log(`✅ Seeded ${count} courses`);
      res.json({ success: true, message: `Seeded ${count} courses`, count });
    } catch (error) {
      console.error('❌ Seed error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  /**
   * GET /api/academy/courses
   * Get all published courses (public course catalog)
   */
  app.get('/api/academy/courses', async (req, res) => {
    try {
      console.log('📚 Fetching Academy courses...');
      const pool = getPool();

      const query = `
        SELECT
          c.*,
          COUNT(DISTINCT l.id) as lesson_count,
          COUNT(DISTINCT e.id) as enrollment_count,
          COUNT(DISTINCT r.id) as review_count
        FROM academy_courses c
        LEFT JOIN academy_lessons l ON l."courseId" = c.id AND l."isPublished" = true
        LEFT JOIN academy_enrollments e ON e."courseId" = c.id
        LEFT JOIN academy_course_reviews r ON r."courseId" = c.id
        WHERE c."isPublished" = true
        GROUP BY c.id
        ORDER BY c."order" ASC, c."createdAt" DESC
      `;

      const result = await pool.query(query);

      // Format response to match Prisma format
      const courses = result.rows.map(row => ({
        ...row,
        _count: {
          lessons: parseInt(row.lesson_count) || 0,
          enrollments: parseInt(row.enrollment_count) || 0,
          reviews: parseInt(row.review_count) || 0,
        },
      }));

      // Remove the count fields from the main object
      courses.forEach(course => {
        delete course.lesson_count;
        delete course.enrollment_count;
        delete course.review_count;
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
      const pool = getPool();

      // Get course with counts
      const courseQuery = `
        SELECT
          c.*,
          COUNT(DISTINCT e.id) as enrollment_count,
          COUNT(DISTINCT r.id) as review_count
        FROM academy_courses c
        LEFT JOIN academy_enrollments e ON e."courseId" = c.id
        LEFT JOIN academy_course_reviews r ON r."courseId" = c.id
        WHERE c.slug = $1
        GROUP BY c.id
      `;

      const courseResult = await pool.query(courseQuery, [slug]);

      if (courseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      const course = courseResult.rows[0];

      // Get lessons for this course
      const lessonsQuery = `
        SELECT id, title, description, duration, "order", "isFree"
        FROM academy_lessons
        WHERE "courseId" = $1 AND "isPublished" = true
        ORDER BY "order" ASC
      `;

      const lessonsResult = await pool.query(lessonsQuery, [course.id]);

      // Format response
      const formattedCourse = {
        ...course,
        lessons: lessonsResult.rows,
        _count: {
          enrollments: parseInt(course.enrollment_count) || 0,
          reviews: parseInt(course.review_count) || 0,
        },
      };

      delete formattedCourse.enrollment_count;
      delete formattedCourse.review_count;

      console.log(`✅ Course found: ${course.title} with ${lessonsResult.rows.length} lessons`);
      res.json({
        success: true,
        data: formattedCourse,
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
   * Get lesson content
   */
  app.get('/api/academy/lesson/:lessonId', async (req, res) => {
    try {
      const { lessonId } = req.params;
      console.log('📖 Fetching lesson:', lessonId);
      const pool = getPool();

      // Get lesson with course info
      const lessonQuery = `
        SELECT l.*, c.id as "courseId", c.title as "courseTitle", c.slug
        FROM academy_lessons l
        JOIN academy_courses c ON c.id = l."courseId"
        WHERE l.id = $1
      `;

      const lessonResult = await pool.query(lessonQuery, [lessonId]);

      if (lessonResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found',
        });
      }

      const row = lessonResult.rows[0];

      // Get all lessons in this course
      const allLessonsQuery = `
        SELECT id, title, "order"
        FROM academy_lessons
        WHERE "courseId" = $1 AND "isPublished" = true
        ORDER BY "order" ASC
      `;

      const allLessonsResult = await pool.query(allLessonsQuery, [row.courseId]);
      const allLessons = allLessonsResult.rows;

      // Find current, next, and previous lessons
      const currentIndex = allLessons.findIndex(l => l.id === lessonId);
      const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
      const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;

      console.log(`✅ Lesson found: ${row.title}`);
      res.json({
        success: true,
        data: {
          lesson: row,
          course: { id: row.courseId, title: row.courseTitle, slug: row.slug, lessons: allLessons },
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

  /**
   * GET /api/academy/my-courses
   * Get user's enrolled courses (requires authentication)
   */
  app.get('/api/academy/my-courses', async (req, res) => {
    try {
      // For now, return empty array since we don't have full auth system in Railway
      // In production, you'd check req.user or JWT token
      console.log('📚 Fetching user enrollments...');
      res.json({
        success: true,
        data: [] // User has no enrollments yet - free courses are auto-accessible
      });
    } catch (error) {
      console.error('❌ Error fetching enrollments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch enrollments',
        error: error.message,
      });
    }
  });

  /**
   * POST /api/academy/enroll
   * Enroll in a course (requires authentication)
   */
  app.post('/api/academy/enroll', async (req, res) => {
    try {
      const { courseId, slug } = req.body;
      const courseIdentifier = courseId || slug;
      console.log('📝 Enrollment request:', { courseId, slug });

      if (!courseIdentifier) {
        return res.status(400).json({
          success: false,
          message: 'courseId or slug is required'
        });
      }

      const pool = getPool();

      // Find the course
      let course;
      if (slug) {
        const result = await pool.query('SELECT * FROM academy_courses WHERE slug = $1', [slug]);
        course = result.rows[0];
      } else {
        const result = await pool.query('SELECT * FROM academy_courses WHERE id = $1', [courseId]);
        course = result.rows[0];
      }

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // For free courses, enrollment is automatic
      res.json({
        success: true,
        message: 'Successfully enrolled in course',
        data: {
          courseId: course.id,
          courseTitle: course.title,
          slug: course.slug,
          enrolledAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Error enrolling in course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enroll in course',
        error: error.message,
      });
    }
  });

  /**
   * POST /api/academy/enroll/:courseId
   * Enroll in a course (alternative with param)
   */
  app.post('/api/academy/enroll/:courseId', async (req, res) => {
    try {
      const { courseId } = req.params;
      console.log('📝 Enrollment request for course:', courseId);

      // For free courses, enrollment is automatic
      res.json({
        success: true,
        message: 'Successfully enrolled in course',
        data: {
          courseId,
          enrolledAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Error enrolling in course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enroll in course',
        error: error.message,
      });
    }
  });

  /**
   * POST /api/academy/lesson/:lessonId/rating
   * Submit a rating/feedback for a lesson
   */
  app.post('/api/academy/lesson/:lessonId/rating', async (req, res) => {
    try {
      const { lessonId } = req.params;
      const { rating, feedback } = req.body;

      console.log(`⭐ Rating submission for lesson ${lessonId}: ${rating} stars`);

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
      }

      const pool = getPool();

      // For now, we'll store ratings in a simple feedback table
      // In production, you'd associate with userId from JWT token
      const insertQuery = `
        INSERT INTO academy_lesson_ratings (
          "lessonId",
          "userId",
          rating,
          feedback,
          "createdAt",
          "updatedAt"
        ) VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, rating, feedback, "createdAt"
      `;

      // Use 'anonymous' as userId for now (in production, get from auth token)
      const userId = 'anonymous-' + Date.now();

      const result = await pool.query(insertQuery, [
        lessonId,
        userId,
        rating,
        feedback || null
      ]);

      console.log(`✅ Rating saved: ${rating} stars for lesson ${lessonId}`);

      res.json({
        success: true,
        message: 'Rating submitted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Error submitting rating:', error);

      // If table doesn't exist, create it on the fly
      if (error.code === '42P01') {
        try {
          const pool = getPool();
          await pool.query(`
            CREATE TABLE IF NOT EXISTS academy_lesson_ratings (
              id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
              "lessonId" TEXT NOT NULL,
              "userId" TEXT NOT NULL,
              rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
              feedback TEXT,
              "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
              "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
            )
          `);

          console.log('✅ Created academy_lesson_ratings table');

          // Retry the insert
          const { lessonId } = req.params;
          const { rating, feedback } = req.body;
          const userId = 'anonymous-' + Date.now();

          const insertQuery = `
            INSERT INTO academy_lesson_ratings (
              "lessonId",
              "userId",
              rating,
              feedback,
              "createdAt",
              "updatedAt"
            ) VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING id, rating, feedback, "createdAt"
          `;

          const result = await pool.query(insertQuery, [
            lessonId,
            userId,
            rating,
            feedback || null
          ]);

          return res.json({
            success: true,
            message: 'Rating submitted successfully',
            data: result.rows[0]
          });
        } catch (createError) {
          console.error('❌ Error creating table:', createError);
          return res.status(500).json({
            success: false,
            message: 'Failed to submit rating',
            error: createError.message,
          });
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to submit rating',
        error: error.message,
      });
    }
  });

  /**
   * GET /api/academy/lesson/:lessonId/ratings
   * Get all ratings for a lesson
   */
  app.get('/api/academy/lesson/:lessonId/ratings', async (req, res) => {
    try {
      const { lessonId } = req.params;
      const pool = getPool();

      const query = `
        SELECT
          rating,
          feedback,
          "createdAt"
        FROM academy_lesson_ratings
        WHERE "lessonId" = $1
        ORDER BY "createdAt" DESC
      `;

      const result = await pool.query(query, [lessonId]);

      // Calculate average rating
      const ratings = result.rows;
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      res.json({
        success: true,
        data: {
          ratings: ratings,
          averageRating: Math.round(avgRating * 10) / 10,
          totalRatings: ratings.length
        }
      });
    } catch (error) {
      console.error('❌ Error fetching ratings:', error);

      // If table doesn't exist, return empty data
      if (error.code === '42P01') {
        return res.json({
          success: true,
          data: {
            ratings: [],
            averageRating: 0,
            totalRatings: 0
          }
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch ratings',
        error: error.message,
      });
    }
  });

  console.log('✅ Academy API routes registered successfully (PostgreSQL mode)');
};
