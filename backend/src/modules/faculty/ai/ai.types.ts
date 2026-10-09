import { z } from 'zod';

export type FacultyIntent =
  | 'PROFILE_QUERY'
  | 'DASHBOARD_STATS'
  | 'CLASSES_QUERY'
  | 'STUDENTS_QUERY'
  | 'SUBJECTS_QUERY'
  | 'ATTENDANCE_QUERY'
  | 'ATTENDANCE_SUMMARY'
  | 'TASKS_QUERY'
  | 'TASK_CREATE'
  | 'TASK_UPDATE'
  | 'TASK_DELETE'
  | 'CALENDAR_QUERY'
  | 'TIMETABLE_TODAY'
  | 'EMAIL_DRAFT'
  | 'EMAIL_SEND'
  | 'KNOWLEDGE_RAG_QUERY'
  | 'GENERAL_ACADEMIC_CHAT';

export interface ConversationMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: ToolCallRequest[];
  toolResults?: ToolExecutionResult[];
  sources?: KnowledgeCitation[];
  createdAt?: string;
}

export interface ToolCallRequest {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface ToolExecutionResult {
  toolCallId: string;
  name: string;
  status: 'success' | 'failed' | 'requires_confirmation';
  data?: any;
  error?: string;
  confirmationPrompt?: string;
}

export interface KnowledgeCitation {
  id: string;
  title: string;
  documentName: string;
  category: string;
  snippet: string;
  score?: number;
}

export interface ToolExecutionContext {
  facultyUid: string;
  email: string;
  role: string;
  departmentId?: string;
  collegeId?: string;
  displayName?: string;
  assignedClassIds: string[];
  isClassIncharge: boolean;
}

export interface ToolDefinition {
  name: string;
  displayName: string;
  description: string;
  parameters: z.ZodObject<any>;
  requiresConfirmation?: boolean;
  confirmationMessage?: (args: any) => string;
  execute: (args: any, context: ToolExecutionContext) => Promise<any>;
}

export interface AIProviderResponse {
  content: string;
  toolCalls?: ToolCallRequest[];
  sources?: KnowledgeCitation[];
  finishReason?: string;
}

export interface OrchestrationResult {
  conversationId: string;
  message: {
    id: string;
    conversationId: string;
    role: 'assistant';
    content: string;
    toolCalls?: Array<{
      id: string;
      name: string;
      displayName: string;
      args: Record<string, any>;
      status: 'pending' | 'success' | 'failed' | 'requires_confirmation';
      result?: any;
      error?: string;
      confirmationPrompt?: string;
    }>;
    sources?: KnowledgeCitation[];
    createdAt: string;
  };
  requiresConfirmation?: boolean;
}

export interface FacultyAuditRecord {
  id: string;
  facultyUid: string;
  toolName: string;
  arguments: Record<string, any>;
  status: 'SUCCESS' | 'FAILED' | 'REJECTED' | 'CONFIRMATION_PENDING';
  error?: string;
  timestamp: Date;
}
