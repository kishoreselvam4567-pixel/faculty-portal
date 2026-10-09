import { ConversationMessage, FacultyAuditRecord } from './ai.types';

export interface StoredConversation {
  id: string;
  facultyUid: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: StoredMessage[];
}

export interface StoredMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: any[];
  toolResults?: any[];
  sources?: any[];
  createdAt: Date;
}

class ConversationStore {
  private conversations: Map<string, StoredConversation> = new Map();
  private auditLogs: FacultyAuditRecord[] = [];

  constructor() {
    // Seed initial welcome conversation for default faculty user
    const defaultConvId = 'conv-welcome-01';
    const defaultUid = 'D679ftp5r9QC8zzybJkGAokVZ2d2';

    this.conversations.set(defaultConvId, {
      id: defaultConvId,
      facultyUid: defaultUid,
      title: 'Welcome & Academic Capabilities',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: 'msg-01',
          conversationId: defaultConvId,
          role: 'assistant',
          content:
            'Hello Professor! I am your AI-powered Faculty LMS Assistant. I can help you inspect assigned classes, review student rosters, track period attendance, look up course syllabi, manage daily reminders, and draft academic notices. How may I assist you today?',
          createdAt: new Date(),
        },
      ],
    });
  }

  async getConversations(facultyUid: string) {
    const list: Array<{
      id: string;
      title: string;
      createdAt: string;
      updatedAt: string;
      messageCount: number;
      lastMessageSnippet?: string;
    }> = [];

    for (const c of this.conversations.values()) {
      if (c.facultyUid === facultyUid) {
        const lastMsg = c.messages[c.messages.length - 1];
        list.push({
          id: c.id,
          title: c.title,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          messageCount: c.messages.length,
          lastMessageSnippet: lastMsg ? lastMsg.content.slice(0, 60) : undefined,
        });
      }
    }

    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async createConversation(facultyUid: string, title?: string) {
    const id = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const conv: StoredConversation = {
      id,
      facultyUid,
      title: title || 'New Conversation',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };
    this.conversations.set(id, conv);
    return {
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messageCount: 0,
    };
  }

  async getMessages(conversationId: string, facultyUid: string) {
    const conv = this.conversations.get(conversationId);
    if (!conv || conv.facultyUid !== facultyUid) {
      return [];
    }

    return conv.messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      toolCalls: m.toolCalls,
      toolResults: m.toolResults,
      sources: m.sources,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  async addMessage(
    conversationId: string,
    facultyUid: string,
    message: {
      role: 'user' | 'assistant' | 'system' | 'tool';
      content: string;
      toolCalls?: any[];
      toolResults?: any[];
      sources?: any[];
    }
  ) {
    let conv = this.conversations.get(conversationId);
    if (!conv) {
      conv = {
        id: conversationId,
        facultyUid,
        title: message.content.slice(0, 36) || 'New Conversation',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };
      this.conversations.set(conversationId, conv);
    }

    if (conv.facultyUid !== facultyUid) {
      throw new Error('Unauthorized conversation access');
    }

    const storedMsg: StoredMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversationId,
      role: message.role,
      content: message.content,
      toolCalls: message.toolCalls,
      toolResults: message.toolResults,
      sources: message.sources,
      createdAt: new Date(),
    };

    conv.messages.push(storedMsg);
    conv.updatedAt = new Date();

    return {
      id: storedMsg.id,
      conversationId: storedMsg.conversationId,
      role: storedMsg.role,
      content: storedMsg.content,
      toolCalls: storedMsg.toolCalls,
      toolResults: storedMsg.toolResults,
      sources: storedMsg.sources,
      createdAt: storedMsg.createdAt.toISOString(),
    };
  }

  async renameConversation(conversationId: string, facultyUid: string, newTitle: string) {
    const conv = this.conversations.get(conversationId);
    if (!conv || conv.facultyUid !== facultyUid) {
      throw new Error('Conversation not found');
    }
    conv.title = newTitle.trim();
    conv.updatedAt = new Date();
    return {
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messageCount: conv.messages.length,
    };
  }

  async deleteConversation(conversationId: string, facultyUid: string) {
    const conv = this.conversations.get(conversationId);
    if (!conv || conv.facultyUid !== facultyUid) {
      return false;
    }
    this.conversations.delete(conversationId);
    return true;
  }

  recordAudit(entry: Omit<FacultyAuditRecord, 'id' | 'timestamp'>) {
    this.auditLogs.push({
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
    });
  }

  getAuditLogs(facultyUid: string) {
    return this.auditLogs.filter((a) => a.facultyUid === facultyUid);
  }
}

export const conversationStore = new ConversationStore();
export default conversationStore;
