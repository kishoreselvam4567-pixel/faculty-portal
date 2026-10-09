import { IAIProvider } from './aiProvider.interface';
import { ConversationMessage, ToolDefinition, AIProviderResponse, ToolCallRequest } from '../ai.types';

export class GeminiProvider implements IAIProvider {
  name = 'Google Gemini';
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
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
      throw new Error('Gemini API key is not configured.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    // Convert messages to Gemini contents format
    const contents: any[] = [];
    for (const msg of messages) {
      if (msg.role === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: msg.content }],
        });
      } else if (msg.role === 'assistant') {
        const parts: any[] = [];
        if (msg.content) parts.push({ text: msg.content });
        if (msg.toolCalls) {
          for (const tc of msg.toolCalls) {
            parts.push({
              functionCall: {
                name: tc.name,
                args: tc.arguments,
              },
            });
          }
        }
        contents.push({ role: 'model', parts });
      } else if (msg.role === 'tool') {
        const parts: any[] = [];
        if (msg.toolResults) {
          for (const tr of msg.toolResults) {
            parts.push({
              functionResponse: {
                name: tr.name,
                response: { output: tr.data || tr.error },
              },
            });
          }
        }
        contents.push({ role: 'function', parts });
      }
    }

    // Build tool declarations if provided
    let functionDeclarations: any[] | undefined;
    if (tools && tools.length > 0) {
      functionDeclarations = tools.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: {
          type: 'OBJECT',
          properties: {},
        },
      }));
    }

    const body: any = {
      contents,
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
    };

    if (functionDeclarations && functionDeclarations.length > 0) {
      body.tools = [{ functionDeclarations }];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const candidateParts = candidate?.content?.parts || [];

    let textContent = '';
    const toolCalls: ToolCallRequest[] = [];

    for (const part of candidateParts) {
      if (part.text) {
        textContent += part.text;
      }
      if (part.functionCall) {
        toolCalls.push({
          id: `call-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: part.functionCall.name,
          arguments: part.functionCall.args || {},
        });
      }
    }

    return {
      content: textContent,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      finishReason: candidate?.finishReason,
    };
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    if (!(await this.isAvailable())) {
      // Deterministic fallback embedding generator based on word tokens
      return this.fallbackEmbedding(text);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text }] },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        return json.embedding?.values || this.fallbackEmbedding(text);
      }
    } catch {
      // Fallback on error
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
