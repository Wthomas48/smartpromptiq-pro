import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addLessons() {
  // First, update the course to be FREE
  const course = await prisma.course.update({
    where: { slug: 'smartpromptiq-basics' },
    data: { accessTier: 'free' }
  });
  console.log('Updated course to FREE tier:', course.title);

  // Delete existing lessons for this course
  await prisma.lesson.deleteMany({ where: { courseId: course.id } });
  console.log('Cleared existing lessons');

  // Add comprehensive lessons with full content
  const lessons = [
    {
      title: 'Welcome to SmartPromptIQ',
      description: 'Introduction to the SmartPromptIQ platform and what you will learn',
      content: `# Welcome to SmartPromptIQ!

## What is SmartPromptIQ?

SmartPromptIQ is your all-in-one AI prompt engineering platform that helps you:

- **Write better prompts** - Use our templates and optimization tools
- **Route to the best AI** - Automatically select GPT-4, Claude, Gemini based on your task
- **Save money** - Smart routing reduces costs by up to 70%
- **Track everything** - Full analytics on your AI usage

## What You'll Learn in This Course

1. Navigating the SmartPromptIQ dashboard
2. Creating and managing prompts
3. Understanding AI model routing
4. Using templates to speed up your workflow
5. Analyzing your prompt performance
6. Best practices for prompt engineering

## Prerequisites

- A SmartPromptIQ account (free tier works!)
- Basic understanding of AI chatbots
- Curiosity to learn!

Let's get started!`,
      duration: 5,
      order: 1,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Dashboard Overview',
      description: 'Navigate the SmartPromptIQ dashboard like a pro',
      content: `# Dashboard Overview

## Your Command Center

When you log into SmartPromptIQ, you'll see your personalized dashboard with:

### Quick Stats
- **Total Prompts**: Number of prompts you've created
- **Tokens Used**: Your AI token consumption
- **Cost Savings**: Money saved through smart routing
- **Success Rate**: Percentage of successful generations

### Main Navigation

1. **Prompt Studio** - Create and edit prompts
2. **Templates** - Pre-built prompt templates
3. **History** - View past generations
4. **Analytics** - Detailed usage reports
5. **Settings** - Account and preferences

### Quick Actions

- **New Prompt** button - Start creating immediately
- **Recent Prompts** - Access your latest work
- **Favorites** - Your starred templates

## Pro Tips

- Pin frequently used prompts to your dashboard
- Set up keyboard shortcuts for faster navigation
- Use the search bar to find any prompt instantly

## Practice Exercise

Take 5 minutes to explore each section of the dashboard. Click on every menu item to familiarize yourself with the layout.`,
      duration: 8,
      order: 2,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Creating Your First Prompt',
      description: 'Step-by-step guide to creating effective prompts',
      content: `# Creating Your First Prompt

## The Prompt Studio

The Prompt Studio is where the magic happens. Let's create your first prompt!

### Step 1: Click "New Prompt"

You'll see the prompt editor with these fields:

- **Title**: Give your prompt a memorable name
- **Category**: Organize by type (writing, coding, analysis, etc.)
- **System Prompt**: Instructions for the AI's behavior
- **User Prompt**: The actual request template

### Step 2: Write Your System Prompt

Example system prompt:
\`\`\`
You are a helpful writing assistant. You write clear,
concise, and engaging content. You always:
- Use active voice
- Keep sentences short
- Include practical examples
\`\`\`

### Step 3: Create Your User Prompt Template

Use variables with {{double braces}}:
\`\`\`
Write a {{tone}} blog post about {{topic}}.
Target audience: {{audience}}
Length: {{word_count}} words
\`\`\`

### Step 4: Test Your Prompt

1. Click "Test Prompt"
2. Fill in the variables
3. Review the AI output
4. Iterate and improve

## Best Practices

- Start simple, then add complexity
- Test with different inputs
- Save versions as you improve
- Add to favorites when perfected`,
      duration: 12,
      order: 3,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Understanding AI Model Routing',
      description: 'Learn how SmartPromptIQ selects the best AI for each task',
      content: `# Understanding AI Model Routing

## What is Smart Routing?

SmartPromptIQ automatically selects the best AI model for your task, saving you money while maintaining quality.

## Available Models

### GPT-4 (OpenAI)
- **Best for**: Complex reasoning, coding, creative writing
- **Cost**: Higher
- **Speed**: Moderate

### Claude (Anthropic)
- **Best for**: Long documents, analysis, safety-critical tasks
- **Cost**: Moderate
- **Speed**: Fast

### Gemini (Google)
- **Best for**: Multimodal tasks, quick responses
- **Cost**: Lower
- **Speed**: Very fast

### GPT-3.5 Turbo
- **Best for**: Simple tasks, high volume
- **Cost**: Lowest
- **Speed**: Fastest

## How Routing Works

1. **Task Analysis**: SmartPromptIQ analyzes your prompt
2. **Complexity Score**: Determines task difficulty
3. **Model Selection**: Picks the optimal model
4. **Cost Optimization**: Balances quality vs. cost

## Routing Modes

- **Auto**: Let SmartPromptIQ decide (recommended)
- **Quality**: Always use the best model
- **Economy**: Prioritize cost savings
- **Manual**: You select the model

## Cost Savings Example

| Task | Without Routing | With Routing | Savings |
|------|----------------|--------------|---------|
| Simple Q&A | $0.03 | $0.003 | 90% |
| Blog Post | $0.12 | $0.06 | 50% |
| Code Review | $0.15 | $0.15 | 0% |

Smart routing saves the most on simple tasks!`,
      duration: 10,
      order: 4,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Using Templates',
      description: 'Speed up your workflow with pre-built templates',
      content: `# Using Templates

## Why Templates?

Templates are pre-built prompts that save you hours of work. SmartPromptIQ includes 50+ templates for common tasks.

## Template Categories

### Writing & Content
- Blog post generator
- Email composer
- Social media posts
- Product descriptions
- Headlines and titles

### Business
- Meeting summaries
- Proposal writer
- SWOT analysis
- Business plans
- Customer emails

### Development
- Code explainer
- Bug fixer
- Documentation writer
- API designer
- Test generator

### Marketing
- Ad copy creator
- SEO optimizer
- Landing page writer
- Campaign planner
- A/B test ideas

## How to Use Templates

### Step 1: Browse Templates
Go to Templates > Browse All

### Step 2: Preview
Click any template to see:
- Description
- Example output
- Required variables

### Step 3: Use Template
Click "Use Template" to copy it to your Prompt Studio

### Step 4: Customize
Modify the template to fit your needs:
- Adjust the system prompt
- Add/remove variables
- Change the tone or style

### Step 5: Save as Your Own
Click "Save as New" to create your personalized version

## Pro Tips

- Start with templates, then customize
- Create your own templates for repeated tasks
- Share templates with your team
- Rate templates to help others`,
      duration: 10,
      order: 5,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Prompt Variables and Dynamic Content',
      description: 'Master variables to create reusable, flexible prompts',
      content: `# Prompt Variables and Dynamic Content

## What Are Variables?

Variables are placeholders in your prompts that get filled in at runtime. They make your prompts reusable and dynamic.

## Variable Syntax

Use double curly braces: \`{{variable_name}}\`

### Example
\`\`\`
Write a {{length}} email to {{recipient}} about {{topic}}.
Tone: {{tone}}
\`\`\`

## Variable Types

### Text Variables
Simple text input
\`\`\`
{{company_name}}
{{product}}
{{customer_name}}
\`\`\`

### Select Variables
Dropdown options
\`\`\`
{{tone:formal|casual|friendly|professional}}
{{length:short|medium|long}}
\`\`\`

### Number Variables
Numeric input
\`\`\`
{{word_count:number}}
{{num_ideas:number}}
\`\`\`

### Multi-line Variables
For longer text
\`\`\`
{{context:textarea}}
{{background_info:textarea}}
\`\`\`

## Advanced Variable Features

### Default Values
\`\`\`
{{tone:professional}}  // defaults to "professional"
\`\`\`

### Required vs Optional
\`\`\`
{{name}}        // required
{{name?}}       // optional
\`\`\`

### Variable Descriptions
Add helper text in the UI:
\`\`\`
{{company_name|The name of the target company}}
\`\`\`

## Real-World Example

**Blog Post Generator**
\`\`\`
Write a {{length:short|medium|long}} blog post about {{topic}}.

Target audience: {{audience}}
Tone: {{tone:informative|casual|professional}}
Include: {{num_examples:number}} examples

{{additional_requirements?:textarea}}
\`\`\`

This creates a flexible, reusable template for any blog topic!`,
      duration: 12,
      order: 6,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Analyzing Your Results',
      description: 'Use analytics to improve your prompts over time',
      content: `# Analyzing Your Results

## The Analytics Dashboard

Track, measure, and improve your prompt performance with built-in analytics.

## Key Metrics

### Usage Metrics
- **Total Generations**: How many times you've used AI
- **Tokens Consumed**: Total input + output tokens
- **Average Response Time**: Speed of generations
- **Models Used**: Breakdown by AI model

### Cost Metrics
- **Total Spend**: Your AI costs
- **Cost per Generation**: Average cost
- **Savings from Routing**: Money saved
- **Budget Remaining**: If you set limits

### Quality Metrics
- **Success Rate**: Generations without errors
- **Regeneration Rate**: How often you retry
- **Favorite Rate**: Prompts you've starred

## Reading the Charts

### Usage Over Time
See your daily/weekly/monthly patterns:
- Identify peak usage times
- Spot unusual spikes
- Track growth trends

### Cost Breakdown
Understand where money goes:
- By model (GPT-4 vs Claude vs etc.)
- By category (writing vs coding vs etc.)
- By prompt (which costs most)

### Model Performance
Compare AI models:
- Quality ratings you've given
- Speed comparisons
- Cost efficiency

## Optimization Tips

### Based on Analytics

1. **High cost prompts**: Try economy routing
2. **Slow responses**: Consider faster models
3. **High regeneration**: Improve your prompt
4. **Unused prompts**: Archive or delete

### Setting Alerts

Configure notifications for:
- Budget thresholds (e.g., 80% used)
- Unusual activity spikes
- Error rate increases

## Export Your Data

Download reports as:
- CSV for spreadsheets
- PDF for presentations
- JSON for integrations`,
      duration: 10,
      order: 7,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Best Practices and Tips',
      description: 'Pro tips to get the most out of SmartPromptIQ',
      content: `# Best Practices and Tips

## Prompt Writing Best Practices

### Be Specific
- BAD: "Write something about dogs"
- GOOD: "Write a 200-word article about golden retriever training tips for first-time owners"

### Provide Context
- BAD: "Fix this code"
- GOOD: "Fix this Python function that should return the sum of even numbers but returns 0"

### Define the Format
- BAD: "Give me ideas"
- GOOD: "Give me 5 ideas as a numbered list, each with a one-sentence explanation"

### Set Constraints
- BAD: "Write an email"
- GOOD: "Write a professional email under 100 words with a clear call-to-action"

## Workflow Optimization

### Organize Your Prompts
- Use descriptive titles
- Add tags for easy filtering
- Create folders by project
- Archive old prompts

### Use Keyboard Shortcuts
- Ctrl/Cmd + N: New prompt
- Ctrl/Cmd + Enter: Run prompt
- Ctrl/Cmd + S: Save
- Ctrl/Cmd + /: Toggle preview

### Batch Processing
- Queue multiple generations
- Use CSV import for bulk variables
- Export results in batches

## Cost Management

### Set Budgets
- Daily limits prevent overspending
- Alerts at 50%, 80%, 100%
- Auto-pause when limit reached

### Optimize Token Usage
- Shorter prompts = lower cost
- Use summaries for long inputs
- Avoid repetitive instructions

### Choose Routing Wisely
- Auto for most tasks
- Quality for important work
- Economy for high-volume simple tasks

## Team Collaboration

### Share Effectively
- Create team template libraries
- Set permissions (view/edit/admin)
- Use comments for feedback

### Maintain Consistency
- Establish naming conventions
- Create style guides
- Review and approve templates

## Troubleshooting

### Poor Results?
1. Add more context
2. Be more specific
3. Try a different model
4. Break into smaller tasks

### Errors?
1. Check your API status
2. Verify token limits
3. Review rate limits
4. Contact support if persistent`,
      duration: 15,
      order: 8,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Course Summary and Next Steps',
      description: 'Review what you learned and where to go next',
      content: `# Course Summary and Next Steps

## What You've Learned

Congratulations! You've completed SmartPromptIQ Basics. Here's what you now know:

### Dashboard Navigation
- Finding your way around SmartPromptIQ
- Understanding key metrics
- Using quick actions

### Prompt Creation
- Writing effective system prompts
- Creating user prompt templates
- Testing and iterating

### Smart Routing
- How model selection works
- Balancing quality and cost
- Choosing the right routing mode

### Templates
- Finding and using templates
- Customizing for your needs
- Creating your own templates

### Variables
- Using dynamic placeholders
- Different variable types
- Building flexible prompts

### Analytics
- Reading your metrics
- Optimizing based on data
- Setting up alerts

### Best Practices
- Writing better prompts
- Managing costs
- Collaborating with teams

## Your Next Steps

### Immediate Actions
1. **Create 3 prompts** for tasks you do regularly
2. **Try 5 templates** from different categories
3. **Set up a budget** to track your spending
4. **Invite a teammate** to collaborate

### Recommended Next Courses

#### Free Courses
- **Prompt Writing 101** - Deep dive into prompt engineering
- **SmartPromptIQ Product Tour** - Explore advanced features

#### Pro Courses
- **Advanced Prompt Patterns** - Master sophisticated techniques
- **Team Workflows & Collaboration** - Scale with your team

### Get Help

- **Documentation**: docs.smartpromptiq.com
- **Community Discord**: Join 10,000+ prompt engineers
- **Support**: support@smartpromptiq.com
- **YouTube**: Video tutorials and tips

## Certificate

Complete the quiz below to earn your "SmartPromptIQ Basics" certificate!

---

Thank you for learning with SmartPromptIQ Academy!

Keep prompting, keep learning, keep growing!`,
      duration: 8,
      order: 9,
      isFree: true,
      isPublished: true
    }
  ];

  for (const lesson of lessons) {
    await prisma.lesson.create({
      data: {
        courseId: course.id,
        ...lesson
      }
    });
    console.log('Created lesson:', lesson.title);
  }

  console.log('\n✅ SmartPromptIQ Basics course updated with 9 complete lessons!');
  console.log('Course is now FREE tier with full content.');
}

addLessons()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
