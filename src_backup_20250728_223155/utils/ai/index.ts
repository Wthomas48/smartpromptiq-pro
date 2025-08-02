// Export the appropriate service based on environment
const USE_MOCK = process.env.NODE_ENV === 'development' && !process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY;

// Main AI service
export * from USE_MOCK ? './mockAiService' : './aiService';

// Education-specific AI service
export * as EducationAI from USE_MOCK ? './mockEducationAI' : './educationAI';

// Financial-specific AI service
export * as FinancialAI from USE_MOCK ? './mockFinancialAI' : './financialAI';

// Marketing-specific AI service
export * as MarketingAI from USE_MOCK ? './mockMarketingAI' : './marketingAI';