import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { API_COSTS, TOKEN_COSTS, getTokenCost, COST_CONTROL_FLAGS } from '../config/costs';

const router = Router();
const prisma = new PrismaClient();

// Cost tracking helper - logs actual API costs for admin dashboard
async function logVoiceCost(userId: string | null, action: string, cost: number, tokensUsed: number, model: string) {
  try {
    await prisma.usageLog.create({
      data: {
        userId: userId || 'anonymous',
        action: `voice:${action}`,
        tokensUsed,
        cost,
        provider: 'openai',
        model,
        responseTime: 0,
        metadata: JSON.stringify({ feature: action }),
      },
    });

    if (COST_CONTROL_FLAGS.logAllAPICosts) {
      console.log(`💰 Voice Cost: $${cost.toFixed(4)} | Tokens: ${tokensUsed} | Model: ${model} | Action: ${action}`);
    }
  } catch (error) {
    console.error('Failed to log voice cost:', error);
  }
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Voice generation constants
const VOICE_TOKEN_COST_PER_100_CHARS = 10;
const MAX_FREE_CHARS = 500;
const MAX_CHARS_PER_REQUEST = 4096;

// Available OpenAI TTS voices
const AVAILABLE_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
type VoiceId = typeof AVAILABLE_VOICES[number];

interface VoiceGenerationRequest {
  text: string;
  voice?: VoiceId;
  style?: string;
  settings?: {
    rate?: number;
    pitch?: number;
    volume?: number;
  };
  category?: string;
}

interface ScriptEnhanceRequest {
  script: string;
  category?: string;
  style?: string;
}

/**
 * POST /api/voice/generate
 * Generate AI voice from text using OpenAI TTS
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'nova', style, settings, category } = req.body as VoiceGenerationRequest;

    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'Text is required' });
    }

    if (text.length > MAX_CHARS_PER_REQUEST) {
      return res.status(400).json({
        message: `Text too long. Maximum ${MAX_CHARS_PER_REQUEST} characters allowed.`
      });
    }

    // Validate voice
    if (!AVAILABLE_VOICES.includes(voice as VoiceId)) {
      return res.status(400).json({
        message: `Invalid voice. Available: ${AVAILABLE_VOICES.join(', ')}`
      });
    }

    // Check if user is authenticated (optional for demo)
    const userId = (req as any).userId;

    // Calculate token cost
    const tokenCost = Math.ceil(text.length / 100) * VOICE_TOKEN_COST_PER_100_CHARS;

    // If user is authenticated, check their token balance
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tokenBalance: true, subscriptionTier: true },
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check token balance (skip for enterprise/unlimited users)
      if (user.subscriptionTier !== 'enterprise' && user.tokenBalance < tokenCost) {
        return res.status(402).json({
          message: 'Insufficient tokens',
          required: tokenCost,
          available: user.tokenBalance,
        });
      }
    }

    // Generate voice using OpenAI TTS - HIGHEST QUALITY SETTINGS
    console.log(`🎙️ Generating PREMIUM voice: ${voice}, ${text.length} chars, ${tokenCost} tokens`);
    console.log(`🎙️ Using TTS-1-HD model for studio-quality output`);

    // Use TTS-1-HD for the absolute best quality
    // This model produces clearer, more natural-sounding audio
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1-hd', // HD = High Definition quality - clearer, less noise
      voice: voice as VoiceId,
      input: text,
      response_format: 'mp3', // MP3 for best compatibility and quality
      speed: settings?.rate || 1.0, // 0.25 to 4.0 range
    });

    console.log(`🎙️ Premium voice generated successfully!`);

    // Calculate actual API cost for tracking
    const actualAPICost = (text.length / 1000000) * API_COSTS.openai['tts-1-hd'];

    // Log cost for admin dashboard
    await logVoiceCost(userId, 'generate', actualAPICost, tokenCost, 'tts-1-hd');

    // Get the audio buffer
    const audioBuffer = Buffer.from(await mp3Response.arrayBuffer());
    const base64Audio = audioBuffer.toString('base64');
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    // Deduct tokens if user is authenticated
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          tokenBalance: { decrement: tokenCost },
          tokensUsed: { increment: tokenCost },
        },
      });

      // Log the generation
      await prisma.generation.create({
        data: {
          userId,
          prompt: text.slice(0, 500), // Store first 500 chars
          response: `Voice generated: ${voice}, ${text.length} chars`,
          model: 'tts-1-hd',
          category: category || 'voice',
          tokenCount: tokenCost,
        },
      });
    }

    // Calculate estimated duration (roughly 150 words per minute)
    const wordCount = text.trim().split(/\s+/).length;
    const estimatedDuration = Math.ceil(wordCount / 150 * 60);

    res.json({
      success: true,
      audioUrl,
      format: 'mp3',
      duration: estimatedDuration,
      voice,
      tokensUsed: tokenCost,
      charCount: text.length,
    });

  } catch (error: any) {
    console.error('Voice generation error:', error);

    // Handle OpenAI-specific errors
    if (error?.status === 429) {
      return res.status(429).json({ message: 'Rate limit exceeded. Please try again later.' });
    }

    if (error?.status === 401) {
      return res.status(500).json({ message: 'Voice service configuration error' });
    }

    res.status(500).json({
      message: 'Failed to generate voice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/voice/enhance-script
 * Use AI to enhance a script for better voice delivery
 */
router.post('/enhance-script', async (req: Request, res: Response) => {
  try {
    const { script, category, style } = req.body as ScriptEnhanceRequest;

    if (!script || typeof script !== 'string') {
      return res.status(400).json({ message: 'Script is required' });
    }

    if (script.length > 5000) {
      return res.status(400).json({ message: 'Script too long. Maximum 5000 characters.' });
    }

    // Build enhancement prompt
    const categoryContext = category ? `This is for ${category} content.` : '';
    const styleContext = style ? `The voice style should be ${style}.` : '';

    const systemPrompt = `You are an expert script writer for voice-over content. Your job is to enhance scripts to sound natural and engaging when read aloud.

Guidelines:
- Use conversational language
- Add natural pauses with punctuation
- Break long sentences into shorter ones
- Remove filler words and redundancy
- Add emphasis where appropriate
- Ensure smooth flow and rhythm
- Keep the original meaning intact
${categoryContext}
${styleContext}

Return ONLY the enhanced script, no explanations.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Enhance this script for voice-over:\n\n${script}` },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const enhancedScript = completion.choices[0]?.message?.content?.trim() || script;

    // Calculate and log API cost for script enhancement
    const inputTokens = (systemPrompt.length + script.length) / 4; // rough estimate
    const outputTokens = (enhancedScript.length) / 4;
    const apiCost = (inputTokens / 1000) * API_COSTS.openai['gpt-4o-mini'].input +
                    (outputTokens / 1000) * API_COSTS.openai['gpt-4o-mini'].output;
    await logVoiceCost(null, 'enhance-script', apiCost, 1, 'gpt-4o-mini');

    res.json({
      success: true,
      enhancedScript,
      originalLength: script.length,
      enhancedLength: enhancedScript.length,
    });

  } catch (error: any) {
    console.error('Script enhancement error:', error);
    res.status(500).json({ message: 'Failed to enhance script' });
  }
});

/**
 * POST /api/voice/generate-from-blueprint
 * Generate a voice pitch from an app blueprint
 */
router.post('/generate-from-blueprint', async (req: Request, res: Response) => {
  try {
    const { blueprint, appName, industry, features, targetAudience, duration = 60 } = req.body;

    if (!blueprint && !appName) {
      return res.status(400).json({ message: 'Blueprint or app name required' });
    }

    // Build the blueprint context
    const blueprintContext = blueprint
      ? JSON.stringify(blueprint)
      : `App: ${appName}, Industry: ${industry || 'general'}, Features: ${features?.join(', ') || 'various'}`;

    const durationText = duration === 30 ? 'a 30-second elevator pitch'
      : duration === 60 ? 'a 60-second overview'
      : `a ${duration}-second presentation`;

    const systemPrompt = `You are an expert at creating compelling app pitch scripts. Generate ${durationText} script for voice-over narration.

The script should:
1. Hook the listener immediately
2. Clearly explain what the app does
3. Highlight key benefits (not just features)
4. Include a call to action
5. Sound natural when read aloud
6. Use conversational, engaging language

Target audience: ${targetAudience || 'general users and potential investors'}

Return ONLY the script, ready to be read aloud. No stage directions or brackets.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a voice pitch script for this app:\n\n${blueprintContext}` },
      ],
      max_tokens: 1000,
      temperature: 0.8,
    });

    const pitchScript = completion.choices[0]?.message?.content?.trim() || '';

    res.json({
      success: true,
      script: pitchScript,
      duration,
      wordCount: pitchScript.split(/\s+/).length,
      estimatedReadTime: Math.ceil(pitchScript.split(/\s+/).length / 150 * 60),
    });

  } catch (error: any) {
    console.error('Blueprint pitch generation error:', error);
    res.status(500).json({ message: 'Failed to generate pitch script' });
  }
});

/**
 * POST /api/voice/generate-lesson-narration
 * Generate voice narration for Academy lesson content
 */
router.post('/generate-lesson-narration', async (req: Request, res: Response) => {
  try {
    const { lessonContent, lessonTitle, courseTitle, style = 'teacher' } = req.body;

    if (!lessonContent) {
      return res.status(400).json({ message: 'Lesson content required' });
    }

    // Clean and prepare lesson content for narration
    const systemPrompt = `You are an expert educational content narrator. Transform the following lesson content into a natural, engaging voice-over script.

Guidelines:
- Use a ${style} tone
- Add natural transitions between sections
- Explain technical terms in simple language
- Include brief pauses (via punctuation) for comprehension
- Keep educational but conversational
- Remove any markdown formatting, links, or code blocks - describe them instead
- Add brief intros like "Let's look at..." or "Now, consider..."

Course: ${courseTitle || 'SmartPromptIQ Academy'}
Lesson: ${lessonTitle || 'Lesson'}

Return ONLY the narration script, ready to be read aloud.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Transform this lesson into voice narration:\n\n${lessonContent.slice(0, 8000)}` },
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    const narrationScript = completion.choices[0]?.message?.content?.trim() || '';

    res.json({
      success: true,
      script: narrationScript,
      wordCount: narrationScript.split(/\s+/).length,
      estimatedDuration: Math.ceil(narrationScript.split(/\s+/).length / 150 * 60),
    });

  } catch (error: any) {
    console.error('Lesson narration generation error:', error);
    res.status(500).json({ message: 'Failed to generate lesson narration' });
  }
});

/**
 * POST /api/voice/generate-prompt-voiceover
 * Generate voice narration for generated prompts/content
 */
router.post('/generate-prompt-voiceover', async (req: Request, res: Response) => {
  try {
    const { promptContent, category, outputType = 'marketing' } = req.body;

    if (!promptContent) {
      return res.status(400).json({ message: 'Prompt content required' });
    }

    // Determine voice style based on category
    const styleMap: Record<string, string> = {
      marketing: 'energetic and persuasive',
      education: 'clear and instructional',
      business: 'professional and authoritative',
      personal: 'warm and friendly',
      financial: 'confident and trustworthy',
    };

    const voiceStyle = styleMap[category] || 'professional';

    const systemPrompt = `You are an expert at converting written content into compelling voice-over scripts.

Transform the content into a ${voiceStyle} voice-over script that:
- Sounds natural when spoken aloud
- Maintains the key message and information
- Uses appropriate pacing and emphasis
- Includes natural transitions
- Is ready for professional voice recording

Return ONLY the voice-over script.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Convert this ${category || 'general'} content into a voice-over script:\n\n${promptContent.slice(0, 5000)}` },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const voiceoverScript = completion.choices[0]?.message?.content?.trim() || '';

    res.json({
      success: true,
      script: voiceoverScript,
      category,
      wordCount: voiceoverScript.split(/\s+/).length,
      estimatedDuration: Math.ceil(voiceoverScript.split(/\s+/).length / 150 * 60),
    });

  } catch (error: any) {
    console.error('Prompt voiceover generation error:', error);
    res.status(500).json({ message: 'Failed to generate voiceover script' });
  }
});

/**
 * GET /api/voice/voices
 * Get available voices and their characteristics
 */
router.get('/voices', (_req: Request, res: Response) => {
  const voices = [
    { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced', gender: 'neutral', style: 'professional', recommended: ['business', 'education'] },
    { id: 'echo', name: 'Echo', description: 'Warm and engaging', gender: 'male', style: 'friendly', recommended: ['personal', 'podcast'] },
    { id: 'fable', name: 'Fable', description: 'Expressive storyteller', gender: 'neutral', style: 'dynamic', recommended: ['entertainment', 'audiobook'] },
    { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative', gender: 'male', style: 'authoritative', recommended: ['business', 'documentary'] },
    { id: 'nova', name: 'Nova', description: 'Bright and energetic', gender: 'female', style: 'energetic', recommended: ['marketing', 'ecommerce'] },
    { id: 'shimmer', name: 'Shimmer', description: 'Soft and calming', gender: 'female', style: 'calm', recommended: ['healthcare', 'meditation'] },
  ];

  res.json({ voices });
});

/**
 * GET /api/voice/templates
 * Get script templates for different use cases
 */
router.get('/templates', (_req: Request, res: Response) => {
  const templates = [
    {
      id: 'app-pitch-60',
      name: '60-Second App Pitch',
      category: 'apps',
      duration: 60,
      template: `Introducing [App Name] - the revolutionary app that [main benefit].

[Problem statement - what frustration does it solve?]

With [App Name], you can:
- [Feature 1 and benefit]
- [Feature 2 and benefit]
- [Feature 3 and benefit]

Built for [target audience], [App Name] makes [key action] effortless.

Ready to transform [area]? Download [App Name] today and experience the difference.`,
    },
    {
      id: 'product-demo',
      name: 'Product Demo',
      category: 'ecommerce',
      duration: 45,
      template: `Meet the [Product Name] - designed to [main purpose].

Here's what makes it special:
First, [feature 1] - which means [benefit].
Second, [feature 2] - so you can [benefit].
And finally, [feature 3] - giving you [benefit].

Whether you're [use case 1] or [use case 2], the [Product Name] delivers.

Order now and see why thousands are making the switch.`,
    },
    {
      id: 'course-intro',
      name: 'Course Introduction',
      category: 'education',
      duration: 45,
      template: `Welcome to [Course Name].

In this course, you'll learn [main topic] from the ground up.

By the end, you'll be able to:
- [Learning outcome 1]
- [Learning outcome 2]
- [Learning outcome 3]

No prior experience needed - just bring your curiosity and let's get started.

I'm [Instructor Name], and I'll be your guide on this journey. Let's begin!`,
    },
    {
      id: 'video-ad-30',
      name: 'Video Ad (30 sec)',
      category: 'marketing',
      duration: 30,
      template: `Tired of [pain point]?

[Brand Name] is here to change that.

Our [product/service] helps you [main benefit] - fast.

Join [number] happy customers who've already made the switch.

[Brand Name]. [Tagline].

Visit [website] today. Limited time offer!`,
    },
    {
      id: 'meditation-intro',
      name: 'Guided Meditation',
      category: 'healthcare',
      duration: 60,
      template: `Find a comfortable position and gently close your eyes.

Take a deep breath in... and slowly release.

Let your shoulders drop. Release any tension you're holding.

With each breath, feel yourself becoming more relaxed.

Breathe in calm... breathe out stress.

You are safe. You are present. You are at peace.

Continue breathing slowly as we journey inward together...`,
    },
  ];

  res.json({ templates });
});

export default router;
