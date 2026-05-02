interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

interface ChatResponse {
  response: string;
  error?: string;
}

export class OpenAIService {
  private apiKey: string;
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly RATE_LIMIT = 10; // requests per hour
  private readonly RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const userData = this.requestCounts.get(clientId);

    if (!userData || now > userData.resetTime) {
      this.requestCounts.set(clientId, { count: 1, resetTime: now + this.RATE_LIMIT_WINDOW });
      return true;
    }

    if (userData.count >= this.RATE_LIMIT) {
      return false;
    }

    userData.count++;
    return true;
  }

  async chat(request: ChatRequest, clientId: string = 'default'): Promise<ChatResponse> {
    if (!this.checkRateLimit(clientId)) {
      return {
        response: '',
        error: 'Rate limit exceeded. Please try again later.',
      };
    }

    try {
      const messages: ChatMessage[] = [
        {
          role: 'user' as const,
          content: `You are a PE/VC portfolio analyst assistant. You have read-only access to portfolio data and can provide insights about fund performance, investment analysis, and portfolio metrics. 

User question: ${request.message}

Please provide a helpful, professional response about portfolio management, investment analysis, or fund performance. Keep responses concise and actionable.`
        }
      ];

      if (request.history) {
        messages.unshift(...request.history);
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        response: data.choices[0]?.message?.content || 'No response generated.',
      };

    } catch (error) {
      return {
        response: '',
        error: error instanceof Error ? error.message : 'Failed to generate response',
      };
    }
  }
}
