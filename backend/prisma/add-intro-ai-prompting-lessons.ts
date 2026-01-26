import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addLessons() {
  const course = await prisma.course.findUnique({
    where: { slug: 'introduction-to-ai-prompting' }
  });

  if (!course) {
    console.log('Course not found!');
    return;
  }

  console.log('Adding lessons to:', course.title);

  // Delete existing lessons
  await prisma.lesson.deleteMany({ where: { courseId: course.id } });
  console.log('Cleared existing lessons');

  const lessons = [
    {
      title: 'What is AI Prompting?',
      description: 'Understand the fundamentals of communicating with AI language models',
      content: `# What is AI Prompting?

## The Art of Talking to AI

AI prompting is the skill of writing instructions (prompts) that get AI language models to produce the results you want. Think of it as learning a new way to communicate.

## Why Prompting Matters

The same AI model can give you:
- **Useless garbage** with a bad prompt
- **Incredible results** with a good prompt

The difference isn't the AI—it's how you ask.

## Real Example

### Bad Prompt:
\`\`\`
Write about marketing
\`\`\`

**Result:** Generic, unfocused content that helps no one.

### Good Prompt:
\`\`\`
Write a 300-word guide for small business owners
explaining 3 low-cost marketing strategies they
can implement this week. Include specific examples
and expected results for each strategy.
\`\`\`

**Result:** Actionable, specific content that provides real value.

## What You'll Learn

In this course, you'll discover:

1. **How AI models actually work** (without the technical jargon)
2. **The anatomy of effective prompts**
3. **Common mistakes and how to avoid them**
4. **Techniques used by prompt engineering pros**
5. **Hands-on practice with real examples**

## Who Uses Prompting?

- **Writers** - Generate ideas, overcome writer's block
- **Developers** - Write and debug code faster
- **Marketers** - Create campaigns and copy
- **Students** - Research and learn more effectively
- **Business owners** - Automate tasks and save time
- **Everyone** - AI is becoming part of daily life

## The Prompting Mindset

Think of AI as a brilliant intern who:
- Knows a lot but needs clear direction
- Can't read your mind
- Does exactly what you ask (not what you meant)
- Gets better results with better instructions

Let's learn how to give those instructions!`,
      duration: 8,
      order: 1,
      isFree: true,
      isPublished: true
    },
    {
      title: 'How AI Language Models Work',
      description: 'A non-technical explanation of what happens behind the scenes',
      content: `# How AI Language Models Work

## The Simple Explanation

AI language models (like GPT-4, Claude, Gemini) are sophisticated text prediction systems. They've read massive amounts of text and learned patterns about how language works.

## What They Actually Do

When you send a prompt, the AI:

1. **Reads your input** - Processes every word you wrote
2. **Understands context** - Figures out what you're asking for
3. **Predicts the best response** - Generates text word-by-word
4. **Returns the output** - Sends the completed response

## Key Concepts

### Tokens
AI doesn't read words—it reads "tokens" (word pieces).

- "Hello" = 1 token
- "Prompting" = 1 token
- "Unbelievable" = 2 tokens (Un + believable)

**Why it matters:** You pay per token, and there are limits on how many tokens fit in one conversation.

### Context Window
The AI's "memory" for a single conversation.

- GPT-4: ~128,000 tokens
- Claude: ~200,000 tokens
- GPT-3.5: ~16,000 tokens

**Why it matters:** Longer documents need models with bigger context windows.

### Temperature
Controls creativity vs. consistency.

- **Low (0.0-0.3):** Predictable, factual, consistent
- **Medium (0.4-0.7):** Balanced creativity
- **High (0.8-1.0):** Creative, varied, sometimes wild

**Why it matters:** Use low temperature for facts, high for creative writing.

## What AI Can and Can't Do

### AI CAN:
- Generate human-like text
- Summarize long documents
- Translate languages
- Write code
- Answer questions
- Analyze data
- Brainstorm ideas

### AI CANNOT:
- Access the internet (unless specifically enabled)
- Remember previous conversations
- Know events after its training date
- Guarantee 100% accuracy
- Truly "understand" like humans do

## The "Hallucination" Problem

AI sometimes makes things up confidently. This happens because:

- It's predicting "likely" text, not verified facts
- It doesn't know what it doesn't know
- It wants to be helpful (even when it shouldn't be)

**Solution:** Always verify important facts from AI responses.

## Different Models, Different Strengths

| Model | Best For |
|-------|----------|
| GPT-4 | Complex reasoning, coding |
| Claude | Long documents, safety |
| Gemini | Speed, multimodal tasks |
| GPT-3.5 | Simple tasks, high volume |

Understanding these basics helps you write better prompts!`,
      duration: 10,
      order: 2,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Anatomy of a Perfect Prompt',
      description: 'The essential components every effective prompt needs',
      content: `# Anatomy of a Perfect Prompt

## The 5 Components of Great Prompts

Every effective prompt contains some combination of these elements:

### 1. ROLE (Who should the AI be?)

Tell the AI what persona to adopt:

\`\`\`
You are an experienced copywriter who specializes
in email marketing for e-commerce brands.
\`\`\`

**Why it works:** Sets the expertise level and perspective.

### 2. CONTEXT (What's the background?)

Provide relevant information:

\`\`\`
I run a small online store selling handmade jewelry.
My target customers are women aged 25-45 who value
unique, artisan products. My average order is $75.
\`\`\`

**Why it works:** AI can tailor responses to your specific situation.

### 3. TASK (What do you want?)

Be specific about the output:

\`\`\`
Write a welcome email for new subscribers that:
- Introduces my brand story
- Offers a 10% first-purchase discount
- Encourages them to browse the new collection
\`\`\`

**Why it works:** Clear instructions = clear results.

### 4. FORMAT (How should it look?)

Specify the structure:

\`\`\`
Format the email with:
- A catchy subject line
- 3 short paragraphs (max 50 words each)
- A clear call-to-action button text
- A P.S. line
\`\`\`

**Why it works:** You get output ready to use.

### 5. CONSTRAINTS (What are the limits?)

Set boundaries:

\`\`\`
Requirements:
- Keep total length under 200 words
- Use a warm, friendly tone (not salesy)
- Don't use exclamation marks excessively
- Include the discount code WELCOME10
\`\`\`

**Why it works:** Prevents common AI mistakes.

## Complete Example

Putting it all together:

\`\`\`
ROLE: You are an experienced copywriter who specializes
in email marketing for e-commerce brands.

CONTEXT: I run a small online store selling handmade
jewelry. My target customers are women aged 25-45 who
value unique, artisan products.

TASK: Write a welcome email for new subscribers that
introduces my brand story, offers a 10% first-purchase
discount (code: WELCOME10), and encourages browsing.

FORMAT:
- Catchy subject line
- 3 short paragraphs (max 50 words each)
- Clear call-to-action
- P.S. line

CONSTRAINTS:
- Under 200 words total
- Warm and friendly tone
- Minimal exclamation marks
\`\`\`

## The Quick Formula

When you're in a hurry, use this template:

\`\`\`
Act as [ROLE].
I need [TASK].
Context: [BACKGROUND INFO].
Format: [STRUCTURE].
Keep it [CONSTRAINTS].
\`\`\`

Not every prompt needs all 5 components, but the more complex your task, the more components you should include.`,
      duration: 12,
      order: 3,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Common Prompting Mistakes',
      description: 'Learn what NOT to do and how to fix it',
      content: `# Common Prompting Mistakes

## Mistake #1: Being Too Vague

### The Problem:
\`\`\`
Help me with my business
\`\`\`

The AI doesn't know:
- What kind of business?
- What kind of help?
- What's your goal?

### The Fix:
\`\`\`
I run a local bakery struggling with Instagram marketing.
Give me 5 post ideas for this week that could increase
engagement and drive foot traffic to my store.
\`\`\`

---

## Mistake #2: Asking Multiple Questions at Once

### The Problem:
\`\`\`
What's the best programming language and how do I learn it
and what jobs can I get and how much do they pay and
should I go to college or do a bootcamp?
\`\`\`

The AI tries to answer everything superficially.

### The Fix:
Ask one focused question at a time, or structure it:
\`\`\`
I want to become a web developer. Please answer these
in order:
1. What programming language should I learn first?
2. What's the best way to learn it (college vs bootcamp)?
3. What entry-level jobs should I target?
\`\`\`

---

## Mistake #3: No Context

### The Problem:
\`\`\`
Write me a cover letter
\`\`\`

### The Fix:
\`\`\`
Write a cover letter for a Senior Marketing Manager
position at Nike. I have 7 years of experience in
digital marketing, led a team of 5 at my current role
at Adidas, and increased our social media engagement
by 150%. The job posting emphasizes leadership and
data-driven decision making.
\`\`\`

---

## Mistake #4: Expecting Perfection on First Try

### The Problem:
Getting frustrated when the first output isn't perfect.

### The Fix:
Treat prompting as a conversation:
\`\`\`
First prompt: Write a tagline for my coffee shop.

Response: "Wake Up to Better Coffee"

Follow-up: I like the direction, but make it more playful
and reference that we're located in Seattle.

Response: "Seattle's Coziest Wake-Up Call"
\`\`\`

---

## Mistake #5: Forgetting the Format

### The Problem:
\`\`\`
Give me some marketing ideas
\`\`\`

You get a wall of text that's hard to use.

### The Fix:
\`\`\`
Give me 5 marketing ideas for my coffee shop.
Format as a numbered list with:
- Idea name (bold)
- One sentence description
- Estimated cost (low/medium/high)
\`\`\`

---

## Mistake #6: Being Too Polite (Wasting Tokens)

### The Problem:
\`\`\`
Hi there! I hope you're doing well. I was wondering if
you might be able to help me with something. If it's not
too much trouble, could you perhaps write a short bio
for me? Only if you have time, of course. Thank you so
much in advance for your help!
\`\`\`

### The Fix:
\`\`\`
Write a professional bio for my LinkedIn profile. I'm a
software engineer with 5 years of experience in Python
and machine learning. Keep it under 100 words.
\`\`\`

Be direct. The AI doesn't have feelings to hurt.

---

## Quick Checklist

Before sending a prompt, ask:
- Is my request specific?
- Did I provide necessary context?
- Did I specify the format I want?
- Am I asking one thing at a time?
- Can I remove unnecessary words?`,
      duration: 10,
      order: 4,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Prompting Techniques: Zero-Shot & Few-Shot',
      description: 'Powerful techniques to improve AI responses dramatically',
      content: `# Prompting Techniques: Zero-Shot & Few-Shot

## What Are These Techniques?

These are ways to structure your prompts that dramatically improve results. Let's break them down.

---

## Zero-Shot Prompting

**Definition:** Asking the AI to do something without giving examples.

### Example:
\`\`\`
Classify this review as positive, negative, or neutral:

"The product arrived on time but the packaging was damaged.
The item itself works fine though."
\`\`\`

**When to use:**
- Simple, straightforward tasks
- When the AI likely understands your intent
- Quick queries

---

## Few-Shot Prompting

**Definition:** Giving the AI examples before asking it to perform the task.

### Example:
\`\`\`
Classify these reviews:

Review: "Absolutely love it! Best purchase ever!"
Classification: Positive

Review: "Terrible quality. Broke after one day."
Classification: Negative

Review: "It's okay. Does what it's supposed to do."
Classification: Neutral

Now classify this review:
Review: "The product arrived on time but the packaging
was damaged. The item itself works fine though."
Classification:
\`\`\`

**When to use:**
- Complex or nuanced tasks
- When you want a specific format
- When zero-shot gives inconsistent results

---

## Few-Shot In Action

### Writing Style Matching

\`\`\`
Write product descriptions in this style:

Example 1:
Product: Wireless Earbuds
Description: "Ditch the wires, keep the vibes. These buds
deliver crisp sound that moves with you."

Example 2:
Product: Smart Watch
Description: "Your wrist just got an upgrade. Track, tap,
and stay connected without missing a beat."

Now write a description for:
Product: Portable Charger
Description:
\`\`\`

### Data Formatting

\`\`\`
Extract information in this format:

Input: "John Smith, CEO of TechCorp, announced the merger
on Tuesday."
Output: {"name": "John Smith", "title": "CEO", "company":
"TechCorp", "event": "merger announcement", "date": "Tuesday"}

Input: "Sarah Jones, Marketing Director at StartupXYZ,
launched the new campaign yesterday."
Output: {"name": "Sarah Jones", "title": "Marketing Director",
"company": "StartupXYZ", "event": "campaign launch",
"date": "yesterday"}

Now extract from:
Input: "Mike Chen, CTO of DataFlow Inc, presented the
quarterly results last Friday."
Output:
\`\`\`

---

## How Many Examples?

| Task Complexity | Examples Needed |
|-----------------|-----------------|
| Simple | 1-2 |
| Medium | 3-4 |
| Complex | 5+ |

More examples = more consistent results, but also more tokens (cost).

---

## Pro Tips

### Tip 1: Use Diverse Examples
Show different scenarios:
\`\`\`
Example 1: Short positive review
Example 2: Long negative review
Example 3: Mixed/neutral review
\`\`\`

### Tip 2: Show Edge Cases
Include tricky examples:
\`\`\`
Example: "Not bad, but not great either."
Classification: Neutral (this is sarcasm-free)

Example: "Oh great, another broken product..."
Classification: Negative (this IS sarcasm)
\`\`\`

### Tip 3: Match Your Real Use Case
If your actual inputs are messy, use messy examples:
\`\`\`
Example: "gr8 product!!! love it 💕💕"
Classification: Positive
\`\`\`

---

## When to Upgrade

- Zero-shot not working? → Try few-shot
- Few-shot not working? → Add more examples
- Still not working? → Refine your examples or try a different approach`,
      duration: 12,
      order: 5,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Chain-of-Thought Prompting',
      description: 'Get AI to think step-by-step for better reasoning',
      content: `# Chain-of-Thought Prompting

## What Is Chain-of-Thought?

Chain-of-Thought (CoT) prompting asks the AI to show its reasoning process step-by-step. This dramatically improves accuracy for complex problems.

## The Magic Words

Simply add: **"Let's think step by step"** or **"Show your reasoning"**

---

## Example: Math Problem

### Without Chain-of-Thought:
\`\`\`
A store sells apples for $2 each and oranges for $3 each.
If I buy 4 apples and 3 oranges, and I have a 10% discount
coupon, how much do I pay?
\`\`\`

AI might jump to an answer (sometimes wrong).

### With Chain-of-Thought:
\`\`\`
A store sells apples for $2 each and oranges for $3 each.
If I buy 4 apples and 3 oranges, and I have a 10% discount
coupon, how much do I pay?

Let's solve this step by step.
\`\`\`

**AI Response:**
\`\`\`
Let me solve this step by step:

1. Calculate apple cost: 4 × $2 = $8
2. Calculate orange cost: 3 × $3 = $9
3. Calculate subtotal: $8 + $9 = $17
4. Calculate discount: $17 × 10% = $1.70
5. Calculate final price: $17 - $1.70 = $15.30

The total is $15.30.
\`\`\`

---

## When to Use Chain-of-Thought

### Great for:
- Math and calculations
- Logic puzzles
- Multi-step problems
- Analysis and comparisons
- Decision-making
- Debugging code

### Not needed for:
- Simple factual questions
- Creative writing
- Basic text generation

---

## Chain-of-Thought Variations

### Explicit Steps
\`\`\`
Analyze whether this business idea is viable.
Walk through these steps:
1. Market size assessment
2. Competition analysis
3. Cost structure
4. Revenue potential
5. Final recommendation
\`\`\`

### Pros and Cons Format
\`\`\`
Should I lease or buy a car?
Think through:
- Pros of leasing
- Cons of leasing
- Pros of buying
- Cons of buying
- Recommendation based on my situation: I drive 15,000
  miles/year and like having new cars every 3 years.
\`\`\`

### Self-Verification
\`\`\`
Solve this problem, then verify your answer by working
backwards:

If a train travels at 60 mph for 2.5 hours, then at
80 mph for 1.5 hours, what's the total distance?
\`\`\`

---

## Real-World Applications

### Code Debugging
\`\`\`
This code isn't working. Debug it step by step:
1. What is the code trying to do?
2. Walk through the logic line by line
3. Identify where it goes wrong
4. Explain the fix

[paste code here]
\`\`\`

### Strategic Decisions
\`\`\`
Help me decide whether to accept this job offer.

Current job: [details]
New offer: [details]

Analyze step by step:
1. Compensation comparison
2. Growth opportunities
3. Work-life balance
4. Career alignment
5. Risk assessment
6. Final recommendation
\`\`\`

### Research Analysis
\`\`\`
Evaluate whether this scientific claim is credible:
"Drinking coffee prevents heart disease"

Analyze step by step:
1. What would make this claim true?
2. What evidence would we need?
3. What are potential confounding factors?
4. What's the likely reality?
\`\`\`

---

## Pro Tips

### Be Patient
CoT responses are longer but more accurate. Don't skip steps to save tokens when accuracy matters.

### Guide the Steps
If you know the reasoning process, outline it:
\`\`\`
Analyze this code's time complexity.
Steps:
1. Identify all loops
2. Determine iterations per loop
3. Calculate nested complexity
4. State Big O notation
\`\`\`

### Combine with Few-Shot
Show an example of good reasoning, then ask for the same:
\`\`\`
Example:
Q: Is 847 divisible by 7?
A: Let me check: 847 ÷ 7 = 121. Yes, 847 is divisible by 7.

Now solve:
Q: Is 923 divisible by 13?
A:
\`\`\``,
      duration: 10,
      order: 6,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Prompt Templates for Common Tasks',
      description: 'Ready-to-use templates you can copy and customize',
      content: `# Prompt Templates for Common Tasks

## Copy, customize, and use these templates immediately!

---

## Writing & Content

### Blog Post Generator
\`\`\`
Write a blog post about [TOPIC].

Target audience: [WHO]
Tone: [FORMAL/CASUAL/PROFESSIONAL]
Length: [WORD COUNT]

Include:
- An attention-grabbing headline
- Introduction with a hook
- 3-5 main sections with subheadings
- Practical examples or tips
- Conclusion with call-to-action

Keywords to include: [KEYWORDS]
\`\`\`

### Email Writer
\`\`\`
Write a [TYPE] email.

Context: [SITUATION]
Recipient: [WHO]
Goal: [WHAT YOU WANT TO ACHIEVE]
Tone: [PROFESSIONAL/FRIENDLY/URGENT]

Include:
- Clear subject line
- Brief greeting
- Main message (max 3 paragraphs)
- Specific call-to-action
- Professional sign-off
\`\`\`

---

## Business & Professional

### Meeting Summary
\`\`\`
Summarize this meeting transcript:

[PASTE TRANSCRIPT]

Format the summary as:
1. Key Decisions Made
2. Action Items (with owners and deadlines)
3. Open Questions
4. Next Steps
\`\`\`

### SWOT Analysis
\`\`\`
Perform a SWOT analysis for [COMPANY/PRODUCT/IDEA].

Context: [BACKGROUND INFO]

Format as a 2x2 table:
- Strengths (internal positives)
- Weaknesses (internal negatives)
- Opportunities (external positives)
- Threats (external negatives)

Include 3-5 bullet points per category.
End with strategic recommendations.
\`\`\`

---

## Coding & Technical

### Code Explainer
\`\`\`
Explain this code in simple terms:

[PASTE CODE]

Include:
1. What the code does (one sentence)
2. Line-by-line explanation
3. Any potential issues or improvements
4. Example of how to use it
\`\`\`

### Bug Fixer
\`\`\`
Fix this code that isn't working:

[PASTE CODE]

Error message: [ERROR]
Expected behavior: [WHAT IT SHOULD DO]
Actual behavior: [WHAT IT DOES]

Provide:
1. What's causing the bug
2. The corrected code
3. Explanation of the fix
\`\`\`

---

## Learning & Research

### Concept Explainer
\`\`\`
Explain [CONCEPT] to me.

My background: [BEGINNER/INTERMEDIATE/EXPERT]
Learning style: [EXAMPLES/ANALOGIES/TECHNICAL DETAILS]

Include:
1. Simple definition
2. Why it matters
3. Real-world example
4. Common misconceptions
5. How to learn more
\`\`\`

### Research Summary
\`\`\`
I need to understand [TOPIC] quickly.

Give me:
1. Overview (2-3 sentences)
2. Key concepts (bullet list)
3. Important facts/statistics
4. Different perspectives/debates
5. Recommended next steps for deeper learning
\`\`\`

---

## Creative

### Brainstorm Ideas
\`\`\`
Generate [NUMBER] ideas for [WHAT].

Context: [BACKGROUND]
Constraints: [LIMITATIONS]

For each idea, provide:
- Idea name
- One-sentence description
- Why it could work
- Potential challenge

Aim for a mix of safe and creative ideas.
\`\`\`

### Story Starter
\`\`\`
Write the opening scene for a [GENRE] story.

Setting: [WHERE/WHEN]
Main character: [BRIEF DESCRIPTION]
Mood: [ATMOSPHERE]
Hook: [WHAT MAKES IT INTERESTING]

Length: [WORD COUNT]
\`\`\`

---

## How to Use These Templates

1. **Copy** the template
2. **Replace** the [BRACKETS] with your info
3. **Remove** any sections you don't need
4. **Add** specific details for better results
5. **Iterate** based on the output`,
      duration: 10,
      order: 7,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Practice Exercises',
      description: 'Apply what you learned with hands-on exercises',
      content: `# Practice Exercises

## Time to Apply What You've Learned!

Complete these exercises to build your prompting skills.

---

## Exercise 1: Fix the Bad Prompt

**Bad prompt:**
\`\`\`
Write something about dogs
\`\`\`

**Your task:** Rewrite this prompt using the 5 components (Role, Context, Task, Format, Constraints) to get useful output.

**Hint:** Decide what KIND of content about dogs you want, for whom, and in what format.

<details>
<summary>Example Solution</summary>

\`\`\`
You are a veterinarian writing for first-time dog owners.

Write a guide on the 5 most important things new puppy
owners need to know in their first week.

Format as a numbered list with:
- Clear heading for each point
- 2-3 sentence explanation
- One practical tip

Keep it under 400 words. Use a friendly, reassuring tone.
\`\`\`
</details>

---

## Exercise 2: Few-Shot Practice

**Task:** Create a few-shot prompt to help AI generate product taglines in a specific style.

**Your tagline style:**
- Short (under 8 words)
- Uses a verb
- Creates emotion

**Products to write for:**
1. Running shoes
2. Coffee maker

**Hint:** Provide 2-3 examples first, then ask for the new taglines.

<details>
<summary>Example Solution</summary>

\`\`\`
Write product taglines in this style:

Product: Fitness tracker
Tagline: "Track your progress. Crush your goals."

Product: Noise-canceling headphones
Tagline: "Silence the world. Find your focus."

Product: Meal prep containers
Tagline: "Prep once. Eat well all week."

Now write taglines for:
1. Running shoes
2. Coffee maker
\`\`\`
</details>

---

## Exercise 3: Chain-of-Thought

**Problem:** Your friend wants to start a food truck business. They have $30,000 in savings, work full-time, and have no restaurant experience.

**Your task:** Write a prompt that uses chain-of-thought reasoning to analyze whether this is a good idea.

**Hint:** Ask the AI to think through specific factors step by step.

<details>
<summary>Example Solution</summary>

\`\`\`
Help me analyze whether my friend should start a food
truck business.

Their situation:
- $30,000 in savings
- Currently works full-time (can't quit immediately)
- No restaurant experience
- Lives in Austin, TX

Analyze step by step:
1. Startup costs - What would $30K cover?
2. Experience gap - How critical is this?
3. Time requirements - Can this work part-time?
4. Market factors - Austin food truck scene
5. Risk assessment - What could go wrong?
6. Alternative paths - Other options to consider
7. Final recommendation with conditions
\`\`\`
</details>

---

## Exercise 4: Format Specification

**Scenario:** You need AI to extract action items from meeting notes.

**Sample meeting notes:**
\`\`\`
Team discussed Q4 goals. Sarah will finalize the budget
by Friday. Mike needs to hire two developers before
end of month. Everyone should review the new policy
document. Launch date pushed to December 15.
\`\`\`

**Your task:** Write a prompt that extracts action items in a structured, usable format.

**Hint:** Specify exactly what format you want for each action item.

<details>
<summary>Example Solution</summary>

\`\`\`
Extract action items from these meeting notes:

[paste notes]

Format each action item as:
| Owner | Task | Deadline | Priority |

If deadline isn't specified, mark as "TBD"
If owner isn't clear, mark as "Team"
Estimate priority as High/Medium/Low based on context
\`\`\`
</details>

---

## Exercise 5: Iteration Practice

**Starting prompt:**
\`\`\`
Write a LinkedIn post about productivity
\`\`\`

**Your task:** Through 3 rounds of iteration, improve this prompt to get a specific, engaging LinkedIn post.

**Round 1:** Add context and basic structure
**Round 2:** Add format and tone specifications
**Round 3:** Add constraints and specific requirements

---

## Check Your Understanding

Answer these questions:

1. What's the difference between zero-shot and few-shot prompting?

2. When should you use chain-of-thought prompting?

3. Name the 5 components of an effective prompt.

4. What does "temperature" control in AI responses?

5. Why is specifying format important?

---

## Keep Practicing!

The best way to improve is to:
- Use AI daily
- Experiment with different approaches
- Learn from outputs (good and bad)
- Build your own template library

You're now equipped with the fundamentals. Go prompt!`,
      duration: 15,
      order: 8,
      isFree: true,
      isPublished: true
    },
    {
      title: 'Course Summary & Next Steps',
      description: 'Review key concepts and continue your learning journey',
      content: `# Course Summary & Next Steps

## Congratulations!

You've completed Introduction to AI Prompting. Let's review what you've learned.

---

## Key Takeaways

### 1. Prompting is a Skill
- The same AI gives different results based on your prompt
- Good prompts = specific, contextual, formatted
- Bad prompts = vague, no context, no structure

### 2. How AI Works
- AI predicts text based on patterns
- Tokens = word pieces (affects cost and limits)
- Context window = AI's memory for one conversation
- Temperature = creativity dial

### 3. The 5 Prompt Components
1. **Role** - Who should AI be?
2. **Context** - What's the background?
3. **Task** - What do you want?
4. **Format** - How should it look?
5. **Constraints** - What are the limits?

### 4. Key Techniques
- **Zero-shot** - Direct questions, no examples
- **Few-shot** - Provide examples first
- **Chain-of-thought** - Step-by-step reasoning

### 5. Avoid Common Mistakes
- Being too vague
- No context
- Wrong format expectations
- Giving up after one try

---

## Your Prompting Cheat Sheet

### Quick Prompt Template:
\`\`\`
Act as [ROLE].
Context: [BACKGROUND].
Task: [WHAT YOU NEED].
Format: [STRUCTURE].
Constraints: [LIMITS].
\`\`\`

### Magic Phrases:
- "Let's think step by step"
- "Format as a [table/list/JSON]"
- "For example: [show what you want]"
- "Avoid [common mistakes]"
- "Keep it under [X words]"

### When Results Aren't Good:
1. Add more context
2. Be more specific
3. Show an example
4. Break into smaller tasks
5. Try a different approach

---

## Recommended Next Courses

### Free:
- **Prompt Writing 101** - Deep dive into writing techniques
- **SmartPromptIQ Basics** - Master the platform

### Pro:
- **Advanced Prompt Patterns** - Expert techniques
- **Prompt Debugging & Optimization** - Fix any prompt
- **Multi-Agent Prompt Systems** - Build AI workflows

---

## Practice Resources

### Daily Practice Ideas:
1. Rewrite one email using AI
2. Summarize one article
3. Generate 5 ideas for any project
4. Debug one piece of code
5. Create one piece of content

### Build Your Template Library:
Start collecting prompts that work well for:
- Your most common tasks
- Your specific industry
- Your preferred formats

---

## Join the Community

- **SmartPromptIQ Discord** - Connect with prompt engineers
- **Weekly challenges** - Practice with others
- **Template sharing** - Get and give prompts

---

## Quick Quiz

Test yourself:

1. What makes a prompt "few-shot"?
   a) It's very short
   b) It includes examples
   c) It uses bullet points

2. When should you use chain-of-thought?
   a) Simple questions
   b) Creative writing
   c) Complex reasoning tasks

3. What's the most important prompting rule?
   a) Be polite
   b) Be specific
   c) Be brief

**Answers:** 1-b, 2-c, 3-b

---

## Final Thoughts

Prompting is like any skill—it improves with practice. You now have the foundation. The more you use AI, the better you'll get at communicating with it.

Remember:
- Start simple
- Iterate and improve
- Build on what works
- Share what you learn

**Thank you for learning with SmartPromptIQ Academy!**

Now go prompt something amazing!`,
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

  console.log('\n✅ Introduction to AI Prompting course updated with 9 complete lessons!');
}

addLessons()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
