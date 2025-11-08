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
        FROM "Course" c
        LEFT JOIN "Lesson" l ON l."courseId" = c.id AND l."isPublished" = true
        LEFT JOIN "Enrollment" e ON e."courseId" = c.id
        LEFT JOIN "Review" r ON r."courseId" = c.id
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
        FROM "Course" c
        LEFT JOIN "Enrollment" e ON e."courseId" = c.id
        LEFT JOIN "Review" r ON r."courseId" = c.id
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
        FROM "Lesson"
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
        FROM "Lesson" l
        JOIN "Course" c ON c.id = l."courseId"
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
        FROM "Lesson"
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

  console.log('✅ Academy API routes registered successfully (PostgreSQL mode)');
};
