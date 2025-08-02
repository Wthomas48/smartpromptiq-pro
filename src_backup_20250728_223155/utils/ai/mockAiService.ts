// Mock AI service for development/testing without API keys
interface CustomizationOptions {
 tone?: string;
 detailLevel?: string;
 format?: string;
}

const mockResponses = {
 business: `# Executive Summary
This strategic business plan outlines a comprehensive approach to achieving sustainable growth and market leadership.

# Strategic Objectives
- Increase market share by 25% within 18 months
- Develop three new product lines targeting emerging markets
- Establish strategic partnerships with key industry players

# Market Analysis Framework
The current market presents significant opportunities for expansion, particularly in digital transformation sectors.

# Implementation Roadmap
Phase 1: Market Research and Validation (Months 1-3)
Phase 2: Product Development and Testing (Months 4-9)
Phase 3: Market Launch and Scaling (Months 10-18)

# Key Performance Indicators
- Revenue growth rate
- Customer acquisition cost
- Market penetration metrics`,

 creative: `# Creative Concept
A bold, innovative approach that challenges conventional thinking while maintaining brand authenticity.

# Visual Direction
Modern, minimalist aesthetic with vibrant accent colors and dynamic typography.

# Brand Guidelines
- Primary colors: Deep blue (#1a365d) and bright orange (#ff6b35)
- Typography: Sans-serif for headers, serif for body text
- Imagery: High-contrast photography with authentic human moments

# Execution Strategy
Multi-channel campaign leveraging digital-first approach with traditional media support.

# Success Metrics
- Brand awareness increase of 40%
- Social media engagement rate of 8%+
- Creative effectiveness score of 85+`,

 technical: `# Technical Overview
A microservices-based architecture leveraging cloud-native technologies for scalability and reliability.

# Architecture Requirements
- RESTful API design with GraphQL for complex queries
- Containerized deployment using Docker and Kubernetes
- Event-driven architecture with message queuing

# Implementation Plan
Sprint 1-2: Core infrastructure setup
Sprint 3-6: Service development and integration
Sprint 7-8: Testing and optimization

# Testing Strategy
- Unit testing coverage minimum 80%
- Integration testing for all API endpoints
- Performance testing under 3x expected load

# Deployment Guidelines
- CI/CD pipeline with automated testing
- Blue-green deployment strategy
- Monitoring and alerting infrastructure`
};

export async function generatePrompt(
 category: "business" | "creative" | "technical",
 responses: Record<string, any>,
 customization: CustomizationOptions = {}
): Promise<string> {
 // Simulate API delay
 await new Promise(resolve => setTimeout(resolve, 1000));
 
 console.log("Mock AI Service - Generating prompt for:", category);
 console.log("Responses:", responses);
 console.log("Customization:", customization);
 
 // Return mock response with some customization applied
 let response = mockResponses[category];
 
 if (customization.tone === "casual") {
   response = response.replace(/\./g, "!").toLowerCase();
 }
 
 return response;
}

export async function refinePrompt(
 currentPrompt: string,
 refinementQuery: string,
 category: string,
 originalAnswers: Record<string, any>,
 history: any[] = []
): Promise<string> {
 // Simulate API delay
 await new Promise(resolve => setTimeout(resolve, 800));
 
 console.log("Mock AI Service - Refining prompt");
 console.log("Refinement query:", refinementQuery);
 
 // Simple mock refinement - just append the refinement request
 return `${currentPrompt}\n\n## Refined Section (Based on: "${refinementQuery}")\nThis section has been updated according to your specific requirements.`;
}