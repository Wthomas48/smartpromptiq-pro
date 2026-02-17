import { Server, Socket } from 'socket.io';
import prisma from '../config/database';
import { SocketUser } from './auth';

// ============================================
// COLLABORATIVE DOCUMENT EDITING
// Field-level sync with version counters
// ============================================

// User colors for cursors (assigned round-robin)
const CURSOR_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
];

interface DocumentEditor {
  userId: string;
  userName: string;
  color: string;
  cursor?: { field: string; offset: number };
  selection?: { field: string; start: number; end: number };
  socketId: string;
}

// Active editors per document room: roomName → userId → DocumentEditor
const documentEditors = new Map<string, Map<string, DocumentEditor>>();

function getRoomName(documentType: string, documentId: string): string {
  return `doc:${documentType}:${documentId}`;
}

function assignColor(roomName: string): string {
  const editors = documentEditors.get(roomName);
  const usedColors = editors ? Array.from(editors.values()).map(e => e.color) : [];
  const available = CURSOR_COLORS.filter(c => !usedColors.includes(c));
  return available[0] || CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}

/**
 * Register collaboration event handlers
 */
export function registerCollaborationHandlers(io: Server, socket: Socket) {
  const user = socket.data.user as SocketUser;

  socket.on('join-document', async ({ documentType, documentId, teamId }: {
    documentType: string;
    documentId: string;
    teamId: string;
  }) => {
    if (!documentType || !documentId || !teamId) return;

    // Validate team membership
    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId: user.id },
    });
    if (!membership) {
      socket.emit('error', { message: 'Not a team member' });
      return;
    }

    const roomName = getRoomName(documentType, documentId);
    socket.join(roomName);

    // Track editor
    if (!documentEditors.has(roomName)) {
      documentEditors.set(roomName, new Map());
    }

    const editor: DocumentEditor = {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      color: assignColor(roomName),
      socketId: socket.id,
    };

    documentEditors.get(roomName)!.set(user.id, editor);

    // Notify others
    socket.to(roomName).emit('user-joined-document', {
      documentType,
      documentId,
      userId: user.id,
      userName: editor.userName,
      color: editor.color,
    });

    // Send current collaborators to the joiner
    const collaborators = Array.from(documentEditors.get(roomName)!.values()).map(e => ({
      userId: e.userId,
      userName: e.userName,
      color: e.color,
      cursor: e.cursor,
      selection: e.selection,
    }));

    socket.emit('document-collaborators', {
      documentType,
      documentId,
      collaborators,
    });
  });

  socket.on('leave-document', ({ documentType, documentId }: {
    documentType: string;
    documentId: string;
  }) => {
    if (!documentType || !documentId) return;
    leaveDocument(io, socket, documentType, documentId, user);
  });

  socket.on('document-update', async ({ documentType, documentId, changes, version }: {
    documentType: string;
    documentId: string;
    changes: { field: string; value: string };
    version: number;
  }) => {
    if (!documentType || !documentId || !changes) return;

    const roomName = getRoomName(documentType, documentId);

    // Only handle prompt editing for now
    if (documentType === 'prompt') {
      try {
        // Optimistic concurrency: check version
        const prompt = await prisma.prompt.findUnique({
          where: { id: documentId },
        });

        if (!prompt) {
          socket.emit('error', { message: 'Document not found' });
          return;
        }

        if (prompt.version !== version) {
          // Version conflict
          socket.emit('document-version-conflict', {
            documentType,
            documentId,
            currentVersion: prompt.version,
            latestDocument: {
              title: prompt.title,
              content: prompt.content,
              category: prompt.category,
              version: prompt.version,
            },
          });
          return;
        }

        // Apply update
        const updateData: any = { version: { increment: 1 } };
        if (changes.field === 'title') updateData.title = changes.value;
        else if (changes.field === 'content') updateData.content = changes.value;
        else if (changes.field === 'category') updateData.category = changes.value;

        const updated = await prisma.prompt.update({
          where: { id: documentId },
          data: updateData,
        });

        // Broadcast to others in the room
        socket.to(roomName).emit('document-updated', {
          documentType,
          documentId,
          changes,
          version: updated.version,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        });

        // Confirm to sender with new version
        socket.emit('document-update-ack', {
          documentType,
          documentId,
          version: updated.version,
        });
      } catch (error) {
        console.error('Document update error:', error);
        socket.emit('error', { message: 'Failed to update document' });
      }
    }
  });

  socket.on('cursor-move', ({ documentType, documentId, position }: {
    documentType: string;
    documentId: string;
    position: { field: string; offset: number };
  }) => {
    if (!documentType || !documentId || !position) return;

    const roomName = getRoomName(documentType, documentId);
    const editors = documentEditors.get(roomName);
    const editor = editors?.get(user.id);

    if (editor) {
      editor.cursor = position;
    }

    socket.to(roomName).emit('cursor-moved', {
      documentType,
      documentId,
      userId: user.id,
      userName: editor?.userName || user.email,
      color: editor?.color || CURSOR_COLORS[0],
      position,
    });
  });

  socket.on('selection-change', ({ documentType, documentId, selection }: {
    documentType: string;
    documentId: string;
    selection: { field: string; start: number; end: number };
  }) => {
    if (!documentType || !documentId || !selection) return;

    const roomName = getRoomName(documentType, documentId);
    const editors = documentEditors.get(roomName);
    const editor = editors?.get(user.id);

    if (editor) {
      editor.selection = selection;
    }

    socket.to(roomName).emit('selection-changed', {
      documentType,
      documentId,
      userId: user.id,
      userName: editor?.userName || user.email,
      color: editor?.color || CURSOR_COLORS[0],
      selection,
    });
  });

  // Clean up all document rooms on disconnect
  socket.on('disconnect', () => {
    for (const [roomName, editors] of documentEditors) {
      if (editors.has(user.id) && editors.get(user.id)!.socketId === socket.id) {
        const parts = roomName.split(':');
        if (parts.length >= 3) {
          leaveDocument(io, socket, parts[1], parts.slice(2).join(':'), user);
        }
      }
    }
  });
}

function leaveDocument(io: Server, socket: Socket, documentType: string, documentId: string, user: SocketUser) {
  const roomName = getRoomName(documentType, documentId);
  socket.leave(roomName);

  const editors = documentEditors.get(roomName);
  if (editors) {
    editors.delete(user.id);
    if (editors.size === 0) {
      documentEditors.delete(roomName);
    }
  }

  io.to(roomName).emit('user-left-document', {
    documentType,
    documentId,
    userId: user.id,
  });
}
