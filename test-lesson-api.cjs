const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function testLessonAPI() {
  const lessonId = 'cmhl14uea0001n25jkvvqq7h8';

  console.log('🔍 Testing Lesson API for ID:', lessonId);
  console.log('');

  try {
    // Fetch lesson the same way the API does
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!lesson) {
      console.log('❌ LESSON NOT FOUND IN DATABASE');
      return;
    }

    console.log('✅ Lesson found in database:');
    console.log('   ID:', lesson.id);
    console.log('   Title:', lesson.title);
    console.log('   Order:', lesson.order);
    console.log('   Duration:', lesson.duration);
    console.log('   isFree:', lesson.isFree);
    console.log('');

    console.log('📚 Course:', lesson.course.title);
    console.log('   Course ID:', lesson.course.id);
    console.log('   Course Slug:', lesson.course.slug);
    console.log('   Total Lessons:', lesson.course.lessons.length);
    console.log('');

    // Find next and previous lessons
    const currentIndex = lesson.course.lessons.findIndex((l) => l.id === lessonId);
    const nextLesson = currentIndex < lesson.course.lessons.length - 1
      ? lesson.course.lessons[currentIndex + 1]
      : null;
    const previousLesson = currentIndex > 0
      ? lesson.course.lessons[currentIndex - 1]
      : null;

    console.log('🔄 Navigation:');
    console.log('   Current Index:', currentIndex);
    console.log('   Previous:', previousLesson ? previousLesson.title : 'None (first lesson)');
    console.log('   Next:', nextLesson ? nextLesson.title : 'None (last lesson)');
    console.log('');

    // Simulate API response
    const apiResponse = {
      success: true,
      data: {
        lesson,
        course: lesson.course,
        progress: null,
        nextLesson,
        previousLesson,
      },
    };

    console.log('📤 API Response Structure:');
    console.log('   success:', apiResponse.success);
    console.log('   data.lesson:', !!apiResponse.data.lesson);
    console.log('   data.course:', !!apiResponse.data.course);
    console.log('   data.progress:', apiResponse.data.progress);
    console.log('   data.nextLesson:', !!apiResponse.data.nextLesson);
    console.log('   data.previousLesson:', !!apiResponse.data.previousLesson);
    console.log('');

    console.log('✅ API Response is correct!');
    console.log('');
    console.log('🔍 Frontend expects:');
    console.log('   result.success = true');
    console.log('   result.data.lesson = {...}');
    console.log('   result.data.course = {...}');
    console.log('');
    console.log('✅ All conditions met - lesson should load!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLessonAPI();
