import type {
  User,
  ResumeData,
  JobDescriptionData,
  Question,
  InterviewSession,
  AnswerEvaluation,
  FinalReport,
  AnalyticsSummary,
  FeedbackSubmission,
} from '../types/index.ts';

const TOKEN_KEY = 'intervue_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Network request failed');
    }

    return data as T;
  },

  // Auth
  async register(email: string, password: string, name?: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(res.token);
    return res;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/auth/me');
  },

  async logout(): Promise<void> {
    this.clearToken();
  },

  // Resume
  async getResume(): Promise<{ resume: ResumeData | null }> {
    return this.request<{ resume: ResumeData | null }>('/api/resume');
  },

  async uploadResume(payload: {
    rawText?: string;
    fileBase64?: string;
    mimeType?: string;
    fileName: string;
    fileSize: number;
  }): Promise<{ resume: ResumeData }> {
    return this.request<{ resume: ResumeData }>('/api/resume/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async loadDemoResume(): Promise<{ resume: ResumeData }> {
    return this.request<{ resume: ResumeData }>('/api/resume/demo-sample', {
      method: 'POST',
    });
  },

  async deleteResume(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/resume', {
      method: 'DELETE',
    });
  },

  // Job Description
  async getJobDescription(): Promise<{ jd: JobDescriptionData | null }> {
    return this.request<{ jd: JobDescriptionData | null }>('/api/jd');
  },

  async analyzeJobDescription(jdText: string): Promise<{ jd: JobDescriptionData }> {
    return this.request<{ jd: JobDescriptionData }>('/api/jd/analyze', {
      method: 'POST',
      body: JSON.stringify({ jdText }),
    });
  },

  async deleteJobDescription(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/jd', {
      method: 'DELETE',
    });
  },

  // Question Generation & Interview Sessions
  async generateQuestions(payload: {
    type: 'topic' | 'overall';
    selectedTopicNames: string[];
    questionCount?: number;
  }): Promise<{ questions: Question[] }> {
    return this.request<{ questions: Question[] }>('/api/interviews/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async startInterview(payload: {
    title?: string;
    type: 'topic' | 'overall';
    selectedTopics: string[];
    questions: Question[];
  }): Promise<{ session: InterviewSession }> {
    return this.request<{ session: InterviewSession }>('/api/interviews/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getInterviews(): Promise<{ sessions: InterviewSession[] }> {
    return this.request<{ sessions: InterviewSession[] }>('/api/interviews');
  },

  async getInterview(id: string): Promise<{ session: InterviewSession }> {
    return this.request<{ session: InterviewSession }>(`/api/interviews/${id}`);
  },

  async deleteInterview(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/interviews/${id}`, {
      method: 'DELETE',
    });
  },

  async submitAnswer(
    sessionId: string,
    payload: {
      questionId: string;
      userAnswer: string;
      audioUsed: boolean;
    }
  ): Promise<{ session: InterviewSession; evaluation: AnswerEvaluation }> {
    return this.request<{ session: InterviewSession; evaluation: AnswerEvaluation }>(
      `/api/interviews/${sessionId}/submit-answer`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async completeInterview(sessionId: string): Promise<{ session: InterviewSession; finalReport: FinalReport }> {
    return this.request<{ session: InterviewSession; finalReport: FinalReport }>(
      `/api/interviews/${sessionId}/complete`,
      {
        method: 'POST',
      }
    );
  },

  // Audio TTS & Transcription
  async requestTTS(text: string): Promise<{ audioBase64: string | null }> {
    return this.request<{ audioBase64: string | null }>('/api/audio/tts', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async transcribeAudio(audioBase64: string, mimeType: string): Promise<{ text: string }> {
    return this.request<{ text: string }>('/api/audio/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audioBase64, mimeType }),
    });
  },

  // Analytics & History
  async getAnalytics(): Promise<{ analytics: AnalyticsSummary }> {
    return this.request<{ analytics: AnalyticsSummary }>('/api/analytics');
  },

  async getHistory(): Promise<{ history: InterviewSession[] }> {
    return this.request<{ history: InterviewSession[] }>('/api/history');
  },

  // Feedback
  async submitFeedback(payload: {
    category: string;
    rating: number;
    message: string;
  }): Promise<{ message: string; feedback: FeedbackSubmission }> {
    return this.request<{ message: string; feedback: FeedbackSubmission }>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
