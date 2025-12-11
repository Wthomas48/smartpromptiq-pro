/**
 * Add Playground Examples to Academy Lessons
 * This adds interactive prompt examples to make lessons hands-on
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎮 Adding Playground Examples to Lessons...\n');

  // Get all lessons
  const lessons = await prisma.lesson.findMany({
    include: { course: true },
    orderBy: { order: 'asc' }
  });

  console.log(`📚 Found ${lessons.length} lessons\n`);

  let updateCount = 0;

  for (const lesson of lessons) {
    // Generate playground examples based on lesson title and course category
    const playgroundExamples = generatePlaygroundExamples(
      lesson.title,
      lesson.course.category,
      lesson.course.title
    );

    if (playgroundExamples.length > 0) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          playgroundExamples: JSON.stringify(playgroundExamples)
        }
      });

      updateCount++;
      console.log(`✅ ${lesson.course.title} → ${lesson.title} (${playgroundExamples.length} examples)`);
    }
  }

  console.log(`\n🎉 Updated ${updateCount} lessons with playground examples!`);
}

function generatePlaygroundExamples(
  lessonTitle: string,
  category: string,
  courseTitle: string
): Array<{ title: string; prompt: string; expectedOutput: string; tips: string[] }> {
  const examples: Array<{ title: string; prompt: string; expectedOutput: string; tips: string[] }> = [];

  // Beginner lessons - Basic prompts
  if (lessonTitle.toLowerCase().includes('introduction') ||
      lessonTitle.toLowerCase().includes('overview') ||
      lessonTitle.toLowerCase().includes('getting started')) {
    examples.push({
      title: 'Simple Question Prompt',
      prompt: 'What are the key principles of effective prompt engineering?',
      expectedOutput: 'The AI should provide a clear, structured list of principles like clarity, specificity, context, and examples.',
      tips: [
        'Start with a clear question',
        'Be specific about what you want',
        'Ask for structured output when helpful'
      ]
    });

    examples.push({
      title: 'Task-Based Prompt',
      prompt: 'Create a 3-step checklist for writing effective AI prompts.',
      expectedOutput: 'The AI should generate a numbered checklist with actionable steps.',
      tips: [
        'Specify the format (checklist, bullet points, etc.)',
        'Include the number of items you want',
        'Be clear about the topic'
      ]
    });
  }

  // Core concepts lessons
  if (lessonTitle.toLowerCase().includes('core concepts') ||
      lessonTitle.toLowerCase().includes('fundamentals')) {
    examples.push({
      title: 'Providing Context',
      prompt: 'I\'m a marketing manager for a tech startup. Explain the benefits of AI automation for my role in simple terms.',
      expectedOutput: 'The AI should tailor the explanation to marketing context with relevant examples.',
      tips: [
        'Include your role or perspective',
        'Specify your knowledge level',
        'Ask for relevant examples'
      ]
    });

    examples.push({
      title: 'Structured Output Request',
      prompt: 'List 5 benefits of prompt engineering. Format as:\nBenefit: [name]\nExplanation: [2-3 sentences]\nExample: [real-world use case]',
      expectedOutput: 'The AI should follow the exact format structure you specified.',
      tips: [
        'Specify the exact format you want',
        'Use examples to show structure',
        'Be clear about the number of items'
      ]
    });
  }

  // Prompt Engineering specific
  if (category === 'prompt-engineering') {
    examples.push({
      title: 'Role-Based Prompting',
      prompt: 'You are an expert software architect. Review this approach for building a microservices system and provide 3 specific recommendations for improvement.',
      expectedOutput: 'The AI should adopt the expert role and provide detailed, technical recommendations.',
      tips: [
        'Assign a specific expert role',
        'Be clear about the task',
        'Request specific number of outputs'
      ]
    });

    examples.push({
      title: 'Chain-of-Thought Prompting',
      prompt: 'Explain how to optimize a slow database query. Think through this step-by-step:\n1. First, identify common causes\n2. Then, suggest diagnostic methods\n3. Finally, provide optimization strategies',
      expectedOutput: 'The AI should follow your reasoning structure and provide thorough step-by-step analysis.',
      tips: [
        'Guide the AI\'s thinking process',
        'Break complex tasks into steps',
        'Use numbered lists for clarity'
      ]
    });
  }

  // SmartPromptIQ platform lessons
  if (category === 'smartpromptiq') {
    examples.push({
      title: 'Template Customization Prompt',
      prompt: 'Generate a custom template for creating marketing email campaigns. Include sections for: target audience, key message, call-to-action, and tone guidelines.',
      expectedOutput: 'A structured template with all specified sections ready to fill in.',
      tips: [
        'List required sections clearly',
        'Specify the use case',
        'Ask for fillable fields'
      ]
    });

    examples.push({
      title: 'Workflow Automation Prompt',
      prompt: 'Describe a 5-step workflow for using AI to automate customer support responses. Include decision points and quality checks.',
      expectedOutput: 'A detailed workflow with steps, decision logic, and quality assurance points.',
      tips: [
        'Specify number of steps',
        'Request decision points',
        'Ask for quality checks'
      ]
    });
  }

  // Development/Technical lessons
  if (category === 'development' || courseTitle.toLowerCase().includes('code')) {
    examples.push({
      title: 'Code Generation Prompt',
      prompt: 'Write a Python function that takes a list of numbers and returns the average, rounded to 2 decimal places. Include error handling for empty lists.',
      expectedOutput: 'Clean Python code with error handling and proper formatting.',
      tips: [
        'Specify the programming language',
        'Include requirements like error handling',
        'Mention formatting preferences'
      ]
    });

    examples.push({
      title: 'Code Review Prompt',
      prompt: 'Review this code for best practices and suggest improvements:\n```python\ndef calc(x,y):\n  return x/y\n```',
      expectedOutput: 'Constructive feedback on naming, error handling, documentation, and edge cases.',
      tips: [
        'Provide the code to review',
        'Specify what to look for',
        'Use code blocks for clarity'
      ]
    });
  }

  // Design lessons
  if (category === 'design') {
    examples.push({
      title: 'Design System Prompt',
      prompt: 'Create a color palette for a fitness app targeting young professionals. Include primary, secondary, and accent colors with hex codes and usage recommendations.',
      expectedOutput: 'A structured color palette with hex codes and clear usage guidelines.',
      tips: [
        'Specify the target audience',
        'Request specific formats (hex codes)',
        'Ask for usage guidelines'
      ]
    });
  }

  // Marketing lessons
  if (category === 'marketing') {
    examples.push({
      title: 'Content Strategy Prompt',
      prompt: 'Generate 10 blog post ideas for a SaaS company selling project management software to remote teams. Include catchy titles and brief descriptions.',
      expectedOutput: 'A list of 10 blog ideas with titles and descriptions tailored to the audience.',
      tips: [
        'Specify the industry and product',
        'Define the target audience',
        'Request both titles and descriptions'
      ]
    });
  }

  // Data & Analytics lessons
  if (category === 'data' || courseTitle.toLowerCase().includes('sql') || courseTitle.toLowerCase().includes('data')) {
    examples.push({
      title: 'Data Analysis Prompt',
      prompt: 'Analyze this sales data pattern: Revenue peaked in Q4 at $500K, dropped to $300K in Q1, then slowly climbed to $400K in Q2. Identify 3 possible causes and 2 recommendations.',
      expectedOutput: 'Thoughtful analysis with specific causes and actionable recommendations.',
      tips: [
        'Provide relevant data or context',
        'Specify number of insights wanted',
        'Ask for actionable recommendations'
      ]
    });
  }

  // If no specific examples were added, add generic ones
  if (examples.length === 0) {
    examples.push({
      title: 'Exploratory Question',
      prompt: `What are the key concepts in ${lessonTitle}?`,
      expectedOutput: 'A clear explanation of the main concepts covered in this lesson.',
      tips: [
        'Start with exploratory questions',
        'Build on the lesson content',
        'Practice explaining concepts back'
      ]
    });

    examples.push({
      title: 'Practical Application',
      prompt: `Give me a real-world example of how to apply ${lessonTitle} concepts in a business context.`,
      expectedOutput: 'A concrete example showing how to use the lesson concepts practically.',
      tips: [
        'Ask for practical examples',
        'Specify your context (business, personal, etc.)',
        'Request step-by-step guidance'
      ]
    });
  }

  return examples;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
