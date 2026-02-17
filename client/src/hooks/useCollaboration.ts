import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { useSocketContext } from './useSocket';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// ============================================
// COLLABORATIVE EDITING HOOK
// Field-level sync with cursor awareness
// ============================================

export interface Collaborator {
  userId: string;
  userName: string;
  color: string;
  cursor?: { field: string; offset: number };
  selection?: { field: string; start: number; end: number };
}

interface UseCollaborationParams {
  documentType: string;
  documentId: string | null | undefined;
  teamId: string | null | undefined;
}

export function useCollaboration({ documentType, documentId, teamId }: UseCollaborationParams) {
  const { isConnected } = useSocketContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [documentVersion, setDocumentVersion] = useState<number>(1);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!documentId || !teamId || !isConnected) {
      setCollaborators([]);
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    // Join document room
    socket.emit('join-document', { documentType, documentId, teamId });

    const onCollaborators = ({ collaborators: collabs }: { collaborators: Collaborator[] }) => {
      setCollaborators(collabs);
    };

    const onUserJoined = ({ userId, userName, color }: { userId: string; userName: string; color: string }) => {
      setCollaborators(prev => {
        if (prev.some(c => c.userId === userId)) return prev;
        return [...prev, { userId, userName, color }];
      });
    };

    const onUserLeft = ({ userId }: { userId: string }) => {
      setCollaborators(prev => prev.filter(c => c.userId !== userId));
    };

    const onDocumentUpdated = ({ changes, version, userId, userName }: {
      changes: { field: string; value: string };
      version: number;
      userId: string;
      userName: string;
    }) => {
      setDocumentVersion(version);

      // Update TanStack Query cache for prompts
      if (documentType === 'prompt') {
        queryClient.setQueryData(['team-prompts', teamId], (old: any) => {
          if (!old?.data?.prompts) return old;
          return {
            ...old,
            data: {
              ...old.data,
              prompts: old.data.prompts.map((p: any) =>
                p.id === documentId
                  ? { ...p, [changes.field]: changes.value, version }
                  : p
              ),
            },
          };
        });
      }
    };

    const onVersionConflict = ({ currentVersion, latestDocument }: {
      currentVersion: number;
      latestDocument: any;
    }) => {
      setDocumentVersion(currentVersion);
      toast({
        title: 'Content updated',
        description: 'Another team member made changes. Your view has been refreshed.',
      });

      // Update cache with latest
      if (documentType === 'prompt') {
        queryClient.invalidateQueries({ queryKey: ['team-prompts', teamId] });
      }
    };

    const onUpdateAck = ({ version }: { version: number }) => {
      setDocumentVersion(version);
    };

    const onCursorMoved = ({ userId, position, color, userName }: any) => {
      setCollaborators(prev =>
        prev.map(c =>
          c.userId === userId ? { ...c, cursor: position, color, userName } : c
        )
      );
    };

    const onSelectionChanged = ({ userId, selection, color, userName }: any) => {
      setCollaborators(prev =>
        prev.map(c =>
          c.userId === userId ? { ...c, selection, color, userName } : c
        )
      );
    };

    socket.on('document-collaborators', onCollaborators);
    socket.on('user-joined-document', onUserJoined);
    socket.on('user-left-document', onUserLeft);
    socket.on('document-updated', onDocumentUpdated);
    socket.on('document-version-conflict', onVersionConflict);
    socket.on('document-update-ack', onUpdateAck);
    socket.on('cursor-moved', onCursorMoved);
    socket.on('selection-changed', onSelectionChanged);

    return () => {
      socket.emit('leave-document', { documentType, documentId });
      socket.off('document-collaborators', onCollaborators);
      socket.off('user-joined-document', onUserJoined);
      socket.off('user-left-document', onUserLeft);
      socket.off('document-updated', onDocumentUpdated);
      socket.off('document-version-conflict', onVersionConflict);
      socket.off('document-update-ack', onUpdateAck);
      socket.off('cursor-moved', onCursorMoved);
      socket.off('selection-changed', onSelectionChanged);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [documentType, documentId, teamId, isConnected, queryClient, toast]);

  const sendUpdate = useCallback((field: string, value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const socket = getSocket();
      if (socket?.connected && documentId) {
        socket.emit('document-update', {
          documentType,
          documentId,
          changes: { field, value },
          version: documentVersion,
        });
      }
    }, 300);
  }, [documentType, documentId, documentVersion]);

  const sendCursorMove = useCallback((field: string, offset: number) => {
    const socket = getSocket();
    if (socket?.connected && documentId) {
      socket.emit('cursor-move', {
        documentType,
        documentId,
        position: { field, offset },
      });
    }
  }, [documentType, documentId]);

  return {
    collaborators,
    documentVersion,
    sendUpdate,
    sendCursorMove,
    setDocumentVersion,
  };
}
