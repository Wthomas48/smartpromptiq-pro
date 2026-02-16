import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/config/api';

// ============================================
// Types
// ============================================

export interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  chunkCount: number | null;
  totalTokens: number | null;
  chatCount: number;
  lastChatAt: string | null;
  createdAt: string;
  updatedAt: string;
  errorMessage: string | null;
}

export interface ChatSession {
  id: string;
  title: string | null;
  provider: string;
  model: string;
  messageCount: number;
  tokenCount: number;
  createdAt: string;
  lastMessageAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  chunksUsed: { index: number; heading?: string; similarity: number }[] | null;
  createdAt: string;
}

export interface ChatResponse {
  success: boolean;
  chatId: string;
  messageId: string;
  answer: string;
  provider: string;
  model: string;
  chunksUsed: { index: number; heading?: string; similarity: number }[];
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  tokensUsed: number;
}

// ============================================
// Hooks
// ============================================

export function useDocuments() {
  return useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/documents');
      const data = await res.json();
      return data.documents;
    },
  });
}

export function useDocument(id: string | null) {
  return useQuery<Document>({
    queryKey: ['documents', id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/documents/${id}`);
      const data = await res.json();
      return data.document;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      // Poll every 2s while processing
      const doc = query.state.data;
      return doc?.status === 'processing' ? 2000 : false;
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      fileName: string;
      fileType: string;
      fileData: string; // base64
      title?: string;
    }) => {
      const res = await apiRequest('POST', '/api/documents/upload', params);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const res = await apiRequest('DELETE', `/api/documents/${documentId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDocumentChats(documentId: string | null) {
  return useQuery<ChatSession[]>({
    queryKey: ['document-chats', documentId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/documents/${documentId}/chats`);
      const data = await res.json();
      return data.chats;
    },
    enabled: !!documentId,
  });
}

export function useChatHistory(documentId: string | null, chatId: string | null) {
  return useQuery<{ chat: ChatSession; messages: ChatMessage[] }>({
    queryKey: ['chat-history', documentId, chatId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/documents/${documentId}/chats/${chatId}`);
      return res.json();
    },
    enabled: !!documentId && !!chatId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<ChatResponse, Error, {
    documentId: string;
    message: string;
    chatId?: string;
    provider?: string;
  }>({
    mutationFn: async ({ documentId, message, chatId, provider }) => {
      const res = await apiRequest('POST', `/api/documents/${documentId}/chat`, {
        message,
        chatId,
        provider,
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-chats', variables.documentId] });
      queryClient.invalidateQueries({ queryKey: ['chat-history', variables.documentId, data.chatId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, chatId }: { documentId: string; chatId: string }) => {
      const res = await apiRequest('DELETE', `/api/documents/${documentId}/chats/${chatId}`);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-chats', variables.documentId] });
    },
  });
}
