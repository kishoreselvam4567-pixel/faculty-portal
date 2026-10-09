import { IAIProvider } from './providers/aiProvider.interface';
import { GeminiProvider } from './providers/geminiProvider';
import { OpenAIProvider } from './providers/openaiProvider';
import { RuleBasedProvider } from './providers/ruleBasedProvider';
import { ConversationMessage, ToolDefinition, AIProviderResponse } from './ai.types';

export class AIEngine {
  private primaryProvider: IAIProvider | null = null;
  private fallbackProvider: RuleBasedProvider;

  constructor() {
    this.fallbackProvider = new RuleBasedProvider();

    // Configure primary provider based on environment
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
      this.primaryProvider = new GeminiProvider();
    } else if (process.env.OPENAI_API_KEY) {
      this.primaryProvider = new OpenAIProvider();
    } else {
      this.primaryProvider = this.fallbackProvider;
    }
  }

  async getActiveProviderName(): Promise<string> {
    if (this.primaryProvider && (await this.primaryProvider.isAvailable())) {
      return this.primaryProvider.name;
    }
    return this.fallbackProvider.name;
  }

  async generateResponse(
    messages: ConversationMessage[],
    tools?: ToolDefinition[],
    systemPrompt?: string
  ): Promise<AIProviderResponse> {
    if (this.primaryProvider) {
      try {
        if (await this.primaryProvider.isAvailable()) {
          return await this.primaryProvider.generateResponse(messages, tools, systemPrompt);
        }
      } catch (err: any) {
        console.warn(`[AIEngine] Primary provider error (${err.message}). Falling back to deterministic engine.`);
      }
    }

    return await this.fallbackProvider.generateResponse(messages, tools, systemPrompt);
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    if (this.primaryProvider) {
      try {
        if (await this.primaryProvider.isAvailable()) {
          return await this.primaryProvider.generateEmbeddings(text);
        }
      } catch {
        // Fallback
      }
    }
    return await this.fallbackProvider.generateEmbeddings(text);
  }
}

export const aiEngine = new AIEngine();
export default aiEngine;
