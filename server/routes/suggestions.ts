import express from "express";
import { openSearchClient } from "../utils/opensearchClient";

const router = express.Router();

router.get("/personalized", async (req, res) => {
  try {
    const category = req.query.category?.toString().toLowerCase() || "";

    const response = await openSearchClient.search({
      index: "suggestions",
      size: 10,
      body: {
        query: category
          ? {
              match: {
                category: category
              }
            }
          : {
              match_all: {}
            }
      }
    });

    const suggestions = response.body.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source
    }));

    res.json({ suggestions });
  } catch (error) {
    console.error("OpenSearch fetch error:", error);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

router.get("/trending", (req, res) => {
  res.json({
    suggestions: [
      {
        id: "4",
        title: "AI Prompt Engineering",
        description: "Master the art of AI prompt engineering",
        category: "technical",
        prompt: "Create effective AI prompts for...",
        tags: ["AI", "prompt", "engineering"],
        relevanceScore: 0.97,
        estimatedTokens: 200
      }
    ]
  });
});

router.post("/interaction", (req, res) => {
  const { suggestionId, action } = req.body;
  console.log(`?? User ${action} on suggestion ${suggestionId}`);
  res.json({ success: true });
});

export default router;
router.post("/add", async (req, res) => {
  try {
    const { title, description, category, prompt, tags, relevanceScore, estimatedTokens } = req.body;

    const response = await openSearchClient.index({
      index: "suggestions",
      body: {
        title,
        description,
        category,
        prompt,
        tags,
        relevanceScore,
        estimatedTokens,
        createdAt: new Date().toISOString()
      }
    });

    res.json({ success: true, id: response.body._id });
  } catch (error) {
    console.error("Failed to index suggestion:", error);
    res.status(500).json({ error: "Failed to index suggestion" });
  }
});
