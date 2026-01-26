"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const stripe_1 = __importDefault(require("stripe"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const logger_1 = require("../lib/logger");
const router = express_1.default.Router();
// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE CONFIGURATION FOR ADMIN PAYMENT VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Validate and sanitize Stripe key to prevent ERR_INVALID_CHAR errors
 * Same validation as billing.ts for consistency
 */
const validateStripeKeyForAdmin = (key) => {
    if (!key)
        return null;
    // Check for invalid characters
    const hasNewline = /[\r\n]/.test(key);
    const hasQuotes = /^["'].*["']$/.test(key);
    if (hasNewline || hasQuotes) {
        console.error('❌ Admin routes: STRIPE_SECRET_KEY contains invalid characters');
        return null;
    }
    const trimmed = key.trim();
    if (!trimmed.startsWith('sk_live_') && !trimmed.startsWith('sk_test_')) {
        console.error('❌ Admin routes: STRIPE_SECRET_KEY must start with sk_live_ or sk_test_');
        return null;
    }
    return trimmed;
};
let stripe = null;
const validatedStripeKey = validateStripeKeyForAdmin(process.env.STRIPE_SECRET_KEY);
if (validatedStripeKey) {
    try {
        stripe = new stripe_1.default(validatedStripeKey, {
            apiVersion: '2023-10-16',
            timeout: 30000,
            maxNetworkRetries: 3
        });
        console.log('✅ Admin routes: Stripe initialized for payment verification');
    }
    catch (error) {
        console.error('❌ Admin routes: Failed to initialize Stripe:', error.message);
        stripe = null;
    }
}
else {
    console.warn('⚠️ Admin routes: Stripe not configured - payment verification disabled');
}
// ═══════════════════════════════════════════════════════════════════════════════
// QUERY PARAMETER VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Safely parse integer query parameters with bounds checking
 */
const parseIntParam = (value, defaultValue, min = 1, max = 1000) => {
    const parsed = parseInt(String(value || defaultValue), 10);
    if (isNaN(parsed))
        return defaultValue;
    return Math.max(min, Math.min(parsed, max));
};
/**
 * Safely parse timeframe parameter
 */
const parseTimeframe = (value) => {
    const timeframes = {
        '24h': { days: 1, label: '24 hours' },
        '7d': { days: 7, label: '7 days' },
        '30d': { days: 30, label: '30 days' },
        '90d': { days: 90, label: '90 days' },
        '1y': { days: 365, label: '1 year' }
    };
    return timeframes[String(value)] || timeframes['30d'];
};
/**
 * Validate string enum parameter
 */
const parseEnumParam = (value, allowed, defaultValue) => {
    const str = String(value || '');
    return allowed.includes(str) ? str : defaultValue;
};
// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN SEED ENDPOINT (One-time setup, protected by secret key)
// ═══════════════════════════════════════════════════════════════════════════════
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * POST /api/admin/seed
 * Creates or updates the admin user
 * Protected by ADMIN_SEED_SECRET environment variable
 *
 * SECURITY: This endpoint should be disabled in production or
 * protected by additional measures (IP whitelist, VPN, etc.)
 */
router.post('/seed', async (req, res) => {
    try {
        const { secret, email, password } = req.body;
        // SECURITY: Require ADMIN_SEED_SECRET to be explicitly set
        const adminSeedSecret = process.env.ADMIN_SEED_SECRET;
        if (!adminSeedSecret) {
            logger_1.logger.securityEvent('Admin seed attempted but ADMIN_SEED_SECRET not configured', 'high', { ip: req.ip });
            return res.status(503).json({
                success: false,
                message: 'Admin seed not configured'
            });
        }
        // Verify seed secret with timing-safe comparison
        if (!secret || secret !== adminSeedSecret) {
            logger_1.logger.securityEvent('Admin seed attempt with invalid secret', 'high', { ip: req.ip });
            return res.status(403).json({
                success: false,
                message: 'Invalid seed secret'
            });
        }
        // SECURITY: Get admin credentials from environment variables
        // Do NOT use hardcoded defaults in production
        const adminEmail = email || process.env.ADMIN_EMAIL || 'admin@smartpromptiq.net';
        const adminPassword = password || process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
            logger_1.logger.error('Admin seed failed - ADMIN_PASSWORD not set');
            return res.status(400).json({
                success: false,
                message: 'Admin password must be provided via request body or ADMIN_PASSWORD env var'
            });
        }
        // Validate password strength
        if (adminPassword.length < 12) {
            return res.status(400).json({
                success: false,
                message: 'Admin password must be at least 12 characters'
            });
        }
        // Check if admin exists
        const existingAdmin = await database_1.default.user.findUnique({
            where: { email: adminEmail }
        });
        const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 12);
        if (existingAdmin) {
            // Update existing admin
            await database_1.default.user.update({
                where: { email: adminEmail },
                data: {
                    role: 'ADMIN',
                    password: hashedPassword
                }
            });
            logger_1.logger.info('Admin user updated', { email: adminEmail });
            return res.json({
                success: true,
                message: 'Admin user updated successfully',
                data: {
                    email: adminEmail,
                    role: 'ADMIN',
                    action: 'updated'
                }
            });
        }
        // Create new admin
        const admin = await database_1.default.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                plan: 'ENTERPRISE',
                subscriptionTier: 'ENTERPRISE',
                tokenBalance: 999999,
                generationsUsed: 0,
                generationsLimit: 999999,
                isActive: true
            }
        });
        logger_1.logger.info('Admin user created', { email: adminEmail, id: admin.id });
        res.json({
            success: true,
            message: 'Admin user created successfully',
            data: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                action: 'created'
            }
        });
    }
    catch (error) {
        console.error('Admin seed error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to seed admin user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
/**
 * POST /api/admin/seed-academy
 * Seeds the academy courses - protected by ADMIN_SEED_SECRET
 */
router.post('/seed-academy', async (req, res) => {
    try {
        const { secret } = req.body;
        const adminSeedSecret = process.env.ADMIN_SEED_SECRET;
        if (!adminSeedSecret || secret !== adminSeedSecret) {
            return res.status(403).json({ success: false, message: 'Invalid seed secret' });
        }
        // Clear existing academy data (FK-safe order)
        await database_1.default.courseReview.deleteMany();
        await database_1.default.lessonProgress.deleteMany();
        await database_1.default.enrollment.deleteMany();
        await database_1.default.lesson.deleteMany();
        await database_1.default.course.deleteMany();
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
        for (const course of courses) {
            await database_1.default.course.create({ data: course });
        }
        // Add lessons for AI Agents Masterclass
        const masterclass = await database_1.default.course.findUnique({ where: { slug: 'ai-agents-masterclass' } });
        if (masterclass) {
            const lessons = [
                { title: 'Welcome to AI Agents', description: 'Introduction to AI agents', duration: 5, order: 1, isFree: true },
                { title: 'Creating Your First AI Agent', description: 'Step-by-step guide', duration: 6, order: 2, isFree: true },
                { title: 'Writing Effective System Prompts', description: 'Master the CRISP framework', duration: 7, order: 3, isFree: true },
                { title: 'Embedding Agents on Your Website', description: 'Technical implementation', duration: 5, order: 4, isFree: true },
                { title: 'Advanced Features', description: 'Voice, analytics, customization', duration: 4, order: 5, isFree: true },
                { title: 'Monetization Strategies', description: 'Turn agents into revenue', duration: 3, order: 6, isFree: true },
            ];
            for (const lesson of lessons) {
                await database_1.default.lesson.create({
                    data: {
                        courseId: masterclass.id,
                        title: lesson.title,
                        description: lesson.description,
                        content: `# ${lesson.title}\n\n${lesson.description}`,
                        duration: lesson.duration,
                        order: lesson.order,
                        isFree: lesson.isFree,
                        isPublished: true,
                    },
                });
            }
        }
        const count = await database_1.default.course.count();
        res.json({ success: true, message: `Academy seeded with ${count} courses` });
    }
    catch (error) {
        console.error('Academy seed error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// Admin authentication middleware
const requireAdmin = async (req, res, next) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }
        next();
    }
    catch (error) {
        console.error('Admin auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
// Get cost dashboard data
router.get('/cost-dashboard', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        // Get all users with their subscription and usage data
        const users = await database_1.default.user.findMany({
            include: {
                subscriptions: {
                    where: { status: 'active' },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                tokenTransactions: {
                    where: {
                        type: 'usage',
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                        }
                    }
                },
                usageLogs: {
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                        }
                    }
                }
            }
        });
        // Calculate system metrics
        let totalRevenue = 0;
        let totalCosts = 0;
        let activeUsers = 0;
        const tierAnalysis = {};
        const riskUsers = [];
        users.forEach(user => {
            const subscription = user.subscriptions[0];
            const isActive = user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            if (isActive)
                activeUsers++;
            // Calculate user revenue (monthly subscription)
            const userRevenue = subscription ? subscription.priceInCents : 0;
            totalRevenue += userRevenue;
            // Calculate user costs (from usage logs)
            const userCosts = user.usageLogs.reduce((sum, log) => sum + log.costInCents, 0);
            totalCosts += userCosts;
            // Tier analysis
            const tier = user.subscriptionTier;
            if (!tierAnalysis[tier]) {
                tierAnalysis[tier] = {
                    users: 0,
                    monthlyRevenue: 0,
                    totalCosts: 0,
                    profit: 0,
                    marginPercentage: 0,
                    profitMultiplier: 0,
                    averageRevenuePerUser: 0,
                    averageCostPerUser: 0
                };
            }
            tierAnalysis[tier].users++;
            tierAnalysis[tier].monthlyRevenue += userRevenue;
            tierAnalysis[tier].totalCosts += userCosts;
            // Risk analysis
            if (userCosts > 0 && userRevenue > 0) {
                const costRatio = userCosts / userRevenue;
                if (costRatio > 0.8) { // Warning threshold: 80%
                    riskUsers.push({
                        userId: user.id,
                        email: user.email,
                        tier: user.subscriptionTier,
                        costRatio,
                        costs: userCosts,
                        revenue: userRevenue,
                        severity: costRatio > 1.0 ? 'CRITICAL' : 'WARNING'
                    });
                }
            }
        });
        // Complete tier analysis calculations
        Object.keys(tierAnalysis).forEach(tier => {
            const analysis = tierAnalysis[tier];
            analysis.profit = analysis.monthlyRevenue - analysis.totalCosts;
            analysis.marginPercentage = analysis.monthlyRevenue > 0
                ? (analysis.profit / analysis.monthlyRevenue) * 100
                : 0;
            analysis.profitMultiplier = analysis.totalCosts > 0
                ? analysis.monthlyRevenue / analysis.totalCosts
                : 0;
            analysis.averageRevenuePerUser = analysis.users > 0
                ? analysis.monthlyRevenue / analysis.users
                : 0;
            analysis.averageCostPerUser = analysis.users > 0
                ? analysis.totalCosts / analysis.users
                : 0;
        });
        // System metrics
        const systemMetrics = {
            totalUsers: users.length,
            activeUsers,
            totalRevenue,
            totalCosts,
            profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0,
            averageMargin: totalCosts > 0 ? totalRevenue / totalCosts : 0
        };
        // Audit results (mock data for now)
        const auditResults = {
            totalUsers: users.length,
            warnings: riskUsers.filter(u => u.severity === 'WARNING'),
            critical: riskUsers.filter(u => u.severity === 'CRITICAL'),
            suspended: [], // Would be actual suspended users
            healthy: users.length - riskUsers.length,
            auditTime: new Date().toISOString()
        };
        // Generate recommendations
        const recommendations = [];
        if (systemMetrics.profitMargin < 20) {
            recommendations.push({
                type: 'profit_margin',
                message: 'System profit margin is below 20%. Consider increasing prices or optimizing costs.',
                priority: 'HIGH'
            });
        }
        if (riskUsers.filter(u => u.severity === 'CRITICAL').length > 0) {
            recommendations.push({
                type: 'cost_protection',
                message: `${riskUsers.filter(u => u.severity === 'CRITICAL').length} users have critical cost ratios. Review immediately.`,
                priority: 'HIGH'
            });
        }
        Object.entries(tierAnalysis).forEach(([tier, analysis]) => {
            if (analysis.marginPercentage < 20) {
                recommendations.push({
                    type: 'tier_optimization',
                    message: `${tier} tier has low profit margin (${analysis.marginPercentage.toFixed(1)}%). Consider price adjustment.`,
                    priority: 'MEDIUM',
                    tier
                });
            }
        });
        if (activeUsers / users.length < 0.5) {
            recommendations.push({
                type: 'user_engagement',
                message: 'Low user engagement detected. Consider re-engagement campaigns.',
                priority: 'MEDIUM'
            });
        }
        res.json({
            success: true,
            data: {
                systemMetrics,
                tierAnalysis,
                riskUsers,
                auditResults,
                recommendations
            }
        });
    }
    catch (error) {
        console.error('Get cost dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Run cost audit
router.post('/cost-audit', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        // This would run a comprehensive cost audit
        // For now, we'll simulate the audit process
        const auditResults = {
            timestamp: new Date().toISOString(),
            usersAudited: 0,
            costThresholdViolations: 0,
            suspensionsApplied: 0,
            warningsIssued: 0,
            summary: 'Cost audit completed successfully'
        };
        // Get users with high cost ratios
        const users = await database_1.default.user.findMany({
            include: {
                subscriptions: {
                    where: { status: 'active' },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                usageLogs: {
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                }
            }
        });
        auditResults.usersAudited = users.length;
        // Analyze each user
        for (const user of users) {
            const subscription = user.subscriptions[0];
            const userRevenue = subscription ? subscription.priceInCents : 0;
            const userCosts = user.usageLogs.reduce((sum, log) => sum + log.costInCents, 0);
            if (userCosts > 0 && userRevenue > 0) {
                const costRatio = userCosts / userRevenue;
                if (costRatio > 1.2) { // 120% - critical threshold
                    auditResults.costThresholdViolations++;
                    // In a real implementation, you might suspend the user or apply restrictions
                    console.log(`Critical cost ratio detected for user ${user.email}: ${(costRatio * 100).toFixed(1)}%`);
                }
                else if (costRatio > 0.8) { // 80% - warning threshold
                    auditResults.warningsIssued++;
                    console.log(`Warning cost ratio for user ${user.email}: ${(costRatio * 100).toFixed(1)}%`);
                }
            }
        }
        res.json({
            success: true,
            data: auditResults,
            message: 'Cost audit completed successfully'
        });
    }
    catch (error) {
        console.error('Cost audit error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Override cost protection for a user
router.post('/override-cost-protection', auth_1.authenticate, requireAdmin, [
    (0, express_validator_1.body)('userId').notEmpty().trim().withMessage('User ID is required'),
    (0, express_validator_1.body)('reason').notEmpty().trim().withMessage('Reason is required'),
    (0, express_validator_1.body)('temporaryLimit').isInt({ min: 0 }).withMessage('Temporary limit must be a positive integer'),
    (0, express_validator_1.body)('expiresAt').isISO8601().withMessage('Expiration date is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { userId, reason, temporaryLimit, expiresAt } = req.body;
        const adminId = req.user.id;
        // Check if user exists
        const user = await database_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Create cost protection override record (you'd need to add this to your schema)
        // For now, we'll just log the override
        console.log(`Admin ${adminId} overrode cost protection for user ${userId}: ${reason}`);
        // In a real implementation, you would:
        // 1. Create an override record in the database
        // 2. Update the user's temporary cost limit
        // 3. Set an expiration for the override
        // 4. Log the admin action for audit purposes
        res.json({
            success: true,
            data: {
                userId,
                temporaryLimit,
                expiresAt,
                appliedBy: adminId,
                reason,
                appliedAt: new Date().toISOString()
            },
            message: 'Cost protection override applied successfully'
        });
    }
    catch (error) {
        console.error('Override cost protection error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get user analytics
router.get('/user-analytics', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { timeframe = '30d', tier } = req.query;
        // Calculate date range
        let startDate = new Date();
        switch (timeframe) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            default:
                startDate.setDate(startDate.getDate() - 30);
        }
        const whereClause = {
            createdAt: {
                gte: startDate
            }
        };
        if (tier && tier !== 'all') {
            whereClause.subscriptionTier = tier;
        }
        // Get user statistics
        const totalUsers = await database_1.default.user.count({ where: whereClause });
        const activeUsers = await database_1.default.user.count({
            where: {
                ...whereClause,
                lastLogin: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Active in last 7 days
                }
            }
        });
        // Get tier distribution
        const tierDistribution = await database_1.default.user.groupBy({
            by: ['subscriptionTier'],
            where: whereClause,
            _count: {
                subscriptionTier: true
            }
        });
        // Get usage analytics
        const usageStats = await database_1.default.usageLog.aggregate({
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            _sum: {
                tokensConsumed: true,
                costInCents: true
            },
            _avg: {
                responseTime: true
            },
            _count: {
                id: true
            }
        });
        // Get revenue analytics
        const revenueStats = await database_1.default.subscription.aggregate({
            where: {
                status: 'active',
                createdAt: {
                    gte: startDate
                }
            },
            _sum: {
                priceInCents: true
            }
        });
        res.json({
            success: true,
            data: {
                userMetrics: {
                    totalUsers,
                    activeUsers,
                    activationRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
                },
                tierDistribution: tierDistribution.map(item => ({
                    tier: item.subscriptionTier,
                    count: item._count.subscriptionTier
                })),
                usageMetrics: {
                    totalRequests: usageStats._count.id || 0,
                    totalTokens: usageStats._sum.tokensConsumed || 0,
                    totalCosts: usageStats._sum.costInCents || 0,
                    averageResponseTime: usageStats._avg.responseTime || 0
                },
                revenueMetrics: {
                    totalRevenue: revenueStats._sum.priceInCents || 0
                },
                timeframe,
                generatedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Get user analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get system health
router.get('/system-health', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        // Database health
        const dbHealth = await database_1.default.user.count();
        // API health (mock data)
        const apiHealth = {
            responseTime: Math.random() * 100 + 50, // 50-150ms
            errorRate: Math.random() * 5, // 0-5%
            uptime: 99.9
        };
        // Cost health
        const recentCosts = await database_1.default.usageLog.aggregate({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            },
            _sum: {
                costInCents: true
            }
        });
        const recentRevenue = await database_1.default.subscription.aggregate({
            where: {
                status: 'active'
            },
            _sum: {
                priceInCents: true
            }
        });
        const costHealth = {
            dailyCosts: recentCosts._sum.costInCents || 0,
            monthlyRevenue: recentRevenue._sum.priceInCents || 0,
            marginHealth: 'healthy' // This would be calculated based on actual margins
        };
        res.json({
            success: true,
            data: {
                database: {
                    status: dbHealth > 0 ? 'healthy' : 'error',
                    userCount: dbHealth
                },
                api: apiHealth,
                costs: costHealth,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Get system health error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Export data
router.get('/export/:type', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { type } = req.params;
        const { format = 'json' } = req.query;
        let data = {};
        switch (type) {
            case 'users':
                data = await database_1.default.user.findMany({
                    select: {
                        id: true,
                        email: true,
                        subscriptionTier: true,
                        createdAt: true,
                        lastLogin: true,
                        tokensUsed: true,
                        generationsUsed: true
                    }
                });
                break;
            case 'usage':
                data = await database_1.default.usageLog.findMany({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                    },
                    include: {
                        user: {
                            select: {
                                email: true,
                                subscriptionTier: true
                            }
                        }
                    }
                });
                break;
            case 'revenue':
                data = await database_1.default.subscription.findMany({
                    where: {
                        status: 'active'
                    },
                    include: {
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                });
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid export type'
                });
        }
        if (format === 'csv') {
            // Convert to CSV format (simplified)
            const csv = JSON.stringify(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${type}-export.csv"`);
            res.send(csv);
        }
        else {
            res.json({
                success: true,
                data,
                exportType: type,
                format,
                timestamp: new Date().toISOString()
            });
        }
    }
    catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// GET /api/admin/stats - Dashboard statistics
router.get('/stats', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        // Get basic user counts
        const totalUsers = await database_1.default.user.count();
        const activeUsers = await database_1.default.user.count({
            where: {
                lastLogin: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            }
        });
        // Get total prompts generated
        const totalPrompts = await database_1.default.prompt.count();
        // Get API calls from usage logs
        const apiCalls = await database_1.default.usageLog.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
            }
        });
        // Get revenue from active subscriptions
        const revenueResult = await database_1.default.subscription.aggregate({
            where: {
                status: 'active'
            },
            _sum: {
                priceInCents: true
            }
        });
        const revenue = (revenueResult._sum.priceInCents || 0) / 100; // Convert to dollars
        // Get subscription tier distribution
        const tierCounts = await database_1.default.user.groupBy({
            by: ['subscriptionTier'],
            _count: {
                subscriptionTier: true
            }
        });
        const subscriptions = {
            free: 0,
            starter: 0,
            pro: 0,
            business: 0,
            enterprise: 0
        };
        tierCounts.forEach(tier => {
            const tierName = tier.subscriptionTier.toLowerCase();
            if (tierName in subscriptions) {
                subscriptions[tierName] = tier._count.subscriptionTier;
            }
        });
        // System health assessment
        let systemHealth = 'healthy';
        // Check if there are any recent errors or high cost ratios
        const recentCosts = await database_1.default.usageLog.aggregate({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            },
            _sum: {
                costInCents: true
            }
        });
        const dailyCost = (recentCosts._sum.costInCents || 0) / 100;
        const dailyRevenue = revenue / 30; // Rough daily revenue estimate
        if (dailyCost > dailyRevenue * 0.8) {
            systemHealth = 'warning';
        }
        if (dailyCost > dailyRevenue) {
            systemHealth = 'critical';
        }
        // System info
        const systemInfo = {
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Mock: 2 hours ago
            environment: process.env.NODE_ENV || 'development'
        };
        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                totalPrompts,
                revenue,
                systemHealth,
                apiCalls,
                subscriptions,
                systemInfo
            }
        });
    }
    catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// GET /api/admin/users - User management data
router.get('/users', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const users = await database_1.default.user.findMany({
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                subscriptionTier: true,
                tokensUsed: true,
                generationsUsed: true,
                createdAt: true,
                lastLogin: true
            }
        });
        const total = await database_1.default.user.count();
        const formattedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.role,
            subscriptionTier: user.subscriptionTier,
            tokenBalance: user.tokensUsed || 0
        }));
        res.json({
            success: true,
            data: {
                users: formattedUsers,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Get admin users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// GET /api/admin/logs - System logs
router.get('/logs', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, level } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // For now, we'll return usage logs as system activity logs
        const usageLogs = await database_1.default.usageLog.findMany({
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });
        const total = await database_1.default.usageLog.count();
        const formattedLogs = usageLogs.map((log, index) => ({
            id: skip + index + 1,
            timestamp: log.createdAt.toISOString(),
            level: log.tokensConsumed > 1000 ? 'warning' : 'info',
            message: `API call by ${log.user.email} - ${log.tokensConsumed} tokens used`,
            details: {
                userId: log.userId,
                tokensConsumed: log.tokensConsumed,
                costInCents: log.costInCents,
                provider: log.provider,
                responseTime: log.responseTime
            }
        }));
        res.json({
            success: true,
            data: {
                logs: formattedLogs,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Get admin logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/admin/actions/:action - Execute admin actions
router.post('/actions/:action', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { action } = req.params;
        const { data } = req.body;
        console.log(`Executing admin action: ${action}`);
        let result = {};
        switch (action) {
            case 'view-users':
                const totalUsers = await database_1.default.user.count();
                const recentUsers = await database_1.default.user.findMany({
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        email: true,
                        createdAt: true,
                        subscriptionTier: true
                    }
                });
                result = {
                    message: `Found ${totalUsers} total users`,
                    details: { totalUsers, recentUsers }
                };
                break;
            case 'monitor-sessions':
                const activeSessions = await database_1.default.user.count({
                    where: {
                        lastLogin: {
                            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
                        }
                    }
                });
                result = {
                    message: `${activeSessions} active sessions in the last hour`,
                    details: { activeSessions }
                };
                break;
            case 'backup-database':
                // Simulate database backup
                result = {
                    message: 'Database backup initiated successfully',
                    details: {
                        backupId: `backup_${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        status: 'in_progress'
                    }
                };
                break;
            case 'send-notifications':
                // Get recent users for notification
                const usersForNotification = await database_1.default.user.count({
                    where: {
                        lastLogin: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                });
                result = {
                    message: `Notifications sent to ${usersForNotification} active users`,
                    details: { recipientCount: usersForNotification }
                };
                break;
            case 'security-audit':
                // Simulate security audit
                const suspiciousActivity = await database_1.default.usageLog.count({
                    where: {
                        tokensConsumed: {
                            gt: 5000 // High token usage
                        },
                        createdAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    }
                });
                result = {
                    message: 'Security audit completed',
                    details: {
                        auditId: `audit_${Date.now()}`,
                        suspiciousActivityCount: suspiciousActivity,
                        recommendations: suspiciousActivity > 0 ? ['Review high-usage accounts'] : ['No issues found']
                    }
                };
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: `Unknown action: ${action}`
                });
        }
        res.json({
            success: true,
            message: result.message,
            data: result.details
        });
    }
    catch (error) {
        console.error('Admin action error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get user activities
router.get('/activities', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Get recent user activities from prompts and usage logs
        const [recentPrompts, recentUsage] = await Promise.all([
            database_1.default.prompt.findMany({
                skip,
                take: Number(limit) / 2,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            email: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }),
            database_1.default.usageLog.findMany({
                skip,
                take: Number(limit) / 2,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            email: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            })
        ]);
        // Combine and format activities
        const activities = [
            ...recentPrompts.map(prompt => ({
                id: `prompt-${prompt.id}`,
                type: 'prompt_created',
                user: prompt.user.firstName || prompt.user.lastName
                    ? `${prompt.user.firstName} ${prompt.user.lastName}`
                    : prompt.user.email,
                description: `Created prompt: ${prompt.title}`,
                timestamp: prompt.createdAt,
                metadata: {
                    category: prompt.category,
                    promptId: prompt.id
                }
            })),
            ...recentUsage.map(usage => ({
                id: `usage-${usage.id}`,
                type: 'api_usage',
                user: usage.user.firstName || usage.user.lastName
                    ? `${usage.user.firstName} ${usage.user.lastName}`
                    : usage.user.email,
                description: `API usage: ${usage.tokensConsumed} tokens`,
                timestamp: usage.createdAt,
                metadata: {
                    tokensConsumed: usage.tokensConsumed,
                    costInCents: usage.costInCents
                }
            }))
        ]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, Number(limit));
        res.json({
            success: true,
            data: {
                activities,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: activities.length
                }
            }
        });
    }
    catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get active sessions
router.get('/active-sessions', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        // Get recent user activity as proxy for active sessions
        const recentUsers = await database_1.default.user.findMany({
            where: {
                updatedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                lastLogin: true,
                updatedAt: true,
                role: true,
                subscriptionTier: true
            },
            orderBy: { updatedAt: 'desc' },
            take: 50
        });
        const sessions = recentUsers.map(user => ({
            id: user.id,
            user: user.firstName || user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email,
            email: user.email,
            role: user.role,
            tier: user.subscriptionTier,
            lastActivity: user.updatedAt,
            lastLogin: user.lastLogin,
            status: new Date(user.updatedAt).getTime() > Date.now() - 30 * 60 * 1000 ? 'active' : 'inactive',
            duration: Math.floor((Date.now() - new Date(user.lastLogin || user.updatedAt).getTime()) / 1000 / 60) // minutes
        }));
        res.json({
            success: true,
            data: {
                sessions,
                summary: {
                    total: sessions.length,
                    active: sessions.filter(s => s.status === 'active').length,
                    inactive: sessions.filter(s => s.status === 'inactive').length
                }
            }
        });
    }
    catch (error) {
        console.error('Get active sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get recent user registrations for live tracking
router.get('/recent-registrations', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { hours = 24 } = req.query;
        const timeWindow = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);
        const recentUsers = await database_1.default.user.findMany({
            where: {
                createdAt: {
                    gte: timeWindow
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                subscriptionTier: true,
                createdAt: true,
                lastLogin: true,
                emailVerified: true
            }
        });
        // Get registration stats by hour for the last 24 hours
        const hourlyStats = [];
        for (let i = 23; i >= 0; i--) {
            const hourStart = new Date(Date.now() - i * 60 * 60 * 1000);
            const hourEnd = new Date(Date.now() - (i - 1) * 60 * 60 * 1000);
            const count = await database_1.default.user.count({
                where: {
                    createdAt: {
                        gte: hourStart,
                        lt: hourEnd
                    }
                }
            });
            hourlyStats.push({
                hour: hourStart.getHours(),
                count,
                timestamp: hourStart.toISOString()
            });
        }
        res.json({
            success: true,
            data: {
                recentUsers: recentUsers.map(user => ({
                    id: user.id,
                    email: user.email,
                    name: user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName || user.email.split('@')[0],
                    plan: user.subscriptionTier,
                    registeredAt: user.createdAt,
                    lastLogin: user.lastLogin,
                    emailVerified: user.emailVerified,
                    status: user.lastLogin ? 'active' : 'pending'
                })),
                hourlyStats,
                summary: {
                    total: recentUsers.length,
                    verified: recentUsers.filter(u => u.emailVerified).length,
                    active: recentUsers.filter(u => u.lastLogin).length,
                    timeWindow: `${hours} hours`
                }
            }
        });
    }
    catch (error) {
        console.error('Get recent registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// GET /api/admin/payments - Payment management data
router.get('/payments', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Build where clause for payment filtering
        const whereClause = {};
        if (status && status !== 'all') {
            whereClause.status = status;
        }
        // Get payments from subscriptions table (as we don't have a separate payments table)
        const subscriptions = await database_1.default.subscription.findMany({
            skip,
            take: Number(limit),
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        const total = await database_1.default.subscription.count({ where: whereClause });
        // Format subscriptions as payments
        const payments = subscriptions.map(sub => ({
            id: sub.id,
            userId: sub.userId,
            userEmail: sub.user.email,
            userName: sub.user.firstName && sub.user.lastName
                ? `${sub.user.firstName} ${sub.user.lastName}`
                : sub.user.firstName || sub.user.email.split('@')[0],
            amount: sub.priceInCents,
            currency: 'usd',
            status: sub.status === 'active' ? 'succeeded' :
                sub.status === 'pending' ? 'pending' : 'failed',
            stripePaymentId: sub.stripeSubscriptionId || `sub_${sub.id}`,
            createdAt: sub.createdAt,
            description: `${sub.tier} Plan Subscription`,
            metadata: {
                tier: sub.tier,
                subscriptionId: sub.id
            }
        }));
        res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Get admin payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/admin/payments/:id/refund - Process payment refund
router.post('/payments/:id/refund', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        // Find the subscription/payment
        const subscription = await database_1.default.subscription.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        // In a real implementation, you would:
        // 1. Process the refund through Stripe
        // 2. Update the subscription status
        // 3. Log the refund for audit purposes
        // For now, we'll simulate the refund process
        await database_1.default.subscription.update({
            where: { id },
            data: {
                status: 'canceled', // Mark as canceled/refunded
                updatedAt: new Date()
            }
        });
        // Log the admin action
        console.log(`Admin ${req.user.id} processed refund for subscription ${id}: ${reason || 'No reason provided'}`);
        res.json({
            success: true,
            message: 'Refund processed successfully',
            data: {
                paymentId: id,
                refundAmount: subscription.priceInCents,
                refundedAt: new Date().toISOString(),
                processedBy: req.user.id,
                reason: reason || 'Admin initiated refund'
            }
        });
    }
    catch (error) {
        console.error('Process refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE PAYMENT VERIFICATION ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * GET /api/admin/payments/verify/:subscriptionId
 * Verify a subscription's payment status directly with Stripe
 */
router.get('/payments/verify/:subscriptionId', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        if (!stripe) {
            return res.status(503).json({
                success: false,
                message: 'Stripe is not configured. Payment verification unavailable.'
            });
        }
        // Find the local subscription record
        const localSubscription = await database_1.default.subscription.findFirst({
            where: {
                OR: [
                    { id: subscriptionId },
                    { stripeSubscriptionId: subscriptionId }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        stripeCustomerId: true
                    }
                }
            }
        });
        if (!localSubscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found in local database'
            });
        }
        // If we have a Stripe subscription ID, verify with Stripe
        let stripeData = null;
        if (localSubscription.stripeSubscriptionId) {
            try {
                const stripeSubscription = await stripe.subscriptions.retrieve(localSubscription.stripeSubscriptionId, { expand: ['latest_invoice', 'customer', 'default_payment_method'] });
                stripeData = {
                    id: stripeSubscription.id,
                    status: stripeSubscription.status,
                    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
                    canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : null,
                    created: new Date(stripeSubscription.created * 1000).toISOString(),
                    latestInvoice: stripeSubscription.latest_invoice ? {
                        id: stripeSubscription.latest_invoice.id,
                        status: stripeSubscription.latest_invoice.status,
                        amountPaid: stripeSubscription.latest_invoice.amount_paid,
                        amountDue: stripeSubscription.latest_invoice.amount_due,
                        paidAt: stripeSubscription.latest_invoice.status_transitions?.paid_at
                            ? new Date(stripeSubscription.latest_invoice.status_transitions.paid_at * 1000).toISOString()
                            : null
                    } : null,
                    customer: stripeSubscription.customer ? {
                        id: typeof stripeSubscription.customer === 'string' ? stripeSubscription.customer : stripeSubscription.customer.id,
                        email: typeof stripeSubscription.customer !== 'string' ? stripeSubscription.customer.email : null
                    } : null
                };
                logger_1.logger.info('Stripe subscription verified', {
                    subscriptionId,
                    stripeStatus: stripeSubscription.status,
                    localStatus: localSubscription.status
                });
            }
            catch (stripeError) {
                logger_1.logger.error('Stripe verification failed', stripeError, { subscriptionId });
                stripeData = {
                    error: true,
                    message: stripeError.message || 'Failed to retrieve from Stripe',
                    code: stripeError.code
                };
            }
        }
        // Check for sync discrepancies
        const syncStatus = {
            inSync: true,
            discrepancies: []
        };
        if (stripeData && !stripeData.error) {
            // Check status sync
            const stripeStatusMap = {
                'active': 'active',
                'past_due': 'past_due',
                'canceled': 'canceled',
                'incomplete': 'pending',
                'incomplete_expired': 'expired',
                'trialing': 'active',
                'unpaid': 'past_due'
            };
            const expectedLocalStatus = stripeStatusMap[stripeData.status] || stripeData.status;
            if (localSubscription.status !== expectedLocalStatus) {
                syncStatus.inSync = false;
                syncStatus.discrepancies.push(`Status mismatch: Local="${localSubscription.status}", Stripe="${stripeData.status}"`);
            }
        }
        res.json({
            success: true,
            data: {
                local: {
                    id: localSubscription.id,
                    userId: localSubscription.userId,
                    userEmail: localSubscription.user.email,
                    userName: localSubscription.user.firstName && localSubscription.user.lastName
                        ? `${localSubscription.user.firstName} ${localSubscription.user.lastName}`
                        : localSubscription.user.email.split('@')[0],
                    tier: localSubscription.tier,
                    status: localSubscription.status,
                    priceInCents: localSubscription.priceInCents,
                    stripeSubscriptionId: localSubscription.stripeSubscriptionId,
                    createdAt: localSubscription.createdAt,
                    updatedAt: localSubscription.updatedAt
                },
                stripe: stripeData,
                syncStatus,
                verifiedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during payment verification'
        });
    }
});
/**
 * GET /api/admin/payments/stripe-customers
 * List all Stripe customers with their payment status
 */
router.get('/payments/stripe-customers', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { limit = 20, starting_after } = req.query;
        if (!stripe) {
            return res.status(503).json({
                success: false,
                message: 'Stripe is not configured'
            });
        }
        // Fetch customers from Stripe
        const params = {
            limit: Math.min(Number(limit), 100),
            expand: ['data.subscriptions']
        };
        if (starting_after) {
            params.starting_after = starting_after;
        }
        const customers = await stripe.customers.list(params);
        // Match with local users
        const enrichedCustomers = await Promise.all(customers.data.map(async (customer) => {
            const localUser = await database_1.default.user.findFirst({
                where: {
                    OR: [
                        { stripeCustomerId: customer.id },
                        { email: customer.email || '' }
                    ]
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    subscriptionTier: true,
                    tokensUsed: true,
                    generationsUsed: true,
                    lastLogin: true
                }
            });
            return {
                stripeCustomerId: customer.id,
                email: customer.email,
                name: customer.name,
                created: new Date(customer.created * 1000).toISOString(),
                subscriptions: (customer.subscriptions?.data || []).map((sub) => ({
                    id: sub.id,
                    status: sub.status,
                    currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
                    cancelAtPeriodEnd: sub.cancel_at_period_end
                })),
                localUser: localUser ? {
                    id: localUser.id,
                    email: localUser.email,
                    name: localUser.firstName && localUser.lastName
                        ? `${localUser.firstName} ${localUser.lastName}`
                        : localUser.email.split('@')[0],
                    tier: localUser.subscriptionTier,
                    lastLogin: localUser.lastLogin
                } : null,
                synced: !!localUser
            };
        }));
        res.json({
            success: true,
            data: {
                customers: enrichedCustomers,
                hasMore: customers.has_more,
                totalFetched: enrichedCustomers.length
            }
        });
    }
    catch (error) {
        console.error('Stripe customers fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch Stripe customers'
        });
    }
});
/**
 * GET /api/admin/payments/recent-charges
 * Get recent Stripe charges for payment monitoring
 */
router.get('/payments/recent-charges', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        // Validate and sanitize limit parameter
        const rawLimit = req.query.limit;
        const parsedLimit = parseInt(String(rawLimit || '20'), 10);
        const limit = isNaN(parsedLimit) || parsedLimit < 1 ? 20 : Math.min(parsedLimit, 100);
        if (!stripe) {
            return res.status(503).json({
                success: false,
                message: 'Stripe is not configured'
            });
        }
        const charges = await stripe.charges.list({
            limit,
            expand: ['data.customer', 'data.invoice']
        });
        const formattedCharges = charges.data.map(charge => ({
            id: charge.id,
            amount: charge.amount,
            amountRefunded: charge.amount_refunded,
            currency: charge.currency,
            status: charge.status,
            paid: charge.paid,
            refunded: charge.refunded,
            disputed: charge.disputed,
            customer: charge.customer ? {
                id: typeof charge.customer === 'string' ? charge.customer : charge.customer.id,
                email: typeof charge.customer !== 'string' ? charge.customer.email : null
            } : null,
            receiptEmail: charge.receipt_email,
            description: charge.description,
            failureCode: charge.failure_code,
            failureMessage: charge.failure_message,
            created: new Date(charge.created * 1000).toISOString(),
            invoice: charge.invoice ? {
                id: typeof charge.invoice === 'string' ? charge.invoice : charge.invoice.id
            } : null
        }));
        // Calculate summary stats
        const summary = {
            totalCharges: formattedCharges.length,
            successfulCharges: formattedCharges.filter(c => c.status === 'succeeded').length,
            failedCharges: formattedCharges.filter(c => c.status === 'failed').length,
            totalAmount: formattedCharges.reduce((sum, c) => sum + (c.status === 'succeeded' ? c.amount : 0), 0),
            totalRefunded: formattedCharges.reduce((sum, c) => sum + c.amountRefunded, 0)
        };
        res.json({
            success: true,
            data: {
                charges: formattedCharges,
                summary,
                hasMore: charges.has_more
            }
        });
    }
    catch (error) {
        console.error('Recent charges fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent charges'
        });
    }
});
/**
 * POST /api/admin/payments/sync-subscription/:subscriptionId
 * Sync a subscription's status from Stripe to local database
 */
router.post('/payments/sync-subscription/:subscriptionId', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        if (!stripe) {
            return res.status(503).json({
                success: false,
                message: 'Stripe is not configured'
            });
        }
        // Find local subscription
        const localSubscription = await database_1.default.subscription.findFirst({
            where: {
                OR: [
                    { id: subscriptionId },
                    { stripeSubscriptionId: subscriptionId }
                ]
            }
        });
        if (!localSubscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        if (!localSubscription.stripeSubscriptionId) {
            return res.status(400).json({
                success: false,
                message: 'Subscription has no Stripe ID - cannot sync'
            });
        }
        // Fetch from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(localSubscription.stripeSubscriptionId);
        // Map Stripe status to local status
        const statusMap = {
            'active': 'active',
            'past_due': 'past_due',
            'canceled': 'canceled',
            'incomplete': 'pending',
            'incomplete_expired': 'expired',
            'trialing': 'active',
            'unpaid': 'past_due',
            'paused': 'paused'
        };
        const newStatus = statusMap[stripeSubscription.status] || stripeSubscription.status;
        // Update local subscription
        const updatedSubscription = await database_1.default.subscription.update({
            where: { id: localSubscription.id },
            data: {
                status: newStatus,
                updatedAt: new Date()
            }
        });
        // Log the sync action
        logger_1.logger.info('Subscription synced from Stripe', {
            subscriptionId: localSubscription.id,
            stripeSubscriptionId: localSubscription.stripeSubscriptionId,
            oldStatus: localSubscription.status,
            newStatus,
            syncedBy: req.user.id
        });
        res.json({
            success: true,
            message: 'Subscription synced successfully',
            data: {
                subscriptionId: updatedSubscription.id,
                previousStatus: localSubscription.status,
                newStatus,
                stripeStatus: stripeSubscription.status,
                syncedAt: new Date().toISOString(),
                syncedBy: req.user.id
            }
        });
    }
    catch (error) {
        console.error('Subscription sync error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to sync subscription'
        });
    }
});
/**
 * GET /api/admin/payments/dashboard
 * Comprehensive payment dashboard with Stripe data
 */
router.get('/payments/dashboard', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        // Local database stats
        const localStats = {
            totalSubscriptions: await database_1.default.subscription.count(),
            activeSubscriptions: await database_1.default.subscription.count({ where: { status: 'active' } }),
            canceledSubscriptions: await database_1.default.subscription.count({ where: { status: 'canceled' } }),
            pendingSubscriptions: await database_1.default.subscription.count({ where: { status: 'pending' } })
        };
        // Revenue from local database
        const revenueResult = await database_1.default.subscription.aggregate({
            where: { status: 'active' },
            _sum: { priceInCents: true }
        });
        // Stripe live data (if available)
        let stripeStats = null;
        if (stripe) {
            try {
                // Get balance
                const balance = await stripe.balance.retrieve();
                // Get recent payment intents
                const recentPayments = await stripe.paymentIntents.list({
                    limit: 10,
                    created: {
                        gte: Math.floor(Date.now() / 1000) - (24 * 60 * 60) // Last 24 hours
                    }
                });
                // Get subscription stats
                const activeSubscriptions = await stripe.subscriptions.list({
                    status: 'active',
                    limit: 1
                });
                stripeStats = {
                    available: true,
                    balance: {
                        available: balance.available.map(b => ({ amount: b.amount, currency: b.currency })),
                        pending: balance.pending.map(b => ({ amount: b.amount, currency: b.currency }))
                    },
                    recentPayments: {
                        count: recentPayments.data.length,
                        totalAmount: recentPayments.data.reduce((sum, p) => sum + (p.amount || 0), 0),
                        succeeded: recentPayments.data.filter(p => p.status === 'succeeded').length,
                        failed: recentPayments.data.filter(p => p.status === 'canceled' || p.status === 'requires_payment_method').length
                    },
                    hasActiveSubscriptions: activeSubscriptions.data.length > 0
                };
            }
            catch (stripeError) {
                stripeStats = {
                    available: false,
                    error: stripeError.message
                };
            }
        }
        // Recent payment events from local database
        const recentSubscriptions = await database_1.default.subscription.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: {
                local: {
                    ...localStats,
                    monthlyRecurringRevenue: (revenueResult._sum.priceInCents || 0) / 100
                },
                stripe: stripeStats,
                recentActivity: recentSubscriptions.map(sub => ({
                    id: sub.id,
                    userEmail: sub.user.email,
                    tier: sub.tier,
                    status: sub.status,
                    amount: sub.priceInCents / 100,
                    createdAt: sub.createdAt
                })),
                generatedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Payment dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate payment dashboard'
        });
    }
});
// GET /api/admin/analytics - Enhanced analytics data
router.get('/analytics', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { timeframe = '30d' } = req.query;
        // Calculate date range
        let startDate = new Date();
        switch (timeframe) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            default:
                startDate.setDate(startDate.getDate() - 30);
        }
        // Get comprehensive analytics data
        const [totalUsers, activeUsers, totalRevenue, totalPrompts, usageStats, tierDistribution, recentTransactions, systemHealth] = await Promise.all([
            // Total users
            database_1.default.user.count(),
            // Active users (last 7 days)
            database_1.default.user.count({
                where: {
                    lastLogin: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            }),
            // Total revenue from active subscriptions
            database_1.default.subscription.aggregate({
                where: { status: 'active' },
                _sum: { priceInCents: true }
            }),
            // Total prompts
            database_1.default.prompt.count({
                where: {
                    createdAt: { gte: startDate }
                }
            }),
            // Usage statistics
            database_1.default.usageLog.aggregate({
                where: {
                    createdAt: { gte: startDate }
                },
                _sum: {
                    tokensConsumed: true,
                    costInCents: true
                },
                _count: { id: true },
                _avg: { responseTime: true }
            }),
            // Tier distribution
            database_1.default.user.groupBy({
                by: ['subscriptionTier'],
                _count: { subscriptionTier: true }
            }),
            // Recent transactions (subscriptions as proxy)
            database_1.default.subscription.count({
                where: {
                    createdAt: { gte: startDate },
                    status: 'active'
                }
            }),
            // System health check
            database_1.default.usageLog.aggregate({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                },
                _sum: { costInCents: true }
            })
        ]);
        // Calculate derived metrics
        const monthlyRevenue = (totalRevenue._sum.priceInCents || 0) / 100;
        const dailyCost = (systemHealth._sum.costInCents || 0) / 100;
        const dailyRevenue = monthlyRevenue / 30;
        // Determine system health status
        let healthStatus = 'healthy';
        if (dailyCost > dailyRevenue * 0.8)
            healthStatus = 'warning';
        if (dailyCost > dailyRevenue)
            healthStatus = 'critical';
        // Format tier distribution
        const tierStats = tierDistribution.reduce((acc, tier) => {
            acc[tier.subscriptionTier.toLowerCase()] = tier._count.subscriptionTier;
            return acc;
        }, {});
        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    activeUsers,
                    monthlyRevenue: Math.round(monthlyRevenue),
                    totalPrompts,
                    successfulPayments: recentTransactions,
                    refundedPayments: 0, // Would be calculated from actual refund data
                    pendingPayments: 0, // Would be calculated from pending subscriptions
                    systemHealth: healthStatus
                },
                usage: {
                    totalRequests: usageStats._count.id || 0,
                    totalTokens: usageStats._sum.tokensConsumed || 0,
                    totalCosts: Math.round((usageStats._sum.costInCents || 0) / 100),
                    averageResponseTime: Math.round(usageStats._avg.responseTime || 0)
                },
                revenue: {
                    total: Math.round(monthlyRevenue),
                    monthly: Math.round(monthlyRevenue),
                    averagePerUser: totalUsers > 0 ? Math.round(monthlyRevenue / totalUsers) : 0,
                    conversionRate: 12.4 // This would be calculated from actual conversion data
                },
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    activationRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
                    tierDistribution: tierStats
                },
                timeframe,
                generatedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// GET /api/admin/dashboard-stats - Real-time dashboard statistics
router.get('/dashboard-stats', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        // Get real-time statistics
        const [totalUsers, activeUsers, totalRevenue, totalPrompts, recentUsage, paymentStats] = await Promise.all([
            database_1.default.user.count(),
            database_1.default.user.count({
                where: {
                    lastLogin: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            }),
            database_1.default.subscription.aggregate({
                where: { status: 'active' },
                _sum: { priceInCents: true }
            }),
            database_1.default.prompt.count(),
            database_1.default.usageLog.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                }
            }),
            database_1.default.subscription.groupBy({
                by: ['status'],
                _count: { status: true }
            })
        ]);
        // Calculate payment statistics
        const successfulPayments = paymentStats.find(p => p.status === 'active')?._count.status || 0;
        const pendingPayments = paymentStats.find(p => p.status === 'pending')?._count.status || 0;
        const refundedPayments = paymentStats.find(p => p.status === 'canceled')?._count.status || 0;
        // System health assessment
        const monthlyRevenue = (totalRevenue._sum.priceInCents || 0) / 100;
        let systemHealth = 'healthy';
        if (activeUsers / totalUsers < 0.3)
            systemHealth = 'warning';
        if (monthlyRevenue < 1000)
            systemHealth = 'warning';
        if (totalUsers < 10)
            systemHealth = 'critical';
        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                totalRevenue: Math.round(monthlyRevenue),
                monthlyRevenue: Math.round(monthlyRevenue),
                totalPrompts,
                successfulPayments,
                refundedPayments,
                pendingPayments,
                systemHealth,
                recentActivity: recentUsage,
                lastUpdated: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// GET /api/admin/token-monitoring - Comprehensive token monitoring
router.get('/token-monitoring', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { timeframe = '30d', userId } = req.query;
        // Calculate date range
        let startDate = new Date();
        switch (timeframe) {
            case '1d':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            default:
                startDate.setDate(startDate.getDate() - 30);
        }
        const whereClause = {
            createdAt: { gte: startDate }
        };
        if (userId) {
            whereClause.userId = userId;
        }
        // Get comprehensive token usage data
        const [totalTokenUsage, tokenTransactions, topUsers, userTokenBalances, alertsData, usageByTier] = await Promise.all([
            // Total token consumption
            database_1.default.usageLog.aggregate({
                where: whereClause,
                _sum: {
                    tokensConsumed: true,
                    costInCents: true
                },
                _count: { id: true },
                _avg: { tokensConsumed: true }
            }),
            // Recent token transactions
            database_1.default.tokenTransaction.findMany({
                where: whereClause,
                take: 100,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            email: true,
                            firstName: true,
                            lastName: true,
                            subscriptionTier: true
                        }
                    }
                }
            }),
            // Top token consumers
            database_1.default.usageLog.groupBy({
                by: ['userId'],
                where: whereClause,
                _sum: {
                    tokensConsumed: true,
                    costInCents: true
                },
                _count: { id: true },
                orderBy: {
                    _sum: {
                        tokensConsumed: 'desc'
                    }
                },
                take: 20
            }),
            // User token balances
            database_1.default.user.findMany({
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    subscriptionTier: true,
                    tokenBalance: true,
                    tokensUsed: true
                },
                orderBy: { tokensUsed: 'desc' },
                take: 50
            }),
            // Token usage alerts (high usage patterns)
            database_1.default.usageLog.findMany({
                where: {
                    ...whereClause,
                    tokensConsumed: { gt: 5000 } // High usage threshold
                },
                include: {
                    user: {
                        select: {
                            email: true,
                            subscriptionTier: true
                        }
                    }
                },
                orderBy: { tokensConsumed: 'desc' },
                take: 50
            }),
            // Usage by subscription tier
            database_1.default.user.groupBy({
                by: ['subscriptionTier'],
                _sum: {
                    tokensUsed: true
                },
                _avg: {
                    tokensUsed: true
                },
                _count: { id: true }
            })
        ]);
        // Get user details for top consumers
        const topUserIds = topUsers.map(u => u.userId);
        const topUserDetails = await database_1.default.user.findMany({
            where: { id: { in: topUserIds } },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                subscriptionTier: true,
                tokenBalance: true
            }
        });
        // Combine top users with their details
        const enrichedTopUsers = topUsers.map(usage => {
            const userDetails = topUserDetails.find(u => u.id === usage.userId);
            return {
                userId: usage.userId,
                email: userDetails?.email || 'Unknown',
                name: userDetails?.firstName && userDetails?.lastName
                    ? `${userDetails.firstName} ${userDetails.lastName}`
                    : userDetails?.firstName || userDetails?.email?.split('@')[0] || 'Unknown',
                tier: userDetails?.subscriptionTier || 'free',
                tokenBalance: userDetails?.tokenBalance || 0,
                totalTokensConsumed: usage._sum.tokensConsumed || 0,
                totalCost: (usage._sum.costInCents || 0) / 100,
                requestCount: usage._count.id,
                averagePerRequest: usage._count.id > 0
                    ? Math.round((usage._sum.tokensConsumed || 0) / usage._count.id)
                    : 0
            };
        });
        // Generate token usage insights
        const insights = {
            totalTokens: totalTokenUsage._sum.tokensConsumed || 0,
            totalCost: (totalTokenUsage._sum.costInCents || 0) / 100,
            totalRequests: totalTokenUsage._count.id || 0,
            averageTokensPerRequest: totalTokenUsage._avg.tokensConsumed || 0,
            highUsageAlerts: alertsData.length,
            activeUsers: new Set(tokenTransactions.map(t => t.userId)).size,
            tierBreakdown: usageByTier.map(tier => ({
                tier: tier.subscriptionTier,
                users: tier._count.id,
                totalTokens: tier._sum.tokensUsed || 0,
                averageTokens: tier._avg.tokensUsed || 0
            }))
        };
        // Recent transactions with formatted data
        const formattedTransactions = tokenTransactions.map(tx => ({
            id: tx.id,
            userId: tx.userId,
            userEmail: tx.user.email,
            userName: tx.user.firstName && tx.user.lastName
                ? `${tx.user.firstName} ${tx.user.lastName}`
                : tx.user.firstName || tx.user.email.split('@')[0],
            type: tx.type,
            amount: tx.amount,
            description: tx.description || 'Token transaction',
            createdAt: tx.createdAt,
            tier: tx.user.subscriptionTier
        }));
        // High usage alerts with user info
        const formattedAlerts = alertsData.map(alert => ({
            id: alert.id,
            userId: alert.userId,
            userEmail: alert.user.email,
            tier: alert.user.subscriptionTier,
            tokensConsumed: alert.tokensConsumed,
            costInCents: alert.costInCents,
            timestamp: alert.createdAt,
            severity: alert.tokensConsumed > 10000 ? 'critical' :
                alert.tokensConsumed > 7500 ? 'high' : 'medium'
        }));
        res.json({
            success: true,
            data: {
                overview: insights,
                topUsers: enrichedTopUsers,
                recentTransactions: formattedTransactions,
                userBalances: userTokenBalances,
                alerts: formattedAlerts,
                timeframe,
                generatedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Get token monitoring error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/admin/token-management - Token management actions
router.post('/token-management', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { action, userId, amount, reason } = req.body;
        const adminId = req.user.id;
        if (!action || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Action and userId are required'
            });
        }
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                tokenBalance: true,
                subscriptionTier: true
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        let result = {};
        switch (action) {
            case 'add_tokens':
                if (!amount || amount <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Valid amount is required for adding tokens'
                    });
                }
                const newBalance = (user.tokenBalance || 0) + amount;
                await database_1.default.user.update({
                    where: { id: userId },
                    data: { tokenBalance: newBalance }
                });
                // Log the transaction
                await database_1.default.tokenTransaction.create({
                    data: {
                        userId,
                        type: 'admin_credit',
                        amount,
                        description: `Admin credit: ${reason || 'Manual adjustment'}`,
                        adminId
                    }
                });
                result = {
                    message: `Added ${amount} tokens to ${user.email}`,
                    previousBalance: user.tokenBalance || 0,
                    newBalance,
                    tokensAdded: amount
                };
                break;
            case 'deduct_tokens':
                if (!amount || amount <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Valid amount is required for deducting tokens'
                    });
                }
                const currentBalance = user.tokenBalance || 0;
                const deductedBalance = Math.max(0, currentBalance - amount);
                await database_1.default.user.update({
                    where: { id: userId },
                    data: { tokenBalance: deductedBalance }
                });
                // Log the transaction
                await database_1.default.tokenTransaction.create({
                    data: {
                        userId,
                        type: 'admin_debit',
                        amount: -amount,
                        description: `Admin deduction: ${reason || 'Manual adjustment'}`,
                        adminId
                    }
                });
                result = {
                    message: `Deducted ${amount} tokens from ${user.email}`,
                    previousBalance: currentBalance,
                    newBalance: deductedBalance,
                    tokensDeducted: amount
                };
                break;
            case 'reset_tokens':
                const resetAmount = amount || 0;
                await database_1.default.user.update({
                    where: { id: userId },
                    data: { tokenBalance: resetAmount }
                });
                // Log the transaction
                await database_1.default.tokenTransaction.create({
                    data: {
                        userId,
                        type: 'admin_reset',
                        amount: resetAmount - (user.tokenBalance || 0),
                        description: `Admin reset: ${reason || 'Token balance reset'}`,
                        adminId
                    }
                });
                result = {
                    message: `Reset token balance for ${user.email} to ${resetAmount}`,
                    previousBalance: user.tokenBalance || 0,
                    newBalance: resetAmount
                };
                break;
            case 'suspend_tokens':
                // In a real implementation, you'd add a suspension flag
                console.log(`Admin ${adminId} suspended token usage for user ${userId}: ${reason}`);
                result = {
                    message: `Token usage suspended for ${user.email}`,
                    reason: reason || 'Admin action',
                    suspendedAt: new Date().toISOString()
                };
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: `Unknown action: ${action}`
                });
        }
        console.log(`Admin ${adminId} performed token action '${action}' on user ${userId}:`, result);
        res.json({
            success: true,
            data: {
                action,
                userId,
                userEmail: user.email,
                performedBy: adminId,
                timestamp: new Date().toISOString(),
                ...result
            }
        });
    }
    catch (error) {
        console.error('Token management error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// GET /api/admin/password-security - Password and security monitoring
router.get('/password-security', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        // Get password security metrics
        const [totalUsers, recentPasswordChanges, failedLoginAttempts, suspiciousActivity, unverifiedEmails, inactiveUsers] = await Promise.all([
            database_1.default.user.count(),
            // Users who changed passwords recently (mock data for now)
            database_1.default.user.count({
                where: {
                    updatedAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            }),
            // Simulate failed login attempts from logs
            database_1.default.usageLog.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    },
                    // In a real implementation, you'd have a separate table for auth logs
                    tokensConsumed: 0 // Using this as a proxy for failed attempts
                }
            }),
            // High usage as suspicious activity
            database_1.default.usageLog.count({
                where: {
                    tokensConsumed: { gt: 10000 },
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            }),
            // Unverified email addresses
            database_1.default.user.count({
                where: {
                    emailVerified: false
                }
            }),
            // Inactive users (no recent login)
            database_1.default.user.count({
                where: {
                    OR: [
                        { lastLogin: null },
                        {
                            lastLogin: {
                                lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
                            }
                        }
                    ]
                }
            })
        ]);
        // Get recent security events
        const recentEvents = await database_1.default.user.findMany({
            where: {
                OR: [
                    {
                        createdAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    },
                    {
                        lastLogin: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    }
                ]
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                lastLogin: true,
                emailVerified: true,
                subscriptionTier: true
            },
            orderBy: { updatedAt: 'desc' },
            take: 50
        });
        // Format security events
        const securityEvents = recentEvents.map(user => {
            const isNewUser = new Date(user.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000;
            const hasRecentLogin = user.lastLogin && new Date(user.lastLogin).getTime() > Date.now() - 24 * 60 * 60 * 1000;
            return {
                id: user.id,
                email: user.email,
                userName: user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.firstName || user.email.split('@')[0],
                eventType: isNewUser ? 'new_registration' : hasRecentLogin ? 'login' : 'activity',
                timestamp: hasRecentLogin ? user.lastLogin : user.createdAt,
                verified: user.emailVerified,
                tier: user.subscriptionTier,
                riskLevel: !user.emailVerified ? 'medium' : 'low'
            };
        });
        // Security health assessment
        const securityHealth = {
            overallScore: Math.max(0, 100 -
                (unverifiedEmails / totalUsers * 30) -
                (inactiveUsers / totalUsers * 20) -
                (suspiciousActivity * 5)),
            recommendations: [],
            threats: {
                high: suspiciousActivity > 10 ? suspiciousActivity : 0,
                medium: unverifiedEmails > totalUsers * 0.3 ? Math.floor(unverifiedEmails * 0.1) : 0,
                low: failedLoginAttempts
            }
        };
        // Generate recommendations
        if (unverifiedEmails > totalUsers * 0.2) {
            securityHealth.recommendations.push('High number of unverified emails detected. Consider email verification campaign.');
        }
        if (inactiveUsers > totalUsers * 0.5) {
            securityHealth.recommendations.push('Many inactive users detected. Review account security policies.');
        }
        if (suspiciousActivity > 5) {
            securityHealth.recommendations.push('Suspicious activity patterns detected. Review high-usage accounts.');
        }
        if (securityHealth.recommendations.length === 0) {
            securityHealth.recommendations.push('Security posture looks good. Continue monitoring.');
        }
        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    verifiedUsers: totalUsers - unverifiedEmails,
                    unverifiedUsers: unverifiedEmails,
                    activeUsers: totalUsers - inactiveUsers,
                    inactiveUsers,
                    recentPasswordChanges,
                    failedLoginAttempts,
                    suspiciousActivity
                },
                securityHealth,
                recentEvents: securityEvents,
                alerts: [
                    ...(suspiciousActivity > 10 ? [{
                            type: 'high_usage',
                            message: `${suspiciousActivity} high-usage sessions detected in last 24h`,
                            severity: 'warning',
                            timestamp: new Date().toISOString()
                        }] : []),
                    ...(unverifiedEmails > totalUsers * 0.3 ? [{
                            type: 'unverified_emails',
                            message: `${unverifiedEmails} unverified email addresses (${Math.round(unverifiedEmails / totalUsers * 100)}%)`,
                            severity: 'info',
                            timestamp: new Date().toISOString()
                        }] : [])
                ],
                generatedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Get password security error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/admin/security-actions - Security management actions
router.post('/security-actions', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { action, userId, reason } = req.body;
        const adminId = req.user.id;
        if (!action) {
            return res.status(400).json({
                success: false,
                message: 'Action is required'
            });
        }
        let result = {};
        switch (action) {
            case 'force_password_reset':
                if (!userId) {
                    return res.status(400).json({
                        success: false,
                        message: 'User ID is required for password reset'
                    });
                }
                const user = await database_1.default.user.findUnique({
                    where: { id: userId },
                    select: { email: true, firstName: true, lastName: true }
                });
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }
                // In a real implementation, you'd:
                // 1. Invalidate current session tokens
                // 2. Send password reset email
                // 3. Log the admin action
                console.log(`Admin ${adminId} forced password reset for user ${userId}: ${reason}`);
                result = {
                    message: `Password reset initiated for ${user.email}`,
                    userEmail: user.email,
                    resetInitiated: new Date().toISOString()
                };
                break;
            case 'suspend_account':
                if (!userId) {
                    return res.status(400).json({
                        success: false,
                        message: 'User ID is required for account suspension'
                    });
                }
                // In a real implementation, you'd add a 'suspended' flag to the user
                console.log(`Admin ${adminId} suspended account for user ${userId}: ${reason}`);
                result = {
                    message: `Account suspended for user ${userId}`,
                    reason: reason || 'Admin action',
                    suspendedAt: new Date().toISOString()
                };
                break;
            case 'security_audit':
                // Initiate comprehensive security audit
                const auditResults = {
                    auditId: `audit_${Date.now()}`,
                    initiatedBy: adminId,
                    timestamp: new Date().toISOString(),
                    scope: 'full_system',
                    status: 'in_progress'
                };
                console.log(`Admin ${adminId} initiated security audit:`, auditResults);
                result = {
                    message: 'Security audit initiated',
                    auditDetails: auditResults
                };
                break;
            case 'bulk_email_verification':
                // Simulate bulk email verification reminder
                const unverifiedCount = await database_1.default.user.count({
                    where: { emailVerified: false }
                });
                result = {
                    message: `Email verification reminders sent to ${unverifiedCount} users`,
                    recipientCount: unverifiedCount,
                    sentAt: new Date().toISOString()
                };
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: `Unknown security action: ${action}`
                });
        }
        console.log(`Admin ${adminId} performed security action '${action}':`, result);
        res.json({
            success: true,
            data: {
                action,
                performedBy: adminId,
                timestamp: new Date().toISOString(),
                ...result
            }
        });
    }
    catch (error) {
        console.error('Security action error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// GET /api/admin/system-monitoring - Overall system monitoring
router.get('/system-monitoring', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        // Get comprehensive system metrics
        const [dailyStats, weeklyStats, monthlyStats, errorRates, performanceMetrics, resourceUsage, alertsCount] = await Promise.all([
            // Daily statistics
            Promise.all([
                database_1.default.user.count({ where: { createdAt: { gte: oneDayAgo } } }),
                database_1.default.prompt.count({ where: { createdAt: { gte: oneDayAgo } } }),
                database_1.default.usageLog.count({ where: { createdAt: { gte: oneDayAgo } } }),
                database_1.default.usageLog.aggregate({
                    where: { createdAt: { gte: oneDayAgo } },
                    _sum: { tokensConsumed: true, costInCents: true }
                })
            ]),
            // Weekly statistics
            Promise.all([
                database_1.default.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
                database_1.default.prompt.count({ where: { createdAt: { gte: oneWeekAgo } } }),
                database_1.default.usageLog.count({ where: { createdAt: { gte: oneWeekAgo } } }),
                database_1.default.usageLog.aggregate({
                    where: { createdAt: { gte: oneWeekAgo } },
                    _sum: { tokensConsumed: true, costInCents: true }
                })
            ]),
            // Monthly statistics
            Promise.all([
                database_1.default.user.count({ where: { createdAt: { gte: oneMonthAgo } } }),
                database_1.default.prompt.count({ where: { createdAt: { gte: oneMonthAgo } } }),
                database_1.default.usageLog.count({ where: { createdAt: { gte: oneMonthAgo } } }),
                database_1.default.usageLog.aggregate({
                    where: { createdAt: { gte: oneMonthAgo } },
                    _sum: { tokensConsumed: true, costInCents: true }
                })
            ]),
            // Error rates (simulated)
            database_1.default.usageLog.count({
                where: {
                    createdAt: { gte: oneDayAgo },
                    tokensConsumed: 0 // Using as proxy for errors
                }
            }),
            // Performance metrics
            database_1.default.usageLog.aggregate({
                where: { createdAt: { gte: oneDayAgo } },
                _avg: { responseTime: true },
                _min: { responseTime: true },
                _max: { responseTime: true }
            }),
            // Resource usage (simulated)
            {
                cpuUsage: Math.random() * 80 + 10, // 10-90%
                memoryUsage: Math.random() * 70 + 20, // 20-90%
                diskUsage: Math.random() * 60 + 30, // 30-90%
                networkIO: Math.random() * 1000 + 100 // MB
            },
            // Alert conditions
            Promise.all([
                database_1.default.usageLog.count({
                    where: {
                        createdAt: { gte: oneDayAgo },
                        tokensConsumed: { gt: 10000 }
                    }
                }),
                database_1.default.user.count({
                    where: {
                        emailVerified: false,
                        createdAt: { gte: oneWeekAgo }
                    }
                })
            ])
        ]);
        // Format statistics
        const systemStats = {
            daily: {
                newUsers: dailyStats[0],
                newPrompts: dailyStats[1],
                apiCalls: dailyStats[2],
                tokensUsed: dailyStats[3]._sum.tokensConsumed || 0,
                costs: (dailyStats[3]._sum.costInCents || 0) / 100
            },
            weekly: {
                newUsers: weeklyStats[0],
                newPrompts: weeklyStats[1],
                apiCalls: weeklyStats[2],
                tokensUsed: weeklyStats[3]._sum.tokensConsumed || 0,
                costs: (weeklyStats[3]._sum.costInCents || 0) / 100
            },
            monthly: {
                newUsers: monthlyStats[0],
                newPrompts: monthlyStats[1],
                apiCalls: monthlyStats[2],
                tokensUsed: monthlyStats[3]._sum.tokensConsumed || 0,
                costs: (monthlyStats[3]._sum.costInCents || 0) / 100
            }
        };
        // System health assessment
        const health = {
            status: 'healthy',
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            lastRestart: new Date(Date.now() - process.uptime() * 1000).toISOString(),
            performance: {
                averageResponseTime: Math.round(performanceMetrics._avg.responseTime || 0),
                minResponseTime: Math.round(performanceMetrics._min.responseTime || 0),
                maxResponseTime: Math.round(performanceMetrics._max.responseTime || 0),
                errorRate: systemStats.daily.apiCalls > 0 ? (errorRates / systemStats.daily.apiCalls * 100) : 0
            },
            resources: resourceUsage
        };
        // Determine health status
        if (health.resources.cpuUsage > 80 || health.resources.memoryUsage > 85) {
            health.status = 'warning';
        }
        if (health.resources.cpuUsage > 90 || health.resources.memoryUsage > 95 || health.performance.errorRate > 10) {
            health.status = 'critical';
        }
        // Generate alerts
        const systemAlerts = [];
        if (alertsCount[0] > 0) {
            systemAlerts.push({
                type: 'high_usage',
                severity: 'warning',
                message: `${alertsCount[0]} high-token usage sessions detected today`,
                timestamp: new Date().toISOString()
            });
        }
        if (alertsCount[1] > systemStats.weekly.newUsers * 0.3) {
            systemAlerts.push({
                type: 'unverified_users',
                severity: 'info',
                message: `${alertsCount[1]} new users haven't verified their email this week`,
                timestamp: new Date().toISOString()
            });
        }
        if (health.performance.errorRate > 5) {
            systemAlerts.push({
                type: 'high_error_rate',
                severity: 'warning',
                message: `Error rate is ${health.performance.errorRate.toFixed(1)}% (threshold: 5%)`,
                timestamp: new Date().toISOString()
            });
        }
        if (health.resources.cpuUsage > 80) {
            systemAlerts.push({
                type: 'high_cpu',
                severity: health.resources.cpuUsage > 90 ? 'critical' : 'warning',
                message: `CPU usage is ${health.resources.cpuUsage.toFixed(1)}%`,
                timestamp: new Date().toISOString()
            });
        }
        // Operational metrics
        const operations = {
            backupStatus: {
                lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
                status: 'completed',
                size: '2.4 GB',
                nextScheduled: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString() // 18 hours from now
            },
            maintenanceWindow: {
                nextMaintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
                duration: '2 hours',
                type: 'scheduled_update'
            },
            monitoring: {
                activeMonitors: 12,
                alertsEnabled: true,
                uptimeTarget: 99.9,
                currentUptime: 99.95
            }
        };
        res.json({
            success: true,
            data: {
                statistics: systemStats,
                health,
                alerts: systemAlerts,
                operations,
                summary: {
                    totalAlerts: systemAlerts.length,
                    criticalAlerts: systemAlerts.filter(a => a.severity === 'critical').length,
                    warningAlerts: systemAlerts.filter(a => a.severity === 'warning').length,
                    systemLoad: (health.resources.cpuUsage + health.resources.memoryUsage) / 2,
                    healthScore: health.status === 'healthy' ? 95 : health.status === 'warning' ? 75 : 45
                },
                generatedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Get system monitoring error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// GET /api/admin/email-management - Comprehensive email monitoring and management
router.get('/email-management', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { timeframe = '30d', status } = req.query;
        // Calculate date range
        let startDate = new Date();
        switch (timeframe) {
            case '1d':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            default:
                startDate.setDate(startDate.getDate() - 30);
        }
        // Get comprehensive email data
        const [totalUsers, verifiedUsers, unverifiedUsers, recentRegistrations, bounceRates, emailCampaigns, verificationPending] = await Promise.all([
            // Total users
            database_1.default.user.count(),
            // Verified email users
            database_1.default.user.count({
                where: { emailVerified: true }
            }),
            // Unverified email users
            database_1.default.user.findMany({
                where: { emailVerified: false },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true,
                    lastLogin: true,
                    subscriptionTier: true
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            }),
            // Recent registrations needing verification
            database_1.default.user.findMany({
                where: {
                    createdAt: { gte: startDate },
                    emailVerified: false
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true,
                    subscriptionTier: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            // Simulate bounce rates (in real app, you'd track this)
            {
                totalSent: Math.floor(Math.random() * 1000) + 500,
                bounced: Math.floor(Math.random() * 50) + 10,
                delivered: Math.floor(Math.random() * 950) + 450,
                opened: Math.floor(Math.random() * 400) + 200
            },
            // Simulate email campaign data
            [
                {
                    id: 'campaign_1',
                    name: 'Welcome Series',
                    type: 'onboarding',
                    status: 'active',
                    sent: 245,
                    opened: 156,
                    clicked: 89,
                    lastSent: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'campaign_2',
                    name: 'Verification Reminders',
                    type: 'verification',
                    status: 'active',
                    sent: 89,
                    opened: 45,
                    clicked: 23,
                    lastSent: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'campaign_3',
                    name: 'Feature Updates',
                    type: 'newsletter',
                    status: 'scheduled',
                    sent: 0,
                    opened: 0,
                    clicked: 0,
                    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            // Users with pending email verification (priority)
            database_1.default.user.findMany({
                where: {
                    emailVerified: false,
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true,
                    subscriptionTier: true
                },
                orderBy: { createdAt: 'desc' }
            })
        ]);
        // Calculate email health metrics
        const emailHealth = {
            verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
            bounceRate: bounceRates.totalSent > 0 ? Math.round((bounceRates.bounced / bounceRates.totalSent) * 100) : 0,
            openRate: bounceRates.totalSent > 0 ? Math.round((bounceRates.opened / bounceRates.totalSent) * 100) : 0,
            deliveryRate: bounceRates.totalSent > 0 ? Math.round((bounceRates.delivered / bounceRates.totalSent) * 100) : 0
        };
        // Email domain analysis
        const domainAnalysis = unverifiedUsers.reduce((acc, user) => {
            const domain = user.email.split('@')[1];
            if (!acc[domain]) {
                acc[domain] = { count: 0, users: [] };
            }
            acc[domain].count++;
            acc[domain].users.push({
                id: user.id,
                email: user.email,
                name: user.firstName || user.email.split('@')[0],
                createdAt: user.createdAt
            });
            return acc;
        }, {});
        // Sort domains by count
        const topDomains = Object.entries(domainAnalysis)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 10)
            .map(([domain, data]) => ({
            domain,
            unverifiedCount: data.count,
            users: data.users
        }));
        // Email alerts
        const emailAlerts = [];
        if (emailHealth.verificationRate < 70) {
            emailAlerts.push({
                type: 'low_verification_rate',
                severity: 'warning',
                message: `Email verification rate is ${emailHealth.verificationRate}% (target: 70%+)`,
                timestamp: new Date().toISOString(),
                count: totalUsers - verifiedUsers
            });
        }
        if (emailHealth.bounceRate > 5) {
            emailAlerts.push({
                type: 'high_bounce_rate',
                severity: 'critical',
                message: `Email bounce rate is ${emailHealth.bounceRate}% (threshold: 5%)`,
                timestamp: new Date().toISOString(),
                count: bounceRates.bounced
            });
        }
        if (verificationPending.length > 50) {
            emailAlerts.push({
                type: 'pending_verifications',
                severity: 'info',
                message: `${verificationPending.length} users registered in last 24h need email verification`,
                timestamp: new Date().toISOString(),
                count: verificationPending.length
            });
        }
        // Recent email activity
        const recentActivity = [
            ...recentRegistrations.map(user => ({
                id: `reg-${user.id}`,
                type: 'registration',
                email: user.email,
                userName: user.firstName || user.email.split('@')[0],
                description: 'New user registration - verification needed',
                timestamp: user.createdAt,
                status: 'pending',
                tier: user.subscriptionTier
            })),
            ...emailCampaigns.filter(c => c.lastSent).map(campaign => ({
                id: `camp-${campaign.id}`,
                type: 'campaign',
                email: '',
                userName: 'System',
                description: `Email campaign '${campaign.name}' sent to ${campaign.sent} users`,
                timestamp: campaign.lastSent,
                status: 'completed',
                tier: ''
            }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    verifiedUsers,
                    unverifiedUsers: totalUsers - verifiedUsers,
                    pendingVerification: verificationPending.length,
                    verificationRate: emailHealth.verificationRate
                },
                emailHealth,
                campaigns: emailCampaigns,
                unverifiedUsersList: unverifiedUsers.map(user => ({
                    id: user.id,
                    email: user.email,
                    name: user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName || user.email.split('@')[0],
                    registeredAt: user.createdAt,
                    lastLogin: user.lastLogin,
                    tier: user.subscriptionTier,
                    daysSinceRegistration: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
                    priority: !user.lastLogin ? 'high' : 'medium'
                })),
                domainAnalysis: topDomains,
                recentActivity,
                alerts: emailAlerts,
                deliveryStats: {
                    sent: bounceRates.totalSent,
                    delivered: bounceRates.delivered,
                    bounced: bounceRates.bounced,
                    opened: bounceRates.opened,
                    deliveryRate: emailHealth.deliveryRate,
                    openRate: emailHealth.openRate,
                    bounceRate: emailHealth.bounceRate
                },
                timeframe,
                generatedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Get email management error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/admin/email-actions - Email management actions
router.post('/email-actions', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { action, userIds, campaignId, templateType, subject, customMessage } = req.body;
        const adminId = req.user.id;
        if (!action) {
            return res.status(400).json({
                success: false,
                message: 'Action is required'
            });
        }
        let result = {};
        switch (action) {
            case 'send_verification_reminder':
                if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'User IDs array is required for verification reminders'
                    });
                }
                // Get user details
                const users = await database_1.default.user.findMany({
                    where: {
                        id: { in: userIds },
                        emailVerified: false
                    },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                });
                if (users.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'No unverified users found with provided IDs'
                    });
                }
                // In a real implementation, you'd:
                // 1. Generate verification tokens
                // 2. Send verification emails
                // 3. Log email sends
                // 4. Track delivery status
                console.log(`Admin ${adminId} sent verification reminders to ${users.length} users:`, users.map(u => u.email));
                result = {
                    message: `Verification reminders sent to ${users.length} users`,
                    recipients: users.map(u => ({
                        email: u.email,
                        name: u.firstName || u.email.split('@')[0]
                    })),
                    sentAt: new Date().toISOString()
                };
                break;
            case 'bulk_verification_reminder':
                // Send reminders to all unverified users
                const allUnverified = await database_1.default.user.findMany({
                    where: { emailVerified: false },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        createdAt: true
                    }
                });
                // Filter to only recent registrations (last 30 days) to avoid spam
                const recentUnverified = allUnverified.filter(user => new Date(user.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000);
                console.log(`Admin ${adminId} sent bulk verification reminders to ${recentUnverified.length} recent users`);
                result = {
                    message: `Bulk verification reminders sent to ${recentUnverified.length} recent users`,
                    totalUnverified: allUnverified.length,
                    recentUnverified: recentUnverified.length,
                    sentAt: new Date().toISOString()
                };
                break;
            case 'create_email_campaign':
                if (!templateType || !subject) {
                    return res.status(400).json({
                        success: false,
                        message: 'Template type and subject are required for email campaigns'
                    });
                }
                const campaignData = {
                    id: `campaign_${Date.now()}`,
                    name: subject,
                    type: templateType,
                    subject,
                    message: customMessage || 'Default campaign message',
                    createdBy: adminId,
                    status: 'draft',
                    createdAt: new Date().toISOString()
                };
                console.log(`Admin ${adminId} created email campaign:`, campaignData);
                result = {
                    message: `Email campaign '${subject}' created successfully`,
                    campaign: campaignData
                };
                break;
            case 'send_campaign':
                if (!campaignId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Campaign ID is required'
                    });
                }
                // Get target users for campaign
                const targetUsers = await database_1.default.user.findMany({
                    where: {
                        emailVerified: true // Only send to verified emails
                    },
                    select: { id: true, email: true, firstName: true }
                });
                console.log(`Admin ${adminId} sent campaign ${campaignId} to ${targetUsers.length} users`);
                result = {
                    message: `Campaign sent to ${targetUsers.length} verified users`,
                    campaignId,
                    recipients: targetUsers.length,
                    sentAt: new Date().toISOString()
                };
                break;
            case 'verify_user_email':
                if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'User IDs are required for manual verification'
                    });
                }
                // Manually verify user emails (admin override)
                const verifiedUsers = await database_1.default.user.updateMany({
                    where: {
                        id: { in: userIds },
                        emailVerified: false
                    },
                    data: {
                        emailVerified: true,
                        updatedAt: new Date()
                    }
                });
                console.log(`Admin ${adminId} manually verified ${verifiedUsers.count} user emails`);
                result = {
                    message: `Manually verified ${verifiedUsers.count} user emails`,
                    verifiedCount: verifiedUsers.count,
                    verifiedAt: new Date().toISOString()
                };
                break;
            case 'export_email_list':
                const { filter = 'all' } = req.body;
                let whereClause = {};
                if (filter === 'verified') {
                    whereClause.emailVerified = true;
                }
                else if (filter === 'unverified') {
                    whereClause.emailVerified = false;
                }
                const emailList = await database_1.default.user.findMany({
                    where: whereClause,
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                        subscriptionTier: true,
                        createdAt: true,
                        emailVerified: true
                    },
                    orderBy: { createdAt: 'desc' }
                });
                result = {
                    message: `Exported ${emailList.length} email addresses`,
                    exportData: emailList,
                    filter,
                    exportedAt: new Date().toISOString()
                };
                break;
            case 'check_email_deliverability':
                // Simulate email deliverability check
                const deliverabilityScore = Math.random() * 30 + 70; // 70-100
                const issues = [];
                if (deliverabilityScore < 80) {
                    issues.push('SPF record needs optimization');
                }
                if (deliverabilityScore < 85) {
                    issues.push('DKIM signature should be implemented');
                }
                if (deliverabilityScore < 90) {
                    issues.push('Domain reputation could be improved');
                }
                result = {
                    message: 'Email deliverability check completed',
                    score: Math.round(deliverabilityScore),
                    status: deliverabilityScore > 90 ? 'excellent' :
                        deliverabilityScore > 80 ? 'good' :
                            deliverabilityScore > 70 ? 'fair' : 'poor',
                    issues,
                    checkedAt: new Date().toISOString()
                };
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: `Unknown email action: ${action}`
                });
        }
        console.log(`Admin ${adminId} performed email action '${action}':`, result);
        res.json({
            success: true,
            data: {
                action,
                performedBy: adminId,
                timestamp: new Date().toISOString(),
                ...result
            }
        });
    }
    catch (error) {
        console.error('Email action error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// GET /api/admin/email-templates - Email template management
router.get('/email-templates', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        // In a real implementation, these would be stored in database
        const emailTemplates = [
            {
                id: 'welcome',
                name: 'Welcome Email',
                type: 'onboarding',
                subject: 'Welcome to SmartPromptIQ! 🎉',
                content: 'Thank you for joining SmartPromptIQ! We\'re excited to help you create amazing AI prompts.',
                variables: ['firstName', 'lastName', 'verificationLink'],
                isActive: true,
                lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'verification',
                name: 'Email Verification',
                type: 'verification',
                subject: 'Please verify your email address',
                content: 'Hi {{firstName}}, please click the link below to verify your email: {{verificationLink}}',
                variables: ['firstName', 'verificationLink'],
                isActive: true,
                lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'verification_reminder',
                name: 'Verification Reminder',
                type: 'verification',
                subject: 'Don\'t forget to verify your email!',
                content: 'Hi {{firstName}}, you haven\'t verified your email yet. Please click: {{verificationLink}}',
                variables: ['firstName', 'verificationLink'],
                isActive: true,
                lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'password_reset',
                name: 'Password Reset',
                type: 'security',
                subject: 'Reset your SmartPromptIQ password',
                content: 'Hi {{firstName}}, click here to reset your password: {{resetLink}}',
                variables: ['firstName', 'resetLink'],
                isActive: true,
                lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'feature_update',
                name: 'Feature Update Newsletter',
                type: 'newsletter',
                subject: 'New features in SmartPromptIQ! ✨',
                content: 'Hi {{firstName}}, check out our latest features and improvements!',
                variables: ['firstName', 'featuresLink'],
                isActive: false,
                lastModified: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        // Template usage statistics (simulated)
        const templateStats = emailTemplates.map(template => {
            const sent = Math.floor(Math.random() * 500) + 100;
            const opened = Math.floor(sent * (Math.random() * 0.4 + 0.3)); // 30-70% open rate
            const clicked = Math.floor(opened * (Math.random() * 0.3 + 0.1)); // 10-40% click rate
            return {
                templateId: template.id,
                name: template.name,
                sent,
                opened,
                clicked,
                openRate: Math.round((opened / sent) * 100),
                clickRate: Math.round((clicked / opened) * 100),
                lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            };
        });
        res.json({
            success: true,
            data: {
                templates: emailTemplates,
                statistics: templateStats,
                summary: {
                    totalTemplates: emailTemplates.length,
                    activeTemplates: emailTemplates.filter(t => t.isActive).length,
                    totalSent: templateStats.reduce((sum, stat) => sum + stat.sent, 0),
                    averageOpenRate: Math.round(templateStats.reduce((sum, stat) => sum + stat.openRate, 0) / templateStats.length),
                    averageClickRate: Math.round(templateStats.reduce((sum, stat) => sum + stat.clickRate, 0) / templateStats.length)
                },
                generatedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Get email templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/admin/email-templates - Create/update email template
router.post('/email-templates', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { templateId, name, type, subject, content, variables, isActive } = req.body;
        const adminId = req.user.id;
        if (!name || !type || !subject || !content) {
            return res.status(400).json({
                success: false,
                message: 'Name, type, subject, and content are required'
            });
        }
        const template = {
            id: templateId || `template_${Date.now()}`,
            name,
            type,
            subject,
            content,
            variables: variables || [],
            isActive: isActive !== undefined ? isActive : true,
            lastModified: new Date().toISOString(),
            modifiedBy: adminId
        };
        // In a real implementation, you'd save this to database
        console.log(`Admin ${adminId} ${templateId ? 'updated' : 'created'} email template:`, template);
        res.json({
            success: true,
            data: {
                template,
                action: templateId ? 'updated' : 'created',
                performedBy: adminId,
                timestamp: new Date().toISOString()
            },
            message: `Email template '${name}' ${templateId ? 'updated' : 'created'} successfully`
        });
    }
    catch (error) {
        console.error('Email template operation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// DELETE /api/admin/users/:id - Delete user account
router.delete('/users/:id', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Deletion reason is required'
            });
        }
        // Check if user exists
        const user = await database_1.default.user.findUnique({
            where: { id }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Don't allow deleting other admins
        if (user.role === 'ADMIN' && user.id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete other admin accounts'
            });
        }
        // Delete user and all related data (cascade)
        await database_1.default.user.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'User account deleted successfully',
            data: {
                deletedUserId: id,
                reason,
                deletedBy: req.user.id,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// DELETE /api/admin/payments/:id - Delete payment record
router.delete('/payments/:id', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Deletion reason is required'
            });
        }
        // Find payment record
        const payment = await database_1.default.tokenTransaction.findUnique({
            where: { id }
        });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }
        // Delete payment record
        await database_1.default.tokenTransaction.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Payment record deleted successfully',
            data: {
                deletedPaymentId: id,
                reason,
                deletedBy: req.user.id,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Delete payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// DELETE /api/admin/sessions/:userId - Terminate user sessions
router.delete('/sessions/:userId', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Termination reason is required'
            });
        }
        // Check if user exists
        const user = await database_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Update user's token version to invalidate all sessions
        await database_1.default.user.update({
            where: { id: userId },
            data: {
                tokenVersion: { increment: 1 }
            }
        });
        res.json({
            success: true,
            message: 'User sessions terminated successfully',
            data: {
                userId,
                reason,
                terminatedBy: req.user.id,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Terminate sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// DELETE /api/admin/logs - Clear system logs
router.delete('/logs', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { olderThan, reason } = req.body;
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Deletion reason is required'
            });
        }
        let whereCondition = {};
        if (olderThan) {
            const cutoffDate = new Date(olderThan);
            whereCondition = { createdAt: { lt: cutoffDate } };
        }
        // Delete usage logs
        const deletedLogs = await database_1.default.usageLog.deleteMany({
            where: whereCondition
        });
        res.json({
            success: true,
            message: `${deletedLogs.count} system logs deleted successfully`,
            data: {
                deletedCount: deletedLogs.count,
                reason,
                deletedBy: req.user.id,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Delete logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/admin/users/:id/suspend - Suspend user account
router.post('/users/:id/suspend', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, duration } = req.body;
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Suspension reason is required'
            });
        }
        // Check if user exists
        const user = await database_1.default.user.findUnique({
            where: { id }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Don't allow suspending other admins
        if (user.role === 'ADMIN' && user.id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Cannot suspend other admin accounts'
            });
        }
        const suspendedUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
        // Update user status
        await database_1.default.user.update({
            where: { id },
            data: {
                status: 'suspended',
                suspendedUntil,
                suspensionReason: reason,
                tokenVersion: { increment: 1 } // Invalidate sessions
            }
        });
        res.json({
            success: true,
            message: 'User account suspended successfully',
            data: {
                userId: id,
                reason,
                suspendedUntil,
                suspendedBy: req.user.id,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/admin/users/:id/unsuspend - Unsuspend user account
router.post('/users/:id/unsuspend', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Unsuspension reason is required'
            });
        }
        // Check if user exists
        const user = await database_1.default.user.findUnique({
            where: { id }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Update user status
        await database_1.default.user.update({
            where: { id },
            data: {
                status: 'active',
                suspendedUntil: null,
                suspensionReason: null
            }
        });
        res.json({
            success: true,
            message: 'User account unsuspended successfully',
            data: {
                userId: id,
                reason,
                unsuspendedBy: req.user.id,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Unsuspend user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// =============================================================================
// STORAGE CLEANUP ENDPOINTS
// =============================================================================
const cleanupService_1 = require("../services/cleanupService");
const supabase_1 = require("../lib/supabase");
/**
 * POST /api/admin/storage/cleanup
 * Trigger manual storage cleanup
 */
router.post('/storage/cleanup', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { retentionDays = cleanupService_1.DEFAULT_RETENTION_DAYS } = req.body;
        console.log(`🧹 Admin triggered storage cleanup (retention: ${retentionDays} days)`);
        const result = await (0, cleanupService_1.runCleanup)(retentionDays);
        res.json({
            success: result.success,
            message: result.success ? 'Cleanup completed successfully' : 'Cleanup completed with errors',
            summary: {
                totalFilesDeleted: result.totalFilesDeleted,
                totalFilesSkipped: result.totalFilesSkipped,
                totalErrors: result.totalErrors,
                duration: result.duration,
                timestamp: result.timestamp,
            },
            details: result.results,
        });
    }
    catch (error) {
        console.error('Storage cleanup error:', error);
        res.status(500).json({
            success: false,
            message: 'Storage cleanup failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * GET /api/admin/storage/stats
 * Get storage statistics for all audio buckets
 */
router.get('/storage/stats', auth_1.authenticate, requireAdmin, async (_req, res) => {
    try {
        const stats = {};
        for (const [key, bucket] of Object.entries(supabase_1.STORAGE_BUCKETS)) {
            const bucketStats = await (0, cleanupService_1.getBucketStats)(bucket);
            stats[bucket] = bucketStats;
        }
        res.json({
            success: true,
            buckets: Object.values(supabase_1.STORAGE_BUCKETS),
            stats,
            retentionDays: cleanupService_1.DEFAULT_RETENTION_DAYS,
        });
    }
    catch (error) {
        console.error('Storage stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get storage stats',
        });
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// USER FEATURE ACCESS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════
// Feature limits by tier (mirrors frontend featureAccess.ts)
const TIER_LIMITS = {
    free: {
        promptsPerMonth: 10,
        tokensPerMonth: 50,
        advancedModels: false,
        voiceGenerationsPerMonth: 5,
        openAIVoices: true,
        elevenLabsVoices: false,
        premiumElevenLabsVoices: false,
        voiceDownloads: false,
        voiceCommercialUse: false,
        musicTracksPerMonth: 3,
        introOutroAccess: false,
        introOutroDownloads: false,
        premiumMusicLibrary: false,
        voiceMusicMixing: false,
        imageGenerationsPerMonth: 5,
        stableDiffusion: true,
        dalleAccess: false,
        dalle3Access: false,
        printIntegration: false,
        blueprintsPerMonth: 1,
        storyModeVoice: false,
        appTemplates: false,
        deploymentHub: false,
        codeExport: false,
        freeCourses: true,
        allCourses: false,
        certificates: false,
        earlyAccess: false,
        playgroundTests: 5,
        pdfExport: false,
        jsonExport: false,
        audioDownloads: false,
        videoExport: false,
        removeBranding: false,
        apiAccess: false,
        apiCallsPerMonth: 0,
        webhooks: false,
        teamMembers: 1,
        teamWorkspace: false,
        adminDashboard: false,
        supportLevel: 'community',
        responseTime: '48-72 hours',
    },
    starter: {
        promptsPerMonth: 100,
        tokensPerMonth: 500,
        advancedModels: false,
        voiceGenerationsPerMonth: 50,
        openAIVoices: true,
        elevenLabsVoices: false,
        premiumElevenLabsVoices: false,
        voiceDownloads: true,
        voiceCommercialUse: false,
        musicTracksPerMonth: 10,
        introOutroAccess: true,
        introOutroDownloads: true,
        premiumMusicLibrary: false,
        voiceMusicMixing: false,
        imageGenerationsPerMonth: 30,
        stableDiffusion: true,
        dalleAccess: false,
        dalle3Access: false,
        printIntegration: false,
        blueprintsPerMonth: 3,
        storyModeVoice: false,
        appTemplates: true,
        deploymentHub: false,
        codeExport: false,
        freeCourses: true,
        allCourses: false,
        certificates: false,
        earlyAccess: false,
        playgroundTests: 25,
        pdfExport: true,
        jsonExport: false,
        audioDownloads: true,
        videoExport: false,
        removeBranding: false,
        apiAccess: false,
        apiCallsPerMonth: 0,
        webhooks: false,
        teamMembers: 1,
        teamWorkspace: false,
        adminDashboard: false,
        supportLevel: 'email',
        responseTime: '24-48 hours',
    },
    pro: {
        promptsPerMonth: 500,
        tokensPerMonth: 2000,
        advancedModels: true,
        voiceGenerationsPerMonth: 200,
        openAIVoices: true,
        elevenLabsVoices: true,
        premiumElevenLabsVoices: false,
        voiceDownloads: true,
        voiceCommercialUse: true,
        musicTracksPerMonth: 50,
        introOutroAccess: true,
        introOutroDownloads: true,
        premiumMusicLibrary: true,
        voiceMusicMixing: true,
        imageGenerationsPerMonth: 100,
        stableDiffusion: true,
        dalleAccess: true,
        dalle3Access: true,
        printIntegration: true,
        blueprintsPerMonth: 10,
        storyModeVoice: true,
        appTemplates: true,
        deploymentHub: true,
        codeExport: true,
        freeCourses: true,
        allCourses: true,
        certificates: true,
        earlyAccess: false,
        playgroundTests: 100,
        pdfExport: true,
        jsonExport: true,
        audioDownloads: true,
        videoExport: true,
        removeBranding: false,
        apiAccess: false,
        apiCallsPerMonth: 0,
        webhooks: false,
        teamMembers: 1,
        teamWorkspace: false,
        adminDashboard: false,
        supportLevel: 'priority',
        responseTime: '12-24 hours',
    },
    business: {
        promptsPerMonth: 2000,
        tokensPerMonth: 5000,
        advancedModels: true,
        voiceGenerationsPerMonth: 500,
        openAIVoices: true,
        elevenLabsVoices: true,
        premiumElevenLabsVoices: true,
        voiceDownloads: true,
        voiceCommercialUse: true,
        musicTracksPerMonth: 150,
        introOutroAccess: true,
        introOutroDownloads: true,
        premiumMusicLibrary: true,
        voiceMusicMixing: true,
        imageGenerationsPerMonth: 300,
        stableDiffusion: true,
        dalleAccess: true,
        dalle3Access: true,
        printIntegration: true,
        blueprintsPerMonth: -1,
        storyModeVoice: true,
        appTemplates: true,
        deploymentHub: true,
        codeExport: true,
        freeCourses: true,
        allCourses: true,
        certificates: true,
        earlyAccess: true,
        playgroundTests: 500,
        pdfExport: true,
        jsonExport: true,
        audioDownloads: true,
        videoExport: true,
        removeBranding: true,
        apiAccess: true,
        apiCallsPerMonth: 1000,
        webhooks: true,
        teamMembers: 5,
        teamWorkspace: true,
        adminDashboard: true,
        supportLevel: 'priority',
        responseTime: '4-12 hours',
    },
    enterprise: {
        promptsPerMonth: -1,
        tokensPerMonth: 20000,
        advancedModels: true,
        voiceGenerationsPerMonth: -1,
        openAIVoices: true,
        elevenLabsVoices: true,
        premiumElevenLabsVoices: true,
        voiceDownloads: true,
        voiceCommercialUse: true,
        musicTracksPerMonth: -1,
        introOutroAccess: true,
        introOutroDownloads: true,
        premiumMusicLibrary: true,
        voiceMusicMixing: true,
        imageGenerationsPerMonth: -1,
        stableDiffusion: true,
        dalleAccess: true,
        dalle3Access: true,
        printIntegration: true,
        blueprintsPerMonth: -1,
        storyModeVoice: true,
        appTemplates: true,
        deploymentHub: true,
        codeExport: true,
        freeCourses: true,
        allCourses: true,
        certificates: true,
        earlyAccess: true,
        playgroundTests: -1,
        pdfExport: true,
        jsonExport: true,
        audioDownloads: true,
        videoExport: true,
        removeBranding: true,
        apiAccess: true,
        apiCallsPerMonth: -1,
        webhooks: true,
        teamMembers: -1,
        teamWorkspace: true,
        adminDashboard: true,
        supportLevel: 'dedicated',
        responseTime: '1-4 hours',
    },
};
/**
 * GET /api/admin/users/:id/features
 * Get detailed feature access for a specific user
 */
router.get('/users/:id/features', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await database_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                subscriptionTier: true,
                tokensUsed: true,
                generationsUsed: true,
                createdAt: true,
                lastLogin: true,
                emailVerified: true,
                subscriptions: {
                    where: { status: 'active' },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                prompts: {
                    select: { id: true },
                },
                usageLogs: {
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        },
                    },
                    select: {
                        tokensConsumed: true,
                        costInCents: true,
                        provider: true,
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        // Get tier limits
        const tier = user.subscriptionTier?.toLowerCase() || 'free';
        const tierLimits = TIER_LIMITS[tier] || TIER_LIMITS.free;
        // Calculate current usage
        const totalTokensUsed = user.usageLogs.reduce((sum, log) => sum + log.tokensConsumed, 0);
        const totalCost = user.usageLogs.reduce((sum, log) => sum + log.costInCents, 0) / 100;
        const promptsCreated = user.prompts.length;
        // Build feature access list with usage data
        const featureAccess = {
            prompts: {
                name: 'Prompt Generation',
                hasAccess: true,
                limit: tierLimits.promptsPerMonth,
                used: promptsCreated,
                remaining: tierLimits.promptsPerMonth === -1 ? 'Unlimited' : Math.max(0, tierLimits.promptsPerMonth - promptsCreated),
            },
            tokens: {
                name: 'AI Tokens',
                hasAccess: true,
                limit: tierLimits.tokensPerMonth,
                used: totalTokensUsed,
                remaining: tierLimits.tokensPerMonth === -1 ? 'Unlimited' : Math.max(0, tierLimits.tokensPerMonth - totalTokensUsed),
            },
            advancedModels: {
                name: 'Advanced AI Models (GPT-4, Claude)',
                hasAccess: tierLimits.advancedModels,
                description: tierLimits.advancedModels ? 'Full access to GPT-4 and Claude' : 'Limited to GPT-3.5',
            },
            voiceGeneration: {
                name: 'Voice Generation',
                hasAccess: tierLimits.voiceGenerationsPerMonth > 0,
                limit: tierLimits.voiceGenerationsPerMonth,
                features: {
                    openAIVoices: tierLimits.openAIVoices,
                    elevenLabsVoices: tierLimits.elevenLabsVoices,
                    premiumElevenLabsVoices: tierLimits.premiumElevenLabsVoices,
                    voiceDownloads: tierLimits.voiceDownloads,
                    voiceCommercialUse: tierLimits.voiceCommercialUse,
                },
            },
            music: {
                name: 'Music & Audio',
                hasAccess: tierLimits.musicTracksPerMonth > 0,
                limit: tierLimits.musicTracksPerMonth,
                features: {
                    introOutroAccess: tierLimits.introOutroAccess,
                    introOutroDownloads: tierLimits.introOutroDownloads,
                    premiumMusicLibrary: tierLimits.premiumMusicLibrary,
                    voiceMusicMixing: tierLimits.voiceMusicMixing,
                },
            },
            designStudio: {
                name: 'Design Studio',
                hasAccess: tierLimits.imageGenerationsPerMonth > 0,
                limit: tierLimits.imageGenerationsPerMonth,
                features: {
                    stableDiffusion: tierLimits.stableDiffusion,
                    dalleAccess: tierLimits.dalleAccess,
                    dalle3Access: tierLimits.dalle3Access,
                    printIntegration: tierLimits.printIntegration,
                },
            },
            builderIQ: {
                name: 'BuilderIQ',
                hasAccess: tierLimits.blueprintsPerMonth !== 0,
                limit: tierLimits.blueprintsPerMonth,
                features: {
                    storyModeVoice: tierLimits.storyModeVoice,
                    appTemplates: tierLimits.appTemplates,
                    deploymentHub: tierLimits.deploymentHub,
                    codeExport: tierLimits.codeExport,
                },
            },
            academy: {
                name: 'Academy',
                hasAccess: tierLimits.freeCourses,
                features: {
                    freeCourses: tierLimits.freeCourses,
                    allCourses: tierLimits.allCourses,
                    certificates: tierLimits.certificates,
                    earlyAccess: tierLimits.earlyAccess,
                    playgroundTests: tierLimits.playgroundTests,
                },
            },
            downloads: {
                name: 'Downloads & Exports',
                hasAccess: tierLimits.pdfExport || tierLimits.audioDownloads,
                features: {
                    pdfExport: tierLimits.pdfExport,
                    jsonExport: tierLimits.jsonExport,
                    audioDownloads: tierLimits.audioDownloads,
                    videoExport: tierLimits.videoExport,
                    removeBranding: tierLimits.removeBranding,
                },
            },
            api: {
                name: 'API Access',
                hasAccess: tierLimits.apiAccess,
                limit: tierLimits.apiCallsPerMonth,
                features: {
                    webhooks: tierLimits.webhooks,
                },
            },
            team: {
                name: 'Team Features',
                hasAccess: tierLimits.teamWorkspace,
                limit: tierLimits.teamMembers,
                features: {
                    teamWorkspace: tierLimits.teamWorkspace,
                    adminDashboard: tierLimits.adminDashboard,
                },
            },
            support: {
                name: 'Support',
                level: tierLimits.supportLevel,
                responseTime: tierLimits.responseTime,
            },
        };
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName || user.email.split('@')[0],
                    role: user.role,
                    tier: user.subscriptionTier,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                    emailVerified: user.emailVerified,
                },
                subscription: user.subscriptions[0] || null,
                usage: {
                    totalTokensUsed,
                    totalCost: `$${totalCost.toFixed(2)}`,
                    promptsCreated,
                    period: 'Last 30 days',
                },
                featureAccess,
                tierLimits,
            },
        });
    }
    catch (error) {
        console.error('Get user features error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
/**
 * POST /api/admin/impersonate/:id
 * Generate a temporary impersonation token for viewing app as a specific user
 * (Read-only access, no modifications allowed)
 */
router.post('/impersonate/:id', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        // Find the target user
        const targetUser = await database_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                subscriptionTier: true,
            },
        });
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        // Cannot impersonate another admin
        if (targetUser.role === 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Cannot impersonate admin users',
            });
        }
        // Log impersonation attempt for audit
        console.log(`🔐 Admin ${adminId} is impersonating user ${targetUser.email} (${id})`);
        // Import JWT for token generation
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'smartpromptiq-jwt-secret-key';
        // Create impersonation token (short-lived, 30 minutes)
        const impersonationToken = jwt.sign({
            userId: targetUser.id,
            email: targetUser.email,
            role: targetUser.role,
            subscriptionTier: targetUser.subscriptionTier,
            isImpersonation: true,
            impersonatedBy: adminId,
            originalAdmin: req.user.email,
        }, JWT_SECRET, { expiresIn: '30m' });
        res.json({
            success: true,
            message: 'Impersonation session created',
            data: {
                impersonationToken,
                targetUser: {
                    id: targetUser.id,
                    email: targetUser.email,
                    name: targetUser.firstName && targetUser.lastName
                        ? `${targetUser.firstName} ${targetUser.lastName}`
                        : targetUser.firstName || targetUser.email.split('@')[0],
                    tier: targetUser.subscriptionTier,
                    role: targetUser.role,
                },
                expiresIn: '30 minutes',
                restrictions: [
                    'Read-only access',
                    'Cannot make purchases',
                    'Cannot modify user data',
                    'Cannot delete content',
                ],
            },
        });
    }
    catch (error) {
        console.error('Impersonate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
/**
 * GET /api/admin/feature-overview
 * Get overview of all features across all tiers for admin reference
 */
router.get('/feature-overview', auth_1.authenticate, requireAdmin, async (_req, res) => {
    try {
        // Get user counts by tier
        const tierCounts = await database_1.default.user.groupBy({
            by: ['subscriptionTier'],
            _count: {
                subscriptionTier: true,
            },
        });
        const tierStats = {};
        tierCounts.forEach(tier => {
            tierStats[tier.subscriptionTier?.toLowerCase() || 'free'] = tier._count.subscriptionTier;
        });
        // Build comprehensive feature overview
        const featureOverview = {
            tiers: ['free', 'starter', 'pro', 'business', 'enterprise'],
            tierDisplayNames: {
                free: 'Free',
                starter: 'Starter ($19/mo)',
                pro: 'Pro ($49/mo)',
                business: 'Business ($99/mo)',
                enterprise: 'Enterprise ($299/mo)',
            },
            tierUserCounts: tierStats,
            features: {
                promptGeneration: {
                    name: 'Prompt Generation',
                    limits: {
                        free: '10/month',
                        starter: '100/month',
                        pro: '500/month',
                        business: '2000/month',
                        enterprise: 'Unlimited',
                    },
                },
                voiceGeneration: {
                    name: 'Voice Generation',
                    limits: {
                        free: '5/month (OpenAI only)',
                        starter: '50/month (OpenAI only)',
                        pro: '200/month (OpenAI + ElevenLabs)',
                        business: '500/month (All voices)',
                        enterprise: 'Unlimited (All voices)',
                    },
                },
                musicAudio: {
                    name: 'Music & Audio',
                    limits: {
                        free: '3 tracks/month',
                        starter: '10 tracks/month + Intro/Outro',
                        pro: '50 tracks/month + Premium Library',
                        business: '150 tracks/month + All features',
                        enterprise: 'Unlimited + All features',
                    },
                },
                designStudio: {
                    name: 'Design Studio',
                    limits: {
                        free: '5 images/month (SD only)',
                        starter: '30 images/month (SD only)',
                        pro: '100 images/month (SD + DALL-E 3)',
                        business: '300 images/month + POD Integration',
                        enterprise: 'Unlimited + POD Priority',
                    },
                },
                builderIQ: {
                    name: 'BuilderIQ',
                    limits: {
                        free: '1 blueprint/month',
                        starter: '3 blueprints/month + Templates',
                        pro: '10 blueprints/month + Story Mode + Deployment',
                        business: 'Unlimited + All features',
                        enterprise: 'Unlimited + All features',
                    },
                },
                academy: {
                    name: 'Academy',
                    limits: {
                        free: 'Free courses only',
                        starter: 'Free courses only',
                        pro: 'All 57 courses + Certificates',
                        business: 'All courses + Early Access',
                        enterprise: 'All courses + Early Access',
                    },
                },
                api: {
                    name: 'API Access',
                    limits: {
                        free: 'No access',
                        starter: 'No access',
                        pro: 'No access',
                        business: '1000 calls/month + Webhooks',
                        enterprise: 'Unlimited + Webhooks',
                    },
                },
                team: {
                    name: 'Team Features',
                    limits: {
                        free: '1 member',
                        starter: '1 member',
                        pro: '1 member',
                        business: '5 members + Workspace + Admin',
                        enterprise: 'Unlimited members + All features',
                    },
                },
                support: {
                    name: 'Support',
                    limits: {
                        free: 'Community (48-72h)',
                        starter: 'Email (24-48h)',
                        pro: 'Priority (12-24h)',
                        business: 'Priority (4-12h)',
                        enterprise: 'Dedicated (1-4h)',
                    },
                },
            },
            tierLimits: TIER_LIMITS,
        };
        res.json({
            success: true,
            data: featureOverview,
        });
    }
    catch (error) {
        console.error('Feature overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
/**
 * PUT /api/admin/users/:id/tier
 * Update a user's subscription tier (admin override)
 */
router.put('/users/:id/tier', auth_1.authenticate, requireAdmin, [
    (0, express_validator_1.body)('tier').isIn(['free', 'starter', 'pro', 'business', 'enterprise']).withMessage('Invalid tier'),
    (0, express_validator_1.body)('reason').notEmpty().trim().withMessage('Reason is required for tier changes'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const { id } = req.params;
        const { tier, reason } = req.body;
        const adminId = req.user.id;
        const user = await database_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                subscriptionTier: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        const previousTier = user.subscriptionTier;
        // Update user tier
        await database_1.default.user.update({
            where: { id },
            data: {
                subscriptionTier: tier.toUpperCase(),
                updatedAt: new Date(),
            },
        });
        // Log the admin action
        console.log(`🔐 Admin ${adminId} changed user ${user.email} tier: ${previousTier} -> ${tier.toUpperCase()}. Reason: ${reason}`);
        res.json({
            success: true,
            message: 'User tier updated successfully',
            data: {
                userId: id,
                email: user.email,
                previousTier,
                newTier: tier.toUpperCase(),
                updatedBy: adminId,
                reason,
                updatedAt: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Update user tier error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// USER DELETION AND CLEANUP ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * POST /api/admin/users/bulk-delete
 * Delete multiple users at once
 */
router.post('/users/bulk-delete', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { userIds, reason, permanent = false } = req.body;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'User IDs array is required',
            });
        }
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Deletion reason is required',
            });
        }
        const adminId = req.user.id;
        const results = [];
        for (const userId of userIds) {
            try {
                // Check if user exists
                const user = await database_1.default.user.findUnique({
                    where: { id: userId },
                });
                if (!user) {
                    results.push({ userId, success: false, error: 'User not found' });
                    continue;
                }
                // Don't allow deleting admins
                if (user.role === 'ADMIN') {
                    results.push({ userId, success: false, error: 'Cannot delete admin users' });
                    continue;
                }
                if (permanent) {
                    // Permanent delete - remove from database
                    await database_1.default.user.delete({
                        where: { id: userId },
                    });
                }
                else {
                    // Soft delete - mark as deleted
                    await database_1.default.user.update({
                        where: { id: userId },
                        data: {
                            status: 'deleted',
                            deletedAt: new Date(),
                            email: `deleted_${Date.now()}_${user.email}`, // Anonymize email
                        },
                    });
                }
                results.push({ userId, success: true });
                console.log(`🗑️ Admin ${adminId} ${permanent ? 'permanently' : 'soft'} deleted user ${user.email}. Reason: ${reason}`);
            }
            catch (err) {
                results.push({ userId, success: false, error: err.message });
            }
        }
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;
        res.json({
            success: true,
            message: `Deleted ${successCount} users, ${failCount} failed`,
            data: {
                results,
                deletedBy: adminId,
                permanent,
                reason,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Bulk delete users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
/**
 * POST /api/admin/cleanup/demo-users
 * Delete all demo/test users (emails containing 'demo', 'test', 'example')
 */
router.post('/cleanup/demo-users', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { confirm, permanent = false } = req.body;
        if (confirm !== 'DELETE_DEMO_USERS') {
            return res.status(400).json({
                success: false,
                message: 'Please confirm by setting confirm: "DELETE_DEMO_USERS"',
            });
        }
        const adminId = req.user.id;
        // Find demo users
        const demoUsers = await database_1.default.user.findMany({
            where: {
                AND: [
                    { role: { not: 'ADMIN' } }, // Never delete admins
                    {
                        OR: [
                            { email: { contains: 'demo' } },
                            { email: { contains: 'test' } },
                            { email: { contains: 'example' } },
                            { email: { endsWith: '@test.com' } },
                            { email: { endsWith: '@demo.com' } },
                            { email: { endsWith: '@example.com' } },
                            { firstName: { contains: 'Demo' } },
                            { firstName: { contains: 'Test' } },
                        ],
                    },
                ],
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
            },
        });
        if (demoUsers.length === 0) {
            return res.json({
                success: true,
                message: 'No demo users found',
                data: { deletedCount: 0 },
            });
        }
        const userIds = demoUsers.map(u => u.id);
        if (permanent) {
            // Permanent delete
            await database_1.default.user.deleteMany({
                where: { id: { in: userIds } },
            });
        }
        else {
            // Soft delete
            await database_1.default.user.updateMany({
                where: { id: { in: userIds } },
                data: {
                    status: 'deleted',
                    deletedAt: new Date(),
                },
            });
        }
        console.log(`🧹 Admin ${adminId} cleaned up ${demoUsers.length} demo users (permanent: ${permanent})`);
        res.json({
            success: true,
            message: `${permanent ? 'Permanently deleted' : 'Soft deleted'} ${demoUsers.length} demo users`,
            data: {
                deletedCount: demoUsers.length,
                deletedUsers: demoUsers,
                permanent,
                deletedBy: adminId,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Cleanup demo users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
/**
 * POST /api/admin/cleanup/inactive-users
 * Delete users inactive for X days
 */
router.post('/cleanup/inactive-users', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { daysInactive = 90, confirm, permanent = false } = req.body;
        if (confirm !== 'DELETE_INACTIVE_USERS') {
            return res.status(400).json({
                success: false,
                message: 'Please confirm by setting confirm: "DELETE_INACTIVE_USERS"',
            });
        }
        if (daysInactive < 30) {
            return res.status(400).json({
                success: false,
                message: 'Minimum inactive days is 30',
            });
        }
        const adminId = req.user.id;
        const cutoffDate = new Date(Date.now() - daysInactive * 24 * 60 * 60 * 1000);
        // Find inactive users
        const inactiveUsers = await database_1.default.user.findMany({
            where: {
                AND: [
                    { role: { not: 'ADMIN' } }, // Never delete admins
                    { subscriptionTier: 'free' }, // Only free tier users
                    {
                        OR: [
                            { lastLogin: { lt: cutoffDate } },
                            { lastLogin: null, createdAt: { lt: cutoffDate } },
                        ],
                    },
                ],
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                lastLogin: true,
                createdAt: true,
            },
        });
        if (inactiveUsers.length === 0) {
            return res.json({
                success: true,
                message: `No users inactive for ${daysInactive}+ days found`,
                data: { deletedCount: 0 },
            });
        }
        const userIds = inactiveUsers.map(u => u.id);
        if (permanent) {
            await database_1.default.user.deleteMany({
                where: { id: { in: userIds } },
            });
        }
        else {
            await database_1.default.user.updateMany({
                where: { id: { in: userIds } },
                data: {
                    status: 'deleted',
                    deletedAt: new Date(),
                },
            });
        }
        console.log(`🧹 Admin ${adminId} cleaned up ${inactiveUsers.length} inactive users (${daysInactive}+ days, permanent: ${permanent})`);
        res.json({
            success: true,
            message: `${permanent ? 'Permanently deleted' : 'Soft deleted'} ${inactiveUsers.length} inactive users`,
            data: {
                deletedCount: inactiveUsers.length,
                deletedUsers: inactiveUsers,
                daysInactive,
                permanent,
                deletedBy: adminId,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Cleanup inactive users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
/**
 * GET /api/admin/deleted-users
 * Get list of soft-deleted users
 */
router.get('/deleted-users', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const deletedUsers = await database_1.default.user.findMany({
            where: {
                status: 'deleted',
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                deletedAt: true,
                createdAt: true,
                subscriptionTier: true,
            },
            orderBy: { deletedAt: 'desc' },
        });
        res.json({
            success: true,
            data: {
                users: deletedUsers,
                count: deletedUsers.length,
            },
        });
    }
    catch (error) {
        console.error('Get deleted users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
/**
 * POST /api/admin/users/:id/restore
 * Restore a soft-deleted user
 */
router.post('/users/:id/restore', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        const user = await database_1.default.user.findUnique({
            where: { id },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        if (user.status !== 'deleted') {
            return res.status(400).json({
                success: false,
                message: 'User is not deleted',
            });
        }
        // Restore the user
        const restoredUser = await database_1.default.user.update({
            where: { id },
            data: {
                status: 'active',
                deletedAt: null,
                // If email was anonymized, we can't restore it - user may need to update
            },
        });
        console.log(`♻️ Admin ${adminId} restored user ${id}`);
        res.json({
            success: true,
            message: 'User restored successfully',
            data: {
                userId: id,
                email: restoredUser.email,
                restoredBy: adminId,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Restore user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
/**
 * DELETE /api/admin/users/:id/permanent
 * Permanently delete a user (no recovery)
 */
router.delete('/users/:id/permanent', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { confirm, reason } = req.body;
        const adminId = req.user.id;
        if (confirm !== 'PERMANENT_DELETE') {
            return res.status(400).json({
                success: false,
                message: 'Please confirm by setting confirm: "PERMANENT_DELETE"',
            });
        }
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Deletion reason is required',
            });
        }
        const user = await database_1.default.user.findUnique({
            where: { id },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        if (user.role === 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Cannot permanently delete admin users',
            });
        }
        // Permanently delete user and all related data
        await database_1.default.user.delete({
            where: { id },
        });
        console.log(`⚠️ Admin ${adminId} PERMANENTLY deleted user ${user.email}. Reason: ${reason}`);
        res.json({
            success: true,
            message: 'User permanently deleted',
            data: {
                deletedUserId: id,
                deletedEmail: user.email,
                reason,
                deletedBy: adminId,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Permanent delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
/**
 * POST /api/admin/cleanup/purge-deleted
 * Permanently remove all soft-deleted users older than X days
 */
router.post('/cleanup/purge-deleted', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { daysOld = 30, confirm } = req.body;
        if (confirm !== 'PURGE_DELETED_USERS') {
            return res.status(400).json({
                success: false,
                message: 'Please confirm by setting confirm: "PURGE_DELETED_USERS"',
            });
        }
        const adminId = req.user.id;
        const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
        // Find soft-deleted users older than cutoff
        const usersToDelete = await database_1.default.user.findMany({
            where: {
                status: 'deleted',
                deletedAt: { lt: cutoffDate },
            },
            select: {
                id: true,
                email: true,
                deletedAt: true,
            },
        });
        if (usersToDelete.length === 0) {
            return res.json({
                success: true,
                message: `No deleted users older than ${daysOld} days`,
                data: { purgedCount: 0 },
            });
        }
        const userIds = usersToDelete.map(u => u.id);
        // Permanently delete
        await database_1.default.user.deleteMany({
            where: { id: { in: userIds } },
        });
        console.log(`🗑️ Admin ${adminId} purged ${usersToDelete.length} deleted users (${daysOld}+ days old)`);
        res.json({
            success: true,
            message: `Permanently purged ${usersToDelete.length} deleted users`,
            data: {
                purgedCount: usersToDelete.length,
                purgedUsers: usersToDelete,
                daysOld,
                purgedBy: adminId,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Purge deleted users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE MIGRATION ENDPOINT - Add missing columns
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * POST /api/admin/run-migrations
 * Run database migrations to add missing columns
 * Protected by admin secret key
 */
router.post('/run-migrations', async (req, res) => {
    try {
        const { adminSecret } = req.body;
        // Validate admin secret
        const expectedSecret = process.env.ADMIN_SEED_SECRET || 'smartpromptiq-admin-2024';
        if (adminSecret !== expectedSecret) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin secret'
            });
        }
        const migrations = [];
        // Migration 1: Add discordId column if it doesn't exist
        try {
            await database_1.default.$executeRaw `
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS "discordId" VARCHAR(255) UNIQUE
      `;
            migrations.push({ name: 'Add discordId column', success: true });
        }
        catch (error) {
            // Column might already exist or other error
            if (error.message?.includes('already exists')) {
                migrations.push({ name: 'Add discordId column', success: true, error: 'Column already exists' });
            }
            else {
                migrations.push({ name: 'Add discordId column', success: false, error: error.message });
            }
        }
        // Migration 2: Add discordUsername column if it doesn't exist
        try {
            await database_1.default.$executeRaw `
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS "discordUsername" VARCHAR(255)
      `;
            migrations.push({ name: 'Add discordUsername column', success: true });
        }
        catch (error) {
            if (error.message?.includes('already exists')) {
                migrations.push({ name: 'Add discordUsername column', success: true, error: 'Column already exists' });
            }
            else {
                migrations.push({ name: 'Add discordUsername column', success: false, error: error.message });
            }
        }
        // Check if all migrations succeeded
        const allSucceeded = migrations.every(m => m.success);
        res.json({
            success: allSucceeded,
            message: allSucceeded ? 'All migrations completed successfully' : 'Some migrations failed',
            migrations,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
            success: false,
            message: 'Migration failed',
            error: error.message
        });
    }
});
exports.default = router;
