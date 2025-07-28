import { UserCache } from "./cache";

// A/B Test Configuration
interface ABTest {
 id: string;
 name: string;
 description: string;
 variants: ABVariant[];
 trafficAllocation: number; // Percentage of users to include in test
 startDate: Date;
 endDate?: Date;
 isActive: boolean;
 targetMetrics: string[];
}

interface ABVariant {
 id: string;
 name: string;
 allocation: number; // Percentage of test traffic
 config: Record<string, any>;
}

interface UserTestAssignment {
 userId: string;
 testId: string;
 variantId: string;
 assignedAt: Date;
}

// Active A/B tests
const activeTests: ABTest[] = [
 {
   id: "onboarding_flow_v1",
   name: "Onboarding Flow Optimization",
   description: "Test different onboarding flows to improve user activation",
   variants: [
     {
       id: "control",
       name: "Original Flow",
       allocation: 50,
       config: {
         showWelcomeModal: false,
         skipCategorySelection: false,
         enableGuidedTour: false
       }
     },
     {
       id: "guided",
       name: "Guided Experience",
       allocation: 50,
       config: {
         showWelcomeModal: true,
         skipCategorySelection: false,
         enableGuidedTour: true
       }
     }
   ],
   trafficAllocation: 100,
   startDate: new Date('2024-01-01'),
   isActive: true,
   targetMetrics: ["user_activation", "first_prompt_creation", "subscription_conversion"]
 },
 {
   id: "pricing_display_v1",
   name: "Pricing Display Test",
   description: "Test different pricing presentations to improve conversion",
   variants: [
     {
       id: "control",
       name: "Standard Pricing",
       allocation: 34,
       config: {
         highlightRecommended: false,
         showAnnualDiscount: false,
         emphasizeTokenValue: false
       }
     },
     {
       id: "recommended",
       name: "Highlight Recommended",
       allocation: 33,
       config: {
         highlightRecommended: true,
         showAnnualDiscount: false,
         emphasizeTokenValue: false
       }
     },
     {
       id: "value_focused",
       name: "Value-Focused",
       allocation: 33,
       config: {
         highlightRecommended: true,
         showAnnualDiscount: true,
         emphasizeTokenValue: true
       }
     }
   ],
   trafficAllocation: 80,
   startDate: new Date('2024-01-15'),
   isActive: true,
   targetMetrics: ["subscription_conversion", "upgrade_clicks", "time_on_pricing_page"]
 },
 {
   id: "prompt_generation_ui_v1",
   name: "Prompt Generation UI",
   description: "Test different UI layouts for prompt generation",
   variants: [
     {
       id: "control",
       name: "Vertical Layout",
       allocation: 50,
       config: {
         layout: "vertical",
         showProgressBar: false,
         enableInlineHelp: false
       }
     },
     {
       id: "horizontal",
       name: "Horizontal Layout",
       allocation: 50,
       config: {
         layout: "horizontal",
         showProgressBar: true,
         enableInlineHelp: true
       }
     }
   ],
   trafficAllocation: 70,
   startDate: new Date('2024-02-01'),
   isActive: true,
   targetMetrics: ["prompt_completion_rate", "user_satisfaction", "generation_time"]
 }
];

// Hash function for consistent user assignment
function hashUserId(userId: string, testId: string): number {
 let hash = 0;
 const str = `${userId}:${testId}`;
 for (let i = 0; i < str.length; i++) {
   const char = str.charCodeAt(i);
   hash = ((hash << 5) - hash) + char;
   hash = hash & hash; // Convert to 32-bit integer
 }
 return Math.abs(hash);
}

// Assign user to test variant
export function assignUserToTest(userId: string, testId: string): ABVariant | null {
 const test = activeTests.find(t => t.id === testId && t.isActive);
 if (!test) return null;

 // Check if user is already assigned (cached)
 const cacheKey = `ab_test:${userId}:${testId}`;
 const cachedAssignment = UserCache.get(cacheKey);
 if (cachedAssignment) {
   return cachedAssignment;
 }

 // Check if user should be included in test
 const hash = hashUserId(userId, testId);
 const userPercentile = (hash % 100) + 1;
 
 if (userPercentile > test.trafficAllocation) {
   return null; // User not in test
 }

 // Assign to variant
 let cumulativeAllocation = 0;
 const variantHash = hashUserId(userId, `${testId}_variant`);
 const variantPercentile = (variantHash % 100) + 1;

 for (const variant of test.variants) {
   cumulativeAllocation += variant.allocation;
   if (variantPercentile <= cumulativeAllocation) {
     // Cache assignment
     UserCache.set(cacheKey, variant);
     return variant;
   }
 }

 return test.variants[0]; // Fallback to first variant
}

// Get all active tests for a user
export function getUserTestAssignments(userId: string): Record<string, ABVariant> {
 const assignments: Record<string, ABVariant> = {};
 
 for (const test of activeTests) {
   if (test.isActive) {
     const variant = assignUserToTest(userId, test.id);
     if (variant) {
       assignments[test.id] = variant;
     }
   }
 }
 
 return assignments;
}

// Track A/B test events
interface ABTestEvent {
 userId: string;
 testId: string;
 variantId: string;
 eventType: string;
 eventData?: Record<string, any>;
 timestamp: Date;
}

const testEvents: ABTestEvent[] = [];

export function trackABTestEvent(
 userId: string,
 testId: string,
 eventType: string,
 eventData?: Record<string, any>
) {
 const variant = assignUserToTest(userId, testId);
 if (!variant) return;

 const event: ABTestEvent = {
   userId,
   testId,
   variantId: variant.id,
   eventType,
   eventData,
   timestamp: new Date()
 };

 testEvents.push(event);
 
 // In production, this would be sent to analytics service
 console.log(`A/B Test Event: ${testId}:${variant.id} - ${eventType}`, eventData);
}

// Get test results for analysis
export function getTestResults(testId: string): any {
 const test = activeTests.find(t => t.id === testId);
 if (!test) return null;

 const testEventsForTest = testEvents.filter(e => e.testId === testId);
 const results: Record<string, any> = {};

 for (const variant of test.variants) {
   const variantEvents = testEventsForTest.filter(e => e.variantId === variant.id);
   const uniqueUsers = new Set(variantEvents.map(e => e.userId)).size;
   
   results[variant.id] = {
     name: variant.name,
     users: uniqueUsers,
     events: variantEvents.length,
     metrics: {}
   };

   // Calculate metrics by event type
   const eventsByType = variantEvents.reduce((acc, event) => {
     if (!acc[event.eventType]) acc[event.eventType] = 0;
     acc[event.eventType]++;
     return acc;
   }, {} as Record<string, number>);

   results[variant.id].metrics = eventsByType;
 }

 return {
   testId,
   testName: test.name,
   variants: results,
   totalEvents: testEventsForTest.length,
   totalUsers: new Set(testEventsForTest.map(e => e.userId)).size
 };
}

// Middleware to inject A/B test configuration
export function getABTestConfig(userId: string) {
 const assignments = getUserTestAssignments(userId);
 const config: Record<string, any> = {};

 for (const [testId, variant] of Object.entries(assignments)) {
   config[testId] = variant.config;
 }

 return config;
}

// Helper functions for specific tests
export function getOnboardingConfig(userId: string) {
 const variant = assignUserToTest(userId, "onboarding_flow_v1");
 return variant?.config || {
   showWelcomeModal: false,
   skipCategorySelection: false,
   enableGuidedTour: false
 };
}

export function getPricingConfig(userId: string) {
 const variant = assignUserToTest(userId, "pricing_display_v1");
 return variant?.config || {
   highlightRecommended: false,
   showAnnualDiscount: false,
   emphasizeTokenValue: false
 };
}

export function getPromptUIConfig(userId: string) {
 const variant = assignUserToTest(userId, "prompt_generation_ui_v1");
 return variant?.config || {
   layout: "vertical",
   showProgressBar: false,
   enableInlineHelp: false
 };
}