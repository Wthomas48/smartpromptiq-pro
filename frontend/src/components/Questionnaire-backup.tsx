// Add this to your Questionnaire.tsx file - replace the existing categoryQuestionaires object

const categoryQuestionaires: Record<string, QuestionnaireCategory> = {
  'business-strategy': {
    id: 'business-strategy',
    title: 'Business Strategy Development',
    description: 'Create comprehensive business strategies with AI-powered insights',
    icon: <Target className="w-6 h-6" />,
    color: 'from-blue-500 to-indigo-600',
    estimatedTime: '15-20 min',
    promptTemplate: `Create a comprehensive business strategy for {businessType} targeting {targetMarket} with {primaryGoal} as the main objective. 

Key Requirements:
- Business Model: {businessModel}
- Market Approach: {marketApproach}
- Timeline: {timeline}
- Budget Range: {budget}

Please provide:
1. Executive Summary
2. Market Analysis
3. Competitive Positioning
4. Implementation Roadmap
5. Risk Assessment
6. Success Metrics and KPIs

Format the response as a professional business strategy document with actionable insights and specific recommendations.`,
    questions: [
      {
        id: 'business-type',
        type: 'single-choice',
        title: 'What type of business are you developing a strategy for?',
        description: 'This helps us tailor the strategy framework to your specific industry and context.',
        required: true,
        category: 'business-context',
        weight: 1.0,
        options: [
          {
            value: 'startup',
            label: 'Early-stage Startup',
            description: 'New venture seeking market entry and initial growth'
          },
          {
            value: 'established-business',
            label: 'Established Business',
            description: 'Existing company looking to expand or pivot'
          },
          {
            value: 'enterprise',
            label: 'Enterprise/Corporation',
            description: 'Large organization developing new strategic initiatives'
          },
          {
            value: 'nonprofit',
            label: 'Non-profit Organization',
            description: 'Mission-driven organization seeking sustainable growth'
          }
        ]
      },
      {
        id: 'target-market',
        type: 'single-choice',
        title: 'Who is your primary target market?',
        description: 'Understanding your audience helps create focused, effective strategies.',
        required: true,
        category: 'market-analysis',
        weight: 1.0,
        options: [
          {
            value: 'b2b-enterprise',
            label: 'B2B Enterprise',
            description: 'Large businesses and corporations'
          },
          {
            value: 'b2b-smb',
            label: 'B2B Small/Medium Business',
            description: 'Small to medium-sized businesses'
          },
          {
            value: 'b2c-mass',
            label: 'B2C Mass Market',
            description: 'General consumer market'
          },
          {
            value: 'b2c-niche',
            label: 'B2C Niche Market',
            description: 'Specific consumer segments'
          }
        ]
      },
      {
        id: 'primary-goal',
        type: 'single-choice',
        title: 'What is your primary strategic goal?',
        description: 'This defines the main focus and success criteria for your strategy.',
        required: true,
        category: 'objectives',
        weight: 1.0,
        options: [
          {
            value: 'market-entry',
            label: 'Market Entry',
            description: 'Launching in a new market or geographic region'
          },
          {
            value: 'growth-scaling',
            label: 'Growth & Scaling',
            description: 'Accelerating growth and expanding operations'
          },
          {
            value: 'digital-transformation',
            label: 'Digital Transformation',
            description: 'Modernizing operations and adopting new technologies'
          },
          {
            value: 'competitive-advantage',
            label: 'Competitive Advantage',
            description: 'Strengthening market position against competitors'
          }
        ]
      }
    ]
  },

  'creative': {
    id: 'creative',
    title: 'Creative & Design Strategy',
    description: 'Develop comprehensive creative strategies and design frameworks',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-600',
    estimatedTime: '12-18 min',
    promptTemplate: `Create a comprehensive creative strategy for {projectType} targeting {audience} with {creativeGoal} as the primary objective.

Project Context:
- Brand Stage: {brandStage}
- Creative Style: {creativeStyle}
- Timeline: {timeline}
- Budget: {budget}

Please provide:
1. Creative Brief & Concept
2. Visual Identity Guidelines
3. Brand Messaging Framework
4. Design System Recommendations
5. Implementation Roadmap
6. Success Metrics

Format as a professional creative strategy with visual examples and actionable guidelines.`,
    questions: [
      {
        id: 'project-type',
        type: 'single-choice',
        title: 'What type of creative project are you working on?',
        description: 'This helps us understand the scope and approach for your creative strategy.',
        required: true,
        category: 'project-context',
        weight: 1.0,
        options: [
          {
            value: 'brand-identity',
            label: 'Brand Identity Design',
            description: 'Logo, visual identity, and brand guidelines'
          },
          {
            value: 'marketing-campaign',
            label: 'Marketing Campaign',
            description: 'Comprehensive marketing creative strategy'
          },
          {
            value: 'product-design',
            label: 'Product Design',
            description: 'UI/UX and product design strategy'
          },
          {
            value: 'packaging-design',
            label: 'Packaging Design',
            description: 'Product packaging and retail presence'
          }
        ]
      },
      {
        id: 'audience',
        type: 'single-choice',
        title: 'Who is your target audience?',
        description: 'Understanding your audience shapes every creative decision.',
        required: true,
        category: 'audience',
        weight: 1.0,
        options: [
          {
            value: 'young-professionals',
            label: 'Young Professionals (25-35)',
            description: 'Tech-savvy, career-focused millennials'
          },
          {
            value: 'families',
            label: 'Families & Parents',
            description: 'Family-oriented consumers with children'
          },
          {
            value: 'luxury-consumers',
            label: 'Luxury Market',
            description: 'High-income, premium-focused consumers'
          },
          {
            value: 'teenagers',
            label: 'Teenagers & Gen Z',
            description: 'Digital natives, social media focused'
          }
        ]
      },
      {
        id: 'creative-goal',
        type: 'single-choice',
        title: 'What is your primary creative goal?',
        description: 'This defines the main objective your creative strategy should achieve.',
        required: true,
        category: 'objectives',
        weight: 1.0,
        options: [
          {
            value: 'brand-awareness',
            label: 'Build Brand Awareness',
            description: 'Increase recognition and visibility'
          },
          {
            value: 'differentiation',
            label: 'Market Differentiation',
            description: 'Stand out from competitors'
          },
          {
            value: 'emotional-connection',
            label: 'Emotional Connection',
            description: 'Create strong emotional bonds with audience'
          },
          {
            value: 'conversion',
            label: 'Drive Conversions',
            description: 'Increase sales and customer action'
          }
        ]
      },
      {
        id: 'brand-stage',
        type: 'single-choice',
        title: 'What stage is your brand currently in?',
        description: 'This helps determine the creative approach and complexity needed.',
        required: true,
        category: 'brand-context',
        weight: 0.8,
        options: [
          {
            value: 'new-brand',
            label: 'New Brand',
            description: 'Starting from scratch, need complete identity'
          },
          {
            value: 'established-rebrand',
            label: 'Established Brand Rebrand',
            description: 'Existing brand needing refresh or overhaul'
          },
          {
            value: 'extension',
            label: 'Brand Extension',
            description: 'Expanding existing brand to new markets/products'
          },
          {
            value: 'refinement',
            label: 'Brand Refinement',
            description: 'Minor updates and improvements to existing brand'
          }
        ]
      },
      {
        id: 'creative-style',
        type: 'single-choice',
        title: 'What creative style resonates with your vision?',
        description: 'This guides the visual direction and aesthetic approach.',
        required: true,
        category: 'aesthetics',
        weight: 0.7,
        options: [
          {
            value: 'modern-minimal',
            label: 'Modern & Minimalist',
            description: 'Clean, simple, sophisticated design'
          },
          {
            value: 'bold-vibrant',
            label: 'Bold & Vibrant',
            description: 'Eye-catching, energetic, colorful approach'
          },
          {
            value: 'classic-elegant',
            label: 'Classic & Elegant',
            description: 'Timeless, refined, premium aesthetic'
          },
          {
            value: 'playful-creative',
            label: 'Playful & Creative',
            description: 'Fun, innovative, experimental design'
          }
        ]
      },
      {
        id: 'timeline',
        type: 'single-choice',
        title: 'What is your project timeline?',
        description: 'Timeline affects the scope and complexity of creative deliverables.',
        required: false,
        category: 'project-scope',
        weight: 0.6,
        options: [
          {
            value: 'rush',
            label: '1-2 Weeks (Rush)',
            description: 'Urgent timeline, focus on essentials'
          },
          {
            value: 'normal',
            label: '1-2 Months (Normal)',
            description: 'Standard timeline for comprehensive work'
          },
          {
            value: 'extended',
            label: '3+ Months (Extended)',
            description: 'Ample time for detailed, iterative process'
          },
          {
            value: 'flexible',
            label: 'Flexible Timeline',
            description: 'Quality is priority over speed'
          }
        ]
      }
    ]
  },

  'technical': {
    id: 'technical',
    title: 'Technical Development Strategy',
    description: 'Create comprehensive technical architectures and development roadmaps',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-green-500 to-teal-600',
    estimatedTime: '20-30 min',
    promptTemplate: `Design a comprehensive technical strategy for {projectType} using {techStack} with {architecture} architecture pattern.

Technical Requirements:
- Scale: {expectedScale}
- Performance: {performanceReqs}
- Security Level: {securityLevel}
- Timeline: {timeline}
- Team Size: {teamSize}

Please provide:
1. System Architecture Overview
2. Technology Stack Recommendations
3. Database Design Strategy
4. Security & Performance Considerations
5. Development Roadmap
6. Deployment & DevOps Strategy
7. Testing & Quality Assurance Plan

Format as detailed technical specification with diagrams and implementation guidance.`,
    questions: [
      {
        id: 'project-type',
        type: 'single-choice',
        title: 'What type of technical project are you building?',
        description: 'This determines the architecture patterns and technologies we recommend.',
        required: true,
        category: 'project-scope',
        weight: 1.0,
        options: [
          {
            value: 'web-application',
            label: 'Web Application',
            description: 'Full-stack web application with frontend and backend'
          },
          {
            value: 'mobile-app',
            label: 'Mobile Application',
            description: 'Native or cross-platform mobile app'
          },
          {
            value: 'api-microservices',
            label: 'API & Microservices',
            description: 'Backend services and API architecture'
          },
          {
            value: 'data-platform',
            label: 'Data Platform',
            description: 'Data processing, analytics, and ML platform'
          }
        ]
      },
      {
        id: 'expected-scale',
        type: 'single-choice',
        title: 'What scale do you expect your system to handle?',
        description: 'This influences architecture decisions, database choices, and scalability planning.',
        required: true,
        category: 'scalability',
        weight: 1.0,
        options: [
          {
            value: 'small-scale',
            label: 'Small Scale',
            description: '< 1K users, simple deployment'
          },
          {
            value: 'medium-scale',
            label: 'Medium Scale',
            description: '1K - 100K users, moderate complexity'
          },
          {
            value: 'large-scale',
            label: 'Large Scale',
            description: '100K - 1M users, high availability required'
          },
          {
            value: 'enterprise-scale',
            label: 'Enterprise Scale',
            description: '1M+ users, global distribution'
          }
        ]
      },
      {
        id: 'tech-stack',
        type: 'single-choice',
        title: 'What technology stack do you prefer?',
        description: 'Technology choice affects development speed, scalability, and team requirements.',
        required: true,
        category: 'technology',
        weight: 1.0,
        options: [
          {
            value: 'react-node',
            label: 'React + Node.js',
            description: 'JavaScript/TypeScript full-stack'
          },
          {
            value: 'python-django',
            label: 'Python + Django/FastAPI',
            description: 'Python-based backend with modern frameworks'
          },
          {
            value: 'java-spring',
            label: 'Java + Spring',
            description: 'Enterprise Java ecosystem'
          },
          {
            value: 'dotnet',
            label: '.NET Core',
            description: 'Microsoft .NET ecosystem'
          }
        ]
      },
      {
        id: 'architecture',
        type: 'single-choice',
        title: 'What architectural approach fits your needs?',
        description: 'Architecture pattern affects scalability, maintainability, and development complexity.',
        required: true,
        category: 'architecture',
        weight: 1.0,
        options: [
          {
            value: 'monolithic',
            label: 'Monolithic Architecture',
            description: 'Single deployable unit, simpler to start'
          },
          {
            value: 'microservices',
            label: 'Microservices',
            description: 'Distributed services, better scalability'
          },
          {
            value: 'serverless',
            label: 'Serverless',
            description: 'Function-based, pay-per-use model'
          },
          {
            value: 'hybrid',
            label: 'Hybrid Approach',
            description: 'Combination based on specific needs'
          }
        ]
      },
      {
        id: 'performance-reqs',
        type: 'single-choice',
        title: 'What are your performance requirements?',
        description: 'Performance needs influence technology choices and optimization strategies.',
        required: false,
        category: 'performance',
        weight: 0.8,
        options: [
          {
            value: 'standard',
            label: 'Standard Performance',
            description: 'Typical web application response times'
          },
          {
            value: 'high-performance',
            label: 'High Performance',
            description: 'Sub-second response times, optimized for speed'
          },
          {
            value: 'real-time',
            label: 'Real-time',
            description: 'Millisecond latency, live updates'
          },
          {
            value: 'batch-processing',
            label: 'Batch Processing',
            description: 'Focus on throughput over latency'
          }
        ]
      },
      {
        id: 'security-level',
        type: 'single-choice',
        title: 'What level of security do you need?',
        description: 'Security requirements affect architecture design and compliance considerations.',
        required: false,
        category: 'security',
        weight: 0.9,
        options: [
          {
            value: 'basic',
            label: 'Basic Security',
            description: 'Standard web security practices'
          },
          {
            value: 'enhanced',
            label: 'Enhanced Security',
            description: 'Additional security layers and monitoring'
          },
          {
            value: 'enterprise',
            label: 'Enterprise Security',
            description: 'Advanced security, audit trails, compliance'
          },
          {
            value: 'government',
            label: 'Government/Military',
            description: 'Maximum security, regulatory compliance'
          }
        ]
      }
    ]
  },

  'marketing': {
    id: 'marketing',
    title: 'Marketing & Growth Strategy',
    description: 'Develop comprehensive marketing strategies and growth frameworks',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-orange-500 to-red-600',
    estimatedTime: '15-25 min',
    promptTemplate: `Create a comprehensive marketing strategy for {businessType} targeting {targetAudience} with {primaryGoal} as the main objective.

Marketing Context:
- Industry: {industry}
- Budget Range: {budget}
- Timeline: {timeline}
- Channels: {preferredChannels}
- Competition Level: {competitionLevel}

Please provide:
1. Target Audience Analysis
2. Marketing Mix Strategy (4Ps/7Ps)
3. Channel Strategy & Tactics
4. Content Marketing Plan
5. Budget Allocation Recommendations
6. Performance Metrics & KPIs
7. Implementation Timeline

Format as a professional marketing strategy with actionable campaigns and measurable outcomes.`,
    questions: [
      {
        id: 'business-type',
        type: 'single-choice',
        title: 'What type of business needs marketing strategy?',
        description: 'Business type determines marketing approaches and channel selection.',
        required: true,
        category: 'business-context',
        weight: 1.0,
        options: [
          {
            value: 'b2b-saas',
            label: 'B2B SaaS',
            description: 'Software as a Service for businesses'
          },
          {
            value: 'e-commerce',
            label: 'E-commerce',
            description: 'Online retail and product sales'
          },
          {
            value: 'local-business',
            label: 'Local Business',
            description: 'Restaurant, retail, or service business'
          },
          {
            value: 'startup',
            label: 'Tech Startup',
            description: 'Early-stage technology company'
          }
        ]
      },
      {
        id: 'target-audience',
        type: 'single-choice',
        title: 'Who is your primary target audience?',
        description: 'Audience definition shapes all marketing messaging and channel selection.',
        required: true,
        category: 'audience',
        weight: 1.0,
        options: [
          {
            value: 'business-owners',
            label: 'Business Owners',
            description: 'Entrepreneurs and SMB owners'
          },
          {
            value: 'professionals',
            label: 'Working Professionals',
            description: '25-45 career-focused individuals'
          },
          {
            value: 'consumers',
            label: 'General Consumers',
            description: 'Broad consumer market'
          },
          {
            value: 'millennials',
            label: 'Millennials',
            description: 'Digital-native generation'
          }
        ]
      },
      {
        id: 'primary-goal',
        type: 'single-choice',
        title: 'What is your primary marketing goal?',
        description: 'Marketing goal determines strategy focus and success metrics.',
        required: true,
        category: 'objectives',
        weight: 1.0,
        options: [
          {
            value: 'brand-awareness',
            label: 'Brand Awareness',
            description: 'Increase brand recognition and visibility'
          },
          {
            value: 'lead-generation',
            label: 'Lead Generation',
            description: 'Generate qualified leads for sales'
          },
          {
            value: 'sales-conversion',
            label: 'Sales Conversion',
            description: 'Drive direct sales and revenue'
          },
          {
            value: 'customer-retention',
            label: 'Customer Retention',
            description: 'Keep and grow existing customers'
          }
        ]
      }
    ]
  },

  'research': {
    id: 'research',
    title: 'Research & Analysis Strategy',
    description: 'Design comprehensive research methodologies and analysis frameworks',
    icon: <Target className="w-6 h-6" />,
    color: 'from-cyan-500 to-blue-600',
    estimatedTime: '18-25 min',
    promptTemplate: `Design a comprehensive research strategy for {researchType} focusing on {researchFocus} with {methodology} methodology.

Research Context:
- Subject Area: {subjectArea}
- Timeline: {timeline}
- Resources: {resources}
- Audience: {audience}

Please provide:
1. Research Objectives & Questions
2. Methodology & Approach
3. Data Collection Strategy
4. Analysis Framework
5. Validity & Reliability Measures
6. Timeline & Milestones
7. Reporting & Presentation Plan

Format as a detailed research proposal with clear methodologies and expected outcomes.`,
    questions: [
      {
        id: 'research-type',
        type: 'single-choice',
        title: 'What type of research are you conducting?',
        description: 'Research type determines methodology and approach.',
        required: true,
        category: 'research-scope',
        weight: 1.0,
        options: [
          {
            value: 'market-research',
            label: 'Market Research',
            description: 'Understanding market trends and customer behavior'
          },
          {
            value: 'user-research',
            label: 'User Research',
            description: 'Understanding user needs and experiences'
          },
          {
            value: 'academic-research',
            label: 'Academic Research',
            description: 'Scholarly research and analysis'
          },
          {
            value: 'competitive-analysis',
            label: 'Competitive Analysis',
            description: 'Analyzing competitors and market positioning'
          }
        ]
      },
      {
        id: 'research-focus',
        type: 'single-choice',
        title: 'What is your primary research focus?',
        description: 'Focus area guides research questions and methodology selection.',
        required: true,
        category: 'focus-area',
        weight: 1.0,
        options: [
          {
            value: 'behavior-analysis',
            label: 'Behavior Analysis',
            description: 'Understanding how people act and make decisions'
          },
          {
            value: 'needs-assessment',
            label: 'Needs Assessment',
            description: 'Identifying problems and requirements'
          },
          {
            value: 'satisfaction-measurement',
            label: 'Satisfaction Measurement',
            description: 'Measuring satisfaction and experience quality'
          },
          {
            value: 'trend-analysis',
            label: 'Trend Analysis',
            description: 'Identifying patterns and future directions'
          }
        ]
      },
      {
        id: 'methodology',
        type: 'single-choice',
        title: 'What research methodology do you prefer?',
        description: 'Methodology affects data quality, timeline, and resource requirements.',
        required: true,
        category: 'methodology',
        weight: 1.0,
        options: [
          {
            value: 'quantitative',
            label: 'Quantitative',
            description: 'Statistical analysis with numerical data'
          },
          {
            value: 'qualitative',
            label: 'Qualitative',
            description: 'In-depth insights through interviews and observation'
          },
          {
            value: 'mixed-methods',
            label: 'Mixed Methods',
            description: 'Combination of quantitative and qualitative'
          },
          {
            value: 'experimental',
            label: 'Experimental',
            description: 'Controlled experiments and A/B testing'
          }
        ]
      }
    ]
  },

  'education': {
    id: 'education',
    title: 'Education & Training Strategy',
    description: 'Create comprehensive educational programs and training curricula',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-600',
    estimatedTime: '20-30 min',
    promptTemplate: `Design a comprehensive educational strategy for {educationType} targeting {learnerAudience} with {learningGoal} as the primary objective.

Educational Context:
- Subject Matter: {subjectMatter}
- Delivery Method: {deliveryMethod}
- Duration: {duration}
- Assessment Method: {assessmentMethod}

Please provide:
1. Learning Objectives & Outcomes
2. Curriculum Structure & Content
3. Instructional Design Strategy
4. Assessment & Evaluation Methods
5. Resource Requirements
6. Implementation Timeline
7. Success Metrics & Tracking

Format as a detailed educational program with clear learning pathways and measurable outcomes.`,
    questions: [
      {
        id: 'education-type',
        type: 'single-choice',
        title: 'What type of educational program are you creating?',
        description: 'Education type determines structure and delivery approach.',
        required: true,
        category: 'program-type',
        weight: 1.0,
        options: [
          {
            value: 'corporate-training',
            label: 'Corporate Training',
            description: 'Employee skills development and training'
          },
          {
            value: 'online-course',
            label: 'Online Course',
            description: 'Digital learning program for general audience'
          },
          {
            value: 'academic-curriculum',
            label: 'Academic Curriculum',
            description: 'Formal educational institution curriculum'
          },
          {
            value: 'workshop-seminar',
            label: 'Workshop/Seminar',
            description: 'Short-term intensive learning experience'
          }
        ]
      },
      {
        id: 'learner-audience',
        type: 'single-choice',
        title: 'Who are your target learners?',
        description: 'Learner characteristics influence content design and delivery methods.',
        required: true,
        category: 'audience',
        weight: 1.0,
        options: [
          {
            value: 'beginners',
            label: 'Beginners',
            description: 'No prior knowledge in the subject area'
          },
          {
            value: 'intermediate',
            label: 'Intermediate',
            description: 'Some background knowledge and experience'
          },
          {
            value: 'advanced',
            label: 'Advanced',
            description: 'Experienced learners seeking specialization'
          },
          {
            value: 'mixed-levels',
            label: 'Mixed Levels',
            description: 'Diverse group with varying experience levels'
          }
        ]
      },
      {
        id: 'learning-goal',
        type: 'single-choice',
        title: 'What is the primary learning goal?',
        description: 'Learning goal shapes curriculum design and assessment methods.',
        required: true,
        category: 'objectives',
        weight: 1.0,
        options: [
          {
            value: 'skill-development',
            label: 'Skill Development',
            description: 'Practical skills and hands-on competencies'
          },
          {
            value: 'knowledge-transfer',
            label: 'Knowledge Transfer',
            description: 'Understanding concepts and theoretical knowledge'
          },
          {
            value: 'certification',
            label: 'Certification',
            description: 'Formal recognition and credential achievement'
          },
          {
            value: 'behavior-change',
            label: 'Behavior Change',
            description: 'Changing attitudes and workplace behaviors'
          }
        ]
      }
    ]
  }
};

export default Questionnaire;
