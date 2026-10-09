import { Request, Response } from 'express';
import { facultyOrchestrator } from './aiOrchestrator';
import { conversationStore } from './conversation.store';
import { taskAndEmailStore } from '../tools/task.store';
import { ragKnowledgeEngine } from '../rag/ragEngine';
import { ToolExecutionContext } from './ai.types';

export class AssistantController {
  // POST /api/faculty/assistant/chat
  chat = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: 'Unauthorized: Missing authenticated faculty context' });
        return;
      }

      const { message, conversationId, actionConfirmation } = req.body;
      if (!message && !actionConfirmation) {
        res.status(400).json({ error: 'Request body must contain message or actionConfirmation' });
        return;
      }

      const context: ToolExecutionContext = {
        facultyUid: user.uid,
        email: user.email,
        role: user.role || 'FACULTY',
        departmentId: user.department_id || undefined,
        collegeId: user.college_id || undefined,
        displayName: user.display_name || undefined,
        assignedClassIds: [],
        isClassIncharge: false,
      };

      const result = await facultyOrchestrator.processChat(context, {
        message: message || '',
        conversationId,
        actionConfirmation,
      });

      res.json(result);
    } catch (error: any) {
      console.error('Assistant chat error:', error);
      res.status(500).json({
        error: error.message || 'AI Assistant encountered an unexpected error processing your request.',
      });
    }
  };

  // GET /api/faculty/assistant/conversations
  getConversations = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = req.user?.uid;
      if (!facultyUid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const conversations = await conversationStore.getConversations(facultyUid);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // POST /api/faculty/assistant/conversations
  createConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = req.user?.uid;
      if (!facultyUid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const { title } = req.body;
      const conv = await conversationStore.createConversation(facultyUid, title);
      res.status(201).json(conv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // GET /api/faculty/assistant/conversations/:id/messages
  getConversationMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = req.user?.uid;
      const conversationId = req.params.id as string;
      if (!facultyUid || !conversationId) {
        res.status(400).json({ error: 'Missing conversation parameters' });
        return;
      }
      const messages = await conversationStore.getMessages(conversationId, facultyUid);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // PATCH /api/faculty/assistant/conversations/:id
  renameConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = req.user?.uid;
      const conversationId = req.params.id as string;
      const { title } = req.body;
      if (!facultyUid || !conversationId || !title) {
        res.status(400).json({ error: 'Missing title or conversationId' });
        return;
      }
      const updated = await conversationStore.renameConversation(conversationId, facultyUid, title);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // DELETE /api/faculty/assistant/conversations/:id
  deleteConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = req.user?.uid;
      const conversationId = req.params.id as string;
      if (!facultyUid || !conversationId) {
        res.status(400).json({ error: 'Missing parameters' });
        return;
      }
      const success = await conversationStore.deleteConversation(conversationId, facultyUid);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // GET /api/faculty/assistant/tools
  getTools = async (_req: Request, res: Response): Promise<void> => {
    try {
      const tools = facultyOrchestrator.getRegisteredTools().map((t) => ({
        name: t.name,
        displayName: t.displayName,
        description: t.description,
        requiresConfirmation: !!t.requiresConfirmation,
      }));
      res.json(tools);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Tasks Management
  getTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = req.user?.uid;
      if (!facultyUid) return;
      const tasks = taskAndEmailStore.getTasks(facultyUid);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = req.user?.uid;
      if (!facultyUid) return;
      const task = taskAndEmailStore.createTask(facultyUid, req.body);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = req.user?.uid;
      const taskId = req.params.id as string;
      if (!facultyUid || !taskId) return;
      const updated = taskAndEmailStore.updateTask(taskId, facultyUid, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = req.user?.uid;
      const taskId = req.params.id as string;
      if (!facultyUid || !taskId) return;
      const deleted = taskAndEmailStore.deleteTask(taskId, facultyUid);
      res.json({ success: deleted });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Email Drafts & Sending
  getEmailDrafts = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = req.user?.uid;
      if (!facultyUid) return;
      const drafts = taskAndEmailStore.getEmailDrafts(facultyUid);
      res.json(drafts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  createEmailDraft = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = req.user?.uid;
      if (!facultyUid) return;
      const draft = taskAndEmailStore.createEmailDraft(facultyUid, req.body);
      res.status(201).json(draft);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  sendEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = req.user?.uid;
      if (!facultyUid) return;
      const { draftId, recipients, subject, body } = req.body;
      const result = taskAndEmailStore.sendEmail(draftId, facultyUid, {
        recipients,
        subject,
        body,
      });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Knowledge Search (RAG)
  searchKnowledge = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = (req.query.q as string) || '';
      const departmentId = req.user?.department_id;
      const results = await ragKnowledgeEngine.search(query, departmentId);
      res.json({ query, count: results.length, results });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Notifications
  getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = req.user?.uid;
      if (!facultyUid) return;

      const tasks = taskAndEmailStore.getTasks(facultyUid);
      const highPriorityTasks = tasks.filter((t) => t.priority === 'HIGH' || t.priority === 'URGENT');

      const notifications = [
        ...highPriorityTasks.map((t) => ({
          id: `notif-${t.id}`,
          title: `Action Required: ${t.title}`,
          type: 'TASK_REMINDER',
          priority: t.priority,
          timestamp: t.createdAt,
        })),
        {
          id: 'notif-att-01',
          title: 'Period attendance due for B.Sc AI & ML (Term 5)',
          type: 'ATTENDANCE_PENDING',
          priority: 'MEDIUM',
          timestamp: new Date(),
        },
        {
          id: 'notif-ann-01',
          title: 'Institutional Academic Council Meeting scheduled for Friday at 3:00 PM',
          type: 'ACADEMIC_ANNOUNCEMENT',
          priority: 'INFO',
          timestamp: new Date(Date.now() - 3600000),
        },
      ];

      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}

export const assistantController = new AssistantController();
export default assistantController;
