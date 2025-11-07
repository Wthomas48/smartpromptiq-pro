import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎓 Seeding SmartPromptIQ Academy...');

  // Clear existing academy data
  await prisma.courseReview.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();

  console.log('✅ Cleared existing academy data');

  // ============================================
  // FREE TIER COURSES
  // ============================================

  const promptWriting101 = await prisma.course.create({
    data: {
      title: 'Prompt Writing 101',
      slug: 'prompt-writing-101',
      description: 'Master the fundamentals of prompt engineering. Learn structure, context, and how to write clear, effective prompts.',
      category: 'prompt-engineering',
      difficulty: 'beginner',
      duration: 180, // 3 hours in minutes
      accessTier: 'free',
      priceUSD: 0,
      isPublished: true,
      order: 1,
      instructor: 'Dr. Sarah Chen',
      tags: 'fundamentals,beginner,free',
      averageRating: 4.9,
      reviewCount: 1234,
      lessons: {
        create: [
          {
            title: 'Anatomy of a Great Prompt',
            description: 'Learn the essential components that make prompts effective',
            content: '# Anatomy of a Great Prompt\n\nEvery effective prompt has three key components:\n\n1. **Context**: Background information\n2. **Task**: What you want the AI to do\n3. **Constraints**: Guidelines and limitations\n\n## Example:\n\n```\nContext: You are a marketing expert with 10 years of experience.\nTask: Write a compelling product description for a sustainable water bottle.\nConstraints: Keep it under 100 words, focus on environmental benefits.\n```',
            duration: 15,
            order: 1,
            isPublished: true,
            isFree: true,
          },
          {
            title: 'Context and Clarity Principles',
            description: 'How to provide context that gets better results',
            content: '# Context and Clarity\n\nThe more context you provide, the better the AI understands your needs.',
            duration: 20,
            order: 2,
            isPublished: true,
            isFree: true,
          },
          {
            title: 'Common Prompt Mistakes',
            description: 'Avoid these common pitfalls',
            content: '# Common Mistakes\n\n1. Being too vague\n2. Not specifying format\n3. Overcomplicating\n4. Forgetting examples',
            duration: 15,
            order: 3,
            isPublished: true,
            isFree: false,
          },
        ],
      },
    },
  });

  const introToAI = await prisma.course.create({
    data: {
      title: 'Introduction to AI Prompting',
      slug: 'introduction-to-ai-prompting',
      description: 'Understand how AI language models work and how to communicate with them effectively.',
      category: 'prompt-engineering',
      difficulty: 'beginner',
      duration: 120,
      accessTier: 'free',
      priceUSD: 0,
      isPublished: true,
      order: 2,
      instructor: 'Prof. Michael Zhang',
      tags: 'ai-basics,beginner,free',
      averageRating: 4.8,
      reviewCount: 892,
    },
  });

  const productTour = await prisma.course.create({
    data: {
      title: 'SmartPromptIQ Product Tour',
      slug: 'smartpromptiq-product-tour',
      description: 'Complete walkthrough of SmartPromptIQ platform features and capabilities.',
      category: 'smartpromptiq',
      difficulty: 'beginner',
      duration: 90,
      accessTier: 'free',
      priceUSD: 0,
      isPublished: true,
      order: 3,
      instructor: 'Emma Rodriguez',
      tags: 'platform,tutorial,free',
      averageRating: 4.9,
      reviewCount: 567,
    },
  });

  console.log('✅ Created FREE tier courses (3)');

  // ============================================
  // SMARTPROMPTIQ SUBSCRIBER TIER
  // ============================================

  const smartpromptiqBasics = await prisma.course.create({
    data: {
      title: 'SmartPromptIQ Basics',
      slug: 'smartpromptiq-basics',
      description: 'Complete guide to getting the most from your SmartPromptIQ subscription.',
      category: 'smartpromptiq',
      difficulty: 'beginner',
      duration: 240,
      accessTier: 'smartpromptiq_included',
      priceUSD: 0,
      isPublished: true,
      order: 4,
      instructor: 'David Kim',
      tags: 'platform,basics,included',
      averageRating: 4.9,
      reviewCount: 445,
    },
  });

  const advancedRouting = await prisma.course.create({
    data: {
      title: 'Advanced Routing & Execution',
      slug: 'advanced-routing-execution',
      description: "Master SmartPromptIQ's intelligent routing system and advanced execution modes.",
      category: 'smartpromptiq',
      difficulty: 'intermediate',
      duration: 300,
      accessTier: 'smartpromptiq_included',
      priceUSD: 0,
      isPublished: true,
      order: 5,
      instructor: 'Lisa Chen',
      tags: 'routing,advanced,included',
      averageRating: 4.8,
      reviewCount: 332,
    },
  });

  const promptChaining = await prisma.course.create({
    data: {
      title: 'Advanced Prompt Chaining',
      slug: 'advanced-prompt-chaining',
      description: 'Build complex, multi-step prompt systems that solve sophisticated problems.',
      category: 'smartpromptiq',
      difficulty: 'advanced',
      duration: 360,
      accessTier: 'smartpromptiq_included',
      priceUSD: 0,
      isPublished: true,
      order: 6,
      instructor: 'Dr. James Wilson',
      tags: 'chaining,advanced,included',
      averageRating: 4.9,
      reviewCount: 278,
    },
  });

  const teamWorkflows = await prisma.course.create({
    data: {
      title: 'Team Workflows & Collaboration',
      slug: 'team-workflows-collaboration',
      description: 'Set up and manage team-based prompting workflows in SmartPromptIQ.',
      category: 'smartpromptiq',
      difficulty: 'intermediate',
      duration: 180,
      accessTier: 'smartpromptiq_included',
      priceUSD: 0,
      isPublished: true,
      order: 7,
      instructor: 'Amanda Foster',
      tags: 'teams,collaboration,included',
      averageRating: 4.7,
      reviewCount: 189,
    },
  });

  console.log('✅ Created SmartPromptIQ Subscriber tier courses (4)');

  // ============================================
  // PRO ACCESS TIER - Foundation
  // ============================================

  const promptFundamentals = await prisma.course.create({
    data: {
      title: 'Prompt Engineering Fundamentals',
      slug: 'prompt-engineering-fundamentals',
      description: 'Comprehensive foundation in professional prompt engineering.',
      category: 'prompt-engineering',
      difficulty: 'intermediate',
      duration: 480,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 10,
      instructor: 'Dr. Sarah Chen',
      tags: 'fundamentals,pro,foundation',
      averageRating: 4.9,
      reviewCount: 1567,
    },
  });

  const aiModelComparison = await prisma.course.create({
    data: {
      title: 'AI Model Comparison & Selection',
      slug: 'ai-model-comparison-selection',
      description: 'Learn when to use GPT-4, Claude, Gemini, and other models.',
      category: 'prompt-engineering',
      difficulty: 'intermediate',
      duration: 240,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 11,
      instructor: 'Prof. Michael Zhang',
      tags: 'models,comparison,pro',
      averageRating: 4.8,
      reviewCount: 892,
    },
  });

  // Advanced Prompt Engineering
  const advancedPatterns = await prisma.course.create({
    data: {
      title: 'Advanced Prompt Patterns',
      slug: 'advanced-prompt-patterns',
      description: 'Master sophisticated prompt design patterns used by experts.',
      category: 'prompt-engineering',
      difficulty: 'advanced',
      duration: 480,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 12,
      instructor: 'Dr. James Wilson',
      tags: 'advanced,patterns,pro',
      averageRating: 4.9,
      reviewCount: 723,
    },
  });

  const promptDebugging = await prisma.course.create({
    data: {
      title: 'Prompt Debugging & Optimization',
      slug: 'prompt-debugging-optimization',
      description: 'Systematic approaches to fixing and improving prompts.',
      category: 'prompt-engineering',
      difficulty: 'advanced',
      duration: 360,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 13,
      instructor: 'Alex Johnson',
      tags: 'debugging,optimization,pro',
      averageRating: 4.8,
      reviewCount: 654,
    },
  });

  const multiAgentSystems = await prisma.course.create({
    data: {
      title: 'Multi-Agent Prompt Systems',
      slug: 'multi-agent-prompt-systems',
      description: 'Build systems with multiple AI agents working together.',
      category: 'prompt-engineering',
      difficulty: 'advanced',
      duration: 600,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 14,
      instructor: 'Dr. Emily Carter',
      tags: 'multi-agent,advanced,pro',
      averageRating: 4.9,
      reviewCount: 445,
    },
  });

  const promptSecurity = await prisma.course.create({
    data: {
      title: 'Prompt Security & Safety',
      slug: 'prompt-security-safety',
      description: 'Protect against prompt injection, jailbreaking, and misuse.',
      category: 'prompt-engineering',
      difficulty: 'intermediate',
      duration: 300,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 15,
      instructor: 'Marcus Davis',
      tags: 'security,safety,pro',
      averageRating: 4.7,
      reviewCount: 389,
    },
  });

  console.log('✅ Created PRO Foundation & Advanced courses (6)');

  // ============================================
  // PRO - Domain-Specific Tracks
  // ============================================

  const devopsAutomation = await prisma.course.create({
    data: {
      title: 'DevOps Automation with AI',
      slug: 'devops-automation-ai',
      description: 'Build AI-powered DevOps workflows and automation systems.',
      category: 'devops',
      difficulty: 'intermediate',
      duration: 600,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 16,
      instructor: 'Carlos Rodriguez',
      tags: 'devops,automation,pro',
      averageRating: 4.9,
      reviewCount: 567,
    },
  });

  const aiDesignSystems = await prisma.course.create({
    data: {
      title: 'AI Design Systems',
      slug: 'ai-design-systems',
      description: 'Create stunning designs with AI for UI/UX, branding, and graphics.',
      category: 'design',
      difficulty: 'intermediate',
      duration: 360,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 18,
      instructor: 'Emma Johnson',
      tags: 'design,ui-ux,pro',
      averageRating: 4.8,
      reviewCount: 723,
    },
  });

  const tradingFinanceAI = await prisma.course.create({
    data: {
      title: 'Trading & Finance AI',
      slug: 'trading-finance-ai',
      description: 'Build AI trading strategies and financial analysis systems.',
      category: 'finance',
      difficulty: 'advanced',
      duration: 720,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 20,
      instructor: 'David Lopez',
      tags: 'trading,finance,pro',
      averageRating: 4.9,
      reviewCount: 445,
    },
  });

  const contentMarketing = await prisma.course.create({
    data: {
      title: 'Content Creation & Marketing',
      slug: 'content-creation-marketing',
      description: 'Master AI-powered content creation for marketing.',
      category: 'marketing',
      difficulty: 'intermediate',
      duration: 420,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 22,
      instructor: 'Sophia Martinez',
      tags: 'content,marketing,pro',
      averageRating: 4.8,
      reviewCount: 891,
    },
  });

  const dataAnalysis = await prisma.course.create({
    data: {
      title: 'Data Analysis & Visualization',
      slug: 'data-analysis-visualization',
      description: 'Analyze data and create insights using AI prompts.',
      category: 'data',
      difficulty: 'intermediate',
      duration: 540,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 24,
      instructor: 'Dr. Raj Patel',
      tags: 'data,analysis,pro',
      averageRating: 4.8,
      reviewCount: 612,
    },
  });

  const codeGeneration = await prisma.course.create({
    data: {
      title: 'Code Generation & Review',
      slug: 'code-generation-review',
      description: 'Master AI-assisted software development.',
      category: 'development',
      difficulty: 'advanced',
      duration: 540,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 31,
      instructor: 'Jessica Lee',
      tags: 'coding,development,pro',
      averageRating: 4.9,
      reviewCount: 1234,
    },
  });

  const pythonPrompting = await prisma.course.create({
    data: {
      title: 'Python for Prompt Engineers',
      slug: 'python-prompt-engineers',
      description: 'Use Python to scale and automate prompt workflows.',
      category: 'development',
      difficulty: 'intermediate',
      duration: 600,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 34,
      instructor: 'Ryan Chen',
      tags: 'python,automation,pro',
      averageRating: 4.9,
      reviewCount: 876,
    },
  });

  const ragSystems = await prisma.course.create({
    data: {
      title: 'RAG (Retrieval-Augmented Generation)',
      slug: 'rag-retrieval-augmented-generation',
      description: 'Build knowledge-enhanced AI systems.',
      category: 'development',
      difficulty: 'advanced',
      duration: 600,
      accessTier: 'pro',
      priceUSD: 0,
      isPublished: true,
      order: 38,
      instructor: 'Dr. Laura Kim',
      tags: 'rag,advanced,pro',
      averageRating: 4.9,
      reviewCount: 534,
    },
  });

  console.log('✅ Created PRO Domain-Specific courses (8)');

  // ============================================
  // CERTIFICATION PROGRAMS
  // ============================================

  const certifiedPromptEngineer = await prisma.course.create({
    data: {
      title: 'Certified Prompt Engineer (CPE)',
      slug: 'certified-prompt-engineer-cpe',
      description: 'Complete certification program with exam. Become a recognized Prompt Engineering professional.',
      category: 'certification',
      difficulty: 'advanced',
      duration: 2400, // 40 hours
      accessTier: 'certification',
      priceUSD: 29900, // $299
      isPublished: true,
      order: 48,
      instructor: 'Multiple Experts',
      tags: 'certification,professional,exam',
      averageRating: 4.9,
      reviewCount: 1567,
    },
  });

  const certifiedArchitect = await prisma.course.create({
    data: {
      title: 'Certified SmartPromptIQ Architect (CSA)',
      slug: 'certified-smartpromptiq-architect-csa',
      description: 'Advanced architecture certification. Requires SmartPromptIQ subscription.',
      category: 'certification',
      difficulty: 'expert',
      duration: 3600, // 60 hours
      accessTier: 'certification',
      priceUSD: 39900, // $399
      isPublished: true,
      order: 49,
      instructor: 'Senior Architects',
      tags: 'certification,architect,expert',
      averageRating: 4.9,
      reviewCount: 432,
    },
  });

  console.log('✅ Created Certification programs (2)');

  console.log('\n🎉 Academy seeding complete!');
  console.log('📊 Summary:');
  console.log('   - Free courses: 3');
  console.log('   - SmartPromptIQ included: 4');
  console.log('   - Pro courses: 14');
  console.log('   - Certifications: 2');
  console.log('   - Total: 23 courses created');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
