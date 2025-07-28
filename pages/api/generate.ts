import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { topic, style, length, complexity } = req.body;
    
    // Demo prompt generation
    const generatedPrompt = `Create a ${length} ${style} prompt about ${topic} suitable for ${complexity} level users. Include specific examples and actionable guidance.`;
    
    res.status(200).json({
      success: true,
      prompt: generatedPrompt,
      metadata: {
        wordCount: generatedPrompt.split(' ').length,
        estimatedTime: '2-3 minutes',
        difficulty: complexity
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
