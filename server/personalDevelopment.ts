import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function getTextContent(response: any): string {
  const textBlock = response.content.find((block: any) => block.type === 'text');
  return textBlock ? textBlock.text : '';
}

export interface PersonalDevelopmentPlan {
  id: string;
  type: "goal_setting" | "public_speaking" | "networking";
  title: string;
  description: string;
  focus: string;
  targetOutcome: string;
  strategies: string[];
  actionSteps: string[];
  milestones: string[];
  trackingMethods: string[];
  resources: string[];
  timeline: string;
  challenges: string[];
  recommendations: string[];
}

export async function generateGoalSettingPlan(
  goalCategory: string,
  specificGoals: string[],
  timeframe: string,
  currentSituation: string,
  obstacles: string[],
  motivationFactors: string[]
): Promise<PersonalDevelopmentPlan> {
  // the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Create a comprehensive goal-setting and productivity plan for ${goalCategory}.

Specific Goals: ${specificGoals.join(', ')}
Timeframe: ${timeframe}
Current Situation: ${currentSituation}
Potential Obstacles: ${obstacles.join(', ')}
Motivation Factors: ${motivationFactors.join(', ')}

Provide detailed goal achievement framework including:
1. SMART goal breakdown and specification
2. Habit formation strategies and behavioral design
3. Progress tracking systems and accountability measures
4. Obstacle management and contingency planning
5. Motivation maintenance and reward systems
6. Time management and productivity optimization
7. Success celebration and milestone recognition
8. Long-term sustainability and habit integration

Format as a structured personal development roadmap with actionable daily, weekly, and monthly steps.`
    }]
  });

  const content = getTextContent(response);
  
  return {
    id: `goal_${Date.now()}`,
    type: "goal_setting",
    title: `Goal Achievement Plan: ${goalCategory}`,
    description: `Structured productivity and habit-building plan for ${goalCategory} goals`,
    focus: goalCategory,
    targetOutcome: specificGoals.join(', '),
    strategies: extractSections(content, 'strategy'),
    actionSteps: extractSections(content, 'action'),
    milestones: extractSections(content, 'milestone'),
    trackingMethods: extractSections(content, 'tracking'),
    resources: extractSections(content, 'resource'),
    timeline: timeframe,
    challenges: extractSections(content, 'obstacle'),
    recommendations: extractSections(content, 'recommendation')
  };
}

export async function generatePublicSpeakingStrategy(
  speechType: string,
  audience: string,
  duration: string,
  mainMessage: string,
  speakingExperience: string,
  specificChallenges: string[]
): Promise<PersonalDevelopmentPlan> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Create a comprehensive public speaking and persuasion strategy for a ${speechType}.

Target Audience: ${audience}
Speech Duration: ${duration}
Main Message: ${mainMessage}
Speaking Experience: ${speakingExperience}
Specific Challenges: ${specificChallenges.join(', ')}

Provide detailed speaking framework including:
1. Speech structure and narrative development
2. Audience engagement and interaction techniques
3. Persuasion psychology and influence strategies
4. Confidence building and anxiety management
5. Voice modulation and body language optimization
6. Visual aids and presentation design principles
7. Q&A handling and objection management
8. Practice routines and preparation methodologies

Format as a comprehensive speaking guide with step-by-step preparation and delivery instructions.`
    }]
  });

  const content = getTextContent(response);

  return {
    id: `speaking_${Date.now()}`,
    type: "public_speaking",
    title: `Speaking Strategy: ${speechType}`,
    description: `Comprehensive public speaking framework for ${speechType} targeting ${audience}`,
    focus: speechType,
    targetOutcome: mainMessage,
    strategies: extractSections(content, 'technique'),
    actionSteps: extractSections(content, 'preparation'),
    milestones: extractSections(content, 'practice'),
    trackingMethods: extractSections(content, 'feedback'),
    resources: extractSections(content, 'resource'),
    timeline: `Preparation for ${duration} speech`,
    challenges: extractSections(content, 'challenge'),
    recommendations: extractSections(content, 'recommendation')
  };
}

export async function generateNetworkingStrategy(
  networkingGoals: string[],
  industryFocus: string,
  currentNetwork: string,
  targetConnections: string,
  networkingStyle: string,
  availableTime: string
): Promise<PersonalDevelopmentPlan> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Create a strategic networking and relationship building plan.

Networking Goals: ${networkingGoals.join(', ')}
Industry Focus: ${industryFocus}
Current Network Size: ${currentNetwork}
Target Connections: ${targetConnections}
Preferred Style: ${networkingStyle}
Available Time: ${availableTime}

Provide detailed networking framework including:
1. Relationship mapping and target identification
2. Outreach strategies and conversation starters
3. Value proposition development and mutual benefit creation
4. Follow-up systems and relationship maintenance
5. Digital networking and social media optimization
6. Event planning and networking opportunity creation
7. Collaboration and partnership development
8. Personal branding and reputation management

Format as a strategic relationship building roadmap with measurable networking outcomes.`
    }]
  });

  const content = getTextContent(response);

  return {
    id: `networking_${Date.now()}`,
    type: "networking",
    title: `Networking Strategy: ${industryFocus}`,
    description: `Strategic relationship building plan for ${industryFocus} with ${targetConnections} target connections`,
    focus: industryFocus,
    targetOutcome: targetConnections,
    strategies: extractSections(content, 'approach'),
    actionSteps: extractSections(content, 'outreach'),
    milestones: extractSections(content, 'connection'),
    trackingMethods: extractSections(content, 'measurement'),
    resources: extractSections(content, 'platform'),
    timeline: availableTime,
    challenges: extractSections(content, 'barrier'),
    recommendations: extractSections(content, 'recommendation')
  };
}

export async function generatePersonalBrandingStrategy(
  profession: string,
  uniqueValue: string,
  targetAudience: string,
  goals: string[],
  currentPresence: string,
  platforms: string[]
): Promise<PersonalDevelopmentPlan> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Create a comprehensive personal branding and professional presence strategy.

Profession: ${profession}
Unique Value Proposition: ${uniqueValue}
Target Audience: ${targetAudience}
Branding Goals: ${goals.join(', ')}
Current Online Presence: ${currentPresence}
Focus Platforms: ${platforms.join(', ')}

Provide detailed branding framework including:
1. Brand identity development and messaging consistency
2. Content creation and thought leadership strategies
3. Social media optimization and engagement tactics
4. Professional portfolio and showcase development
5. Networking and community building approaches
6. Reputation management and crisis communication
7. Influence building and authority establishment
8. Performance measurement and brand evolution

Format as a strategic personal branding roadmap with actionable implementation steps.`
    }]
  });

  const content = getTextContent(response);

  return {
    id: `branding_${Date.now()}`,
    type: "networking",
    title: `Personal Branding: ${profession}`,
    description: `Professional presence strategy for ${profession} targeting ${targetAudience}`,
    focus: profession,
    targetOutcome: goals.join(', '),
    strategies: extractSections(content, 'strategy'),
    actionSteps: extractSections(content, 'implementation'),
    milestones: extractSections(content, 'achievement'),
    trackingMethods: extractSections(content, 'metric'),
    resources: extractSections(content, 'tool'),
    timeline: "Ongoing brand development",
    challenges: extractSections(content, 'challenge'),
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
          ((sectionType === 'strategy' && (cleaned.toLowerCase().includes('strategy') || cleaned.toLowerCase().includes('approach') || cleaned.toLowerCase().includes('method'))) ||
          (sectionType === 'action' && (cleaned.toLowerCase().includes('action') || cleaned.toLowerCase().includes('step') || cleaned.toLowerCase().includes('do'))) ||
          (sectionType === 'milestone' && (cleaned.toLowerCase().includes('milestone') || cleaned.toLowerCase().includes('goal') || cleaned.toLowerCase().includes('target'))) ||
          (sectionType === 'tracking' && (cleaned.toLowerCase().includes('track') || cleaned.toLowerCase().includes('measure') || cleaned.toLowerCase().includes('monitor'))) ||
          (sectionType === 'resource' && (cleaned.toLowerCase().includes('resource') || cleaned.toLowerCase().includes('tool') || cleaned.toLowerCase().includes('app'))) ||
          (sectionType === 'obstacle' && (cleaned.toLowerCase().includes('obstacle') || cleaned.toLowerCase().includes('challenge') || cleaned.toLowerCase().includes('barrier'))) ||
          (sectionType === 'recommendation' && (cleaned.toLowerCase().includes('recommend') || cleaned.toLowerCase().includes('suggest') || cleaned.toLowerCase().includes('tip'))) ||
          (sectionType === 'technique' && (cleaned.toLowerCase().includes('technique') || cleaned.toLowerCase().includes('skill') || cleaned.toLowerCase().includes('practice'))) ||
          (sectionType === 'preparation' && (cleaned.toLowerCase().includes('prepare') || cleaned.toLowerCase().includes('practice') || cleaned.toLowerCase().includes('rehearse'))) ||
          (sectionType === 'practice' && (cleaned.toLowerCase().includes('practice') || cleaned.toLowerCase().includes('exercise') || cleaned.toLowerCase().includes('drill'))) ||
          (sectionType === 'feedback' && (cleaned.toLowerCase().includes('feedback') || cleaned.toLowerCase().includes('evaluation') || cleaned.toLowerCase().includes('assessment'))) ||
          (sectionType === 'challenge' && (cleaned.toLowerCase().includes('challenge') || cleaned.toLowerCase().includes('difficulty') || cleaned.toLowerCase().includes('problem'))) ||
          (sectionType === 'approach' && (cleaned.toLowerCase().includes('approach') || cleaned.toLowerCase().includes('strategy') || cleaned.toLowerCase().includes('method'))) ||
          (sectionType === 'outreach' && (cleaned.toLowerCase().includes('outreach') || cleaned.toLowerCase().includes('contact') || cleaned.toLowerCase().includes('connect'))) ||
          (sectionType === 'connection' && (cleaned.toLowerCase().includes('connection') || cleaned.toLowerCase().includes('relationship') || cleaned.toLowerCase().includes('contact'))) ||
          (sectionType === 'measurement' && (cleaned.toLowerCase().includes('measure') || cleaned.toLowerCase().includes('metric') || cleaned.toLowerCase().includes('kpi'))) ||
          (sectionType === 'platform' && (cleaned.toLowerCase().includes('platform') || cleaned.toLowerCase().includes('network') || cleaned.toLowerCase().includes('channel'))) ||
          (sectionType === 'barrier' && (cleaned.toLowerCase().includes('barrier') || cleaned.toLowerCase().includes('obstacle') || cleaned.toLowerCase().includes('challenge'))) ||
          (sectionType === 'implementation' && (cleaned.toLowerCase().includes('implement') || cleaned.toLowerCase().includes('execute') || cleaned.toLowerCase().includes('action'))) ||
          (sectionType === 'achievement' && (cleaned.toLowerCase().includes('achieve') || cleaned.toLowerCase().includes('accomplish') || cleaned.toLowerCase().includes('milestone'))) ||
          (sectionType === 'metric' && (cleaned.toLowerCase().includes('metric') || cleaned.toLowerCase().includes('kpi') || cleaned.toLowerCase().includes('measure'))) ||
          (sectionType === 'tool' && (cleaned.toLowerCase().includes('tool') || cleaned.toLowerCase().includes('resource') || cleaned.toLowerCase().includes('platform'))))
      ) {
        sections.push(cleaned);
      }
    }
  }
  
  return sections.slice(0, 8); // Limit to 8 items for readability
}