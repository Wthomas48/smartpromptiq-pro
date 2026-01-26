"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const emailService_1 = __importDefault(require("../services/emailService"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * POST /api/academy/seed-courses
 * Seeds academy courses - protected by secret
 */
router.post('/seed-courses', async (req, res) => {
    try {
        const { secret } = req.body;
        const seedSecret = process.env.ADMIN_SEED_SECRET || process.env.JWT_SECRET;
        if (!secret || secret !== seedSecret) {
            return res.status(403).json({ success: false, message: 'Invalid secret' });
        }
        // Clear and reseed
        await prisma.courseReview.deleteMany();
        await prisma.lessonProgress.deleteMany();
        await prisma.enrollment.deleteMany();
        await prisma.lesson.deleteMany();
        await prisma.course.deleteMany();
        // FULL 57 COURSES CATALOG
        const courses = [
            // FREE TIER (3)
            { title: 'Prompt Writing 101', slug: 'prompt-writing-101', description: 'Master the fundamentals of prompt engineering. Learn structure, context, and how to write clear, effective prompts.', category: 'prompt-engineering', difficulty: 'beginner', duration: 180, accessTier: 'free', priceUSD: 0, isPublished: true, order: 1, instructor: 'Dr. Sarah Chen', tags: 'fundamentals,beginner,free', averageRating: 4.9, reviewCount: 1234, enrollmentCount: 5432 },
            { title: 'Introduction to AI Prompting', slug: 'introduction-to-ai-prompting', description: 'Understand how AI language models work and how to communicate with them effectively.', category: 'prompt-engineering', difficulty: 'beginner', duration: 120, accessTier: 'free', priceUSD: 0, isPublished: true, order: 2, instructor: 'Prof. Michael Zhang', tags: 'ai-basics,beginner,free', averageRating: 4.8, reviewCount: 892, enrollmentCount: 4123 },
            { title: 'SmartPromptIQ Product Tour', slug: 'smartpromptiq-product-tour', description: 'Complete walkthrough of SmartPromptIQ platform features and capabilities.', category: 'smartpromptiq', difficulty: 'beginner', duration: 90, accessTier: 'free', priceUSD: 0, isPublished: true, order: 3, instructor: 'Emma Rodriguez', tags: 'platform,tutorial,free', averageRating: 4.9, reviewCount: 567, enrollmentCount: 3456 },
            // SMARTPROMPTIQ SUBSCRIBER TIER (6)
            { title: 'SmartPromptIQ Basics', slug: 'smartpromptiq-basics', description: 'Complete guide to getting the most from your SmartPromptIQ subscription.', category: 'smartpromptiq', difficulty: 'beginner', duration: 240, accessTier: 'smartpromptiq_included', priceUSD: 0, isPublished: true, order: 4, instructor: 'David Kim', tags: 'platform,basics,included', averageRating: 4.9, reviewCount: 445, enrollmentCount: 2234 },
            { title: 'Advanced Routing & Execution', slug: 'advanced-routing-execution', description: "Master SmartPromptIQ's intelligent routing system and advanced execution modes.", category: 'smartpromptiq', difficulty: 'intermediate', duration: 300, accessTier: 'smartpromptiq_included', priceUSD: 0, isPublished: true, order: 5, instructor: 'Lisa Chen', tags: 'routing,advanced,included', averageRating: 4.8, reviewCount: 332, enrollmentCount: 1876 },
            { title: 'Advanced Prompt Chaining', slug: 'advanced-prompt-chaining', description: 'Build complex, multi-step prompt systems that solve sophisticated problems.', category: 'smartpromptiq', difficulty: 'advanced', duration: 360, accessTier: 'smartpromptiq_included', priceUSD: 0, isPublished: true, order: 6, instructor: 'Dr. James Wilson', tags: 'chaining,advanced,included', averageRating: 4.9, reviewCount: 278, enrollmentCount: 1543 },
            { title: 'Team Workflows & Collaboration', slug: 'team-workflows-collaboration', description: 'Set up and manage team-based prompting workflows in SmartPromptIQ.', category: 'smartpromptiq', difficulty: 'intermediate', duration: 180, accessTier: 'smartpromptiq_included', priceUSD: 0, isPublished: true, order: 7, instructor: 'Amanda Foster', tags: 'teams,collaboration,included', averageRating: 4.7, reviewCount: 189, enrollmentCount: 987 },
            { title: '50+ SmartPromptIQ Templates Library', slug: 'smartpromptiq-templates-library', description: 'Pre-built, customizable prompt templates for common business tasks.', category: 'smartpromptiq', difficulty: 'beginner', duration: 120, accessTier: 'smartpromptiq_included', priceUSD: 0, isPublished: true, order: 8, instructor: 'Template Team', tags: 'templates,resources,included', averageRating: 4.8, reviewCount: 456, enrollmentCount: 2345 },
            { title: 'Monthly Live Q&A Sessions', slug: 'monthly-live-qa-sessions', description: 'Interactive sessions with SmartPromptIQ experts.', category: 'smartpromptiq', difficulty: 'beginner', duration: 60, accessTier: 'smartpromptiq_included', priceUSD: 0, isPublished: true, order: 9, instructor: 'Expert Panel', tags: 'live,qa,community,included', averageRating: 4.9, reviewCount: 234, enrollmentCount: 1876 },
            // PRO TIER - Foundation (2)
            { title: 'Prompt Engineering Fundamentals', slug: 'prompt-engineering-fundamentals', description: 'Comprehensive foundation in professional prompt engineering.', category: 'prompt-engineering', difficulty: 'intermediate', duration: 480, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 10, instructor: 'Dr. Sarah Chen', tags: 'fundamentals,pro,foundation', averageRating: 4.9, reviewCount: 1567, enrollmentCount: 3456 },
            { title: 'AI Model Comparison & Selection', slug: 'ai-model-comparison-selection', description: 'Learn when to use GPT-4, Claude, Gemini, and other models.', category: 'prompt-engineering', difficulty: 'intermediate', duration: 240, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 11, instructor: 'Prof. Michael Zhang', tags: 'models,comparison,pro', averageRating: 4.8, reviewCount: 892, enrollmentCount: 2345 },
            // PRO TIER - Advanced Prompt Engineering (4)
            { title: 'Advanced Prompt Patterns', slug: 'advanced-prompt-patterns', description: 'Master sophisticated prompt design patterns used by experts.', category: 'prompt-engineering', difficulty: 'advanced', duration: 480, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 12, instructor: 'Dr. James Wilson', tags: 'advanced,patterns,pro', averageRating: 4.9, reviewCount: 723, enrollmentCount: 1876 },
            { title: 'Prompt Debugging & Optimization', slug: 'prompt-debugging-optimization', description: 'Systematic approaches to fixing and improving prompts.', category: 'prompt-engineering', difficulty: 'advanced', duration: 360, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 13, instructor: 'Alex Johnson', tags: 'debugging,optimization,pro', averageRating: 4.8, reviewCount: 654, enrollmentCount: 1543 },
            { title: 'Multi-Agent Prompt Systems', slug: 'multi-agent-prompt-systems', description: 'Build systems with multiple AI agents working together.', category: 'prompt-engineering', difficulty: 'advanced', duration: 600, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 14, instructor: 'Dr. Emily Carter', tags: 'multi-agent,advanced,pro', averageRating: 4.9, reviewCount: 445, enrollmentCount: 987 },
            { title: 'Prompt Security & Safety', slug: 'prompt-security-safety', description: 'Protect against prompt injection, jailbreaking, and misuse.', category: 'prompt-engineering', difficulty: 'intermediate', duration: 300, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 15, instructor: 'Marcus Davis', tags: 'security,safety,pro', averageRating: 4.7, reviewCount: 389, enrollmentCount: 1234 },
            // PRO TIER - DevOps (2)
            { title: 'DevOps Automation with AI', slug: 'devops-automation-ai', description: 'Build AI-powered DevOps workflows and automation systems.', category: 'devops', difficulty: 'intermediate', duration: 600, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 16, instructor: 'Carlos Rodriguez', tags: 'devops,automation,pro', averageRating: 4.9, reviewCount: 567, enrollmentCount: 1432 },
            { title: 'Kubernetes & Container Prompting', slug: 'kubernetes-container-prompting', description: 'AI-powered container orchestration and management.', category: 'devops', difficulty: 'advanced', duration: 360, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 17, instructor: 'Carlos Rodriguez', tags: 'kubernetes,containers,devops,pro', averageRating: 4.8, reviewCount: 345, enrollmentCount: 876 },
            // PRO TIER - Design (2)
            { title: 'AI Design Systems', slug: 'ai-design-systems', description: 'Create stunning designs with AI for UI/UX, branding, and graphics.', category: 'design', difficulty: 'intermediate', duration: 360, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 18, instructor: 'Emma Johnson', tags: 'design,ui-ux,pro', averageRating: 4.8, reviewCount: 723, enrollmentCount: 1654 },
            { title: 'Advanced Design Automation', slug: 'advanced-design-automation', description: 'Build AI-powered design workflows and creative systems.', category: 'design', difficulty: 'advanced', duration: 480, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 19, instructor: 'Emma Johnson', tags: 'design,automation,midjourney,pro', averageRating: 4.9, reviewCount: 456, enrollmentCount: 987 },
            // PRO TIER - Finance (2)
            { title: 'Trading & Finance AI', slug: 'trading-finance-ai', description: 'Build AI trading strategies and financial analysis systems.', category: 'finance', difficulty: 'advanced', duration: 720, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 20, instructor: 'David Lopez', tags: 'trading,finance,pro', averageRating: 4.9, reviewCount: 445, enrollmentCount: 1123 },
            { title: 'Algorithmic Trading with AI', slug: 'algorithmic-trading-ai', description: 'Advanced algorithmic trading using AI prompts.', category: 'finance', difficulty: 'expert', duration: 600, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 21, instructor: 'David Lopez', tags: 'algo-trading,finance,expert,pro', averageRating: 4.9, reviewCount: 289, enrollmentCount: 654 },
            // PRO TIER - Marketing (2)
            { title: 'Content Creation & Marketing', slug: 'content-creation-marketing', description: 'Master AI-powered content creation for marketing.', category: 'marketing', difficulty: 'intermediate', duration: 420, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 22, instructor: 'Sophia Martinez', tags: 'content,marketing,pro', averageRating: 4.8, reviewCount: 891, enrollmentCount: 2134 },
            { title: 'Video & Podcast Script Writing', slug: 'video-podcast-script-writing', description: 'Create compelling scripts for video and audio content.', category: 'marketing', difficulty: 'intermediate', duration: 300, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 23, instructor: 'Sophia Martinez', tags: 'video,podcast,scripting,pro', averageRating: 4.7, reviewCount: 567, enrollmentCount: 1234 },
            // PRO TIER - Data (2)
            { title: 'Data Analysis & Visualization', slug: 'data-analysis-visualization', description: 'Analyze data and create insights using AI prompts.', category: 'data', difficulty: 'intermediate', duration: 540, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 24, instructor: 'Dr. Raj Patel', tags: 'data,analysis,pro', averageRating: 4.8, reviewCount: 612, enrollmentCount: 1543 },
            { title: 'SQL & Database Prompting', slug: 'sql-database-prompting', description: 'Generate and optimize SQL queries with AI.', category: 'data', difficulty: 'intermediate', duration: 360, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 25, instructor: 'Dr. Raj Patel', tags: 'sql,database,pro', averageRating: 4.7, reviewCount: 445, enrollmentCount: 987 },
            // PRO TIER - Business (3)
            { title: 'Customer Support Automation', slug: 'customer-support-automation', description: 'Build AI-powered customer support systems.', category: 'business', difficulty: 'intermediate', duration: 420, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 26, instructor: 'Jennifer Williams', tags: 'support,automation,business,pro', averageRating: 4.8, reviewCount: 523, enrollmentCount: 1432 },
            { title: 'Sales Enablement with AI', slug: 'sales-enablement-ai', description: 'AI-powered sales processes and materials.', category: 'business', difficulty: 'intermediate', duration: 360, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 27, instructor: 'Robert Chen', tags: 'sales,business,pro', averageRating: 4.7, reviewCount: 389, enrollmentCount: 1123 },
            { title: 'Legal Document Analysis', slug: 'legal-document-analysis', description: 'Use AI to analyze and draft legal documents.', category: 'business', difficulty: 'advanced', duration: 480, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 28, instructor: 'Attorney Lisa Chang', tags: 'legal,analysis,business,pro', averageRating: 4.8, reviewCount: 267, enrollmentCount: 654 },
            // PRO TIER - Healthcare & Education (2)
            { title: 'Healthcare & Medical Prompting', slug: 'healthcare-medical-prompting', description: 'AI applications in healthcare and medical research.', category: 'healthcare', difficulty: 'advanced', duration: 600, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 29, instructor: 'Dr. Sarah Johnson MD', tags: 'healthcare,medical,hipaa,pro', averageRating: 4.9, reviewCount: 389, enrollmentCount: 765 },
            { title: 'Education & E-Learning', slug: 'education-e-learning', description: 'Create educational content and learning systems with AI.', category: 'education', difficulty: 'intermediate', duration: 420, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 30, instructor: 'Prof. Amanda White', tags: 'education,elearning,teaching,pro', averageRating: 4.8, reviewCount: 623, enrollmentCount: 1345 },
            // PRO TIER - Development (7)
            { title: 'Code Generation & Review', slug: 'code-generation-review', description: 'Master AI-assisted software development.', category: 'development', difficulty: 'advanced', duration: 540, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 31, instructor: 'Jessica Lee', tags: 'coding,development,pro', averageRating: 4.9, reviewCount: 1234, enrollmentCount: 2345 },
            { title: 'API Integration Prompting', slug: 'api-integration-prompting', description: 'Connect AI to external APIs and services.', category: 'development', difficulty: 'intermediate', duration: 360, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 32, instructor: 'Tom Harris', tags: 'api,integration,development,pro', averageRating: 4.7, reviewCount: 567, enrollmentCount: 1234 },
            { title: 'No-Code/Low-Code with AI', slug: 'no-code-low-code-ai', description: 'Build applications without traditional coding using AI.', category: 'development', difficulty: 'intermediate', duration: 300, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 33, instructor: 'Rachel Green', tags: 'no-code,zapier,automation,pro', averageRating: 4.8, reviewCount: 789, enrollmentCount: 1876 },
            { title: 'Python for Prompt Engineers', slug: 'python-prompt-engineers', description: 'Use Python to scale and automate prompt workflows.', category: 'development', difficulty: 'intermediate', duration: 600, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 34, instructor: 'Ryan Chen', tags: 'python,automation,pro', averageRating: 4.9, reviewCount: 876, enrollmentCount: 1654 },
            { title: 'JavaScript & Web Integration', slug: 'javascript-web-integration', description: 'Integrate AI prompts into web applications.', category: 'development', difficulty: 'intermediate', duration: 480, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 35, instructor: 'Alex Park', tags: 'javascript,web,development,pro', averageRating: 4.8, reviewCount: 654, enrollmentCount: 1432 },
            { title: 'Prompt Architecture & Design Patterns', slug: 'prompt-architecture-design-patterns', description: 'Enterprise-grade prompt system architecture.', category: 'development', difficulty: 'expert', duration: 720, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 36, instructor: 'Dr. Patricia Moore', tags: 'architecture,enterprise,expert,pro', averageRating: 4.9, reviewCount: 345, enrollmentCount: 678 },
            { title: 'Fine-Tuning & Custom Models', slug: 'fine-tuning-custom-models', description: 'When and how to fine-tune custom AI models.', category: 'development', difficulty: 'expert', duration: 900, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 37, instructor: 'Dr. Kevin Zhang', tags: 'fine-tuning,custom-models,expert,pro', averageRating: 4.9, reviewCount: 234, enrollmentCount: 567 },
            // PRO TIER - Advanced Frameworks (3)
            { title: 'RAG (Retrieval-Augmented Generation)', slug: 'rag-retrieval-augmented-generation', description: 'Build knowledge-enhanced AI systems.', category: 'development', difficulty: 'advanced', duration: 600, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 38, instructor: 'Dr. Laura Kim', tags: 'rag,advanced,pro', averageRating: 4.9, reviewCount: 534, enrollmentCount: 1123 },
            { title: 'LangChain & Framework Mastery', slug: 'langchain-framework-mastery', description: 'Master LangChain and other AI orchestration frameworks.', category: 'development', difficulty: 'advanced', duration: 720, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 39, instructor: 'Brandon Lee', tags: 'langchain,frameworks,advanced,pro', averageRating: 4.9, reviewCount: 678, enrollmentCount: 1234 },
            { title: 'Prompt Engineering for Enterprise', slug: 'prompt-engineering-enterprise', description: 'Deploy and manage AI at enterprise scale.', category: 'business', difficulty: 'expert', duration: 840, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 40, instructor: 'Margaret Thompson', tags: 'enterprise,governance,expert,pro', averageRating: 4.9, reviewCount: 456, enrollmentCount: 789 },
            // PRO TIER - Research & Creative (4)
            { title: 'AI Research Methods', slug: 'ai-research-methods', description: 'Use AI to accelerate research and discovery.', category: 'research', difficulty: 'advanced', duration: 600, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 41, instructor: 'Dr. Helen Foster', tags: 'research,academic,advanced,pro', averageRating: 4.8, reviewCount: 345, enrollmentCount: 678 },
            { title: 'Prompt Engineering for Scientific Computing', slug: 'prompt-engineering-scientific-computing', description: 'AI applications in scientific research.', category: 'research', difficulty: 'advanced', duration: 720, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 42, instructor: 'Dr. Richard Wang', tags: 'science,computing,research,pro', averageRating: 4.8, reviewCount: 267, enrollmentCount: 543 },
            { title: 'Creative Writing with AI', slug: 'creative-writing-ai', description: 'Write novels, stories, and creative content with AI.', category: 'creative', difficulty: 'intermediate', duration: 480, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 43, instructor: 'Author Monica Blake', tags: 'writing,creative,storytelling,pro', averageRating: 4.7, reviewCount: 567, enrollmentCount: 1234 },
            { title: 'Game Development & Interactive Fiction', slug: 'game-development-interactive-fiction', description: 'Create game narratives and interactive experiences.', category: 'creative', difficulty: 'intermediate', duration: 540, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 44, instructor: 'Game Designer Chris Miller', tags: 'gaming,narrative,interactive,pro', averageRating: 4.8, reviewCount: 445, enrollmentCount: 876 },
            // PRO TIER - Workshops & Events (3)
            { title: 'Weekly Live Workshops', slug: 'weekly-live-workshops', description: 'Hands-on workshops on trending topics.', category: 'events', difficulty: 'intermediate', duration: 120, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 45, instructor: 'Workshop Team', tags: 'live,workshops,events,pro', averageRating: 4.9, reviewCount: 789, enrollmentCount: 2345 },
            { title: 'Monthly Case Study Deep Dives', slug: 'monthly-case-study-deep-dives', description: 'Detailed analysis of real-world implementations.', category: 'events', difficulty: 'advanced', duration: 180, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 46, instructor: 'Industry Experts', tags: 'case-studies,real-world,events,pro', averageRating: 4.9, reviewCount: 567, enrollmentCount: 1876 },
            { title: 'Quarterly Hackathons', slug: 'quarterly-hackathons', description: 'Build AI projects, compete, win prizes.', category: 'events', difficulty: 'intermediate', duration: 2880, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 47, instructor: 'Hackathon Team', tags: 'hackathon,competition,events,pro', averageRating: 4.9, reviewCount: 445, enrollmentCount: 1234 },
            // CERTIFICATION PROGRAMS (6)
            { title: 'Certified Prompt Engineer (CPE)', slug: 'certified-prompt-engineer-cpe', description: 'Complete certification program with exam. Become a recognized Prompt Engineering professional.', category: 'certification', difficulty: 'advanced', duration: 2400, accessTier: 'certification', priceUSD: 29900, isPublished: true, order: 48, instructor: 'Certification Board', tags: 'certification,professional,exam', averageRating: 4.9, reviewCount: 1567, enrollmentCount: 3456 },
            { title: 'Certified SmartPromptIQ Architect (CSA)', slug: 'certified-smartpromptiq-architect-csa', description: 'Advanced architecture certification. Requires SmartPromptIQ subscription.', category: 'certification', difficulty: 'expert', duration: 3600, accessTier: 'certification', priceUSD: 39900, isPublished: true, order: 49, instructor: 'Senior Architects', tags: 'certification,architect,expert', averageRating: 4.9, reviewCount: 432, enrollmentCount: 987 },
            { title: 'Certified DevOps AI Engineer', slug: 'certified-devops-ai-engineer', description: 'DevOps + AI specialization certification.', category: 'certification', difficulty: 'advanced', duration: 2100, accessTier: 'certification', priceUSD: 29900, isPublished: true, order: 50, instructor: 'DevOps Experts', tags: 'certification,devops,specialist', averageRating: 4.8, reviewCount: 289, enrollmentCount: 567 },
            { title: 'Certified AI Design Specialist', slug: 'certified-ai-design-specialist', description: 'Design + AI specialization certification.', category: 'certification', difficulty: 'advanced', duration: 1800, accessTier: 'certification', priceUSD: 29900, isPublished: true, order: 51, instructor: 'Design Experts', tags: 'certification,design,specialist', averageRating: 4.8, reviewCount: 234, enrollmentCount: 456 },
            { title: 'Certified Financial AI Engineer', slug: 'certified-financial-ai-engineer', description: 'Finance + AI specialization certification.', category: 'certification', difficulty: 'advanced', duration: 2400, accessTier: 'certification', priceUSD: 29900, isPublished: true, order: 52, instructor: 'Finance Experts', tags: 'certification,finance,specialist', averageRating: 4.9, reviewCount: 178, enrollmentCount: 345 },
            { title: 'Certified Enterprise AI Architect', slug: 'certified-enterprise-ai-architect', description: 'Enterprise deployment specialization certification.', category: 'certification', difficulty: 'expert', duration: 3000, accessTier: 'certification', priceUSD: 39900, isPublished: true, order: 53, instructor: 'Enterprise Architects', tags: 'certification,enterprise,architect', averageRating: 4.9, reviewCount: 156, enrollmentCount: 289 },
            // BONUS RESOURCES (4)
            { title: 'Prompt Template Library (500+ Templates)', slug: 'prompt-template-library-500', description: 'Categorized, fully customizable prompt templates.', category: 'resources', difficulty: 'beginner', duration: 60, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 54, instructor: 'Template Team', tags: 'templates,resources,library,pro', averageRating: 4.9, reviewCount: 1234, enrollmentCount: 3456 },
            { title: 'AI Model Comparison Database', slug: 'ai-model-comparison-database', description: 'Real-time model performance data and cost calculators.', category: 'resources', difficulty: 'beginner', duration: 30, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 55, instructor: 'Research Team', tags: 'models,comparison,resources,pro', averageRating: 4.8, reviewCount: 876, enrollmentCount: 2345 },
            { title: 'Community Forum & Discord Access', slug: 'community-forum-discord-access', description: '24/7 peer support, expert office hours, project showcases.', category: 'resources', difficulty: 'beginner', duration: 0, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 56, instructor: 'Community Team', tags: 'community,discord,forum,pro', averageRating: 4.9, reviewCount: 2345, enrollmentCount: 5678 },
            { title: 'Resource Library & Downloads', slug: 'resource-library-downloads', description: 'E-books, guides, cheat sheets, video tutorials, newsletters.', category: 'resources', difficulty: 'beginner', duration: 0, accessTier: 'pro', priceUSD: 0, isPublished: true, order: 57, instructor: 'Content Team', tags: 'resources,downloads,library,pro', averageRating: 4.8, reviewCount: 1567, enrollmentCount: 4321 },
        ];
        for (const c of courses) {
            await prisma.course.create({ data: c });
        }
        // Add lessons for AI Agents Masterclass
        const mc = await prisma.course.findUnique({ where: { slug: 'ai-agents-masterclass' } });
        if (mc) {
            const lessons = [
                { title: 'Welcome to AI Agents', description: 'Introduction to AI agents and what you will learn', content: '# Welcome to AI Agents Masterclass!\n\nIn this course you will learn to build, deploy, and monetize AI chat agents.', duration: 5, order: 1, isFree: true },
                { title: 'Creating Your First AI Agent', description: 'Step-by-step guide to creating your first agent', content: '# Creating Your First AI Agent\n\n1. Go to AI Agents section\n2. Click Create Agent\n3. Fill in the details\n4. Get your API key', duration: 6, order: 2, isFree: true },
                { title: 'Writing Effective System Prompts', description: 'Master the CRISP framework for system prompts', content: '# Writing Effective System Prompts\n\n## The CRISP Framework\n\n- **C**ontext\n- **R**ole\n- **I**nstructions\n- **S**cope\n- **P**ersonality', duration: 7, order: 3, isFree: true },
                { title: 'Embedding Agents on Your Website', description: 'Technical guide to adding agents to any site', content: '# Embedding Agents\n\nAdd this script to your website:\n\n```html\n<script src="https://smartpromptiq.com/widget.js" data-agent="your-slug"></script>\n```', duration: 5, order: 4, isFree: true },
                { title: 'Advanced Features', description: 'Voice, analytics, and customization', content: '# Advanced Features\n\n- Voice capabilities\n- Analytics dashboard\n- Custom styling\n- Rate limiting', duration: 4, order: 5, isFree: true },
                { title: 'Monetization Strategies', description: 'Turn your agents into revenue', content: '# Monetization Strategies\n\n1. Sell as a service\n2. Lead generation\n3. Customer support savings\n4. Premium chat tiers', duration: 3, order: 6, isFree: true },
            ];
            for (const l of lessons) {
                await prisma.lesson.create({ data: { courseId: mc.id, ...l, isPublished: true } });
            }
        }
        const count = await prisma.course.count();
        res.json({ success: true, message: `Seeded ${count} courses`, count });
    }
    catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================
/**
 * GET /api/academy/courses
 * Get all published courses (public course catalog)
 */
router.get('/courses', async (req, res) => {
    try {
        const { category, difficulty, accessTier } = req.query;
        const where = {
            isPublished: true,
        };
        if (category)
            where.category = category;
        if (difficulty)
            where.difficulty = difficulty;
        if (accessTier)
            where.accessTier = accessTier;
        const courses = await prisma.course.findMany({
            where,
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
            include: {
                _count: {
                    select: {
                        lessons: true,
                        enrollments: true,
                        reviews: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: courses,
        });
    }
    catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch courses',
            error: error.message,
        });
    }
});
/**
 * GET /api/academy/search
 * Search courses and lessons
 * IMPORTANT: Must be defined BEFORE /courses/:slug to avoid route collision
 */
router.get('/search', async (req, res) => {
    try {
        const { q, category, difficulty, accessTier } = req.query;
        if (!q || typeof q !== 'string' || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters',
            });
        }
        const searchTerm = q.trim().toLowerCase();
        // Build filter conditions
        // Note: SQLite doesn't support mode: 'insensitive', so we use contains which is case-sensitive
        // Production (PostgreSQL) should use mode: 'insensitive' for case-insensitive search
        const courseWhere = {
            isPublished: true,
            OR: [
                { title: { contains: searchTerm } },
                { description: { contains: searchTerm } },
                { tags: { contains: searchTerm } },
                { instructor: { contains: searchTerm } },
            ],
        };
        if (category)
            courseWhere.category = category;
        if (difficulty)
            courseWhere.difficulty = difficulty;
        if (accessTier)
            courseWhere.accessTier = accessTier;
        // Search courses and lessons in parallel
        const [courses, lessons] = await Promise.all([
            prisma.course.findMany({
                where: courseWhere,
                include: {
                    _count: {
                        select: {
                            lessons: true,
                            enrollments: true,
                        },
                    },
                },
                take: 20, // Limit results
                orderBy: [
                    { enrollmentCount: 'desc' },
                    { averageRating: 'desc' },
                ],
            }),
            prisma.lesson.findMany({
                where: {
                    isPublished: true,
                    OR: [
                        { title: { contains: searchTerm } },
                        { description: { contains: searchTerm } },
                        { content: { contains: searchTerm } },
                    ],
                },
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            category: true,
                        },
                    },
                },
                take: 20,
            }),
        ]);
        res.json({
            success: true,
            data: {
                query: searchTerm,
                courses: {
                    count: courses.length,
                    results: courses,
                },
                lessons: {
                    count: lessons.length,
                    results: lessons,
                },
                totalResults: courses.length + lessons.length,
            },
        });
    }
    catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed',
            error: error.message,
        });
    }
});
/**
 * GET /api/academy/courses/:slug
 * Get single course by slug with lessons
 */
router.get('/courses/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const course = await prisma.course.findUnique({
            where: { slug },
            include: {
                lessons: {
                    where: { isPublished: true },
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        duration: true,
                        order: true,
                        isFree: true,
                        // Don't include content yet - requires enrollment
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                        reviews: true,
                    },
                },
            },
        });
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }
        res.json({
            success: true,
            data: course,
        });
    }
    catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch course',
            error: error.message,
        });
    }
});
// ============================================
// AUTHENTICATED ROUTES (Auth middleware required)
// ============================================
// Note: Add your auth middleware before these routes in server.ts
/**
 * GET /api/academy/my-courses
 * Get user's enrolled courses
 */
router.get('/my-courses', auth_1.authenticate, async (req, res) => {
    try {
        // @ts-ignore - userId comes from auth middleware
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
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
            orderBy: { enrolledAt: 'desc' },
        });
        res.json({
            success: true,
            data: enrollments,
        });
    }
    catch (error) {
        console.error('Error fetching user courses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enrolled courses',
            error: error.message,
        });
    }
});
/**
 * POST /api/academy/enroll
 * Enroll user in a course
 */
router.post('/enroll', auth_1.authenticate, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const { courseId, enrollmentType, paymentId } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }
        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });
        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled in this course',
                data: existingEnrollment,
            });
        }
        // Create enrollment
        const enrollment = await prisma.enrollment.create({
            data: {
                userId,
                courseId,
                enrollmentType: enrollmentType || 'free',
                paymentId,
                status: 'active',
            },
            include: {
                course: {
                    include: {
                        lessons: {
                            where: { isPublished: true },
                        },
                    },
                },
            },
        });
        // Update course enrollment count
        await prisma.course.update({
            where: { id: courseId },
            data: {
                enrollmentCount: {
                    increment: 1,
                },
            },
        });
        // Get user details for email
        // @ts-ignore
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                firstName: true,
                lastName: true,
            },
        });
        // Send enrollment confirmation email (non-blocking)
        if (user) {
            console.log(`📧 Sending enrollment email to ${user.email} for course: ${enrollment.course.title}`);
            setImmediate(async () => {
                try {
                    await emailService_1.default.sendAcademyEnrollmentEmail(user.email, user.firstName || 'Student', {
                        title: enrollment.course.title,
                        slug: enrollment.course.slug,
                        lessonCount: enrollment.course.lessons.length,
                        duration: enrollment.course.duration,
                        difficulty: enrollment.course.difficulty,
                        instructor: enrollment.course.instructor || undefined,
                    });
                    console.log(`✅ Enrollment email sent to ${user.email}`);
                }
                catch (error) {
                    console.error(`❌ Failed to send enrollment email to ${user.email}:`, error);
                    // Email failure doesn't affect enrollment success
                }
            });
        }
        res.json({
            success: true,
            message: 'Successfully enrolled in course',
            data: enrollment,
        });
    }
    catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to enroll in course',
            error: error.message,
        });
    }
});
/**
 * GET /api/academy/lesson/:lessonId
 * Get lesson content (requires enrollment or free lesson)
 * NOTE: Free lessons can be accessed without authentication
 */
router.get('/lesson/:lessonId', async (req, res) => {
    try {
        const { lessonId } = req.params;
        // Get auth token if present (optional for free lessons)
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        let userId = null;
        // Try to authenticate if token present
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                userId = decoded.userId;
            }
            catch (err) {
                // Invalid token - continue as unauthenticated user
                console.log('Invalid token, continuing as unauthenticated user');
            }
        }
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
            return res.status(404).json({
                success: false,
                message: 'Lesson not found',
            });
        }
        // Check access
        // Free lessons are accessible to everyone (even unauthenticated users)
        // Paid lessons require enrollment
        let hasAccess = lesson.isFree;
        if (!hasAccess && userId) {
            // Only check enrollment if user is authenticated
            hasAccess = await checkCourseAccess(userId, lesson.courseId);
        }
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: lesson.isFree
                    ? 'This lesson is free but you must sign in to track your progress.'
                    : 'Access denied. Please enroll in this course to access this lesson.',
                requiresAuth: !userId,
                requiresEnrollment: !lesson.isFree,
            });
        }
        // Get user's progress for this lesson (only if authenticated)
        let progress = null;
        if (userId) {
            progress = await prisma.lessonProgress.findUnique({
                where: {
                    userId_lessonId: {
                        userId,
                        lessonId,
                    },
                },
            });
        }
        // Find next and previous lessons
        const currentIndex = lesson.course.lessons.findIndex((l) => l.id === lessonId);
        const nextLesson = currentIndex < lesson.course.lessons.length - 1
            ? lesson.course.lessons[currentIndex + 1]
            : null;
        const previousLesson = currentIndex > 0
            ? lesson.course.lessons[currentIndex - 1]
            : null;
        res.json({
            success: true,
            data: {
                lesson,
                course: lesson.course,
                progress,
                nextLesson,
                previousLesson,
            },
        });
    }
    catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lesson',
            error: error.message,
        });
    }
});
/**
 * POST /api/academy/progress/:lessonId
 * Update lesson progress
 */
router.post('/progress/:lessonId', auth_1.authenticate, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const { lessonId } = req.params;
        const { completed, timeSpent, lastPosition, quizScore, userNotes } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        const progress = await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId,
                },
            },
            update: {
                completed,
                timeSpent: timeSpent ? { increment: timeSpent } : undefined,
                lastPosition,
                quizScore,
                userNotes,
                completedAt: completed ? new Date() : undefined,
            },
            create: {
                userId,
                lessonId,
                completed: completed || false,
                timeSpent: timeSpent || 0,
                lastPosition,
                quizScore,
                userNotes,
                completedAt: completed ? new Date() : undefined,
            },
        });
        // Update enrollment progress
        await updateEnrollmentProgress(userId, lessonId);
        res.json({
            success: true,
            message: 'Progress updated successfully',
            data: progress,
        });
    }
    catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update progress',
            error: error.message,
        });
    }
});
/**
 * GET /api/academy/admin/stats
 * Get academy analytics for admin dashboard (requires admin auth)
 */
router.get('/admin/stats', auth_1.authenticate, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        // Check if user is admin
        // @ts-ignore
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required',
            });
        }
        // Get academy statistics
        const [totalCourses, publishedCourses, totalEnrollments, activeEnrollments, completedCourses, totalCertificates, totalLessons, recentEnrollments, topCourses,] = await Promise.all([
            prisma.course.count(),
            prisma.course.count({ where: { isPublished: true } }),
            prisma.enrollment.count(),
            prisma.enrollment.count({ where: { status: 'active' } }),
            prisma.enrollment.count({ where: { status: 'completed' } }),
            prisma.certificate.count(),
            prisma.lesson.count({ where: { isPublished: true } }),
            prisma.enrollment.findMany({
                take: 10,
                orderBy: { enrolledAt: 'desc' },
                include: {
                    course: true,
                },
            }),
            prisma.course.findMany({
                take: 5,
                orderBy: { enrollmentCount: 'desc' },
                where: { isPublished: true },
                include: {
                    _count: {
                        select: {
                            enrollments: true,
                            reviews: true,
                        },
                    },
                },
            }),
        ]);
        // Get enrollment growth (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentEnrollmentCount = await prisma.enrollment.count({
            where: {
                enrolledAt: {
                    gte: thirtyDaysAgo,
                },
            },
        });
        // Get completion rate
        const completionRate = totalEnrollments > 0
            ? Math.round((completedCourses / totalEnrollments) * 100)
            : 0;
        res.json({
            success: true,
            data: {
                overview: {
                    totalCourses,
                    publishedCourses,
                    totalEnrollments,
                    activeEnrollments,
                    completedCourses,
                    totalCertificates,
                    totalLessons,
                    completionRate,
                    recentEnrollments: recentEnrollmentCount,
                },
                recentActivity: recentEnrollments,
                topCourses,
            },
        });
    }
    catch (error) {
        console.error('Error fetching academy admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch academy statistics',
            error: error.message,
        });
    }
});
/**
 * POST /api/academy/lesson/:lessonId/rating
 * Submit or update lesson rating and feedback
 */
router.post('/lesson/:lessonId/rating', auth_1.authenticate, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const { lessonId } = req.params;
        const { rating, feedback } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5 stars',
            });
        }
        // Check if lesson exists
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found',
            });
        }
        // Check if user has access to this lesson (enrolled or free)
        const hasAccess = lesson.isFree || await checkCourseAccess(userId, lesson.courseId);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'You must be enrolled in this course to rate lessons',
            });
        }
        // Create or update rating in lessonProgress
        const progress = await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId,
                },
            },
            update: {
                rating,
                feedback: feedback || null,
            },
            create: {
                userId,
                lessonId,
                rating,
                feedback: feedback || null,
                completed: false,
            },
        });
        res.json({
            success: true,
            message: 'Rating submitted successfully',
            data: {
                rating: progress.rating,
                feedback: progress.feedback,
            },
        });
    }
    catch (error) {
        console.error('Error submitting lesson rating:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit rating',
            error: error.message,
        });
    }
});
/**
 * GET /api/academy/dashboard
 * Get user's academy dashboard data
 */
router.get('/dashboard', auth_1.authenticate, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        // Get user's enrollments with progress
        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        lessons: {
                            where: { isPublished: true },
                        },
                    },
                },
            },
        });
        // Get overall progress stats
        const totalLessonsCompleted = await prisma.lessonProgress.count({
            where: {
                userId,
                completed: true,
            },
        });
        // Get certificates
        const certificates = await prisma.certificate.findMany({
            where: { userId },
            orderBy: { issuedAt: 'desc' },
        });
        // Get recent activity
        const recentProgress = await prisma.lessonProgress.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            include: {
                lesson: {
                    include: {
                        course: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: {
                enrollments,
                stats: {
                    coursesEnrolled: enrollments.length,
                    coursesCompleted: enrollments.filter((e) => e.status === 'completed').length,
                    lessonsCompleted: totalLessonsCompleted,
                    certificatesEarned: certificates.length,
                },
                certificates,
                recentActivity: recentProgress,
            },
        });
    }
    catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message,
        });
    }
});
// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Check if user has access to a course
 * Requires both:
 * 1. Active enrollment OR course is free
 * 2. Appropriate subscription tier for the course accessTier
 */
async function checkCourseAccess(userId, courseId) {
    try {
        // Get course details
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { accessTier: true },
        });
        if (!course)
            return false;
        // Get user subscription tier
        // @ts-ignore
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionTier: true },
        });
        if (!user)
            return false;
        // Check subscription tier access
        const hasSubscriptionAccess = checkSubscriptionAccess(user.subscriptionTier, course.accessTier);
        if (!hasSubscriptionAccess) {
            console.log(`❌ Access denied: User tier "${user.subscriptionTier}" cannot access course with accessTier "${course.accessTier}"`);
            return false;
        }
        // Check enrollment status
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });
        const hasEnrollment = enrollment?.status === 'active';
        console.log(`✅ Access check: User ${userId} has tier "${user.subscriptionTier}", course requires "${course.accessTier}", enrollment: ${hasEnrollment}`);
        return hasEnrollment;
    }
    catch (error) {
        console.error('Error checking course access:', error);
        return false;
    }
}
/**
 * Check if a user's subscription tier allows access to a course's access tier
 */
function checkSubscriptionAccess(userTier, courseAccessTier) {
    // Free tier: Only free courses
    if (userTier === 'free') {
        return courseAccessTier === 'free';
    }
    // Academy tier: Free + Academy courses
    if (userTier === 'academy' || userTier === 'starter') {
        return courseAccessTier === 'free' || courseAccessTier === 'academy';
    }
    // Pro tier and above: Access to all courses (free, academy, pro, certification)
    if (userTier === 'pro' || userTier === 'business' || userTier === 'enterprise') {
        return true;
    }
    // Default deny
    return false;
}
/**
 * Update enrollment progress based on completed lessons
 */
async function updateEnrollmentProgress(userId, lessonId) {
    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                course: {
                    include: {
                        lessons: {
                            where: { isPublished: true },
                        },
                    },
                },
            },
        });
        if (!lesson)
            return;
        const totalLessons = lesson.course.lessons.length;
        const completedLessons = await prisma.lessonProgress.count({
            where: {
                userId,
                lessonId: {
                    in: lesson.course.lessons.map((l) => l.id),
                },
                completed: true,
            },
        });
        const progressPercentage = (completedLessons / totalLessons) * 100;
        const isNewlyCompleted = progressPercentage === 100;
        // Check if enrollment was previously completed
        const currentEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: lesson.courseId,
                },
            },
        });
        const wasAlreadyCompleted = currentEnrollment?.status === 'completed';
        await prisma.enrollment.update({
            where: {
                userId_courseId: {
                    userId,
                    courseId: lesson.courseId,
                },
            },
            data: {
                progress: progressPercentage,
                completedAt: progressPercentage === 100 ? new Date() : null,
                status: progressPercentage === 100 ? 'completed' : 'active',
                lastAccessedAt: new Date(),
            },
        });
        // If course just completed, create certificate and send email
        if (isNewlyCompleted && !wasAlreadyCompleted) {
            await handleCourseCompletion(userId, lesson.courseId, lesson.course.title);
        }
    }
    catch (error) {
        console.error('Error updating enrollment progress:', error);
    }
}
/**
 * Handle course completion - create certificate and send email
 */
async function handleCourseCompletion(userId, courseId, courseTitle) {
    try {
        // Get user details
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                firstName: true,
                lastName: true,
            },
        });
        if (!user)
            return;
        // Get total lessons completed and time spent
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                lessons: {
                    where: { isPublished: true },
                },
            },
        });
        if (!course)
            return;
        const lessonProgressData = await prisma.lessonProgress.findMany({
            where: {
                userId,
                lessonId: {
                    in: course.lessons.map((l) => l.id),
                },
            },
        });
        const totalTimeSpent = lessonProgressData.reduce((sum, lp) => sum + (lp.timeSpent || 0), 0);
        const timeInHours = Math.round(totalTimeSpent / 60);
        // Create certificate
        const certificate = await prisma.certificate.create({
            data: {
                userId,
                courseId,
                courseTitle,
                studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                issuedAt: new Date(),
            },
        });
        console.log(`🏆 Certificate created for ${user.email} - Course: ${courseTitle}`);
        // Send certificate email (non-blocking)
        setImmediate(async () => {
            try {
                await emailService_1.default.sendAcademyCertificateEmail(user.email, user.firstName || 'Student', {
                    courseTitle,
                    certificateId: certificate.id,
                    completionDate: certificate.issuedAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }),
                    lessonsCompleted: course.lessons.length,
                    timeSpent: timeInHours || 1,
                });
                console.log(`✅ Certificate email sent to ${user.email}`);
            }
            catch (error) {
                console.error(`❌ Failed to send certificate email to ${user.email}:`, error);
            }
        });
    }
    catch (error) {
        console.error('Error handling course completion:', error);
    }
}
exports.default = router;
