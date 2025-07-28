// Mock Financial AI service for development/testing without API keys

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
 // Simulate API delay
 await new Promise(resolve => setTimeout(resolve, 1000));
 
 return {
   id: `revenue_${Date.now()}`,
   type: "revenue_model",
   title: `Revenue Strategy: ${businessType}`,
   description: `Comprehensive revenue model and financial projections for ${businessType} in ${industry}`,
   businessModel: businessType,
   targetMarket: targetCustomers,
   projections: {
     revenue: [
       "Year 1: $500K from initial customer base",
       "Year 2: $2M with 300% growth rate",
       "Year 3: $5M with market expansion",
       "Monthly recurring revenue: $150K by end of Year 2",
       "Average revenue per user: $" + pricePoints[0] + " monthly",
       "Revenue mix: 70% subscriptions, 30% services"
     ],
     expenses: [
       "Customer acquisition cost: $150 per customer",
       "Operating expenses: 45% of revenue",
       "Marketing spend: 25% of revenue",
       "Technology infrastructure: $50K/month",
       "Personnel costs: $200K/month by Year 2",
       "Total monthly burn rate: $300K"
     ],
     profitability: [
       "Break-even timeline: Month 18",
       "Gross margin: 75% on SaaS revenue",
       "Net margin: 15% by Year 3",
       "Unit economics positive by Month 12",
       "LTV/CAC ratio: 3.5x",
       "Contribution margin: 55%"
     ]
   },
   fundingOptions: [
     "Seed funding: $2M for initial product development",
     "Series A: $10M for market expansion",
     "Revenue-based financing for growth capital",
     "Strategic partnerships for distribution"
   ],
   pitchElements: [
     "Strong unit economics with proven scalability",
     "Clear path to profitability within 18 months",
     "Multiple revenue streams for stability",
     "Competitive pricing with premium positioning"
   ],
   riskFactors: [
     "Market competition from established players",
     "Customer acquisition cost sensitivity",
     "Technology platform scalability challenges",
     "Regulatory compliance requirements"
   ],
   recommendations: [
     "Focus on customer retention to improve LTV",
     "Implement tiered pricing for market segmentation",
     "Develop channel partnerships for distribution",
     "Monitor unit economics monthly"
   ],
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
 // Simulate API delay
 await new Promise(resolve => setTimeout(resolve, 1000));

 return {
   id: `funding_${Date.now()}`,
   type: "funding_strategy",
   title: `Funding Strategy: ${businessStage} Stage`,
   description: `Comprehensive funding roadmap for ${businessModel} seeking ${fundingAmount}`,
   businessModel,
   targetMarket: "Investors and funding sources",
   projections: {
     revenue: [
       "Pre-money valuation: $" + (parseInt(fundingAmount) * 4) + "M",
       "Post-money valuation: $" + (parseInt(fundingAmount) * 5) + "M",
       "Expected ROI for investors: 10x in 5 years",
       "Revenue multiple: 5x current ARR"
     ],
     expenses: useOfFunds.map(use => `${use}: $${(parseInt(fundingAmount) * 0.2).toFixed(0)}M allocated`),
     profitability: [
       "Path to profitability: 24 months post-funding",
       "Expected burn rate: $500K/month",
       "Runway with funding: 36 months",
       "Next funding milestone: $10M ARR"
     ]
   },
   fundingOptions: [
     "Lead investor: Tier 1 VC with industry expertise",
     "Angel syndicate for initial round",
     "Strategic investors from target industry",
     "Government grants and R&D tax credits"
   ],
   pitchElements: [
     `Strong founding team: ${team.join(", ")}`,
     `Current traction: ${traction}`,
     "Clear go-to-market strategy",
     "Defensible technology moat"
   ],
   riskFactors: [
     "Dilution management for founders",
     "Board composition negotiations",
     "Liquidation preference terms",
     "Anti-dilution provisions"
   ],
   recommendations: [
     "Target investors with portfolio synergies",
     "Prepare comprehensive data room",
     "Engage experienced legal counsel",
     "Build relationships before fundraising"
   ],
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
 // Simulate API delay
 await new Promise(resolve => setTimeout(resolve, 1000));

 return {
   id: `pitch_${Date.now()}`,
   type: "pitch_deck",
   title: `Pitch Strategy: ${companyName}`,
   description: `Investor pitch deck and storytelling strategy for ${companyName}`,
   businessModel,
   targetMarket: "Investors and stakeholders",
   projections: {
     revenue: [
       "TAM: $" + marketSize + " total addressable market",
       "SAM: $" + (parseInt(marketSize) * 0.1) + "B serviceable market",
       "SOM: $100M obtainable in 5 years",
       "Market growth rate: 25% CAGR"
     ],
     expenses: [
       "Funding ask: $" + fundingAmount,
       "18-month runway with current burn",
       "70% allocation to growth initiatives",
       "30% for operational excellence"
     ],
     profitability: [
       "Path to $100M revenue in 5 years",
       "Expected 10x return for investors",
       "IPO potential within 7-10 years",
       "Strategic acquisition opportunities"
     ]
   },
   fundingOptions: [
     "Series A funding round of $" + fundingAmount,
     "Strategic investor participation",
     "Employee option pool expansion",
     "Debt financing for equipment"
   ],
   pitchElements: [
     "Slide 1: Vision - " + solution,
     "Slide 2: Problem - " + problemStatement,
     "Slide 3: Solution - Product demo",
     "Slide 4: Market - $" + marketSize + " opportunity",
     "Slide 5: Business Model - " + businessModel,
     "Slide 6: Traction - " + traction,
     "Slide 7: Team - " + team,
     "Slide 8: Ask - $" + fundingAmount + " to scale"
   ],
   riskFactors: [
     "Competition from tech giants",
     "Market timing and adoption rate",
     "Regulatory environment changes",
     "Key personnel retention"
   ],
   recommendations: [
     "Lead with compelling problem narrative",
     "Show product-market fit evidence",
     "Emphasize team domain expertise",
     "Prepare detailed financial appendix"
   ],
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
 // Simulate API delay
 await new Promise(resolve => setTimeout(resolve, 1000));

 return {
   id: `projections_${Date.now()}`,
   type: "financial_projections",
   title: `Financial Projections: ${businessType}`,
   description: `Detailed financial modeling and projections for ${businessType} over ${timeHorizon}`,
   businessModel: businessType,
   targetMarket: "Financial planning and analysis",
   projections: {
     revenue: revenueStreams.map((stream, i) => 
       `${stream}: $${(parseInt(initialInvestment) * (i + 1) * 0.5).toFixed(0)}M by Year 3`
     ),
     expenses: operatingExpenses.map((expense, i) => 
       `${expense}: ${15 + i * 5}% of revenue`
     ),
     profitability: [
       `EBITDA positive by Year 2`,
       `Net profit margin: ${parseInt(growthRate) * 0.5}% by Year 3`,
       `Cash flow positive in 18 months`,
       `ROI: ${parseInt(growthRate) * 2}% annually`,
       `Working capital needs: $${(parseInt(initialInvestment) * 0.3).toFixed(0)}M`,
       `Break-even: Month 24`
     ]
   },
   fundingOptions: [
     "Initial investment: $" + initialInvestment,
     "Working capital line of credit",
     "Equipment financing options",
     "Revenue-based financing for growth"
   ],
   pitchElements: [
     `Growth rate: ${growthRate}% annually`,
     "Multiple revenue streams for stability",
     "Scalable business model",
     "Strong unit economics"
   ],
   riskFactors: [
     "Market volatility impact",
     "Currency exchange fluctuations",
     "Supply chain dependencies",
     "Competitive pricing pressure"
   ],
   recommendations: [
     "Maintain 6-month cash reserve",
     "Diversify revenue streams",
     "Implement robust financial controls",
     "Monthly variance analysis"
   ],
   timeline: timeHorizon
 };
}