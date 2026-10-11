export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionType =
  | 'technical_theory'
  | 'practical_coding'
  | 'system_design'
  | 'behavioral'
  | 'project_deepdive';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface ExtractedTopic {
  id: string;
  name: string;
  category: 'languages' | 'frameworks' | 'databases' | 'concepts' | 'projects' | 'tools' | 'experience';
  summary: string;
  evidence: string;
  projectReference?: string;
  evidenceStrength: 'high' | 'medium' | 'low';
  isAmbiguous?: boolean;
  source?: 'resume' | 'jd' | 'matched';
  jdRelevance?: 'required' | 'preferred';
}

export interface ResumeData {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  fullName?: string;
  email?: string;
  summary?: string;
  education: Array<{
    school: string;
    degree: string;
    year?: string;
  }>;
  skills: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    tools: string[];
    coreConcepts: string[];
  };
  projects: Array<{
    title: string;
    techStack: string[];
    description: string;
  }>;
  experience: Array<{
    role: string;
    company: string;
    duration?: string;
    highlights: string[];
  }>;
  topics: ExtractedTopic[];
}

export interface JobDescriptionData {
  id: string;
  jobTitle: string;
  company?: string;
  rawText: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  matchingSkills: string[];
  missingSkills: string[];
  recommendedFocus: string[];
  extractedTopics?: ExtractedTopic[];
  uploadedAt: string;
}

export interface RubricWeights {
  technicalCorrectness: number;
  clarityAndStructure: number;
  practicalDepth: number;
  reasoningAndTradeoffs: number;
}

export interface Question {
  id: string;
  text: string;
  topic: string;
  difficulty: Difficulty;
  type: QuestionType;
  expectedCompetencies: string[];
  evaluationRubric: RubricWeights;
  followUpQuestion?: string;
}

export interface AnswerEvaluation {
  score: number;
  rubricBreakdown: {
    technicalCorrectness: number;
    clarityAndStructure: number;
    practicalDepth: number;
    reasoningAndTradeoffs: number;
  };
  strengths: string[];
  weaknesses: string[];
  modelAnswer: string;
  improvedAnswer: string;
  topicSpecificFeedback: string;
  reviewedAt: string;
}

export interface SubmittedAnswer {
  questionId: string;
  userAnswer: string;
  audioUsed: boolean;
  submittedAt: string;
  evaluation?: AnswerEvaluation;
}

export interface FinalReport {
  averageScore: number;
  totalQuestions: number;
  attemptedQuestions: number;
  unansweredQuestions: number;
  difficultyScores: {
    easyAvg: number;
    mediumAvg: number;
    hardAvg: number;
  };
  topicPerformance: Array<{
    topic: string;
    avgScore: number;
    count: number;
    status: 'Strong' | 'Average' | 'Needs Work';
  }>;
  strongestAreas: string[];
  improvementAreas: string[];
  recurringMistakes: string[];
  recommendedRevision: string[];
  suggestedNextSession: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  title: string;
  type: 'topic' | 'overall';
  selectedTopics: string[];
  questions: Question[];
  answers: Record<string, SubmittedAnswer>;
  status: 'in_progress' | 'completed';
  finalReport?: FinalReport;
  createdAt: string;
  completedAt?: string;
}

export interface AnalyticsSummary {
  totalInterviews: number;
  totalQuestionsAttempted: number;
  overallAverageScore: number;
  recentScores: Array<{ date: string; score: number; title: string }>;
  topicProficiency: Array<{ topic: string; score: number; questionsAnswered: number }>;
  difficultyPerformance: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
}

export interface FeedbackSubmission {
  id: string;
  userId: string;
  userEmail: string;
  category: 'interview_quality' | 'bug_report' | 'feature_request' | 'general';
  rating: number;
  message: string;
  createdAt: string;
}
