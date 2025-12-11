const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./backend/prisma/dev.db'
    }
  }
});

async function checkLessons() {
  try {
    const lessonCount = await prisma.lesson.count();
    const courseCount = await prisma.course.count();

    console.log(`\n📊 Database Statistics:`);
    console.log(`   Courses: ${courseCount}`);
    console.log(`   Lessons: ${lessonCount}`);

    // Get a sample course with lessons
    const courseWithLessons = await prisma.course.findFirst({
      include: {
        _count: {
          select: { lessons: true }
        }
      }
    });

    console.log(`\n📚 Sample Course:`);
    console.log(`   Title: ${courseWithLessons.title}`);
    console.log(`   Lessons: ${courseWithLessons._count.lessons}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkLessons();
