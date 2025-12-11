const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function testAcademyLessons() {
  console.log('🔍 Testing Academy Lessons...\n');

  try {
    // Get all courses
    const courses = await prisma.course.findMany({
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    console.log(`📚 Total Courses: ${courses.length}\n`);

    let coursesWithLessons = 0;
    let coursesWithoutLessons = 0;
    let totalLessons = 0;
    const problemCourses = [];

    for (const course of courses) {
      const lessonCount = course.lessons.length;
      totalLessons += lessonCount;

      if (lessonCount > 0) {
        coursesWithLessons++;
        console.log(`✅ ${course.title}`);
        console.log(`   Slug: ${course.slug}`);
        console.log(`   Lessons: ${lessonCount}`);
        console.log(`   First lesson: ${course.lessons[0]?.title || 'N/A'}`);
        console.log(`   Category: ${course.category}`);
        console.log(`   Difficulty: ${course.difficulty}\n`);
      } else {
        coursesWithoutLessons++;
        problemCourses.push(course);
        console.log(`❌ ${course.title} - NO LESSONS`);
        console.log(`   Slug: ${course.slug}`);
        console.log(`   Category: ${course.category}\n`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Total Courses: ${courses.length}`);
    console.log(`   ✅ Courses with lessons: ${coursesWithLessons}`);
    console.log(`   ❌ Courses without lessons: ${coursesWithoutLessons}`);
    console.log(`   📖 Total Lessons: ${totalLessons}`);
    console.log(`   📈 Average lessons per course: ${(totalLessons / courses.length).toFixed(1)}`);

    if (problemCourses.length > 0) {
      console.log('\n\n⚠️ PROBLEM COURSES (No Lessons):');
      problemCourses.forEach(course => {
        console.log(`   - ${course.title} (${course.slug})`);
      });
    } else {
      console.log('\n\n🎉 ALL COURSES HAVE LESSONS! Ready to start! 🚀');
    }

    // Check if first 2 lessons are free for each course
    console.log('\n\n🔓 Checking Free Preview Lessons:');
    let coursesWithFreePreview = 0;
    for (const course of courses) {
      if (course.lessons.length >= 2) {
        const firstTwoFree = course.lessons.slice(0, 2).every(l => l.isFree);
        if (firstTwoFree) {
          coursesWithFreePreview++;
        } else {
          console.log(`   ⚠️ ${course.title} - First 2 lessons not marked as free`);
        }
      }
    }
    console.log(`   ✅ ${coursesWithFreePreview} courses have free preview lessons`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAcademyLessons();
