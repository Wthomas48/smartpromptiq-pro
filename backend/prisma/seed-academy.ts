/**
 * SmartPromptIQ Academy Seeder
 *
 * PRODUCTION GUARD: Requires SEED_ACADEMY_CONFIRM=yes to execute
 *
 * Usage:
 *   railway run -- npx tsx prisma/seed-academy.ts
 *   (with SEED_ACADEMY_CONFIRM=yes set in Railway variables)
 */

import { PrismaClient } from '@prisma/client'

// =============================================================================
// PRODUCTION SAFETY GUARD
// =============================================================================
const CONFIRM_FLAG = process.env.SEED_ACADEMY_CONFIRM

if (CONFIRM_FLAG !== 'yes') {
  console.error('⛔ SEED BLOCKED')
  console.error('')
  console.error('This seed will DELETE all academy data and recreate it.')
  console.error('To proceed, set environment variable: SEED_ACADEMY_CONFIRM=yes')
  console.error('')
  console.error('Example:')
  console.error('  railway variables set SEED_ACADEMY_CONFIRM=yes')
  console.error('  railway run -- npx tsx prisma/seed-academy.ts')
  console.error('  railway variables unset SEED_ACADEMY_CONFIRM')
  process.exit(1)
}

// =============================================================================
// DATABASE CONNECTION GUARD
// =============================================================================
const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('⛔ DATABASE_URL is not set')
  process.exit(1)
}

if (!DATABASE_URL.startsWith('postgresql://') && !DATABASE_URL.startsWith('postgres://')) {
  console.error('⛔ DATABASE_URL must be a valid PostgreSQL connection string')
  process.exit(1)
}

// =============================================================================
// PRISMA CLIENT
// =============================================================================
const prisma = new PrismaClient()

// =============================================================================
// SEED DATA
// =============================================================================
async function main() {
  console.log('🎓 Seeding SmartPromptIQ Academy...')

  // Clear existing data (FK-safe order)
  await prisma.courseReview.deleteMany()
  await prisma.lessonProgress.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.course.deleteMany()

  // Create course
  const course = await prisma.course.create({
    data: {
      title: 'AI Prompt Engineering 101',
      slug: 'ai-prompt-engineering-101',
      description: 'Learn how to write effective prompts and use AI tools productively.',
      category: 'prompt-engineering',
      difficulty: 'beginner',
      duration: 60,
      accessTier: 'free',
      priceUSD: 0,
      isPublished: true,
      order: 1,
      instructor: 'SmartPromptIQ Team',
      tags: 'prompts,ai,beginner,free',
    },
  })

  // Create lessons
  await prisma.lesson.createMany({
    data: [
      {
        courseId: course.id,
        title: 'What Is Prompt Engineering?',
        description: 'An introduction to the art and science of prompt engineering.',
        content: '# What Is Prompt Engineering?\n\nPrompt engineering is the practice of designing inputs that guide AI models to produce better outputs.\n\n## Key Concepts\n\n- **Context**: Provide background information\n- **Clarity**: Be specific about what you want\n- **Constraints**: Set boundaries and format requirements',
        duration: 10,
        order: 1,
        isPublished: true,
        isFree: true,
      },
      {
        courseId: course.id,
        title: 'Why Prompts Matter',
        description: 'Understanding the impact of well-crafted prompts.',
        content: '# Why Prompts Matter\n\nThe quality of your prompt directly impacts the quality of AI responses.\n\n## The Difference\n\n**Bad prompt**: "Write something about dogs"\n\n**Good prompt**: "Write a 200-word article about the health benefits of walking your dog daily, targeting first-time dog owners"',
        duration: 10,
        order: 2,
        isPublished: true,
        isFree: true,
      },
      {
        courseId: course.id,
        title: 'Anatomy of a Great Prompt',
        description: 'Breaking down the components of effective prompts.',
        content: '# Anatomy of a Great Prompt\n\nEvery effective prompt has key components:\n\n1. **Role**: Who should the AI act as?\n2. **Task**: What do you want done?\n3. **Context**: What background is needed?\n4. **Format**: How should the output be structured?\n5. **Tone**: What style or voice?\n\n## Template\n\n```\nYou are a [ROLE].\n[CONTEXT]\nPlease [TASK].\nFormat: [FORMAT]\nTone: [TONE]\n```',
        duration: 15,
        order: 3,
        isPublished: true,
        isFree: false,
      },
    ],
  })

  console.log('✅ Academy seed complete: 1 course, 3 lessons')
}

// =============================================================================
// EXECUTE
// =============================================================================
main()
  .catch((e) => {
    console.error('⛔ Seed failed:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
