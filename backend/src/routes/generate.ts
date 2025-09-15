import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Mock AI prompt generation
const generateAIPrompt = async (category: string, answers: any, customization: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const prompts: Record<string, string> = {
    marketing: `# Marketing Strategy Prompt

Based on your responses, here's a comprehensive marketing strategy prompt:

## Campaign Objective
Create a ${customization.detailLevel || 'comprehensive'} marketing campaign for ${answers.businessType || 'your business'} targeting ${answers.targetAudience || 'your ideal customers'}.

## Key Requirements:
- Tone: ${customization.tone || 'Professional'}
- Budget Range: ${answers.budget || 'Not specified'}
- Timeline: ${answers.timeline || 'Not specified'}
- Primary Goal: ${answers.primaryGoal || 'Brand awareness'}

## Deliverables:
1. Marketing strategy overview
2. Target audience analysis
3. Channel recommendations
4. Content calendar outline
5. Success metrics and KPIs

## Additional Context:
${answers.additionalContext || 'No additional context provided'}

Please provide a detailed marketing plan that addresses each of these areas with specific, actionable recommendations.`,

    'product-development': `# Product Development Strategy Prompt

Based on your product development needs, here's a comprehensive strategy prompt:

## Product Overview
Develop a ${customization.detailLevel || 'comprehensive'} product development strategy for ${answers.productType || 'your product'}.

## Key Parameters:
- Development Stage: ${answers.stage || 'Not specified'}
- Target Market: ${answers.targetMarket || 'Not specified'}
- Timeline: ${answers.timeline || 'Not specified'}
- Budget: ${answers.budget || 'Not specified'}

## Development Focus Areas:
1. Product concept and validation
2. Technical requirements and specifications
3. User experience and design
4. Development roadmap and milestones
5. Testing and quality assurance
6. Launch strategy

## Constraints and Considerations:
${answers.constraints || 'No specific constraints mentioned'}

Please provide a detailed product development plan with timelines, resources, and success metrics.`,

    'financial-planning': `# Financial Planning Strategy Prompt

Create a ${customization.detailLevel || 'comprehensive'} financial planning strategy based on the following parameters:

## Financial Objectives
- Primary Goal: ${answers.primaryGoal || 'Not specified'}
- Time Horizon: ${answers.timeHorizon || 'Not specified'}
- Risk Tolerance: ${answers.riskTolerance || 'Not specified'}

## Current Situation:
- Investment Experience: ${answers.experience || 'Not specified'}
- Current Assets: ${answers.currentAssets || 'Not specified'}
- Monthly Budget: ${answers.monthlyBudget || 'Not specified'}

## Planning Areas:
1. Budget analysis and optimization
2. Investment strategy recommendations
3. Risk management and insurance
4. Tax optimization strategies
5. Retirement planning
6. Emergency fund recommendations

## Special Considerations:
${answers.specialNeeds || 'No special considerations mentioned'}

Please provide a detailed financial plan with specific recommendations and action steps.`,

    education: `# Educational Content Strategy Prompt

Develop a ${customization.detailLevel || 'comprehensive'} educational content strategy for ${answers.subject || 'your subject area'}.

## Learning Objectives:
- Target Audience: ${answers.audience || 'Not specified'}
- Learning Level: ${answers.level || 'Not specified'}
- Content Format: ${answers.format || 'Not specified'}

## Content Parameters:
- Duration: ${answers.duration || 'Not specified'}
- Delivery Method: ${answers.delivery || 'Not specified'}
- Assessment Type: ${answers.assessment || 'Not specified'}

## Curriculum Structure:
1. Learning objectives and outcomes
2. Content modules and lessons
3. Interactive elements and activities
4. Assessment and evaluation methods
5. Resource requirements
6. Implementation timeline

## Special Requirements:
${answers.requirements || 'No special requirements mentioned'}

Please create a detailed educational content plan with learning pathways and engagement strategies.`,

    'personal-development': `# Personal Development Plan Prompt

Create a ${customization.detailLevel || 'comprehensive'} personal development strategy focused on ${answers.focusArea || 'overall growth'}.

## Development Goals:
- Primary Focus: ${answers.primaryFocus || 'Not specified'}
- Timeline: ${answers.timeline || 'Not specified'}
- Current Level: ${answers.currentLevel || 'Not specified'}

## Key Areas:
1. Goal setting and achievement strategies
2. Skill development recommendations
3. Habit formation and tracking
4. Progress measurement methods
5. Resource and tool suggestions
6. Accountability systems

## Personal Context:
- Available Time: ${answers.timeCommitment || 'Not specified'}
- Preferred Learning Style: ${answers.learningStyle || 'Not specified'}
- Obstacles: ${answers.obstacles || 'None mentioned'}

## Success Metrics:
${answers.successMetrics || 'To be defined'}

Please provide a detailed personal development plan with actionable steps and milestones.`
  };

  return prompts[category] || `# Custom ${category.charAt(0).toUpperCase() + category.slice(1)} Prompt

Based on your responses, here's a customized prompt for your ${category} needs:

## Objective
Create a ${customization.detailLevel || 'comprehensive'} strategy addressing your specific requirements.

## Key Parameters
${Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Tone and Style
- Communication Style: ${customization.tone || 'Professional'}
- Detail Level: ${customization.detailLevel || 'Comprehensive'}
- Format: ${customization.format || 'Structured'}

Please provide a detailed strategy that addresses these specific needs with actionable recommendations.`;
};

// Generate AI prompt
router.post('/generate-prompt', authenticate, [
  body('category').notEmpty().trim(),
  body('answers').isObject(),
  body('customization').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check user's generation limit
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (user!.generationsUsed >= user!.generationsLimit) {
      return res.status(403).json({
        success: false,
        message: 'Generation limit exceeded. Please upgrade your plan.'
      });
    }

    const { category, answers, customization } = req.body;

    // Generate the AI prompt
    const prompt = await generateAIPrompt(category, answers, customization);

    // Update user's generation count
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        generationsUsed: { increment: 1 }
      }
    });

    res.json({
      success: true,
      data: {
        prompt,
        category,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Generate prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Refine existing prompt
router.post('/refine-prompt', authenticate, [
  body('currentPrompt').notEmpty().trim(),
  body('refinementQuery').notEmpty().trim(),
  body('category').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check user's generation limit
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (user!.generationsUsed >= user!.generationsLimit) {
      return res.status(403).json({
        success: false,
        message: 'Generation limit exceeded. Please upgrade your plan.'
      });
    }

    const { currentPrompt, refinementQuery, category, originalAnswers, history } = req.body;

    // Simulate AI refinement process
    await new Promise(resolve => setTimeout(resolve, 1500));

    let refinedPrompt = currentPrompt;

    // Apply refinement based on the query
    if (refinementQuery.toLowerCase().includes('specific') || refinementQuery.toLowerCase().includes('target audience')) {
      refinedPrompt = currentPrompt.replace(
        'your target audience',
        `${originalAnswers?.targetAudience || 'your specific target demographic'}`
      );
      refinedPrompt += `\n\n## Target Audience Specifics\n- Demographics: ${originalAnswers?.demographics || 'To be defined'}\n- Pain points: ${originalAnswers?.painPoints || 'To be identified'}\n- Preferred channels: ${originalAnswers?.channels || 'Multi-channel approach'}`;
    }

    if (refinementQuery.toLowerCase().includes('implementation') || refinementQuery.toLowerCase().includes('steps')) {
      refinedPrompt += `\n\n## Implementation Steps\n1. **Planning Phase** (Week 1-2)\n   - Conduct market research\n   - Define success metrics\n   - Allocate resources\n\n2. **Execution Phase** (Week 3-6)\n   - Launch pilot program\n   - Monitor performance\n   - Gather feedback\n\n3. **Optimization Phase** (Week 7-8)\n   - Analyze results\n   - Implement improvements\n   - Scale successful elements`;
    }

    if (refinementQuery.toLowerCase().includes('challenges') || refinementQuery.toLowerCase().includes('solutions')) {
      refinedPrompt += `\n\n## Potential Challenges & Solutions\n\n### Challenge 1: Resource Constraints\n**Solution:** Prioritize high-impact activities and consider phased implementation\n\n### Challenge 2: Market Competition\n**Solution:** Focus on unique value proposition and differentiation strategies\n\n### Challenge 3: Measurement Difficulties\n**Solution:** Implement comprehensive analytics and tracking systems`;
    }

    if (refinementQuery.toLowerCase().includes('roi') || refinementQuery.toLowerCase().includes('business value')) {
      refinedPrompt += `\n\n## ROI & Business Value\n\n### Expected Returns\n- **Short-term (3 months):** ${originalAnswers?.shortTermGoals || '20-30% improvement in key metrics'}\n- **Medium-term (6 months):** ${originalAnswers?.mediumTermGoals || '50-70% improvement in efficiency'}\n- **Long-term (12 months):** ${originalAnswers?.longTermGoals || '100%+ ROI achievement'}\n\n### Business Impact\n- Cost reduction through improved efficiency\n- Revenue growth through enhanced performance\n- Strategic advantage through innovation`;
    }

    if (refinementQuery.toLowerCase().includes('conversational') || refinementQuery.toLowerCase().includes('tone')) {
      refinedPrompt = refinedPrompt.replace(/\. /g, '. You know, ');
      refinedPrompt = refinedPrompt.replace(/\n## /g, '\n## Hey, let\'s talk about ');
      refinedPrompt = refinedPrompt.replace(/Consider /g, 'You might want to consider ');
    }

    if (refinementQuery.toLowerCase().includes('timeline') || refinementQuery.toLowerCase().includes('milestones')) {
      refinedPrompt += `\n\n## Timeline & Milestones\n\n### Phase 1: Foundation (Weeks 1-2)\n- ✅ Project kickoff and team alignment\n- ✅ Initial research and analysis\n- ✅ Strategy development\n\n### Phase 2: Development (Weeks 3-6)\n- 🔄 Implementation begins\n- 🔄 Regular progress reviews\n- 🔄 Iterative improvements\n\n### Phase 3: Launch (Weeks 7-8)\n- 📈 Go-live preparation\n- 📈 Performance monitoring\n- 📈 Success measurement`;
    }

    if (refinementQuery.toLowerCase().includes('metrics') || refinementQuery.toLowerCase().includes('kpi')) {
      refinedPrompt += `\n\n## Success Metrics & KPIs\n\n### Primary Metrics\n- **Conversion Rate:** Target ${originalAnswers?.conversionTarget || '25%'} improvement\n- **Engagement Score:** Aim for ${originalAnswers?.engagementTarget || '80%'} satisfaction\n- **Performance Index:** Achieve ${originalAnswers?.performanceTarget || '90%'} efficiency\n\n### Secondary Metrics\n- Customer satisfaction scores\n- Time-to-completion rates\n- Cost-per-acquisition improvements\n- User retention and loyalty metrics`;
    }

    if (refinementQuery.toLowerCase().includes('simplify') || refinementQuery.toLowerCase().includes('non-technical')) {
      refinedPrompt = refinedPrompt.replace(/implementation/gi, 'putting into action');
      refinedPrompt = refinedPrompt.replace(/optimization/gi, 'making it better');
      refinedPrompt = refinedPrompt.replace(/analytics/gi, 'tracking and measuring');
      refinedPrompt = refinedPrompt.replace(/stakeholders/gi, 'team members and decision makers');
      refinedPrompt += `\n\n## Simple Summary\nThis plan breaks down complex ideas into easy-to-understand steps. Each section explains what needs to be done, why it matters, and how to measure success. No technical jargon - just clear, actionable guidance that anyone can follow.`;
    }

    if (refinementQuery.toLowerCase().includes('examples') || refinementQuery.toLowerCase().includes('case studies')) {
      refinedPrompt += `\n\n## Real-World Examples\n\n### Case Study 1: Similar Success Story\n**Company:** Industry leader in ${category}\n**Challenge:** Similar objectives to yours\n**Solution:** Implemented comparable strategy\n**Results:** 40% improvement in key metrics within 6 months\n\n### Best Practice Example\n**Approach:** Step-by-step implementation\n**Timeline:** 8-week execution plan\n**Outcome:** Exceeded initial goals by 25%`;
    }

    if (refinementQuery.toLowerCase().includes('budget') || refinementQuery.toLowerCase().includes('cost')) {
      refinedPrompt += `\n\n## Budget Considerations\n\n### Investment Breakdown\n- **Phase 1 (Planning):** ${originalAnswers?.budgetPhase1 || '$5,000-10,000'}\n- **Phase 2 (Implementation):** ${originalAnswers?.budgetPhase2 || '$15,000-25,000'}\n- **Phase 3 (Optimization):** ${originalAnswers?.budgetPhase3 || '$5,000-15,000'}\n\n### Cost-Benefit Analysis\n- **Total Investment:** Estimated ${originalAnswers?.totalBudget || '$25,000-50,000'}\n- **Expected ROI:** 200-300% within first year\n- **Break-even Point:** 6-8 months\n\n### Budget Optimization Tips\n- Start with pilot program to minimize initial costs\n- Leverage existing resources where possible\n- Consider phased approach for cash flow management`;
    }

    if (refinementQuery.toLowerCase().includes('quick wins') || refinementQuery.toLowerCase().includes('immediate')) {
      refinedPrompt += `\n\n## Quick Wins & Immediate Actions\n\n### Week 1 Quick Wins\n- ✅ Identify and optimize top 3 pain points\n- ✅ Implement 2-3 low-cost, high-impact improvements\n- ✅ Set up basic tracking and measurement systems\n\n### 30-Day Fast Track\n- 📈 Launch pilot program with limited scope\n- 📈 Gather initial feedback and data\n- 📈 Make rapid iterations based on results\n\n### Immediate ROI Opportunities\n- Automation of repetitive tasks\n- Process optimization for efficiency gains\n- Quick technology implementations`;
    }

    if (refinementQuery.toLowerCase().includes('competitive') || refinementQuery.toLowerCase().includes('differentiation')) {
      refinedPrompt += `\n\n## Competitive Analysis & Differentiation\n\n### Competitive Landscape\n- **Direct Competitors:** 3-5 main players in market\n- **Indirect Competitors:** Alternative solutions customers consider\n- **Market Gaps:** Opportunities for differentiation\n\n### Differentiation Strategy\n- **Unique Value Proposition:** What sets you apart\n- **Competitive Advantages:** Your strongest assets\n- **Market Positioning:** How to position against competitors\n\n### Competitive Intelligence\n- Monitor competitor activities and strategies\n- Identify their weaknesses and opportunities\n- Develop counter-strategies and defensive measures`;
    }

    // Update user's generation count for refinements
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        generationsUsed: { increment: 1 }
      }
    });

    res.json({
      success: true,
      data: {
        refinedPrompt,
        refinementApplied: refinementQuery,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Refine prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get generation stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        generationsUsed: true,
        generationsLimit: true
      }
    });

    const promptsCount = await prisma.prompt.count({
      where: { userId: req.user!.id }
    });

    const recentPrompts = await prisma.prompt.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true
      }
    });

    const categoryStats = await prisma.prompt.groupBy({
      by: ['category'],
      where: { userId: req.user!.id },
      _count: {
        category: true
      }
    });

    res.json({
      success: true,
      data: {
        generationsUsed: user?.generationsUsed || 0,
        generationsLimit: user?.generationsLimit || 100,
        totalPrompts: promptsCount,
        recentPrompts,
        categoryBreakdown: categoryStats.map(stat => ({
          category: stat.category,
          count: stat._count.category
        }))
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;