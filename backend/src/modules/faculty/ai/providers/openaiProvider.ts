import { IAIProvider } from './aiProvider.interface';
import { ConversationMessage, ToolDefinition, AIProviderResponse, ToolCallRequest } from '../ai.types';

export class OpenAIProvider implements IAIProvider {
  name = 'OpenAI Compatible';
  private apiKey: string;
  private baseUrl: string;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    this.modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey && this.apiKey.length > 5 && !this.apiKey.includes('your-');
  }

  async generateResponse(
    messages: ConversationMessage[],
    tools?: ToolDefinition[],
    systemPrompt?: string
  ): Promise<AIProviderResponse> {
    if (!(await this.isAvailable())) {
      throw new Error('OpenAI API key is not configured.');
    }

    const formattedMessages: any[] = [];
    if (systemPrompt) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of messages) {
      formattedMessages.push({
        role: msg.role === 'tool' ? 'tool' : msg.role,
        content: msg.content,
      });
    }

    const openAiTools = tools?.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: { type: 'object', properties: {} },
      },
    }));

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: formattedMessages,
        tools: openAiTools && openAiTools.length > 0 ? openAiTools : undefined,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;

    const toolCalls: ToolCallRequest[] = [];
    if (choice?.tool_calls) {
      for (const tc of choice.tool_calls) {
        let args = {};
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {
          args = {};
        }
        toolCalls.push({
          id: tc.id,
          name: tc.function.name,
          arguments: args,
        });
      }
    }

    return {
      content: choice?.content || '',
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      finishReason: data.choices?.[0]?.finish_reason,
    };
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    if (!(await this.isAvailable())) {
      return this.fallbackEmbedding(text);
    }

    try {
      const res = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        return json.data?.[0]?.embedding || this.fallbackEmbedding(text);
      }
    } catch {
      // Fallback
    }

    return this.fallbackEmbedding(text);
  }

  private fallbackEmbedding(text: string): number[] {
    const dim = 64;
    const vec = new Array(dim).fill(0);
    const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
    for (let i = 0; i < tokens.length; i++) {
      const word = tokens[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j);
        hash |= 0;
      }
      const idx = Math.abs(hash) % dim;
      vec[idx] += 1;
    }
    const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vec.map((v) => v / mag);
  }
}
