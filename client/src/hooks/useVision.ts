import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/config/api';

// ============================================
// Types
// ============================================

export interface VisionProvider {
  id: string;
  name: string;
  available: boolean;
}

export interface VisionAnalysis {
  id: string;
  prompt: string;
  response: string;
  model: string;
  tokenCount: number | null;
  metadata: {
    provider: string;
    model: string;
    mimeType: string;
    fileName: string;
    imageSize: number;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  } | null;
  createdAt: string;
}

export interface AnalyzeResponse {
  id: string;
  analysis: string;
  provider: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  tokensUsed: number;
}

// ============================================
// Hooks
// ============================================

export function useVisionStatus() {
  return useQuery<{ configured: boolean; providers: VisionProvider[] }>({
    queryKey: ['vision-status'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/images/vision/status');
      const json = await res.json();
      return json.data;
    },
    staleTime: 60_000,
  });
}

export function useAnalyzeImage() {
  return useMutation<AnalyzeResponse, Error, { imageData: string; mimeType: string; prompt: string; provider?: string; fileName?: string }>({
    mutationFn: async (params) => {
      const res = await apiRequest('POST', '/api/images/analyze', params);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Analysis failed');
      return json.data;
    },
  });
}

export function useVisionAnalyses(page: number = 1) {
  return useQuery<{ analyses: VisionAnalysis[]; pagination: { page: number; limit: number; total: number; pages: number } }>({
    queryKey: ['vision-analyses', page],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/images/analyses?page=${page}`);
      const json = await res.json();
      return json.data;
    },
  });
}
