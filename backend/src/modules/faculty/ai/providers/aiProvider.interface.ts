import { ConversationMessage, ToolDefinition, AIProviderResponse } from '../ai.types';

export interface IAIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  generateResponse(
    messages: ConversationMessage[],
    tools?: ToolDefinition[],
    systemPrompt?: string
  ): Promise<AIProviderResponse>;
  generateEmbeddings(text: string): Promise<number[]>;
}
