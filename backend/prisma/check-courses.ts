import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkCourses() {
  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: { lessons: true }
      }
    },
    orderBy: { order: 'asc' }
  });

  console.log('\n📊 COURSE STATUS REPORT\n');
  console.log('=' .repeat(80));

  const empty: string[] = [];
  const hasContent: string[] = [];

  for (const course of courses) {
    const status = course._count.lessons > 0 ? '✅' : '❌ EMPTY';
    console.log(`${status} | ${course._count.lessons} lessons | ${course.title}`);

    if (course._count.lessons === 0) {
      empty.push(course.slug);
    } else {
      hasContent.push(course.slug);
    }
  }

  console.log('\n' + '=' .repeat(80));
  console.log(`\n📈 SUMMARY:`);
  console.log(`   Total courses: ${courses.length}`);
  console.log(`   With content: ${hasContent.length}`);
  console.log(`   Empty: ${empty.length}`);

  if (empty.length > 0) {
    console.log(`\n❌ EMPTY COURSES (${empty.length}):`);
    empty.forEach((slug, i) => console.log(`   ${i + 1}. ${slug}`));
  }
}

checkCourses()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
