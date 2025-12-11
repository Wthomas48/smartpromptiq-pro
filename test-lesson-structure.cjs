const { Pool } = require('pg');
const https = require('https');

const pool = new Pool({
  connectionString: 'postgresql://postgres:xYiuuCchtQPUaaKVejYWcUSuSBiqCsIM@metro.proxy.rlwy.net:36720/railway',
  ssl: { rejectUnauthorized: false }
});

async function testLesson() {
  // Get first lesson ID
  const result = await pool.query('SELECT id, title, "playgroundExamples", "codeSnippet", "exerciseData" FROM academy_lessons LIMIT 1');
  const lesson = result.rows[0];

  console.log('📖 Lesson:', lesson.title);
  console.log('🎮 Has playgroundExamples:', !!lesson.playgroundExamples);
  console.log('💻 Has codeSnippet:', !!lesson.codeSnippet);
  console.log('✍️ Has exerciseData:', !!lesson.exerciseData);

  if (lesson.playgroundExamples) {
    console.log('\n🎮 Playground Examples:');
    console.log(lesson.playgroundExamples.substring(0, 200) + '...');
  }

  await pool.end();
}

testLesson().catch(console.error);
