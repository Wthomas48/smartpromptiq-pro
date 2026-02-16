import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/config/api';

// ============================================
// Types
// ============================================

export interface SearchSource {
  index: number;
  title: string;
  url: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface SearchResponse {
  query: string;
  results: WebSearchResult[];
  tavilyAnswer?: string;
  searchDepth: string;
  timeTakenMs: number;
  tokensUsed: number;
}

export interface SynthesizedSearchResponse {
  answer: string;
  sources: SearchSource[];
  query: string;
  provider: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  searchDepth: string;
  timeTakenMs: number;
  tokensUsed: number;
}

export interface SearchStatusResponse {
  configured: boolean;
}

// ============================================
// Hooks
// ============================================

export function useSearchStatus() {
  return useQuery<SearchStatusResponse>({
    queryKey: ['search-status'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/search/status');
      const json = await res.json();
      return json.data;
    },
    staleTime: 60_000,
  });
}

export function useWebSearch() {
  return useMutation<SearchResponse, Error, { query: string; searchDepth?: 'basic' | 'advanced'; maxResults?: number; topic?: 'general' | 'news' }>({
    mutationFn: async (params) => {
      const res = await apiRequest('POST', '/api/search', params);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Search failed');
      return json.data;
    },
  });
}

export function useSearchSynthesize() {
  return useMutation<SynthesizedSearchResponse, Error, { query: string; searchDepth?: 'basic' | 'advanced'; maxResults?: number; topic?: 'general' | 'news'; provider?: string }>({
    mutationFn: async (params) => {
      const res = await apiRequest('POST', '/api/search/synthesize', params);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Search synthesis failed');
      return json.data;
    },
  });
}
