import { aiEngine } from './aiEngine';
import { conversationStore } from './conversation.store';
import {
  ConversationMessage,
  ToolDefinition,
  ToolExecutionContext,
  OrchestrationResult,
} from './ai.types';

export class FacultyAIOrchestrator {
  private tools: Map<string, ToolDefinition> = new Map();

  registerTool(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  getRegisteredTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  async processChat(
    context: ToolExecutionContext,
    payload: {
      message: string;
      conversationId?: string;
      actionConfirmation?: {
        toolName: string;
        args: Record<string, any>;
        confirmed: boolean;
      };
    }
  ): Promise<OrchestrationResult> {
    const { facultyUid } = context;
    let conversationId = payload.conversationId;

    if (!conversationId) {
      const conv = await conversationStore.createConversation(
        facultyUid,
        payload.message.slice(0, 36) || 'New Conversation'
      );
      conversationId = conv.id;
    }

    // Handle interactive confirmation flow
    if (payload.actionConfirmation && payload.actionConfirmation.confirmed) {
      const { toolName, args } = payload.actionConfirmation;
      const tool = this.tools.get(toolName);

      if (!tool) {
        throw new Error(`Tool ${toolName} is not registered in Faculty Tool Registry.`);
      }

      // Record audit for user confirmation
      conversationStore.recordAudit({
        facultyUid,
        toolName,
        arguments: args,
        status: 'SUCCESS',
      });

      // Execute tool
      let executionResult: any;
      try {
        executionResult = await tool.execute(args, context);
      } catch (err: any) {
        conversationStore.recordAudit({
          facultyUid,
          toolName,
          arguments: args,
          status: 'FAILED',
          error: err.message,
        });
        throw err;
      }

      const confirmedMsg = await conversationStore.addMessage(conversationId, facultyUid, {
        role: 'assistant',
        content: `✅ **Action Confirmed & Executed Successfully:** ${tool.displayName}\n\n` +
          (typeof executionResult === 'string' ? executionResult : '```json\n' + JSON.stringify(executionResult, null, 2) + '\n```'),
        toolCalls: [
          {
            id: `call-confirmed-${Date.now()}`,
            name: tool.name,
            displayName: tool.displayName,
            args,
            status: 'success',
            result: executionResult,
          },
        ],
      });

      return {
        conversationId,
        message: confirmedMsg as any,
        requiresConfirmation: false,
      };
    }

    // Persist incoming user message
    await conversationStore.addMessage(conversationId, facultyUid, {
      role: 'user',
      content: payload.message,
    });

    // Fetch conversation context history (last 10 messages)
    const history = await conversationStore.getMessages(conversationId, facultyUid);
    const messages: ConversationMessage[] = history.slice(-10).map((h) => ({
      role: h.role,
      content: h.content,
      toolCalls: h.toolCalls,
      toolResults: h.toolResults,
      sources: h.sources,
    }));

    const systemPrompt = `You are the Aura Academia Faculty AI Assistant, an authoritative, production-grade intelligence layer integrated into the College LMS Faculty Portal.
You have access to real faculty databases, course catalogs, student rosters, period attendance, academic tasks, and syllabus documents.
Always ground your answers in authorized institutional records. Do not invent marks, student IDs, or attendance figures.
When executing sensitive actions such as sending emails or deleting tasks, flag them for confirmation.
Always be concise, professional, supportive, and format answers using structured markdown, bullet points, and tables.`;

    // Execute first inference pass with AI Engine
    const providerResponse = await aiEngine.generateResponse(
      messages,
      this.getRegisteredTools(),
      systemPrompt
    );

    const executedTools: any[] = [];
    let requiresConfirmation = false;
    let sources: any[] = [];

    // If provider invoked tool calls
    if (providerResponse.toolCalls && providerResponse.toolCalls.length > 0) {
      for (const call of providerResponse.toolCalls) {
        const tool = this.tools.get(call.name);
        if (!tool) {
          executedTools.push({
            id: call.id,
            name: call.name,
            displayName: call.name,
            args: call.arguments,
            status: 'failed',
            error: `Unrecognized tool: ${call.name}`,
          });
          continue;
        }

        // Validate arguments using Zod
        const parseResult = tool.parameters.safeParse(call.arguments);
        if (!parseResult.success) {
          executedTools.push({
            id: call.id,
            name: tool.name,
            displayName: tool.displayName,
            args: call.arguments,
            status: 'failed',
            error: `Invalid tool parameters: ${parseResult.error.message}`,
          });
          continue;
        }

        // Check if tool requires user confirmation
        if (tool.requiresConfirmation) {
          requiresConfirmation = true;
          const prompt = tool.confirmationMessage
            ? tool.confirmationMessage(parseResult.data)
            : `Please confirm execution of ${tool.displayName}.`;

          conversationStore.recordAudit({
            facultyUid,
            toolName: tool.name,
            arguments: parseResult.data,
            status: 'CONFIRMATION_PENDING',
          });

          executedTools.push({
            id: call.id,
            name: tool.name,
            displayName: tool.displayName,
            args: parseResult.data,
            status: 'requires_confirmation',
            confirmationPrompt: prompt,
          });
          continue;
        }

        // Execute permitted tool
        try {
          const result = await tool.execute(parseResult.data, context);
          conversationStore.recordAudit({
            facultyUid,
            toolName: tool.name,
            arguments: parseResult.data,
            status: 'SUCCESS',
          });

          executedTools.push({
            id: call.id,
            name: tool.name,
            displayName: tool.displayName,
            args: parseResult.data,
            status: 'success',
            result,
          });

          // If tool was RAG search, extract citations
          if (tool.name === 'search_knowledge_base' && result?.results) {
            sources = result.results;
          }
        } catch (execErr: any) {
          conversationStore.recordAudit({
            facultyUid,
            toolName: tool.name,
            arguments: parseResult.data,
            status: 'FAILED',
            error: execErr.message,
          });

          executedTools.push({
            id: call.id,
            name: tool.name,
            displayName: tool.displayName,
            args: parseResult.data,
            status: 'failed',
            error: execErr.message,
          });
        }
      }

      // Second synthesis pass with tool execution results
      const toolResultsMessages: ConversationMessage[] = [
        ...messages,
        {
          role: 'tool',
          content: 'Tool execution completed.',
          toolResults: executedTools.map((t) => ({
            toolCallId: t.id,
            name: t.name,
            status: t.status,
            data: t.result,
            error: t.error,
          })),
        },
      ];

      const synthesisResponse = await aiEngine.generateResponse(
        toolResultsMessages,
        undefined,
        systemPrompt
      );

      const assistantMsg = await conversationStore.addMessage(conversationId, facultyUid, {
        role: 'assistant',
        content: synthesisResponse.content,
        toolCalls: executedTools,
        sources: sources.length > 0 ? sources : undefined,
      });

      return {
        conversationId,
        message: assistantMsg as any,
        requiresConfirmation,
      };
    }

    // Direct text response without tool execution
    const directAssistantMsg = await conversationStore.addMessage(conversationId, facultyUid, {
      role: 'assistant',
      content: providerResponse.content,
      sources: providerResponse.sources,
    });

    return {
      conversationId,
      message: directAssistantMsg as any,
      requiresConfirmation: false,
    };
  }
}

export const facultyOrchestrator = new FacultyAIOrchestrator();

// Register all modular faculty tools
import('../tools/toolRegistry').then(({ registerAllFacultyTools }) => {
  registerAllFacultyTools(facultyOrchestrator);
}).catch(() => {});

export default facultyOrchestrator;
