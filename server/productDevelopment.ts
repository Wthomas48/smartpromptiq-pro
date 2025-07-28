import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function getTextContent(response: any): string {
  const textBlock = response.content.find((block: any) => block.type === 'text');
  return textBlock ? textBlock.text : '';
}

export interface ProductStrategy {
  id: string;
  type: "mvp_planning" | "ux_design" | "competitive_analysis";
  title: string;
  description: string;
  industry: string;
  targetMarket: string;
  features: string[];
  roadmap: string[];
  validationMethods: string[];
  timeline: string;
  budget?: string;
  risks: string[];
  recommendations: string[];
}

export async function generateMVPPlan(
  productName: string,
  industry: string,
  targetAudience: string,
  problemStatement: string,
  coreFeatures: string[],
  budget: string,
  timeline: string
): Promise<ProductStrategy> {
  // the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Create a comprehensive MVP planning strategy for a ${productName} in the ${industry} industry.

Target Audience: ${targetAudience}
Problem Statement: ${problemStatement}
Core Features: ${coreFeatures.join(', ')}
Budget: ${budget}
Timeline: ${timeline}

Provide a detailed MVP plan including:
1. Feature prioritization and roadmap
2. Market validation strategies
3. Technical requirements
4. Go-to-market approach
5. Success metrics and KPIs
6. Risk assessment and mitigation
7. Resource allocation recommendations

Format as a comprehensive business strategy with actionable steps.`
    }]
  });

  const content = getTextContent(response);
  
  return {
    id: `mvp_${Date.now()}`,
    type: "mvp_planning",
    title: `MVP Strategy: ${productName}`,
    description: `Comprehensive MVP planning for ${productName} targeting ${targetAudience}`,
    industry,
    targetMarket: targetAudience,
    features: coreFeatures,
    roadmap: extractSections(content, 'roadmap'),
    validationMethods: extractSections(content, 'validation'),
    timeline,
    budget,
    risks: extractSections(content, 'risk'),
    recommendations: extractSections(content, 'recommendation')
  };
}

export async function generateUXDesignStrategy(
  productType: string,
  userPersonas: string[],
  businessGoals: string[],
  platforms: string[],
  designPrinciples: string
): Promise<ProductStrategy> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Create a comprehensive UX design strategy for a ${productType}.

User Personas: ${userPersonas.join(', ')}
Business Goals: ${businessGoals.join(', ')}
Target Platforms: ${platforms.join(', ')}
Design Principles: ${designPrinciples}

Provide detailed UX design guidance including:
1. User journey mapping and wireframe recommendations
2. Information architecture and navigation flows
3. Usability testing methodologies
4. Accessibility and inclusive design considerations
5. Design system and component library recommendations
6. Interaction patterns and micro-interactions
7. Performance optimization for user experience
8. A/B testing strategies for design decisions

Format as a comprehensive UX strategy with practical implementation steps.`
    }]
  });

  const content = getTextContent(response);

  return {
    id: `ux_${Date.now()}`,
    type: "ux_design",
    title: `UX Strategy: ${productType}`,
    description: `User experience design strategy for ${productType} across ${platforms.join(', ')}`,
    industry: "UX Design",
    targetMarket: userPersonas.join(', '),
    features: extractSections(content, 'feature'),
    roadmap: extractSections(content, 'implementation'),
    validationMethods: extractSections(content, 'testing'),
    timeline: "Varies by implementation phase",
    risks: extractSections(content, 'challenge'),
    recommendations: extractSections(content, 'recommendation')
  };
}

export async function generateCompetitiveAnalysis(
  industry: string,
  productCategory: string,
  competitors: string[],
  marketSize: string,
  differentiationGoals: string[]
): Promise<ProductStrategy> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Conduct a comprehensive competitive analysis for the ${productCategory} market in the ${industry} industry.

Key Competitors: ${competitors.join(', ')}
Market Size: ${marketSize}
Differentiation Goals: ${differentiationGoals.join(', ')}

Provide detailed competitive analysis including:
1. Competitor feature comparison matrix
2. Market positioning and pricing strategies
3. Strengths and weaknesses assessment
4. Market gaps and opportunities
5. Industry trends and future predictions
6. Differentiation strategies and unique value propositions
7. Go-to-market recommendations
8. Competitive monitoring and intelligence gathering

Format as a strategic business intelligence report with actionable insights.`
    }]
  });

  const content = getTextContent(response);

  return {
    id: `competitive_${Date.now()}`,
    type: "competitive_analysis",
    title: `Competitive Analysis: ${productCategory}`,
    description: `Market intelligence and competitive positioning for ${productCategory} in ${industry}`,
    industry,
    targetMarket: "Market analysis",
    features: extractSections(content, 'opportunity'),
    roadmap: extractSections(content, 'strategy'),
    validationMethods: extractSections(content, 'monitoring'),
    timeline: "Ongoing competitive intelligence",
    risks: extractSections(content, 'threat'),
    recommendations: extractSections(content, 'recommendation')
  };
}

function extractSections(content: string, sectionType: string): string[] {
  const lines = content.split('\n');
  const sections: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('•') || trimmed.includes('-') || trimmed.includes('*')) {
      const cleaned = trimmed.replace(/^[•\-*]\s*/, '').trim();
      if (cleaned.length > 10 && 
          (sectionType === 'roadmap' && (cleaned.toLowerCase().includes('phase') || cleaned.toLowerCase().includes('step') || cleaned.toLowerCase().includes('milestone'))) ||
          (sectionType === 'validation' && (cleaned.toLowerCase().includes('test') || cleaned.toLowerCase().includes('validate') || cleaned.toLowerCase().includes('measure'))) ||
          (sectionType === 'risk' && (cleaned.toLowerCase().includes('risk') || cleaned.toLowerCase().includes('challenge') || cleaned.toLowerCase().includes('threat'))) ||
          (sectionType === 'recommendation' && (cleaned.toLowerCase().includes('recommend') || cleaned.toLowerCase().includes('suggest') || cleaned.toLowerCase().includes('should'))) ||
          (sectionType === 'feature' && (cleaned.toLowerCase().includes('feature') || cleaned.toLowerCase().includes('functionality') || cleaned.toLowerCase().includes('component'))) ||
          (sectionType === 'implementation' && (cleaned.toLowerCase().includes('implement') || cleaned.toLowerCase().includes('develop') || cleaned.toLowerCase().includes('build'))) ||
          (sectionType === 'testing' && (cleaned.toLowerCase().includes('test') || cleaned.toLowerCase().includes('user') || cleaned.toLowerCase().includes('feedback'))) ||
          (sectionType === 'challenge' && (cleaned.toLowerCase().includes('challenge') || cleaned.toLowerCase().includes('difficulty') || cleaned.toLowerCase().includes('barrier'))) ||
          (sectionType === 'opportunity' && (cleaned.toLowerCase().includes('opportunity') || cleaned.toLowerCase().includes('gap') || cleaned.toLowerCase().includes('potential'))) ||
          (sectionType === 'strategy' && (cleaned.toLowerCase().includes('strategy') || cleaned.toLowerCase().includes('approach') || cleaned.toLowerCase().includes('plan'))) ||
          (sectionType === 'monitoring' && (cleaned.toLowerCase().includes('monitor') || cleaned.toLowerCase().includes('track') || cleaned.toLowerCase().includes('analyze'))) ||
          (sectionType === 'threat' && (cleaned.toLowerCase().includes('threat') || cleaned.toLowerCase().includes('competitive') || cleaned.toLowerCase().includes('risk')))
      ) {
        sections.push(cleaned);
      }
    }
  }
  
  return sections.slice(0, 8); // Limit to 8 items for readability
}