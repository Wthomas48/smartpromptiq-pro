import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function getTextContent(response: any): string {
  const textBlock = response.content.find((block: any) => block.type === 'text');
  return textBlock ? textBlock.text : '';
}

export interface FinancialStrategy {
  id: string;
  type: "revenue_model" | "funding_strategy" | "pitch_deck" | "financial_projections";
  title: string;
  description: string;
  businessModel: string;
  targetMarket: string;
  projections: {
    revenue: string[];
    expenses: string[];
    profitability: string[];
  };
  fundingOptions: string[];
  pitchElements: string[];
  riskFactors: string[];
  recommendations: string[];
  timeline: string;
}

export async function generateRevenueModel(
  businessType: string,
  industry: string,
  targetCustomers: string,
  pricePoints: string[],
  scalabilityFactors: string[],
  competitiveLandscape: string
): Promise<FinancialStrategy> {
  // the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Create a comprehensive revenue model and financial projections for a ${businessType} in the ${industry} industry.

Target Customers: ${targetCustomers}
Price Points: ${pricePoints.join(', ')}
Scalability Factors: ${scalabilityFactors.join(', ')}
Competitive Landscape: ${competitiveLandscape}

Provide detailed financial strategy including:
1. Revenue stream diversification and pricing strategies
2. Customer acquisition cost (CAC) and lifetime value (LTV) analysis
3. Unit economics and contribution margins
4. Scalability metrics and growth projections
5. Market penetration and revenue forecasting
6. Break-even analysis and profitability timelines
7. Scenario planning (conservative, realistic, optimistic)
8. Key performance indicators and financial metrics

Format as a comprehensive financial business plan with actionable revenue strategies.`
    }]
  });

  const content = getTextContent(response);
  
  return {
    id: `revenue_${Date.now()}`,
    type: "revenue_model",
    title: `Revenue Strategy: ${businessType}`,
    description: `Comprehensive revenue model and financial projections for ${businessType} in ${industry}`,
    businessModel: businessType,
    targetMarket: targetCustomers,
    projections: {
      revenue: extractFinancialData(content, 'revenue'),
      expenses: extractFinancialData(content, 'expense'),
      profitability: extractFinancialData(content, 'profit')
    },
    fundingOptions: extractSections(content, 'funding'),
    pitchElements: extractSections(content, 'strategy'),
    riskFactors: extractSections(content, 'risk'),
    recommendations: extractSections(content, 'recommendation'),
    timeline: "12-36 months for full implementation"
  };
}

export async function generateFundingStrategy(
  businessStage: string,
  fundingAmount: string,
  useOfFunds: string[],
  businessModel: string,
  traction: string,
  team: string[]
): Promise<FinancialStrategy> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Create a comprehensive funding strategy for a ${businessStage} stage ${businessModel} business.

Funding Amount Needed: ${fundingAmount}
Use of Funds: ${useOfFunds.join(', ')}
Current Traction: ${traction}
Team: ${team.join(', ')}

Provide detailed funding strategy including:
1. Funding source analysis (bootstrapping, angel, VC, grants, crowdfunding)
2. Investor targeting and due diligence preparation
3. Valuation methodologies and negotiation strategies
4. Term sheet considerations and equity structures
5. Funding timeline and milestone-based approach
6. Alternative financing options and debt instruments
7. Exit strategy planning and investor expectations
8. Legal and regulatory compliance requirements

Format as a comprehensive funding roadmap with practical implementation steps.`
    }]
  });

  const content = getTextContent(response);

  return {
    id: `funding_${Date.now()}`,
    type: "funding_strategy",
    title: `Funding Strategy: ${businessStage} Stage`,
    description: `Comprehensive funding roadmap for ${businessModel} seeking ${fundingAmount}`,
    businessModel,
    targetMarket: "Investors and funding sources",
    projections: {
      revenue: extractFinancialData(content, 'milestone'),
      expenses: extractFinancialData(content, 'use'),
      profitability: extractFinancialData(content, 'return')
    },
    fundingOptions: extractSections(content, 'funding'),
    pitchElements: extractSections(content, 'pitch'),
    riskFactors: extractSections(content, 'risk'),
    recommendations: extractSections(content, 'recommendation'),
    timeline: "6-18 months funding cycle"
  };
}

export async function generatePitchDeckStrategy(
  companyName: string,
  problemStatement: string,
  solution: string,
  marketSize: string,
  businessModel: string,
  traction: string,
  team: string,
  fundingAmount: string
): Promise<FinancialStrategy> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Create a compelling pitch deck strategy and storytelling framework for ${companyName}.

Problem Statement: ${problemStatement}
Solution: ${solution}
Market Size: ${marketSize}
Business Model: ${businessModel}
Traction: ${traction}
Team: ${team}
Funding Amount: ${fundingAmount}

Provide detailed pitch deck strategy including:
1. Narrative structure and compelling storytelling techniques
2. Slide-by-slide content recommendations and visual hierarchy
3. Market analysis and competitive positioning
4. Financial projections and key metrics presentation
5. Traction demonstration and social proof strategies
6. Team credibility and expertise highlighting
7. Investment opportunity and ROI projections
8. Q&A preparation and objection handling

Format as a comprehensive pitch presentation guide with persuasive storytelling elements.`
    }]
  });

  const content = getTextContent(response);

  return {
    id: `pitch_${Date.now()}`,
    type: "pitch_deck",
    title: `Pitch Strategy: ${companyName}`,
    description: `Investor pitch deck and storytelling strategy for ${companyName}`,
    businessModel,
    targetMarket: "Investors and stakeholders",
    projections: {
      revenue: extractFinancialData(content, 'projection'),
      expenses: extractFinancialData(content, 'investment'),
      profitability: extractFinancialData(content, 'return')
    },
    fundingOptions: extractSections(content, 'funding'),
    pitchElements: extractSections(content, 'slide'),
    riskFactors: extractSections(content, 'challenge'),
    recommendations: extractSections(content, 'recommendation'),
    timeline: "3-6 months pitch preparation"
  };
}

export async function generateFinancialProjections(
  businessType: string,
  industry: string,
  initialInvestment: string,
  revenueStreams: string[],
  operatingExpenses: string[],
  growthRate: string,
  timeHorizon: string
): Promise<FinancialStrategy> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Create detailed financial projections for a ${businessType} in the ${industry} industry.

Initial Investment: ${initialInvestment}
Revenue Streams: ${revenueStreams.join(', ')}
Operating Expenses: ${operatingExpenses.join(', ')}
Expected Growth Rate: ${growthRate}
Time Horizon: ${timeHorizon}

Provide comprehensive financial projections including:
1. Monthly/quarterly/annual revenue forecasting
2. Cost structure analysis and expense modeling
3. Cash flow projections and working capital requirements
4. Profitability analysis and margin optimization
5. Sensitivity analysis and scenario planning
6. Break-even analysis and runway calculations
7. Key financial ratios and performance metrics
8. Investment requirements and funding gaps

Format as a detailed financial model with actionable insights and recommendations.`
    }]
  });

  const content = getTextContent(response);

  return {
    id: `projections_${Date.now()}`,
    type: "financial_projections",
    title: `Financial Projections: ${businessType}`,
    description: `Detailed financial modeling and projections for ${businessType} over ${timeHorizon}`,
    businessModel: businessType,
    targetMarket: "Financial planning and analysis",
    projections: {
      revenue: extractFinancialData(content, 'revenue'),
      expenses: extractFinancialData(content, 'expense'),
      profitability: extractFinancialData(content, 'profit')
    },
    fundingOptions: extractSections(content, 'funding'),
    pitchElements: extractSections(content, 'metric'),
    riskFactors: extractSections(content, 'risk'),
    recommendations: extractSections(content, 'recommendation'),
    timeline: timeHorizon
  };
}

function extractFinancialData(content: string, dataType: string): string[] {
  const lines = content.split('\n');
  const data: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if ((trimmed.includes('$') || trimmed.includes('%') || trimmed.includes('month') || trimmed.includes('year')) &&
        (trimmed.includes('•') || trimmed.includes('-') || trimmed.includes('*'))) {
      const cleaned = trimmed.replace(/^[•\-*]\s*/, '').trim();
      if (cleaned.length > 10 && 
          ((dataType === 'revenue' && (cleaned.toLowerCase().includes('revenue') || cleaned.toLowerCase().includes('sales') || cleaned.toLowerCase().includes('income'))) ||
          (dataType === 'expense' && (cleaned.toLowerCase().includes('expense') || cleaned.toLowerCase().includes('cost') || cleaned.toLowerCase().includes('spending'))) ||
          (dataType === 'profit' && (cleaned.toLowerCase().includes('profit') || cleaned.toLowerCase().includes('margin') || cleaned.toLowerCase().includes('earnings'))) ||
          (dataType === 'milestone' && (cleaned.toLowerCase().includes('milestone') || cleaned.toLowerCase().includes('target') || cleaned.toLowerCase().includes('goal'))) ||
          (dataType === 'use' && (cleaned.toLowerCase().includes('use') || cleaned.toLowerCase().includes('allocation') || cleaned.toLowerCase().includes('spend'))) ||
          (dataType === 'return' && (cleaned.toLowerCase().includes('return') || cleaned.toLowerCase().includes('roi') || cleaned.toLowerCase().includes('yield'))) ||
          (dataType === 'projection' && (cleaned.toLowerCase().includes('project') || cleaned.toLowerCase().includes('forecast') || cleaned.toLowerCase().includes('estimate'))) ||
          (dataType === 'investment' && (cleaned.toLowerCase().includes('investment') || cleaned.toLowerCase().includes('funding') || cleaned.toLowerCase().includes('capital'))))
      ) {
        data.push(cleaned);
      }
    }
  }
  
  return data.slice(0, 6); // Limit to 6 items for readability
}

function extractSections(content: string, sectionType: string): string[] {
  const lines = content.split('\n');
  const sections: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('•') || trimmed.includes('-') || trimmed.includes('*')) {
      const cleaned = trimmed.replace(/^[•\-*]\s*/, '').trim();
      if (cleaned.length > 10 && 
          ((sectionType === 'funding' && (cleaned.toLowerCase().includes('funding') || cleaned.toLowerCase().includes('investment') || cleaned.toLowerCase().includes('capital'))) ||
          (sectionType === 'strategy' && (cleaned.toLowerCase().includes('strategy') || cleaned.toLowerCase().includes('approach') || cleaned.toLowerCase().includes('plan'))) ||
          (sectionType === 'risk' && (cleaned.toLowerCase().includes('risk') || cleaned.toLowerCase().includes('challenge') || cleaned.toLowerCase().includes('threat'))) ||
          (sectionType === 'recommendation' && (cleaned.toLowerCase().includes('recommend') || cleaned.toLowerCase().includes('suggest') || cleaned.toLowerCase().includes('should'))) ||
          (sectionType === 'pitch' && (cleaned.toLowerCase().includes('pitch') || cleaned.toLowerCase().includes('present') || cleaned.toLowerCase().includes('investor'))) ||
          (sectionType === 'slide' && (cleaned.toLowerCase().includes('slide') || cleaned.toLowerCase().includes('section') || cleaned.toLowerCase().includes('element'))) ||
          (sectionType === 'challenge' && (cleaned.toLowerCase().includes('challenge') || cleaned.toLowerCase().includes('difficulty') || cleaned.toLowerCase().includes('obstacle'))) ||
          (sectionType === 'metric' && (cleaned.toLowerCase().includes('metric') || cleaned.toLowerCase().includes('kpi') || cleaned.toLowerCase().includes('measure'))))
      ) {
        sections.push(cleaned);
      }
    }
  }
  
  return sections.slice(0, 8); // Limit to 8 items for readability
}