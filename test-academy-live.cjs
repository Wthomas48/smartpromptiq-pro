const https = require('https');

console.log('🧪 Testing Academy API on Railway...\n');

https.get('https://smartpromptiq-pro-production.up.railway.app/api/academy/courses', (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {
    try {
      const json = JSON.parse(data);

      if (json.success) {
        console.log('✅ SUCCESS! Academy API is live on Railway!\n');
        console.log(`📚 Total courses returned: ${json.data.length}\n`);

        console.log('First 5 courses:');
        json.data.slice(0, 5).forEach((course, i) => {
          console.log(`\n${i + 1}. ${course.title}`);
          console.log(`   Category: ${course.category}`);
          console.log(`   Difficulty: ${course.difficulty}`);
          console.log(`   Duration: ${Math.floor(course.duration / 60)}h ${course.duration % 60}m`);
          console.log(`   Access: ${course.accessTier}`);
          console.log(`   Instructor: ${course.instructor}`);
          console.log(`   Rating: ${course.averageRating} ⭐ (${course.reviewCount} reviews)`);
        });

        console.log('\n🎉 Academy is LIVE! Visit: https://smartpromptiq-pro-production.up.railway.app/academy/courses');
      } else {
        console.error('❌ API returned error:', json.message);
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.log('Response:', data.substring(0, 500));
    }
  });
}).on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});
