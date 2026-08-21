// Client Service for AI Content Studio
// Communicates with backend endpoints to trigger batch AI generation, validation & live publishing

export interface AIGenerateRequest {
  gameType: 'four_pics' | 'quiz' | 'menteur' | 'draw_and_guess' | 'qui_suis_je' | 'charades';
  category: string;
  difficulty?: number | string;
  count: number;
  mode?: string;
  language?: string;
}

export interface AIStudioItem {
  id: string;
  word?: string;
  question?: string;
  target?: string;
  theme?: string;
  category: string;
  difficulty?: number | string;
  hint?: string;
  options?: string[];
  correctIndex?: number;
  statements?: string[];
  lieIndex?: number;
  validationScore?: number;
  status: 'validated' | 'rejected';
  rejectionReason?: string | null;
  imageDescriptions?: string[];
}

export interface AIGenerateResponse {
  success: boolean;
  totalRequested: number;
  validatedCount: number;
  rejectedCount: number;
  validated: AIStudioItem[];
  rejected: AIStudioItem[];
  questions?: AIStudioItem[];
  challenges?: AIStudioItem[];
  prompts?: AIStudioItem[];
  characters?: AIStudioItem[];
  charades?: AIStudioItem[];
}

class AIContentStudioService {
  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:3001';
  }

  async checkStatus(): Promise<{ configured: boolean; stats: any }> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/ai/status`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[AI Studio] Status fetch failed:', e);
    }
    return { configured: false, stats: {} };
  }

  async updateApiKey(apiKey: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/ai/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      return data.success;
    } catch (e) {
      console.error('[AI Studio] Update key error:', e);
      return false;
    }
  }

  async generateContent(params: AIGenerateRequest): Promise<AIGenerateResponse> {
    const res = await fetch(`${this.getBaseUrl()}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
      throw new Error(err.error || `Erreur HTTP ${res.status}`);
    }

    return await res.json();
  }

  async publishValidatedItems(gameType: string, items: AIStudioItem[]): Promise<{ success: boolean; publishedCount: number }> {
    const res = await fetch(`${this.getBaseUrl()}/api/ai/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameType, items }),
    });

    return await res.json();
  }
}

export const aiStudioService = new AIContentStudioService();
