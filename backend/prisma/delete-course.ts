import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function removeCourses() {
  const slugs = ['team-workflows-collaboration', 'smartpromptiq-product-tour'];

  for (const slug of slugs) {
    const course = await prisma.course.findUnique({ where: { slug } });

    if (course) {
      await prisma.lessonProgress.deleteMany({
        where: { lesson: { courseId: course.id } }
      });
      await prisma.lesson.deleteMany({ where: { courseId: course.id } });
      await prisma.enrollment.deleteMany({ where: { courseId: course.id } });
      await prisma.courseReview.deleteMany({ where: { courseId: course.id } });
      await prisma.course.delete({ where: { slug } });
      console.log('✅ Deleted:', course.title);
    } else {
      console.log('Not found:', slug);
    }
  }
}

removeCourses()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
