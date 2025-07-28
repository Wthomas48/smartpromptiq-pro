import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface CustomizationOptions {
  tone?: string;
  detailLevel?: string;
  format?: string;
}

const categoryTemplates = {
  business: {
    systemPrompt: `You are a business strategy expert. Generate comprehensive business prompts based on questionnaire responses.`,
    defaultStructure: [
      "Executive Summary",
      "Strategic Objectives", 
      "Market Analysis Framework",
      "Implementation Roadmap",
      "Key Performance Indicators"
    ]
  },
  creative: {
    systemPrompt: `You are a creative director and design expert. Generate detailed creative briefs based on questionnaire responses.`,
    defaultStructure: [
      "Creative Concept",
      "Visual Direction",
      "Brand Guidelines", 
      "Execution Strategy",
      "Success Metrics"
    ]
  },
  technical: {
    systemPrompt: `You are a senior software architect. Generate technical specifications and project requirements based on questionnaire responses.`,
    defaultStructure: [
      "Technical Overview",
      "Architecture Requirements",
      "Implementation Plan",
      "Testing Strategy",
      "Deployment Guidelines"
    ]
  }
};

export async function generatePrompt(
  category: "business" | "creative" | "technical",
  responses: Record<string, any>,
  customization: CustomizationOptions = {}
): Promise<string> {
  try {
    const template = categoryTemplates[category];
    
    // Build the prompt based on category and responses
    const responsesString = Object.entries(responses)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const toneInstruction = customization.tone ? `Use a ${customization.tone} tone.` : 'Use a professional tone.';
    const detailInstruction = customization.detailLevel ? `Provide ${customization.detailLevel} level of detail.` : 'Provide comprehensive detail.';
    const formatInstruction = customization.format ? `Format as ${customization.format}.` : 'Format as a structured document.';

    const userPrompt = `
Based on the following questionnaire responses, generate a detailed ${category} prompt:

${responsesString}

Requirements:
- ${toneInstruction}
- ${detailInstruction} 
- ${formatInstruction}
- Include specific, actionable guidance
- Structure using sections: ${template.defaultStructure.join(', ')}

Create a comprehensive prompt that can be used as a blueprint for implementation.
    `;

    // Try Anthropic first as it's more reliable
    try {
      const message = await anthropic.messages.create({
        max_tokens: 2000,
        messages: [{ role: 'user', content: `${template.systemPrompt}\n\n${userPrompt}` }],
        model: 'claude-sonnet-4-20250514',
      });

      const generatedContent = message.content[0] && 'text' in message.content[0] ? message.content[0].text : null;
      if (generatedContent) {
        return generatedContent;
      }
    } catch (anthropicError) {
      console.error("Anthropic error:", anthropicError);
    }

    // Fallback to OpenAI if Anthropic fails
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: template.systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Failed to generate prompt";
  } catch (error) {
    console.error("Error generating prompt:", error);
    throw new Error("AI services are currently unavailable. Please try again later.");
  }
}

export async function refinePrompt(
  currentPrompt: string,
  refinementQuery: string,
  category: string,
  originalAnswers: Record<string, any>,
  history: any[] = []
): Promise<string> {
  try {
    const template = categoryTemplates[category as keyof typeof categoryTemplates];
    if (!template) {
      throw new Error(`Unsupported category: ${category}`);
    }

    const historyContext = history.length > 0 
      ? `Previous refinements:\n${history.map(h => `Q: ${h.question}\nA: Applied refinement`).join('\n')}\n\n`
      : '';

    const refinementPrompt = `${template.systemPrompt}

You are refining an existing prompt based on user feedback. Here's the context:

Original questionnaire responses: ${JSON.stringify(originalAnswers, null, 2)}

Current prompt:
"""
${currentPrompt}
"""

${historyContext}User refinement request: "${refinementQuery}"

Please modify the prompt according to the user's request while maintaining the overall structure and quality. Make the changes specific and targeted to address their feedback. Return only the refined prompt content.`;

    // Try Anthropic first
    try {
      const message = await anthropic.messages.create({
        max_tokens: 2500,
        messages: [{ role: 'user', content: refinementPrompt }],
        model: 'claude-sonnet-4-20250514',
      });

      const refinedContent = message.content[0] && 'text' in message.content[0] ? message.content[0].text : null;
      if (refinedContent) {
        return refinedContent;
      }
    } catch (anthropicError) {
      console.error("Anthropic refinement error:", anthropicError);
    }

    // Fallback to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert prompt refinement specialist." },
        { role: "user", content: refinementPrompt }
      ],
      max_tokens: 2500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Failed to refine prompt";
  } catch (error) {
    console.error("Error refining prompt:", error);
    throw new Error("AI services are currently unavailable for refinement. Please try again later.");
  }
}
