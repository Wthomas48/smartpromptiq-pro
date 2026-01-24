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

  console.log('✅ Cleared existing academy data')

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
      duration: 180,
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
  })

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
    },
  })

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
    },
  })

  // AI Agents Fundamentals - Beginner FREE course
  await prisma.course.create({
    data: {
      title: 'AI Agents Fundamentals',
      slug: 'ai-agents-fundamentals',
      description: 'Understand the core concepts of AI agents. Learn what they are, how they work, and why they are transforming business automation. Perfect introduction before the Masterclass.',
      category: 'smartpromptiq',
      difficulty: 'beginner',
      duration: 25,
      accessTier: 'free',
      priceUSD: 0,
      isPublished: true,
      order: 4,
      instructor: 'Alex Thompson',
      tags: 'agents,fundamentals,beginner,free,introduction',
      averageRating: 4.8,
      reviewCount: 1523,
      enrollmentCount: 3200,
      lessons: {
        create: [
          {
            title: 'What Are AI Agents?',
            description: 'Understanding the basics of AI agents and their capabilities',
            content: `# What Are AI Agents?

## Introduction

AI Agents are autonomous software programs powered by large language models (LLMs) that can understand, reason, and take actions to accomplish tasks.

## Key Characteristics

### 1. Natural Language Understanding
AI agents can understand human language in all its complexity:
- Context and nuance
- Intent and sentiment
- Multiple languages

### 2. Reasoning & Decision Making
Unlike simple chatbots, AI agents can:
- Analyze situations
- Consider multiple options
- Make informed decisions
- Learn from interactions

### 3. Task Execution
AI agents don't just respond - they ACT:
- Answer questions
- Complete forms
- Make recommendations
- Trigger workflows

## Why AI Agents Matter

- **24/7 Availability**: Work around the clock
- **Instant Responses**: No wait times
- **Consistent Quality**: Same great service every time
- **Scalability**: Handle thousands of conversations simultaneously
- **Cost Efficiency**: Reduce operational costs by 60-80%`,
            duration: 5,
            order: 1,
            isPublished: true,
            isFree: true,
          },
          {
            title: 'How AI Agents Work',
            description: 'The technology and architecture behind AI agents',
            content: `# How AI Agents Work

## The Agent Pipeline

When a user sends a message to an AI agent, here's what happens:

### Step 1: Input Processing
The agent receives the message and prepares it for understanding.

### Step 2: Understanding
The Large Language Model (LLM) processes the input:
- Identifies intent (what does the user want?)
- Extracts entities (names, dates, products)
- Considers context (previous messages, user history)

### Step 3: Reasoning
The agent decides how to respond:
- Should I answer directly?
- Do I need more information?
- Should I take an action?

### Step 4: Response Generation
The agent crafts an appropriate response.

### Step 5: Action Execution (Optional)
If needed, the agent can call external APIs, update databases, or trigger notifications.`,
            duration: 6,
            order: 2,
            isPublished: true,
            isFree: true,
          },
          {
            title: 'AI Agent Use Cases',
            description: 'Real-world applications of AI agents across industries',
            content: `# AI Agent Use Cases

## Customer Service
- Answer FAQs instantly
- Handle returns and exchanges
- Track orders and shipments
- 70% reduction in support tickets

## Sales & Lead Generation
- Qualify leads automatically
- Answer product questions
- Schedule demos and calls
- 40% more leads captured

## E-Commerce
- Product recommendations
- Size and fit guidance
- Order status updates
- 15% increase in average order value`,
            duration: 5,
            order: 3,
            isPublished: true,
            isFree: true,
          },
        ],
      },
    },
  })

  // AI Agents Masterclass - Featured FREE course
  await prisma.course.create({
    data: {
      title: 'AI Agents Masterclass',
      slug: 'ai-agents-masterclass',
      description: 'Learn to build, deploy, and monetize AI chatbots for any website. From basics to advanced automation. Create embeddable chat agents that work 24/7.',
      category: 'smartpromptiq',
      difficulty: 'intermediate',
      duration: 30,
      accessTier: 'free',
      priceUSD: 0,
      isPublished: true,
      order: 5,
      instructor: 'Alex Thompson',
      tags: 'agents,chatbots,automation,free,featured',
      averageRating: 4.9,
      reviewCount: 2847,
      enrollmentCount: 2847,
      lessons: {
        create: [
          {
            title: 'Welcome to AI Agents',
            description: 'Introduction to AI agents and what you will learn in this course',
            content: `# Welcome to the AI Agents Masterclass! 🤖

## What You'll Learn

In this comprehensive course, you'll master the art of building and deploying AI agents that can:

- **Chat with your website visitors** 24/7
- **Answer questions** about your products and services
- **Collect leads** and qualify prospects automatically
- **Provide customer support** without human intervention

## Why AI Agents?

AI agents are revolutionizing how businesses interact with customers:

- 🕐 **24/7 Availability**: Never miss a customer inquiry
- 💰 **Cost Savings**: Reduce support costs by up to 70%
- 📈 **Scalability**: Handle unlimited conversations simultaneously
- 🎯 **Consistency**: Deliver consistent brand messaging every time

## Course Structure

This course is divided into 6 lessons:

1. **Welcome** (This lesson) - Overview and setup
2. **Creating Your First Agent** - Step-by-step guide
3. **Writing Effective System Prompts** - The secret to great agents
4. **Embedding on Your Website** - Technical implementation
5. **Advanced Features** - Voice, analytics, and more
6. **Monetization Strategies** - Turn your agents into revenue

Let's get started! 🚀`,
            duration: 5,
            order: 1,
            isPublished: true,
            isFree: true,
          },
          {
            title: 'Creating Your First AI Agent',
            description: 'Step-by-step guide to creating your first intelligent chat agent',
            content: `# Creating Your First AI Agent

## Step 1: Navigate to the Agent Dashboard

Go to the **AI Agents** section from the main navigation or visit \`/agents\`.

## Step 2: Click "Create Agent"

You'll see a modal with several fields to fill in:

### Basic Information

- **Agent Name**: Give your agent a memorable name
- **Slug**: A URL-friendly identifier
- **Description**: Brief description of what your agent does

### System Prompt (Most Important!)

This is where you define your agent's personality, knowledge, and behavior.

### Model Settings

- **Provider**: Choose Anthropic (Claude) or OpenAI (GPT)
- **Model**: Select based on your needs

## Step 3: Save and Get Your API Key

After creating, you'll receive an **API key**.

⚠️ **IMPORTANT**: Save this key immediately! It's only shown once.`,
            duration: 6,
            order: 2,
            isPublished: true,
            isFree: true,
          },
          {
            title: 'Writing Effective System Prompts',
            description: 'Master the art of crafting system prompts that make your agents intelligent',
            content: `# Writing Effective System Prompts

The system prompt is the brain of your AI agent.

## The CRISP Framework

### C - Context
Define who the agent is and what company it represents.

### R - Role
Specify what the agent's responsibilities are.

### I - Instructions
Provide clear guidelines on how to respond.

### S - Scope
Define what the agent can and cannot help with.

### P - Personality
Set the tone and style of communication.`,
            duration: 7,
            order: 3,
            isPublished: true,
            isFree: true,
          },
          {
            title: 'Embedding Agents on Your Website',
            description: 'Technical guide to adding your AI agent to any website',
            content: `# Embedding Agents on Your Website

Adding your AI agent to a website is simple - just one script tag!

## The Embed Code

\`\`\`html
<script
  src="https://smartpromptiq.com/widget.js"
  data-api-key="YOUR_API_KEY_HERE"
  data-agent="your-agent-slug"
  data-theme="light"
  data-position="bottom-right"
></script>
\`\`\`

## Platform-Specific Instructions

### WordPress
Add to your theme's footer.php

### Shopify
Go to Online Store → Themes → Edit Code

### React/Next.js
Use useEffect to load the script dynamically`,
            duration: 5,
            order: 4,
            isPublished: true,
            isFree: true,
          },
          {
            title: 'Advanced Features',
            description: 'Unlock voice capabilities, analytics, and advanced customization',
            content: `# Advanced Agent Features

## 🎙️ Voice Capabilities

Enable voice input/output for hands-free interaction.

## 📊 Analytics Dashboard

Track your agent's performance:
- Conversations
- Messages
- Response Time
- Satisfaction

## 🎨 Advanced Customization

- Custom welcome messages
- Suggested questions
- Domain restrictions
- Rate limiting`,
            duration: 4,
            order: 5,
            isPublished: true,
            isFree: true,
          },
          {
            title: 'Monetization Strategies',
            description: 'Turn your AI agents into a profitable business',
            content: `# Monetization Strategies 💰

## Strategy 1: Sell as a Service
Create agents for clients with setup fees and monthly retainers.

## Strategy 2: Lead Generation
Use agents to qualify leads 24/7.

## Strategy 3: Customer Support Savings
Reduce support costs by 95%+ per interaction.

## Strategy 4: Premium Chat Tiers
Offer tiered support levels.

## 🎓 Congratulations!

You've completed the AI Agents Masterclass!

You now know how to:
✅ Create intelligent AI agents
✅ Write effective system prompts
✅ Embed agents on any website
✅ Use advanced features
✅ Monetize your agents`,
            duration: 3,
            order: 6,
            isPublished: true,
            isFree: true,
          },
        ],
      },
    },
  })

  console.log('✅ Created FREE tier courses (5)')

  // ============================================
  // SMARTPROMPTIQ SUBSCRIBER TIER
  // ============================================

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
      order: 6,
      instructor: 'David Kim',
      tags: 'platform,basics,included',
      averageRating: 4.9,
      reviewCount: 445,
    },
  })

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
      order: 7,
      instructor: 'Lisa Chen',
      tags: 'routing,advanced,included',
      averageRating: 4.8,
      reviewCount: 332,
    },
  })

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
      order: 8,
      instructor: 'Dr. James Wilson',
      tags: 'chaining,advanced,included',
      averageRating: 4.9,
      reviewCount: 278,
    },
  })

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
      order: 9,
      instructor: 'Amanda Foster',
      tags: 'teams,collaboration,included',
      averageRating: 4.7,
      reviewCount: 189,
    },
  })

  console.log('✅ Created SmartPromptIQ Subscriber tier courses (4)')

  // ============================================
  // PRO ACCESS TIER
  // ============================================

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
    },
  })

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
    },
  })

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
    },
  })

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
    },
  })

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
    },
  })

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
    },
  })

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
    },
  })

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
      order: 17,
      instructor: 'Emma Johnson',
      tags: 'design,ui-ux,pro',
      averageRating: 4.8,
      reviewCount: 723,
    },
  })

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
      order: 18,
      instructor: 'David Lopez',
      tags: 'trading,finance,pro',
      averageRating: 4.9,
      reviewCount: 445,
    },
  })

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
      order: 19,
      instructor: 'Sophia Martinez',
      tags: 'content,marketing,pro',
      averageRating: 4.8,
      reviewCount: 891,
    },
  })

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
      order: 20,
      instructor: 'Dr. Raj Patel',
      tags: 'data,analysis,pro',
      averageRating: 4.8,
      reviewCount: 612,
    },
  })

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
      order: 21,
      instructor: 'Jessica Lee',
      tags: 'coding,development,pro',
      averageRating: 4.9,
      reviewCount: 1234,
    },
  })

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
      order: 22,
      instructor: 'Ryan Chen',
      tags: 'python,automation,pro',
      averageRating: 4.9,
      reviewCount: 876,
    },
  })

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
      order: 23,
      instructor: 'Dr. Laura Kim',
      tags: 'rag,advanced,pro',
      averageRating: 4.9,
      reviewCount: 534,
    },
  })

  console.log('✅ Created PRO courses (14)')

  // ============================================
  // CERTIFICATION PROGRAMS
  // ============================================

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
      order: 24,
      instructor: 'Multiple Experts',
      tags: 'certification,professional,exam',
      averageRating: 4.9,
      reviewCount: 1567,
    },
  })

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
      order: 25,
      instructor: 'Senior Architects',
      tags: 'certification,architect,expert',
      averageRating: 4.9,
      reviewCount: 432,
    },
  })

  console.log('✅ Created Certification programs (2)')

  console.log('\n🎉 Academy seeding complete!')
  console.log('📊 Summary:')
  console.log('   - Free courses: 5 (including AI Agents Fundamentals & Masterclass)')
  console.log('   - SmartPromptIQ included: 4')
  console.log('   - Pro courses: 14')
  console.log('   - Certifications: 2')
  console.log('   - Total: 25 courses')
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
