import { useEffect, useState } from "react";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  tags: string[];
  relevanceScore: number;
  estimatedTokens: number;
}

const categories = ["marketing", "content", "business", "technical", "education"];

export default function Generation() {
  const [category, setCategory] = useState("marketing");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSuggestions = async (selectedCategory: string) => {
    setLoading(true);
    try {
      const response = await fetch(\`/api/suggestions/personalized?category=\${selectedCategory}\`);
      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError("Failed to load suggestions.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendInteraction = async (id: string, action: "like" | "dislike") => {
    try {
      await fetch("/api/suggestions/interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId: id, action })
      });
      console.log(\`Interaction recorded: \${action} on \${id}\`);
    } catch (err) {
      console.error("Interaction error:", err);
    }
  };

  useEffect(() => {
    fetchSuggestions(category);
  }, [category]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Smart Suggestions</h1>

      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
        Select Category:
      </label>
      <select
        id="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="mb-6 p-2 border border-gray-300 rounded-md"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </option>
        ))}
      </select>

      {loading && <p>Loading suggestions...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((s) => (
          <div key={s.id} className="bg-white shadow-md rounded-xl p-5 border border-gray-200">
            <h2 className="text-xl font-semibold text-blue-700">{s.title}</h2>
            <p className="text-gray-700 mb-2">{s.description}</p>
            <div className="text-sm text-gray-500 mb-1">Prompt: <em>{s.prompt}</em></div>
            <div className="text-xs text-gray-400 mb-2">Tags: {s.tags.join(", ")}</div>

            <div className="flex gap-2">
              <button
                onClick={() => sendInteraction(s.id, "like")}
                className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
              >
                ?? Like
              </button>
              <button
                onClick={() => sendInteraction(s.id, "dislike")}
                className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
              >
                ?? Dislike
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
