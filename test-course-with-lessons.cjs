const https = require('https');

console.log('🧪 Testing course with lessons...\n');

https.get('https://smartpromptiq-pro-production.up.railway.app/api/academy/courses/introduction-to-ai-prompting', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.success) {
        const course = json.data;
        console.log(`✅ Course: ${course.title}`);
        console.log(`📖 Lessons: ${course.lessons.length}\n`);

        console.log('First 5 lessons:');
        course.lessons.slice(0, 5).forEach((lesson, i) => {
          console.log(`  ${i + 1}. ${lesson.title} (${lesson.duration}min)${lesson.isFree ? ' [FREE]' : ''}`);
        });

        console.log('\n🎉 SUCCESS! Courses have lessons!');
      } else {
        console.error('❌ Error:', json.message);
      }
    } catch (error) {
      console.error('❌ Parse error:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});
