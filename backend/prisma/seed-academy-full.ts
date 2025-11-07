import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎓 Seeding SmartPromptIQ Academy - FULL CATALOG (57+ Courses)...');

  // Clear existing academy data
  await prisma.courseReview.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();

  console.log('✅ Cleared existing academy data');

  const courses = [];

  // ============================================
  // FREE TIER COURSES (3)
  // ============================================

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Prompt Writing 101',
        slug: 'prompt-writing-101',
        description: 'Master the fundamentals of prompt engineering. Learn structure, context, and how to write clear, effective prompts.',
        category: 'prompt-engineering',
        difficulty: 'beginner',
        duration: 180,
        accessTier: 'free',
        priceUSD: 0,
        isPublished: true,
        order: 1,
        instructor: 'Dr. Sarah Chen',
        tags: 'fundamentals,beginner,free',
        averageRating: 4.9,
        reviewCount: 1234,
        enrollmentCount: 5432,
      },
    })
  );

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 4123,
      },
    })
  );

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 3456,
      },
    })
  );

  console.log('✅ Created FREE tier courses (3)');

  // ============================================
  // SMARTPROMPTIQ SUBSCRIBER TIER (6)
  // ============================================

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 2234,
      },
    })
  );

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 1876,
      },
    })
  );

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 1543,
      },
    })
  );

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 987,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: '50+ SmartPromptIQ Templates Library',
        slug: 'smartpromptiq-templates-library',
        description: 'Pre-built, customizable prompt templates for common business tasks.',
        category: 'smartpromptiq',
        difficulty: 'beginner',
        duration: 120,
        accessTier: 'smartpromptiq_included',
        priceUSD: 0,
        isPublished: true,
        order: 8,
        instructor: 'Template Team',
        tags: 'templates,resources,included',
        averageRating: 4.8,
        reviewCount: 456,
        enrollmentCount: 2345,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Monthly Live Q&A Sessions',
        slug: 'monthly-live-qa-sessions',
        description: 'Interactive sessions with SmartPromptIQ experts.',
        category: 'smartpromptiq',
        difficulty: 'beginner',
        duration: 60,
        accessTier: 'smartpromptiq_included',
        priceUSD: 0,
        isPublished: true,
        order: 9,
        instructor: 'Expert Panel',
        tags: 'live,qa,community,included',
        averageRating: 4.9,
        reviewCount: 234,
        enrollmentCount: 1876,
      },
    })
  );

  console.log('✅ Created SmartPromptIQ Subscriber tier courses (6)');

  // ============================================
  // PRO TIER - Foundation Track (2)
  // ============================================

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 3456,
      },
    })
  );

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 2345,
      },
    })
  );

  console.log('✅ Created PRO Foundation courses (2)');

  // ============================================
  // PRO TIER - Advanced Prompt Engineering (4)
  // ============================================

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 1876,
      },
    })
  );

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 1543,
      },
    })
  );

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 987,
      },
    })
  );

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 1234,
      },
    })
  );

  console.log('✅ Created PRO Advanced Prompt Engineering courses (4)');

  // ============================================
  // PRO TIER - DevOps Track (2)
  // ============================================

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 1432,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Kubernetes & Container Prompting',
        slug: 'kubernetes-container-prompting',
        description: 'AI-powered container orchestration and management.',
        category: 'devops',
        difficulty: 'advanced',
        duration: 360,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 17,
        instructor: 'Carlos Rodriguez',
        tags: 'kubernetes,containers,devops,pro',
        averageRating: 4.8,
        reviewCount: 345,
        enrollmentCount: 876,
      },
    })
  );

  console.log('✅ Created PRO DevOps courses (2)');

  // ============================================
  // PRO TIER - Design Track (2)
  // ============================================

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 1654,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Advanced Design Automation',
        slug: 'advanced-design-automation',
        description: 'Build AI-powered design workflows and creative systems.',
        category: 'design',
        difficulty: 'advanced',
        duration: 480,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 19,
        instructor: 'Emma Johnson',
        tags: 'design,automation,midjourney,pro',
        averageRating: 4.9,
        reviewCount: 456,
        enrollmentCount: 987,
      },
    })
  );

  console.log('✅ Created PRO Design courses (2)');

  // ============================================
  // PRO TIER - Finance & Trading Track (2)
  // ============================================

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 1123,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Algorithmic Trading with AI',
        slug: 'algorithmic-trading-ai',
        description: 'Advanced algorithmic trading using AI prompts.',
        category: 'finance',
        difficulty: 'expert',
        duration: 600,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 21,
        instructor: 'David Lopez',
        tags: 'algo-trading,finance,expert,pro',
        averageRating: 4.9,
        reviewCount: 289,
        enrollmentCount: 654,
      },
    })
  );

  console.log('✅ Created PRO Finance courses (2)');

  // ============================================
  // PRO TIER - Marketing & Content (2)
  // ============================================

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 2134,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Video & Podcast Script Writing',
        slug: 'video-podcast-script-writing',
        description: 'Create compelling scripts for video and audio content.',
        category: 'marketing',
        difficulty: 'intermediate',
        duration: 300,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 23,
        instructor: 'Sophia Martinez',
        tags: 'video,podcast,scripting,pro',
        averageRating: 4.7,
        reviewCount: 567,
        enrollmentCount: 1234,
      },
    })
  );

  console.log('✅ Created PRO Marketing courses (2)');

  // ============================================
  // PRO TIER - Data & Analytics (2)
  // ============================================

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 1543,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'SQL & Database Prompting',
        slug: 'sql-database-prompting',
        description: 'Generate and optimize SQL queries with AI.',
        category: 'data',
        difficulty: 'intermediate',
        duration: 360,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 25,
        instructor: 'Dr. Raj Patel',
        tags: 'sql,database,pro',
        averageRating: 4.7,
        reviewCount: 445,
        enrollmentCount: 987,
      },
    })
  );

  console.log('✅ Created PRO Data courses (2)');

  // ============================================
  // PRO TIER - Business Applications (3)
  // ============================================

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Customer Support Automation',
        slug: 'customer-support-automation',
        description: 'Build AI-powered customer support systems.',
        category: 'business',
        difficulty: 'intermediate',
        duration: 420,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 26,
        instructor: 'Jennifer Williams',
        tags: 'support,automation,business,pro',
        averageRating: 4.8,
        reviewCount: 523,
        enrollmentCount: 1432,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Sales Enablement with AI',
        slug: 'sales-enablement-ai',
        description: 'AI-powered sales processes and materials.',
        category: 'business',
        difficulty: 'intermediate',
        duration: 360,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 27,
        instructor: 'Robert Chen',
        tags: 'sales,business,pro',
        averageRating: 4.7,
        reviewCount: 389,
        enrollmentCount: 1123,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Legal Document Analysis',
        slug: 'legal-document-analysis',
        description: 'Use AI to analyze and draft legal documents.',
        category: 'business',
        difficulty: 'advanced',
        duration: 480,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 28,
        instructor: 'Attorney Lisa Chang',
        tags: 'legal,analysis,business,pro',
        averageRating: 4.8,
        reviewCount: 267,
        enrollmentCount: 654,
      },
    })
  );

  console.log('✅ Created PRO Business courses (3)');

  // ============================================
  // PRO TIER - Development & Technical (7)
  // ============================================

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 2345,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'API Integration Prompting',
        slug: 'api-integration-prompting',
        description: 'Connect AI to external APIs and services.',
        category: 'development',
        difficulty: 'intermediate',
        duration: 360,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 32,
        instructor: 'Tom Harris',
        tags: 'api,integration,development,pro',
        averageRating: 4.7,
        reviewCount: 567,
        enrollmentCount: 1234,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'No-Code/Low-Code with AI',
        slug: 'no-code-low-code-ai',
        description: 'Build applications without traditional coding using AI.',
        category: 'development',
        difficulty: 'intermediate',
        duration: 300,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 33,
        instructor: 'Rachel Green',
        tags: 'no-code,zapier,automation,pro',
        averageRating: 4.8,
        reviewCount: 789,
        enrollmentCount: 1876,
      },
    })
  );

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 1654,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'JavaScript & Web Integration',
        slug: 'javascript-web-integration',
        description: 'Integrate AI prompts into web applications.',
        category: 'development',
        difficulty: 'intermediate',
        duration: 480,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 35,
        instructor: 'Alex Park',
        tags: 'javascript,web,development,pro',
        averageRating: 4.8,
        reviewCount: 654,
        enrollmentCount: 1432,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Prompt Architecture & Design Patterns',
        slug: 'prompt-architecture-design-patterns',
        description: 'Enterprise-grade prompt system architecture.',
        category: 'development',
        difficulty: 'expert',
        duration: 720,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 36,
        instructor: 'Dr. Patricia Moore',
        tags: 'architecture,enterprise,expert,pro',
        averageRating: 4.9,
        reviewCount: 345,
        enrollmentCount: 678,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Fine-Tuning & Custom Models',
        slug: 'fine-tuning-custom-models',
        description: 'When and how to fine-tune custom AI models.',
        category: 'development',
        difficulty: 'expert',
        duration: 900,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 37,
        instructor: 'Dr. Kevin Zhang',
        tags: 'fine-tuning,custom-models,expert,pro',
        averageRating: 4.9,
        reviewCount: 234,
        enrollmentCount: 567,
      },
    })
  );

  console.log('✅ Created PRO Development courses (7)');

  // ============================================
  // PRO TIER - Advanced Frameworks (3)
  // ============================================

  courses.push(
    await prisma.course.create({
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
        enrollmentCount: 1123,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'LangChain & Framework Mastery',
        slug: 'langchain-framework-mastery',
        description: 'Master LangChain and other AI orchestration frameworks.',
        category: 'development',
        difficulty: 'advanced',
        duration: 720,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 39,
        instructor: 'Brandon Lee',
        tags: 'langchain,frameworks,advanced,pro',
        averageRating: 4.9,
        reviewCount: 678,
        enrollmentCount: 1234,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Prompt Engineering for Enterprise',
        slug: 'prompt-engineering-enterprise',
        description: 'Deploy and manage AI at enterprise scale.',
        category: 'business',
        difficulty: 'expert',
        duration: 840,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 40,
        instructor: 'Margaret Thompson',
        tags: 'enterprise,governance,expert,pro',
        averageRating: 4.9,
        reviewCount: 456,
        enrollmentCount: 789,
      },
    })
  );

  console.log('✅ Created PRO Advanced Frameworks courses (3)');

  // ============================================
  // PRO TIER - Research & Creative (4)
  // ============================================

  courses.push(
    await prisma.course.create({
      data: {
        title: 'AI Research Methods',
        slug: 'ai-research-methods',
        description: 'Use AI to accelerate research and discovery.',
        category: 'research',
        difficulty: 'advanced',
        duration: 600,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 41,
        instructor: 'Dr. Helen Foster',
        tags: 'research,academic,advanced,pro',
        averageRating: 4.8,
        reviewCount: 345,
        enrollmentCount: 678,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Prompt Engineering for Scientific Computing',
        slug: 'prompt-engineering-scientific-computing',
        description: 'AI applications in scientific research.',
        category: 'research',
        difficulty: 'advanced',
        duration: 720,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 42,
        instructor: 'Dr. Richard Wang',
        tags: 'science,computing,research,pro',
        averageRating: 4.8,
        reviewCount: 267,
        enrollmentCount: 543,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Creative Writing with AI',
        slug: 'creative-writing-ai',
        description: 'Write novels, stories, and creative content with AI.',
        category: 'creative',
        difficulty: 'intermediate',
        duration: 480,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 43,
        instructor: 'Author Monica Blake',
        tags: 'writing,creative,storytelling,pro',
        averageRating: 4.7,
        reviewCount: 567,
        enrollmentCount: 1234,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Game Development & Interactive Fiction',
        slug: 'game-development-interactive-fiction',
        description: 'Create game narratives and interactive experiences.',
        category: 'creative',
        difficulty: 'intermediate',
        duration: 540,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 44,
        instructor: 'Game Designer Chris Miller',
        tags: 'gaming,narrative,interactive,pro',
        averageRating: 4.8,
        reviewCount: 445,
        enrollmentCount: 876,
      },
    })
  );

  console.log('✅ Created PRO Research & Creative courses (4)');

  // ============================================
  // PRO TIER - Healthcare & Education (2)
  // ============================================

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Healthcare & Medical Prompting',
        slug: 'healthcare-medical-prompting',
        description: 'AI applications in healthcare and medical research.',
        category: 'healthcare',
        difficulty: 'advanced',
        duration: 600,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 29,
        instructor: 'Dr. Sarah Johnson MD',
        tags: 'healthcare,medical,hipaa,pro',
        averageRating: 4.9,
        reviewCount: 389,
        enrollmentCount: 765,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Education & E-Learning',
        slug: 'education-e-learning',
        description: 'Create educational content and learning systems with AI.',
        category: 'education',
        difficulty: 'intermediate',
        duration: 420,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 30,
        instructor: 'Prof. Amanda White',
        tags: 'education,elearning,teaching,pro',
        averageRating: 4.8,
        reviewCount: 623,
        enrollmentCount: 1345,
      },
    })
  );

  console.log('✅ Created PRO Healthcare & Education courses (2)');

  // ============================================
  // PRO TIER - Workshops & Events (3)
  // ============================================

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Weekly Live Workshops',
        slug: 'weekly-live-workshops',
        description: 'Hands-on workshops on trending topics.',
        category: 'events',
        difficulty: 'intermediate',
        duration: 120,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 45,
        instructor: 'Workshop Team',
        tags: 'live,workshops,events,pro',
        averageRating: 4.9,
        reviewCount: 789,
        enrollmentCount: 2345,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Monthly Case Study Deep Dives',
        slug: 'monthly-case-study-deep-dives',
        description: 'Detailed analysis of real-world implementations.',
        category: 'events',
        difficulty: 'advanced',
        duration: 180,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 46,
        instructor: 'Industry Experts',
        tags: 'case-studies,real-world,events,pro',
        averageRating: 4.9,
        reviewCount: 567,
        enrollmentCount: 1876,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Quarterly Hackathons',
        slug: 'quarterly-hackathons',
        description: 'Build AI projects, compete, win prizes.',
        category: 'events',
        difficulty: 'intermediate',
        duration: 2880, // 48 hours
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 47,
        instructor: 'Hackathon Team',
        tags: 'hackathon,competition,events,pro',
        averageRating: 4.9,
        reviewCount: 445,
        enrollmentCount: 1234,
      },
    })
  );

  console.log('✅ Created PRO Workshops & Events courses (3)');

  // ============================================
  // CERTIFICATION PROGRAMS (6)
  // ============================================

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Certified Prompt Engineer (CPE)',
        slug: 'certified-prompt-engineer-cpe',
        description: 'Complete certification program with exam. Become a recognized Prompt Engineering professional.',
        category: 'certification',
        difficulty: 'advanced',
        duration: 2400,
        accessTier: 'certification',
        priceUSD: 29900,
        isPublished: true,
        order: 48,
        instructor: 'Certification Board',
        tags: 'certification,professional,exam',
        averageRating: 4.9,
        reviewCount: 1567,
        enrollmentCount: 3456,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Certified SmartPromptIQ Architect (CSA)',
        slug: 'certified-smartpromptiq-architect-csa',
        description: 'Advanced architecture certification. Requires SmartPromptIQ subscription.',
        category: 'certification',
        difficulty: 'expert',
        duration: 3600,
        accessTier: 'certification',
        priceUSD: 39900,
        isPublished: true,
        order: 49,
        instructor: 'Senior Architects',
        tags: 'certification,architect,expert',
        averageRating: 4.9,
        reviewCount: 432,
        enrollmentCount: 987,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Certified DevOps AI Engineer',
        slug: 'certified-devops-ai-engineer',
        description: 'DevOps + AI specialization certification.',
        category: 'certification',
        difficulty: 'advanced',
        duration: 2100,
        accessTier: 'certification',
        priceUSD: 29900,
        isPublished: true,
        order: 50,
        instructor: 'DevOps Experts',
        tags: 'certification,devops,specialist',
        averageRating: 4.8,
        reviewCount: 289,
        enrollmentCount: 567,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Certified AI Design Specialist',
        slug: 'certified-ai-design-specialist',
        description: 'Design + AI specialization certification.',
        category: 'certification',
        difficulty: 'advanced',
        duration: 1800,
        accessTier: 'certification',
        priceUSD: 29900,
        isPublished: true,
        order: 51,
        instructor: 'Design Experts',
        tags: 'certification,design,specialist',
        averageRating: 4.8,
        reviewCount: 234,
        enrollmentCount: 456,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Certified Financial AI Engineer',
        slug: 'certified-financial-ai-engineer',
        description: 'Finance + AI specialization certification.',
        category: 'certification',
        difficulty: 'advanced',
        duration: 2400,
        accessTier: 'certification',
        priceUSD: 29900,
        isPublished: true,
        order: 52,
        instructor: 'Finance Experts',
        tags: 'certification,finance,specialist',
        averageRating: 4.9,
        reviewCount: 178,
        enrollmentCount: 345,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Certified Enterprise AI Architect',
        slug: 'certified-enterprise-ai-architect',
        description: 'Enterprise deployment specialization certification.',
        category: 'certification',
        difficulty: 'expert',
        duration: 3000,
        accessTier: 'certification',
        priceUSD: 39900,
        isPublished: true,
        order: 53,
        instructor: 'Enterprise Architects',
        tags: 'certification,enterprise,architect',
        averageRating: 4.9,
        reviewCount: 156,
        enrollmentCount: 289,
      },
    })
  );

  console.log('✅ Created Certification programs (6)');

  // ============================================
  // BONUS RESOURCES (4)
  // ============================================

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Prompt Template Library (500+ Templates)',
        slug: 'prompt-template-library-500',
        description: 'Categorized, fully customizable prompt templates.',
        category: 'resources',
        difficulty: 'beginner',
        duration: 60,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 54,
        instructor: 'Template Team',
        tags: 'templates,resources,library,pro',
        averageRating: 4.9,
        reviewCount: 1234,
        enrollmentCount: 3456,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'AI Model Comparison Database',
        slug: 'ai-model-comparison-database',
        description: 'Real-time model performance data and cost calculators.',
        category: 'resources',
        difficulty: 'beginner',
        duration: 30,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 55,
        instructor: 'Research Team',
        tags: 'models,comparison,resources,pro',
        averageRating: 4.8,
        reviewCount: 876,
        enrollmentCount: 2345,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Community Forum & Discord Access',
        slug: 'community-forum-discord-access',
        description: '24/7 peer support, expert office hours, project showcases.',
        category: 'resources',
        difficulty: 'beginner',
        duration: 0,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 56,
        instructor: 'Community Team',
        tags: 'community,discord,forum,pro',
        averageRating: 4.9,
        reviewCount: 2345,
        enrollmentCount: 5678,
      },
    })
  );

  courses.push(
    await prisma.course.create({
      data: {
        title: 'Resource Library & Downloads',
        slug: 'resource-library-downloads',
        description: 'E-books, guides, cheat sheets, video tutorials, newsletters.',
        category: 'resources',
        difficulty: 'beginner',
        duration: 0,
        accessTier: 'pro',
        priceUSD: 0,
        isPublished: true,
        order: 57,
        instructor: 'Content Team',
        tags: 'resources,downloads,library,pro',
        averageRating: 4.8,
        reviewCount: 1567,
        enrollmentCount: 4321,
      },
    })
  );

  console.log('✅ Created Bonus Resources (4)');

  console.log('\n🎉 FULL CATALOG SEEDING COMPLETE!');
  console.log(`📊 Total courses created: ${courses.length}`);

  return courses;
}

main()
  .then((courses) => {
    console.log(`\n✅ Created ${courses.length} courses so far...`);
    console.log('Continuing with more courses...');
  })
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
