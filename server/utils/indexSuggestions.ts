import { openSearchClient } from "../utils/opensearchClient";

const suggestions = [
  {
    id: "1",
    title: "Marketing Campaign Planner",
    description: "Generate comprehensive marketing campaign strategies",
    category: "marketing",
    prompt: "Create a detailed marketing campaign for...",
    tags: ["marketing", "strategy", "campaign"],
    relevanceScore: 0.95,
    estimatedTokens: 150
  },
  {
    id: "2",
    title: "Content Creation Assistant",
    description: "Help create engaging content for your audience",
    category: "content",
    prompt: "Write engaging content that...",
    tags: ["content", "writing", "engagement"],
    relevanceScore: 0.88,
    estimatedTokens: 120
  },
  {
    id: "3",
    title: "Business Strategy Guide",
    description: "Develop effective business strategies",
    category: "business",
    prompt: "Create a business strategy for...",
    tags: ["business", "strategy", "planning"],
    relevanceScore: 0.92,
    estimatedTokens: 180
  }
];

async function indexSuggestions() {
  for (const suggestion of suggestions) {
    await openSearchClient.index({
      index: "suggestions",
      id: suggestion.id,
      body: suggestion
    });
  }
  console.log("? Suggestions indexed");
}

indexSuggestions().catch(console.error);
