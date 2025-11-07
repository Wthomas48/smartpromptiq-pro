import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎓 Starting Academy Lessons Seeding...');

  // Get all courses
  const courses = await prisma.course.findMany({
    orderBy: { order: 'asc' }
  });

  console.log(`📚 Found ${courses.length} courses. Creating lessons...`);

  // Lesson templates by course category and difficulty
  const lessonTemplates = {
    beginner: [
      { title: 'Introduction and Overview', description: 'Get started with the fundamentals and understand what you\'ll learn', duration: 15, isFree: true },
      { title: 'Core Concepts', description: 'Master the essential concepts and terminology', duration: 20, isFree: true },
      { title: 'Getting Started', description: 'Hands-on introduction to the basics', duration: 25, isFree: false },
      { title: 'Practical Examples', description: 'Learn through real-world examples and use cases', duration: 30, isFree: false },
      { title: 'Best Practices', description: 'Industry standards and recommended approaches', duration: 20, isFree: false },
      { title: 'Common Mistakes to Avoid', description: 'Learn from common pitfalls and how to avoid them', duration: 15, isFree: false },
      { title: 'Next Steps', description: 'Where to go from here and additional resources', duration: 10, isFree: false },
    ],
    intermediate: [
      { title: 'Advanced Foundations', description: 'Deep dive into advanced fundamentals', duration: 25, isFree: true },
      { title: 'Advanced Techniques', description: 'Master intermediate-level strategies and methods', duration: 30, isFree: false },
      { title: 'Real-World Applications', description: 'Apply your knowledge to practical scenarios', duration: 35, isFree: false },
      { title: 'Problem-Solving Strategies', description: 'Develop critical thinking and problem-solving skills', duration: 30, isFree: false },
      { title: 'Case Studies', description: 'Analyze successful implementations and learn from them', duration: 40, isFree: false },
      { title: 'Optimization and Performance', description: 'Learn to optimize for better results', duration: 35, isFree: false },
      { title: 'Tools and Resources', description: 'Essential tools and frameworks for success', duration: 25, isFree: false },
      { title: 'Integration Patterns', description: 'Connect different concepts and build comprehensive solutions', duration: 30, isFree: false },
    ],
    advanced: [
      { title: 'Expert-Level Concepts', description: 'Master the most sophisticated concepts and theories', duration: 35, isFree: true },
      { title: 'Advanced Architecture', description: 'Design scalable and robust solutions', duration: 40, isFree: false },
      { title: 'Complex Problem Solving', description: 'Tackle the most challenging scenarios', duration: 45, isFree: false },
      { title: 'Industry Patterns and Practices', description: 'Learn from industry leaders and established patterns', duration: 40, isFree: false },
      { title: 'Performance at Scale', description: 'Handle large-scale implementations effectively', duration: 45, isFree: false },
      { title: 'Cutting-Edge Techniques', description: 'Explore the latest innovations and methodologies', duration: 40, isFree: false },
      { title: 'Research and Innovation', description: 'Contribute to the field and push boundaries', duration: 35, isFree: false },
      { title: 'Leadership and Strategy', description: 'Lead teams and drive organizational change', duration: 40, isFree: false },
      { title: 'Future Trends', description: 'Prepare for emerging trends and technologies', duration: 30, isFree: false },
    ]
  };

  // Category-specific lesson additions
  const categoryLessons: { [key: string]: any[] } = {
    'prompt-engineering': [
      { title: 'Understanding AI Language Models', description: 'How GPT, Claude, and other LLMs work', duration: 30 },
      { title: 'Prompt Structure and Components', description: 'Breaking down effective prompts', duration: 25 },
      { title: 'Context and Token Management', description: 'Optimize your prompts for better results', duration: 30 },
      { title: 'Advanced Prompt Techniques', description: 'Chain-of-thought, few-shot, and more', duration: 40 },
    ],
    'smartpromptiq': [
      { title: 'Platform Overview', description: 'Navigate SmartPromptIQ like a pro', duration: 20 },
      { title: 'Questionnaire Best Practices', description: 'Get the most out of questionnaires', duration: 25 },
      { title: 'Template Customization', description: 'Customize templates for your needs', duration: 30 },
      { title: 'Collaboration Features', description: 'Work with teams effectively', duration: 25 },
    ],
    'devops': [
      { title: 'CI/CD Pipeline Setup', description: 'Automated deployment workflows', duration: 35 },
      { title: 'Container Orchestration', description: 'Docker, Kubernetes, and more', duration: 40 },
      { title: 'Monitoring and Logging', description: 'Track system health and performance', duration: 30 },
      { title: 'Security Best Practices', description: 'Secure your infrastructure', duration: 35 },
    ],
    'marketing': [
      { title: 'Audience Research', description: 'Understand your target market', duration: 30 },
      { title: 'Content Strategy', description: 'Plan and execute content campaigns', duration: 35 },
      { title: 'Analytics and Metrics', description: 'Measure marketing effectiveness', duration: 30 },
      { title: 'Campaign Optimization', description: 'Improve ROI and performance', duration: 35 },
    ],
    'design': [
      { title: 'Design Principles', description: 'Fundamental design theory', duration: 25 },
      { title: 'User Research Methods', description: 'Understand user needs', duration: 30 },
      { title: 'Prototyping and Testing', description: 'Validate your designs', duration: 35 },
      { title: 'Design Systems', description: 'Build scalable design systems', duration: 40 },
    ],
  };

  let totalLessonsCreated = 0;

  for (const course of courses) {
    console.log(`\n📖 Creating lessons for: ${course.title}`);

    // Get base lessons based on difficulty
    let baseLessons = [];
    if (course.difficulty === 'beginner') {
      baseLessons = [...lessonTemplates.beginner];
    } else if (course.difficulty === 'intermediate') {
      baseLessons = [...lessonTemplates.intermediate];
    } else {
      baseLessons = [...lessonTemplates.advanced];
    }

    // Add category-specific lessons
    const categoryKey = course.category as string;
    if (categoryLessons[categoryKey]) {
      // Insert category-specific lessons after first 2 base lessons
      baseLessons.splice(2, 0, ...categoryLessons[categoryKey]);
    }

    // Create lessons for this course
    let lessonOrder = 1;
    for (const lessonTemplate of baseLessons) {
      const lesson = await prisma.lesson.create({
        data: {
          courseId: course.id,
          title: lessonTemplate.title,
          description: lessonTemplate.description,
          content: generateLessonContent(lessonTemplate.title, course.title, course.category),
          duration: lessonTemplate.duration,
          order: lessonOrder,
          isFree: lessonTemplate.isFree ?? (lessonOrder <= 2), // First 2 lessons free by default
          isPublished: true,
          videoUrl: null, // Can be added later
          downloadUrl: null,
          codeSnippet: null,
          quizData: null,
        },
      });

      console.log(`  ✅ Lesson ${lessonOrder}: ${lesson.title} (${lesson.duration}min)`);
      lessonOrder++;
      totalLessonsCreated++;
    }

    console.log(`  📊 Created ${lessonOrder - 1} lessons for ${course.title}`);
  }

  console.log(`\n✨ Seeding completed!`);
  console.log(`📚 Total courses: ${courses.length}`);
  console.log(`📖 Total lessons created: ${totalLessonsCreated}`);
  console.log(`⏱️  Average lessons per course: ${Math.round(totalLessonsCreated / courses.length)}`);
}

function generateLessonContent(
  lessonTitle: string,
  courseTitle: string,
  category: string
): string {
  return `
# ${lessonTitle}

Welcome to this lesson in the **${courseTitle}** course!

## Learning Objectives

By the end of this lesson, you will:

- Understand the key concepts of ${lessonTitle.toLowerCase()}
- Apply practical techniques in real-world scenarios
- Master best practices for ${category}
- Build confidence in implementing these strategies

## Lesson Overview

This comprehensive lesson covers:

### 1. Introduction
Understanding the fundamentals and why this topic matters in today's landscape.

### 2. Core Concepts
Deep dive into the essential principles and theories that form the foundation.

### 3. Practical Application
Real-world examples and hands-on exercises to reinforce learning.

### 4. Best Practices
Industry-standard approaches and proven methodologies.

### 5. Common Pitfalls
Learn from common mistakes and how to avoid them.

## Key Takeaways

- **Concept 1**: Master the fundamental principles
- **Concept 2**: Apply knowledge in practical scenarios
- **Concept 3**: Understand industry best practices
- **Concept 4**: Avoid common mistakes
- **Concept 5**: Build for long-term success

## Practical Exercise

**Task**: Apply what you've learned by completing the following exercise:

1. Review the concepts covered in this lesson
2. Identify how they apply to your specific use case
3. Create an implementation plan
4. Test and validate your approach
5. Iterate and improve based on results

## Additional Resources

- 📄 **Lesson Slides**: Download comprehensive slides for offline review
- 📚 **Reading Material**: Curated articles and documentation
- 🎥 **Video Content**: Watch supplementary video tutorials
- 💬 **Community Discussion**: Join fellow learners in the forum
- 🔧 **Tools & Templates**: Access practical resources and templates

## Next Steps

Continue your learning journey by:

1. Completing the quiz for this lesson
2. Participating in the community discussion
3. Moving on to the next lesson
4. Applying concepts to your projects

---

**Need Help?**

If you have questions or need clarification:
- Post in the course discussion forum
- Reach out to the instructor
- Connect with fellow students
- Review additional resources

**Remember**: Learning is a journey, not a destination. Take your time, practice regularly, and don't hesitate to revisit lessons as needed.

---

*This lesson is part of the ${courseTitle} course in SmartPromptIQ Academy.*
`.trim();
}

main()
  .catch((e) => {
    console.error('❌ Error seeding lessons:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
