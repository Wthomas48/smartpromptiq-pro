const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:xYiuuCchtQPUaaKVejYWcUSuSBiqCsIM@metro.proxy.rlwy.net:36720/railway',
  ssl: { rejectUnauthorized: false }
});

async function testQuery() {
  try {
    console.log('🧪 Testing Academy courses query...\n');

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
      LIMIT 5
    `;

    const result = await pool.query(query);

    console.log(`✅ Found ${result.rows.length} courses:\n`);

    result.rows.forEach(course => {
      console.log(`📚 ${course.title}`);
      console.log(`   - Slug: ${course.slug}`);
      console.log(`   - Category: ${course.category}`);
      console.log(`   - Difficulty: ${course.difficulty}`);
      console.log(`   - Lessons: ${course.lesson_count}`);
      console.log(`   - Access: ${course.accessTier}`);
      console.log('');
    });

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

testQuery();
