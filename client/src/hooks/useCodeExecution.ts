import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/config/api';

// ============================================
// Types
// ============================================

export interface SupportedLanguage {
  id: string;
  label: string;
  version: string;
  icon: string;
}

export interface ExecutionOutput {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    signal: string | null;
    output: string;
  };
  compile: {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    output: string;
  } | null;
  tokensUsed: number;
}

// ============================================
// Hooks
// ============================================

export function useLanguages() {
  return useQuery<{ languages: SupportedLanguage[]; templates: Record<string, string> }>({
    queryKey: ['code-languages'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/code/languages');
      const json = await res.json();
      return json.data;
    },
    staleTime: 300_000, // 5 min cache
  });
}

export function useExecuteCode() {
  return useMutation<ExecutionOutput, Error, { language: string; code: string; stdin?: string }>({
    mutationFn: async (params) => {
      const res = await apiRequest('POST', '/api/code/execute', params);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Execution failed');
      return json.data;
    },
  });
}
