// Test script to verify AI prompt generation with Anthropic
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testPromptGeneration() {
  try {
    const systemPrompt = `You are a business strategy expert. Generate comprehensive business prompts based on questionnaire responses.`;
    
    const userPrompt = `
Based on these questionnaire responses, create a comprehensive prompt:

Category: business
Responses: {
  "businessType": "startup",
  "goal": "market-expansion",
  "audience": "enterprise-clients",
  "timeline": "6-months",
  "budget": "medium"
}

Requirements:
- Use a professional tone.
- Provide comprehensive level of detail.
- Format as structured.
- Include specific, actionable guidance
- Structure using sections: Executive Summary, Strategic Objectives, Market Analysis Framework, Implementation Roadmap, Key Performance Indicators

Create a comprehensive prompt that can be used as a blueprint for implementation.
    `;

    const message = await anthropic.messages.create({
      max_tokens: 2000,
      messages: [{ role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }],
      model: 'claude-sonnet-4-20250514',
    });

    const generatedContent = message.content[0] && 'text' in message.content[0] ? message.content[0].text : null;
    
    if (generatedContent) {
      console.log('✓ AI Prompt Generation Test Successful');
      console.log('Generated Content:', generatedContent.substring(0, 200) + '...');
      return true;
    } else {
      console.log('✗ No content generated');
      return false;
    }
  } catch (error) {
    console.error('✗ AI Prompt Generation Test Failed:', error.message);
    return false;
  }
}

testPromptGeneration();