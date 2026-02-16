import { useState, useRef, useEffect, useCallback } from 'react';
import {
  useDocuments,
  useDocument,
  useUploadDocument,
  useDeleteDocument,
  useSendMessage,
  useDocumentChats,
  useChatHistory,
  useDeleteChat,
  type Document,
  type ChatMessage,
  type ChatResponse,
} from '@/hooks/useDocumentChat';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  FileText, Upload, Trash2, Send, Loader2, AlertCircle, CheckCircle2,
  Clock, MessageSquare, ChevronRight, Plus, X, File, FileType,
} from 'lucide-react';

// ============================================
// HELPERS
// ============================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeIcon(type: string) {
  switch (type) {
    case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
    case 'docx': return <FileType className="w-5 h-5 text-blue-500" />;
    default: return <File className="w-5 h-5 text-gray-500" />;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'ready':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3 h-3" /> Ready</span>;
    case 'processing':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Loader2 className="w-3 h-3 animate-spin" /> Processing</span>;
    case 'failed':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><AlertCircle className="w-3 h-3" /> Failed</span>;
    default:
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"><Clock className="w-3 h-3" /> {status}</span>;
  }
}

// ============================================
// UPLOAD PANEL
// ============================================

function UploadDropZone({ onUpload, isUploading }: { onUpload: (file: File) => void; isUploading: boolean }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }, [onUpload]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
        ${isDragging
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
          : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }
        ${isUploading ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.txt,.md,.docx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
      {isUploading ? (
        <Loader2 className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
      ) : (
        <Upload className="w-8 h-8 mx-auto text-gray-400" />
      )}
      <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {isUploading ? 'Uploading...' : 'Drop a file or click to upload'}
      </p>
      <p className="mt-1 text-xs text-gray-500">PDF, TXT, MD, DOCX (max 10 MB)</p>
    </div>
  );
}

// ============================================
// DOCUMENT LIST
// ============================================

function DocumentList({
  documents,
  selectedId,
  onSelect,
  onDelete,
}: {
  documents: Document[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        No documents yet. Upload one to get started.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {documents.map((doc) => (
        <div
          key={doc.id}
          onClick={() => doc.status === 'ready' && onSelect(doc.id)}
          className={`
            group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm
            ${selectedId === doc.id
              ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-1 ring-indigo-300 dark:ring-indigo-700'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
            }
            ${doc.status !== 'ready' ? 'opacity-70 cursor-default' : ''}
          `}
        >
          {fileTypeIcon(doc.fileType)}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-gray-900 dark:text-gray-100">{doc.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {statusBadge(doc.status)}
              <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
              {doc.chunkCount && (
                <span className="text-xs text-gray-500">{doc.chunkCount} chunks</span>
              )}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-all"
            title="Delete document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================
// CHAT PANEL
// ============================================

function ChatPanel({
  documentId,
  documentTitle,
}: {
  documentId: string;
  documentTitle: string;
}) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; chunksUsed?: any[] }[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [provider, setProvider] = useState('auto');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessage = useSendMessage();

  // Reset on document change
  useEffect(() => {
    setMessages([]);
    setChatId(null);
    setInput('');
  }, [documentId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sendMessage.isPending) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);

    try {
      const result: ChatResponse = await sendMessage.mutateAsync({
        documentId,
        message: text,
        chatId: chatId || undefined,
        provider: provider === 'auto' ? undefined : provider,
      });

      setChatId(result.chatId);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.answer, chunksUsed: result.chunksUsed },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message || 'Failed to get response'}` },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <span className="font-semibold truncate text-gray-900 dark:text-gray-100">{documentTitle}</span>
        </div>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="text-xs border rounded-md px-2 py-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
        >
          <option value="auto">Auto</option>
          <option value="openai">GPT-4o</option>
          <option value="anthropic">Claude</option>
          <option value="gemini">Gemini</option>
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-gray-500 dark:text-gray-400 font-medium">Ask a question about this document</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">The AI will search the document and answer with citations</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`
                max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
                }
              `}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.chunksUsed && msg.chunksUsed.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sources: {msg.chunksUsed.map((c) => `[${c.index + 1}]${c.heading ? ` ${c.heading}` : ''}`).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {sendMessage.isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching document...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this document..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sendMessage.isPending}
            className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function DocumentChat() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const { data: documents = [], isLoading } = useDocuments();
  const { data: selectedDoc } = useDocument(selectedDocId);
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  const handleUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['pdf', 'txt', 'md', 'markdown', 'docx'];
    if (!allowed.includes(ext)) {
      toast({ title: 'Unsupported file', description: `Allowed: ${allowed.join(', ')}`, variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum size is 10 MB', variant: 'destructive' });
      return;
    }

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    try {
      const result = await uploadMutation.mutateAsync({
        fileName: file.name,
        fileType: ext,
        fileData: base64,
        title: file.name,
      });
      if (result.document?.id) {
        setSelectedDocId(result.document.id);
      }
      toast({ title: 'Document uploaded', description: 'Processing will complete shortly.' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (selectedDocId === id) setSelectedDocId(null);
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Document deleted' });
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-300" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Sign in to use Doc Chat</h2>
          <p className="mt-2 text-gray-500">Upload documents and chat with AI about their content.</p>
        </div>
      </div>
    );
  }

  const readyDoc = selectedDocId ? documents.find((d) => d.id === selectedDocId && d.status === 'ready') : null;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Page header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-500" />
          Document Chat
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Upload documents and ask AI questions about their content
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — documents */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <UploadDropZone onUpload={handleUpload} isUploading={uploadMutation.isPending} />

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <DocumentList
                documents={documents}
                selectedId={selectedDocId}
                onSelect={setSelectedDocId}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>

        {/* Right panel — chat */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
          {readyDoc ? (
            <ChatPanel documentId={readyDoc.id} documentTitle={readyDoc.title} />
          ) : selectedDocId && selectedDoc?.status === 'processing' ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto text-amber-500 animate-spin" />
                <p className="mt-4 font-medium text-gray-700 dark:text-gray-300">Processing document...</p>
                <p className="mt-1 text-sm text-gray-500">Extracting text, chunking, and generating embeddings</p>
              </div>
            </div>
          ) : selectedDocId && selectedDoc?.status === 'failed' ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
                <p className="mt-4 font-medium text-gray-700 dark:text-gray-300">Processing failed</p>
                <p className="mt-1 text-sm text-gray-500">{selectedDoc.errorMessage || 'Unknown error'}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="mt-4 text-lg font-medium text-gray-500 dark:text-gray-400">Select a document to start chatting</p>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Upload a PDF, TXT, MD, or DOCX file</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
