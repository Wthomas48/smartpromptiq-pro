import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authenticateWithSubscription, requireTokens, trackApiUsage } from '../middleware/subscriptionAuth';
import prisma from '../config/database';
import aiService from '../services/aiService';

const router = express.Router();

// Demo product endpoints (no auth required)
router.post('/mvp-planning', [
  body('answers').optional().isObject(),
  body('preferences').optional().isObject()
], async (req, res) => {
  try {
    const { answers = {}, preferences = {} } = req.body;

    console.log('🚀 Demo generating MVP planning prompt');

    const mvpPrompt = generateMVPPlanningPrompt(answers, preferences);

    res.json({
      success: true,
      data: {
        prompt: mvpPrompt,
        category: 'product',
        template: 'mvp-planning',
        generatedAt: new Date(),
        usage: { type: 'demo', tokens: 0 }
      }
    });
  } catch (error) {
    console.error('Demo MVP planning error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/ux-design', [
  body('answers').optional().isObject(),
  body('preferences').optional().isObject()
], async (req, res) => {
  try {
    const { answers = {}, preferences = {} } = req.body;

    console.log('🎨 Demo generating UX design prompt');

    const uxPrompt = generateUXDesignPrompt(answers, preferences);

    res.json({
      success: true,
      data: {
        prompt: uxPrompt,
        category: 'product',
        template: 'ux-design',
        generatedAt: new Date(),
        usage: { type: 'demo', tokens: 0 }
      }
    });
  } catch (error) {
    console.error('Demo UX design error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/competitive-analysis', [
  body('answers').optional().isObject(),
  body('preferences').optional().isObject()
], async (req, res) => {
  try {
    const { answers = {}, preferences = {} } = req.body;

    console.log('📊 Demo generating competitive analysis prompt');

    const competitivePrompt = generateCompetitiveAnalysisPrompt(answers, preferences);

    res.json({
      success: true,
      data: {
        prompt: competitivePrompt,
        category: 'product',
        template: 'competitive-analysis',
        generatedAt: new Date(),
        usage: { type: 'demo', tokens: 0 }
      }
    });
  } catch (error) {
    console.error('Demo competitive analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Generic category prompt generation endpoint
router.post('/:category/:template', [
  authenticateWithSubscription,
  trackApiUsage,
  requireTokens(1, 'category-specific'),
  body('answers').optional().isObject(),
  body('preferences').optional().isObject()
], async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { category, template } = req.params;
    const { answers = {}, preferences = {} } = req.body;

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

    console.log(`🎯 Generating ${category}/${template} prompt`);

    // Generate AI prompt based on category and template
    const prompt = await aiService.generateCategoryPrompt({
      category,
      template,
      answers,
      preferences,
      userId: req.user!.id
    });

    // Save to database
    const savedPrompt = await prisma.prompt.create({
      data: {
        title: `${category} - ${template}`,
        content: prompt.content,
        category: category,
        template: template,
        userId: req.user!.id,
        metadata: {
          answers,
          preferences,
          usage: prompt.usage || {}
        }
      }
    });

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
        prompt: savedPrompt,
        usage: prompt.usage
      },
      message: `${category} prompt generated successfully`
    });

  } catch (error) {
    console.error(`Category prompt generation error (${req.params.category}/${req.params.template}):`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate prompt',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions for demo prompt generation
function generateMVPPlanningPrompt(answers: any, preferences: any): string {
  return `# MVP Development Blueprint

## Executive Summary
This comprehensive MVP (Minimum Viable Product) planning guide will help you build a focused, market-ready product that validates your core assumptions while minimizing development costs.

## Product Vision & Strategy

### Core Value Proposition
- **Primary Problem:** ${answers.problem || 'Solve a specific market pain point'}
- **Target Users:** ${answers.target_users || 'Early adopters and power users'}
- **Unique Solution:** ${answers.solution || 'Innovative approach to existing challenges'}
- **Success Metrics:** ${answers.success_metrics || 'User engagement and retention'}

### MVP Scope Definition
**Core Features (Must-Have):**
1. User authentication and onboarding
2. Primary workflow functionality
3. Basic data management
4. Core user interaction features
5. Essential feedback collection

**Secondary Features (Nice-to-Have):**
- Advanced analytics dashboard
- Social sharing capabilities
- Mobile optimization
- Third-party integrations
- Advanced customization options

## Technical Implementation Strategy

### Architecture Approach
**Backend Stack:**
- RESTful API design
- Scalable database architecture
- Authentication & authorization
- Data validation and security

**Frontend Stack:**
- Responsive web application
- Progressive Web App (PWA) capabilities
- Cross-browser compatibility
- Accessibility compliance

**Infrastructure:**
- Cloud-based hosting (AWS/GCP/Azure)
- CI/CD pipeline setup
- Monitoring and logging
- Backup and disaster recovery

### Development Timeline (8-12 Weeks)

**Phase 1: Foundation (Weeks 1-3)**
- Project setup and environment configuration
- Database design and API structure
- User authentication system
- Basic UI/UX framework

**Phase 2: Core Features (Weeks 4-7)**
- Primary functionality development
- User workflow implementation
- Data management systems
- Basic testing and debugging

**Phase 3: Validation & Launch (Weeks 8-12)**
- User testing and feedback collection
- Performance optimization
- Security auditing
- MVP launch preparation

## User Experience Design

### User Journey Mapping
1. **Discovery:** How users find your product
2. **Onboarding:** First-time user experience
3. **Activation:** Core value realization
4. **Engagement:** Regular usage patterns
5. **Retention:** Long-term value delivery

### Key UX Principles
- **Simplicity:** Minimize cognitive load
- **Clarity:** Clear navigation and instructions
- **Feedback:** Immediate response to user actions
- **Accessibility:** Usable by diverse audiences
- **Performance:** Fast loading and responsiveness

## Market Validation Strategy

### Testing Methodology
**A/B Testing Areas:**
- Landing page conversion optimization
- User onboarding flow
- Feature usage patterns
- Pricing model validation

**Feedback Collection:**
- In-app feedback widgets
- User interviews and surveys
- Analytics and usage data
- Customer support interactions

### Key Metrics to Track
**Product Metrics:**
- Daily/Monthly Active Users (DAU/MAU)
- Feature adoption rates
- User retention cohorts
- Time to value realization

**Business Metrics:**
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Monthly recurring revenue (MRR)
- Churn rate analysis

## Risk Management & Mitigation

### Technical Risks
- **Scalability Issues:** Plan for gradual load increases
- **Security Vulnerabilities:** Regular security audits
- **Performance Bottlenecks:** Monitoring and optimization
- **Data Loss:** Robust backup strategies

### Market Risks
- **Competition:** Continuous competitive analysis
- **User Adoption:** Flexible feature iteration
- **Market Changes:** Agile development approach
- **Funding:** Conservative resource planning

## Launch Strategy

### Pre-Launch Activities
- Beta testing with target users
- Content marketing and SEO optimization
- Social media presence establishment
- Partnership and collaboration setup

### Launch Execution
- Soft launch with limited user base
- Feedback collection and rapid iteration
- Performance monitoring and optimization
- User acquisition campaign activation

### Post-Launch Optimization
- Data-driven feature prioritization
- User feedback integration
- Scalability improvements
- Market expansion planning

## Success Criteria & Next Steps

### MVP Success Definition
- **User Engagement:** 30%+ weekly active user rate
- **Feature Adoption:** 60%+ core feature usage
- **User Feedback:** 4.0+ average user rating
- **Technical Performance:** 99%+ uptime

### Evolution Planning
Based on MVP results, consider:
- Feature expansion and enhancement
- Market segment diversification
- Platform extension (mobile apps)
- Business model optimization

This MVP blueprint provides a comprehensive framework for building a successful minimum viable product that validates your core assumptions while establishing a foundation for long-term growth.`;
}

function generateUXDesignPrompt(answers: any, preferences: any): string {
  return `# UX Design Excellence Framework

## Design Philosophy & Approach

### User-Centered Design Principles
This comprehensive UX design guide focuses on creating intuitive, accessible, and delightful user experiences that drive engagement and achieve business objectives.

### Core Design Values
- **Empathy:** Understanding user needs and pain points
- **Simplicity:** Reducing complexity and cognitive load
- **Accessibility:** Inclusive design for all users
- **Consistency:** Unified design language and patterns
- **Innovation:** Creative solutions to user problems

## User Research & Analysis

### User Persona Development
**Primary Persona:**
- **Demographics:** ${answers.demographics || 'Target age group 25-45, professionals'}
- **Goals:** ${answers.user_goals || 'Efficiency, productivity, and ease of use'}
- **Pain Points:** ${answers.pain_points || 'Complex interfaces and lengthy processes'}
- **Technology Comfort:** ${answers.tech_comfort || 'Moderate to high digital literacy'}

### Journey Mapping
**Key Touchpoints:**
1. **Awareness:** First interaction with product/brand
2. **Consideration:** Evaluation and comparison phase
3. **Onboarding:** Initial product experience
4. **Regular Use:** Daily workflow integration
5. **Advocacy:** Sharing and recommending

### Research Methods
- **User Interviews:** Deep qualitative insights
- **Surveys:** Quantitative preference data
- **Usability Testing:** Behavioral observation
- **Analytics Analysis:** Usage pattern identification
- **Competitive Analysis:** Industry best practices

## Information Architecture

### Content Organization
**Hierarchical Structure:**
- Primary navigation (5-7 main categories)
- Secondary navigation (sub-categories)
- Tertiary content (detailed pages)
- Cross-linking and related content

**Mental Model Alignment:**
- Logical grouping of related features
- Predictable navigation patterns
- Clear labeling and terminology
- Intuitive content relationships

### Navigation Design
**Primary Navigation:**
- Dashboard/Home
- Core functionality areas
- User account/settings
- Help and support

**Navigation Principles:**
- Maximum 3-click rule to key content
- Breadcrumb navigation for deep structures
- Search functionality for content discovery
- Mobile-first responsive design

## Interaction Design

### Interface Components
**Form Design:**
- Clear field labeling and instructions
- Inline validation and error messaging
- Progressive disclosure for complex forms
- Auto-save and draft functionality

**Feedback Systems:**
- Loading states and progress indicators
- Success and error confirmations
- Contextual help and tooltips
- Undo/redo capabilities

### Micro-Interactions
**Animation Guidelines:**
- Purposeful motion design (200-300ms transitions)
- Easing functions for natural movement
- Reduced motion accessibility options
- Performance-optimized animations

**State Changes:**
- Hover and focus states
- Active and selected states
- Disabled and error states
- Loading and processing states

## Visual Design System

### Brand Integration
**Color Palette:**
- Primary brand colors (2-3 colors)
- Secondary supporting colors
- Neutral grays and backgrounds
- Accessibility-compliant contrast ratios

**Typography Scale:**
- Header hierarchy (H1-H6)
- Body text and paragraph styles
- UI element text sizing
- Reading comfort and line spacing

### Component Library
**UI Components:**
- Buttons and interactive elements
- Form inputs and controls
- Cards and content containers
- Navigation and menu systems
- Modals and overlay components

## Responsive Design Strategy

### Breakpoint System
**Mobile First Approach:**
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+
- Large screens: 1440px+

### Adaptive Layouts
- Flexible grid systems
- Scalable typography
- Touch-friendly interactive elements
- Optimized image delivery

## Accessibility & Inclusion

### WCAG 2.1 Compliance
**Level AA Standards:**
- Color contrast ratios (4.5:1 minimum)
- Keyboard navigation support
- Screen reader compatibility
- Alternative text for images

**Inclusive Design:**
- Multiple input methods support
- Cognitive accessibility considerations
- Language and cultural sensitivity
- Assistive technology compatibility

## Usability Testing & Validation

### Testing Methodology
**Moderated Testing:**
- Task-based scenario testing
- Think-aloud protocols
- Post-test interviews
- Behavioral observation

**Unmoderated Testing:**
- Remote usability testing tools
- Heatmap and click tracking
- A/B testing for design variations
- Analytics-driven insights

### Key Metrics
**Usability Metrics:**
- Task completion rates
- Time to completion
- Error rates and recovery
- User satisfaction scores

**Engagement Metrics:**
- Page views and session duration
- Feature adoption rates
- User retention and return visits
- Conversion funnel analysis

## Implementation Guidelines

### Design Handoff
**Developer Collaboration:**
- Detailed design specifications
- Component behavior documentation
- Asset organization and delivery
- Quality assurance checkpoints

**Design Tools Integration:**
- Version control for design files
- Component library maintenance
- Design system documentation
- Cross-platform consistency

## Continuous Improvement

### Iterative Design Process
1. **Research & Analysis:** Data collection and user insights
2. **Ideation & Prototyping:** Solution exploration
3. **Testing & Validation:** User feedback integration
4. **Implementation:** Development collaboration
5. **Monitoring & Optimization:** Performance tracking

### Success Measurement
**Design Success Metrics:**
- Improved task completion rates
- Reduced user error rates
- Increased user satisfaction scores
- Enhanced accessibility compliance

This UX design framework ensures that your product delivers exceptional user experiences while meeting business objectives and maintaining technical feasibility.`;
}

function generateCompetitiveAnalysisPrompt(answers: any, preferences: any): string {
  return `# Comprehensive Competitive Analysis Framework

## Executive Summary
This competitive analysis provides a strategic overview of the market landscape, identifying key competitors, market opportunities, and strategic positioning recommendations.

## Market Landscape Overview

### Industry Context
**Market Size & Growth:**
- Total Addressable Market (TAM): ${answers.market_size || '$X billion globally'}
- Market Growth Rate: ${answers.growth_rate || 'X% annually'}
- Key Market Drivers: ${answers.market_drivers || 'Digital transformation, user demand'}
- Emerging Trends: ${answers.trends || 'AI integration, mobile-first approach'}

### Competitive Ecosystem
**Market Segments:**
1. **Direct Competitors:** Similar products and target users
2. **Indirect Competitors:** Alternative solutions to same problems
3. **Substitute Products:** Different approaches to user needs
4. **New Entrants:** Emerging players and disruptors

## Competitor Analysis Matrix

### Primary Competitors

**Competitor A: [Market Leader]**
- **Market Position:** Established leader with 30%+ market share
- **Strengths:** Brand recognition, comprehensive features, enterprise focus
- **Weaknesses:** Legacy technology, high pricing, complex UX
- **Target Audience:** Enterprise and large organizations
- **Pricing Strategy:** Premium pricing with enterprise discounts

**Competitor B: [Growth Stage]**
- **Market Position:** Fast-growing challenger with innovative approach
- **Strengths:** Modern UI/UX, competitive pricing, rapid feature development
- **Weaknesses:** Limited enterprise features, newer brand
- **Target Audience:** SMBs and individual professionals
- **Pricing Strategy:** Competitive pricing with freemium model

**Competitor C: [Niche Player]**
- **Market Position:** Specialized solution for specific use cases
- **Strengths:** Deep domain expertise, loyal user base
- **Weaknesses:** Limited scalability, narrow market focus
- **Target Audience:** Specific industry or use case
- **Pricing Strategy:** Value-based pricing for specialized features

### Feature Comparison Analysis

**Core Functionality:**
| Feature | Your Product | Competitor A | Competitor B | Competitor C |
|---------|--------------|--------------|--------------|--------------|
| Feature 1 | ✅ Advanced | ✅ Basic | ✅ Advanced | ❌ Missing |
| Feature 2 | ✅ Basic | ✅ Advanced | ✅ Basic | ✅ Advanced |
| Feature 3 | ✅ Advanced | ❌ Missing | ✅ Basic | ✅ Basic |
| Feature 4 | 🔄 Planned | ✅ Advanced | ✅ Advanced | ❌ Missing |

**User Experience:**
- **Ease of Use:** Ranking and specific UX advantages
- **Onboarding:** Comparison of user activation processes
- **Mobile Experience:** Mobile app quality and features
- **Performance:** Speed, reliability, and uptime

## SWOT Analysis

### Strengths
**Your Product Advantages:**
- Innovative technology approach
- Superior user experience design
- Competitive pricing strategy
- Strong team expertise
- Agile development process

### Weaknesses
**Areas for Improvement:**
- Limited brand recognition
- Smaller user base
- Resource constraints
- Feature gaps vs. established players

### Opportunities
**Market Opportunities:**
- Underserved market segments
- Emerging technology trends
- Partnership possibilities
- Geographic expansion potential
- New use case development

### Threats
**Market Risks:**
- Established competitor responses
- New market entrants
- Technology disruption
- Economic downturns
- Regulatory changes

## Customer Analysis

### User Feedback Comparison
**Common User Complaints (Competitors):**
- Competitor A: "Too complex and expensive"
- Competitor B: "Missing enterprise features"
- Competitor C: "Limited integration options"

**User Preferences:**
- Ease of use over feature richness
- Value for money considerations
- Integration capabilities
- Customer support quality
- Security and compliance

### Market Gaps & Opportunities
**Unmet Needs:**
1. **Price-Performance Gap:** Quality solution at accessible pricing
2. **User Experience:** Simplified workflow for complex tasks
3. **Integration:** Seamless connectivity with existing tools
4. **Customization:** Flexible solution adaptation
5. **Support:** Responsive customer service

## Strategic Positioning

### Differentiation Strategy
**Unique Value Proposition:**
- **Core Differentiator:** ${answers.differentiation || 'Superior user experience with enterprise features'}
- **Target Market:** ${answers.target_market || 'Growth-stage companies seeking scalable solutions'}
- **Positioning Statement:** "The only solution that combines enterprise-grade functionality with consumer-grade simplicity"

### Competitive Advantages
**Sustainable Advantages:**
1. **Technology Innovation:** Proprietary algorithms or methods
2. **User Experience:** Superior design and usability
3. **Cost Structure:** Efficient operations enabling competitive pricing
4. **Team Expertise:** Deep domain knowledge and experience
5. **Market Timing:** First-mover advantage in emerging segments

## Go-to-Market Strategy

### Market Entry Approach
**Phase 1: Establish Foothold**
- Target underserved market segment
- Focus on superior user experience
- Competitive pricing strategy
- Content marketing and SEO

**Phase 2: Market Expansion**
- Enterprise feature development
- Partnership and integration strategy
- Sales team building
- Brand awareness campaigns

**Phase 3: Market Leadership**
- Innovation and R&D investment
- Market consolidation opportunities
- International expansion
- Platform ecosystem development

### Competitive Response Planning
**Defensive Strategies:**
- Continuous product innovation
- Customer loyalty programs
- Exclusive partnerships
- Patent and IP protection

**Offensive Strategies:**
- Direct feature comparison marketing
- Competitive pricing pressure
- Talent acquisition from competitors
- Market share expansion tactics

## Risk Assessment & Mitigation

### Competitive Risks
1. **Price Wars:** Race to bottom pricing
2. **Feature Replication:** Competitors copying innovations
3. **Market Consolidation:** Larger players acquiring competitors
4. **Technology Disruption:** New paradigms making current solutions obsolete

### Mitigation Strategies
- **Innovation Focus:** Continuous R&D investment
- **Customer Loyalty:** Strong relationships and switching costs
- **Agility:** Rapid response to market changes
- **Partnerships:** Strategic alliances and integrations

## Action Plan & Recommendations

### Immediate Actions (0-3 months)
1. Address critical feature gaps identified in analysis
2. Improve user onboarding based on competitor weaknesses
3. Develop competitive pricing strategy
4. Create competitor tracking system

### Medium-term Actions (3-12 months)
1. Build missing enterprise features
2. Establish strategic partnerships
3. Enhance customer support capabilities
4. Develop thought leadership content

### Long-term Strategy (12+ months)
1. Expand into adjacent market segments
2. Consider strategic acquisitions
3. Develop platform ecosystem
4. International market expansion

This competitive analysis provides the strategic intelligence needed to make informed decisions about product development, marketing, and business strategy in your competitive landscape.`;
}

export default router;