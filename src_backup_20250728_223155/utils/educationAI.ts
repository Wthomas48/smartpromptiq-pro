import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
 apiKey: process.env.ANTHROPIC_API_KEY,
});

function getTextContent(response: any): string {
 const textBlock = response.content.find((block: any) => block.type === 'text');
 return textBlock ? textBlock.text : '';
}

export interface EducationalContent {
 id: string;
 type: "course_creation" | "skill_development" | "research_insights";
 title: string;
 description: string;
 subject: string;
 targetAudience: string;
 modules: string[];
 objectives: string[];
 activities: string[];
 assessments: string[];
 resources: string[];
 timeline: string;
 difficulty: string;
 recommendations: string[];
}

export async function generateCourseStructure(
 courseName: string,
 subject: string,
 targetAudience: string,
 learningObjectives: string[],
 duration: string,
 deliveryMethod: string,
 assessmentMethods: string[]
): Promise<EducationalContent> {
 // the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
 const response = await anthropic.messages.create({
   model: 'claude-sonnet-4-20250514',
   max_tokens: 2000,
   messages: [{
     role: 'user',
     content: `Create a comprehensive course structure for "${courseName}" in the ${subject} field.

Target Audience: ${targetAudience}
Learning Objectives: ${learningObjectives.join(', ')}
Course Duration: ${duration}
Delivery Method: ${deliveryMethod}
Assessment Methods: ${assessmentMethods.join(', ')}

Provide detailed course design including:
1. Module breakdown with learning outcomes
2. Lesson plans and content structure
3. Interactive activities and engagement strategies
4. Assessment rubrics and evaluation methods
5. Resource recommendations and reading materials
6. Timeline and pacing guidelines
7. Prerequisite knowledge and skill requirements
8. Technology integration and tools needed

Format as a comprehensive educational blueprint with actionable implementation steps.`
   }]
 });

 const content = getTextContent(response);
 
 return {
   id: `course_${Date.now()}`,
   type: "course_creation",
   title: `Course Design: ${courseName}`,
   description: `Comprehensive course structure for ${courseName} targeting ${targetAudience}`,
   subject,
   targetAudience,
   modules: extractSections(content, 'module'),
   objectives: extractSections(content, 'objective'),
   activities: extractSections(content, 'activity'),
   assessments: extractSections(content, 'assessment'),
   resources: extractSections(content, 'resource'),
   timeline: duration,
   difficulty: determineDifficulty(targetAudience),
   recommendations: extractSections(content, 'recommendation')
 };
}

export async function generateSkillDevelopmentPath(
 skillName: string,
 currentLevel: string,
 targetLevel: string,
 timeframe: string,
 learningStyle: string,
 careerGoals: string[]
): Promise<EducationalContent> {
 const response = await anthropic.messages.create({
   model: 'claude-sonnet-4-20250514',
   max_tokens: 2000,
   messages: [{
     role: 'user',
     content: `Create a personalized skill development pathway for ${skillName}.

Current Level: ${currentLevel}
Target Level: ${targetLevel}
Timeframe: ${timeframe}
Learning Style: ${learningStyle}
Career Goals: ${careerGoals.join(', ')}

Provide detailed development plan including:
1. Progressive learning milestones and checkpoints
2. Practical exercises and hands-on projects
3. Knowledge gaps analysis and remediation strategies
4. Industry-relevant applications and use cases
5. Mentorship and networking opportunities
6. Certification and credential pathways
7. Success metrics and progress tracking methods
8. Resource allocation and time management strategies

Format as a structured professional development roadmap with measurable outcomes.`
   }]
 });

 const content = getTextContent(response);

 return {
   id: `skill_${Date.now()}`,
   type: "skill_development",
   title: `Skill Development: ${skillName}`,
   description: `Professional development pathway from ${currentLevel} to ${targetLevel} in ${timeframe}`,
   subject: skillName,
   targetAudience: "Professional development",
   modules: extractSections(content, 'milestone'),
   objectives: extractSections(content, 'outcome'),
   activities: extractSections(content, 'exercise'),
   assessments: extractSections(content, 'metric'),
   resources: extractSections(content, 'resource'),
   timeline: timeframe,
   difficulty: currentLevel,
   recommendations: extractSections(content, 'recommendation')
 };
}

export async function generateResearchInsights(
 researchTopic: string,
 dataTypes: string[],
 analysisGoals: string[],
 stakeholders: string,
 methodology: string,
 timeline: string
): Promise<EducationalContent> {
 const response = await anthropic.messages.create({
   model: 'claude-sonnet-4-20250514',
   max_tokens: 2000,
   messages: [{
     role: 'user',
     content: `Transform research data into actionable insights for: ${researchTopic}

Data Types Available: ${dataTypes.join(', ')}
Analysis Goals: ${analysisGoals.join(', ')}
Key Stakeholders: ${stakeholders}
Research Methodology: ${methodology}
Project Timeline: ${timeline}

Provide comprehensive research framework including:
1. Data collection and validation strategies
2. Statistical analysis and interpretation methods
3. Visualization and presentation techniques
4. Key findings identification and synthesis
5. Actionable recommendations and next steps
6. Risk assessment and limitation analysis
7. Stakeholder communication and reporting formats
8. Implementation roadmap and success metrics

Format as a detailed research methodology with practical application guidelines.`
   }]
 });

 const content = getTextContent(response);

 return {
   id: `research_${Date.now()}`,
   type: "research_insights",
   title: `Research Analysis: ${researchTopic}`,
   description: `Data-driven insights and actionable findings for ${researchTopic}`,
   subject: researchTopic,
   targetAudience: stakeholders,
   modules: extractSections(content, 'phase'),
   objectives: extractSections(content, 'finding'),
   activities: extractSections(content, 'analysis'),
   assessments: extractSections(content, 'validation'),
   resources: extractSections(content, 'method'),
   timeline,
   difficulty: "Advanced",
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
         ((sectionType === 'module' && (cleaned.toLowerCase().includes('module') || cleaned.toLowerCase().includes('unit') || cleaned.toLowerCase().includes('chapter'))) ||
         (sectionType === 'objective' && (cleaned.toLowerCase().includes('objective') || cleaned.toLowerCase().includes('goal') || cleaned.toLowerCase().includes('outcome'))) ||
         (sectionType === 'activity' && (cleaned.toLowerCase().includes('activity') || cleaned.toLowerCase().includes('exercise') || cleaned.toLowerCase().includes('practice'))) ||
         (sectionType === 'assessment' && (cleaned.toLowerCase().includes('assessment') || cleaned.toLowerCase().includes('evaluation') || cleaned.toLowerCase().includes('test'))) ||
         (sectionType === 'resource' && (cleaned.toLowerCase().includes('resource') || cleaned.toLowerCase().includes('material') || cleaned.toLowerCase().includes('tool'))) ||
         (sectionType === 'recommendation' && (cleaned.toLowerCase().includes('recommend') || cleaned.toLowerCase().includes('suggest') || cleaned.toLowerCase().includes('should'))) ||
         (sectionType === 'milestone' && (cleaned.toLowerCase().includes('milestone') || cleaned.toLowerCase().includes('phase') || cleaned.toLowerCase().includes('stage'))) ||
         (sectionType === 'outcome' && (cleaned.toLowerCase().includes('outcome') || cleaned.toLowerCase().includes('result') || cleaned.toLowerCase().includes('achievement'))) ||
         (sectionType === 'exercise' && (cleaned.toLowerCase().includes('exercise') || cleaned.toLowerCase().includes('project') || cleaned.toLowerCase().includes('practice'))) ||
         (sectionType === 'metric' && (cleaned.toLowerCase().includes('metric') || cleaned.toLowerCase().includes('measure') || cleaned.toLowerCase().includes('track'))) ||
         (sectionType === 'phase' && (cleaned.toLowerCase().includes('phase') || cleaned.toLowerCase().includes('step') || cleaned.toLowerCase().includes('stage'))) ||
         (sectionType === 'finding' && (cleaned.toLowerCase().includes('finding') || cleaned.toLowerCase().includes('insight') || cleaned.toLowerCase().includes('discovery'))) ||
         (sectionType === 'analysis' && (cleaned.toLowerCase().includes('analysis') || cleaned.toLowerCase().includes('method') || cleaned.toLowerCase().includes('approach'))) ||
         (sectionType === 'validation' && (cleaned.toLowerCase().includes('validation') || cleaned.toLowerCase().includes('verify') || cleaned.toLowerCase().includes('confirm'))) ||
         (sectionType === 'method' && (cleaned.toLowerCase().includes('method') || cleaned.toLowerCase().includes('technique') || cleaned.toLowerCase().includes('approach'))))
     ) {
       sections.push(cleaned);
     }
   }
 }
 
 return sections.slice(0, 8); // Limit to 8 items for readability
}

function determineDifficulty(targetAudience: string): string {
 const audience = targetAudience.toLowerCase();
 if (audience.includes('beginner') || audience.includes('intro') || audience.includes('basic')) {
   return 'Beginner';
 } else if (audience.includes('advanced') || audience.includes('expert') || audience.includes('professional')) {
   return 'Advanced';
 } else {
   return 'Intermediate';
 }
}