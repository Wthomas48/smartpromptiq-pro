import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/config/api';

// ============================================
// Types
// ============================================

export interface UserMemory {
  id: string;
  content: string;
  category: 'general' | 'preference' | 'fact' | 'instruction';
  source: 'user' | 'auto';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Hooks
// ============================================

export function useMemories() {
  return useQuery<{ memories: UserMemory[]; count: number; maxMemories: number }>({
    queryKey: ['memories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/memory');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useAddMemory() {
  const queryClient = useQueryClient();
  return useMutation<UserMemory, Error, { content: string; category?: string }>({
    mutationFn: async (params) => {
      const res = await apiRequest('POST', '/api/memory', params);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to add memory');
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}

export function useUpdateMemory() {
  const queryClient = useQueryClient();
  return useMutation<UserMemory, Error, { id: string; content?: string; category?: string; isActive?: boolean }>({
    mutationFn: async ({ id, ...params }) => {
      const res = await apiRequest('PUT', `/api/memory/${id}`, params);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to update memory');
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}

export function useDeleteMemory() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await apiRequest('DELETE', `/api/memory/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete memory');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}

export function useClearMemories() {
  const queryClient = useQueryClient();
  return useMutation<void, Error>({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', '/api/memory');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to clear memories');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}
