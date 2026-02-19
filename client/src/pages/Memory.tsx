import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import {
  useMemories,
  useAddMemory,
  useUpdateMemory,
  useDeleteMemory,
  useClearMemories,
  UserMemory,
} from '@/hooks/useMemory';
import {
  Brain,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Loader2,
  Tag,
  AlertTriangle,
} from 'lucide-react';

// ============================================
// PERSISTENT MEMORY PAGE
// ============================================

const CATEGORIES = [
  { id: 'general', label: 'General', color: 'bg-slate-100 text-slate-700' },
  { id: 'preference', label: 'Preference', color: 'bg-blue-100 text-blue-700' },
  { id: 'fact', label: 'Fact', color: 'bg-green-100 text-green-700' },
  { id: 'instruction', label: 'Instruction', color: 'bg-amber-100 text-amber-700' },
];

export default function Memory() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Auth guard — redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/signin');
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // State
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const { data, isLoading } = useMemories();
  const addMutation = useAddMemory();
  const updateMutation = useUpdateMemory();
  const deleteMutation = useDeleteMemory();
  const clearMutation = useClearMemories();

  const handleAdd = () => {
    if (!newContent.trim() || newContent.trim().length < 2) {
      toast({ title: 'Too short', description: 'Memory must be at least 2 characters', variant: 'destructive' });
      return;
    }

    addMutation.mutate(
      { content: newContent.trim(), category: newCategory },
      {
        onSuccess: () => {
          setNewContent('');
          toast({ title: 'Memory saved' });
        },
        onError: (error) => {
          toast({ title: 'Failed', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !addMutation.isPending) {
      e.preventDefault();
      handleAdd();
    }
  };

  const startEdit = (memory: UserMemory) => {
    setEditingId(memory.id);
    setEditContent(memory.content);
  };

  const saveEdit = (id: string) => {
    if (!editContent.trim()) return;
    updateMutation.mutate(
      { id, content: editContent.trim() },
      {
        onSuccess: () => {
          setEditingId(null);
          toast({ title: 'Memory updated' });
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Memory deleted' }),
    });
  };

  const handleClearAll = () => {
    clearMutation.mutate(undefined, {
      onSuccess: () => {
        setShowClearConfirm(false);
        toast({ title: 'All memories cleared' });
      },
    });
  };

  const getCategoryStyle = (category: string) => {
    return CATEGORIES.find((c) => c.id === category)?.color || CATEGORIES[0].color;
  };

  const memories = data?.memories || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">
      <section className="py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <BackButton />

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Memory</h2>
            <p className="text-slate-600 text-lg">
              Save preferences and facts so AI remembers you across conversations
            </p>
          </div>

          {/* Add Memory Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                placeholder="e.g. 'I'm a marketing manager' or 'Always respond in bullet points'"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={addMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 placeholder-slate-400 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleAdd}
                disabled={addMutation.isPending || !newContent.trim()}
                className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md"
              >
                {addMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Save
              </button>
            </div>

            {/* Category Selector */}
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              <div className="flex gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setNewCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      newCategory === cat.id
                        ? cat.color + ' ring-1 ring-current/20'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          {data && (
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-sm text-slate-500">
                {data.count} / {data.maxMemories} memories used
              </span>
              {memories.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Clear Confirmation */}
          {showClearConfirm && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-700">Delete all memories? This cannot be undone.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={clearMutation.isPending}
                  className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {clearMutation.isPending ? 'Deleting...' : 'Delete All'}
                </button>
              </div>
            </div>
          )}

          {/* Memories List */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            </div>
          ) : memories.length > 0 ? (
            <div className="space-y-3">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                >
                  {editingId === memory.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(memory.id)}
                        autoFocus
                        className="flex-1 px-3 py-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                      />
                      <button
                        onClick={() => saveEdit(memory.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-slate-800">{memory.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${getCategoryStyle(memory.category)}`}>
                            {memory.category}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(memory.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEdit(memory)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(memory.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100/50 mb-6">
                <Brain className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No memories yet</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Add facts about yourself, preferences, and instructions. AI will use them to personalize responses across all conversations.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {[
                  "I'm a software engineer",
                  'Always use bullet points',
                  'My company is called Acme Inc',
                  'I prefer concise answers',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setNewContent(suggestion)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
