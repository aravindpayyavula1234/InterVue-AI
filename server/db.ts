import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  User,
  ResumeData,
  JobDescriptionData,
  InterviewSession,
  FeedbackSubmission,
  AnalyticsSummary,
} from '../src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.resolve(DATA_DIR, 'intervue_db.json');

export interface StoredUser extends User {
  passwordHash: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  resumes: (ResumeData & { userId: string })[];
  jobDescriptions: (JobDescriptionData & { userId: string; resumeId?: string })[];
  interviews: InterviewSession[];
  feedback: FeedbackSubmission[];
}

const defaultDb: DatabaseSchema = {
  users: [],
  resumes: [],
  jobDescriptions: [],
  interviews: [],
  feedback: [],
};

// Ensure data folder and file exist
function initDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (error) {
    console.error('Failed to initialize database, using in-memory state:', error);
    return defaultDb;
  }
}

let dbMemory = initDb();

function saveDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbMemory, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to persist database to file:', error);
  }
}

export const db = {
  // Users
  getUserByEmail(email: string): StoredUser | undefined {
    return dbMemory.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserById(id: string): StoredUser | undefined {
    return dbMemory.users.find((u) => u.id === id);
  },

  createUser(user: StoredUser): StoredUser {
    dbMemory.users.push(user);
    saveDb();
    return user;
  },

  // Resumes
  getResumeByUserId(userId: string): ResumeData | undefined {
    const found = dbMemory.resumes.find((r) => r.userId === userId);
    return found;
  },

  saveResume(userId: string, resume: ResumeData): ResumeData {
    // Remove existing for this user
    dbMemory.resumes = dbMemory.resumes.filter((r) => r.userId !== userId);
    const stored = { ...resume, userId };
    dbMemory.resumes.push(stored);
    saveDb();
    return resume;
  },

  deleteResume(userId: string): boolean {
    const beforeCount = dbMemory.resumes.length;
    dbMemory.resumes = dbMemory.resumes.filter((r) => r.userId !== userId);
    dbMemory.jobDescriptions = dbMemory.jobDescriptions.filter((jd) => jd.userId !== userId);
    saveDb();
    return dbMemory.resumes.length < beforeCount;
  },

  // Job Descriptions
  getJobDescriptionByUserId(userId: string): JobDescriptionData | undefined {
    return dbMemory.jobDescriptions.find((jd) => jd.userId === userId);
  },

  saveJobDescription(userId: string, jd: JobDescriptionData): JobDescriptionData {
    dbMemory.jobDescriptions = dbMemory.jobDescriptions.filter((item) => item.userId !== userId);
    dbMemory.jobDescriptions.push({ ...jd, userId });
    saveDb();
    return jd;
  },

  deleteJobDescription(userId: string): boolean {
    const beforeCount = dbMemory.jobDescriptions.length;
    dbMemory.jobDescriptions = dbMemory.jobDescriptions.filter((jd) => jd.userId !== userId);
    saveDb();
    return dbMemory.jobDescriptions.length < beforeCount;
  },

  // Interviews
  getInterviewsByUserId(userId: string): InterviewSession[] {
    return dbMemory.interviews
      .filter((i) => i.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getInterviewById(id: string, userId: string): InterviewSession | undefined {
    return dbMemory.interviews.find((i) => i.id === id && i.userId === userId);
  },

  saveInterview(interview: InterviewSession): InterviewSession {
    const idx = dbMemory.interviews.findIndex((i) => i.id === interview.id);
    if (idx >= 0) {
      dbMemory.interviews[idx] = interview;
    } else {
      dbMemory.interviews.push(interview);
    }
    saveDb();
    return interview;
  },

  deleteInterview(id: string, userId: string): boolean {
    const beforeCount = dbMemory.interviews.length;
    dbMemory.interviews = dbMemory.interviews.filter((i) => !(i.id === id && i.userId === userId));
    saveDb();
    return dbMemory.interviews.length < beforeCount;
  },

  // Feedback
  addFeedback(feedback: FeedbackSubmission): FeedbackSubmission {
    dbMemory.feedback.push(feedback);
    saveDb();
    return feedback;
  },

  // Analytics aggregation per user
  getAnalytics(userId: string): AnalyticsSummary {
    const userSessions = dbMemory.interviews.filter((i) => i.userId === userId);
    const completed = userSessions.filter((i) => i.status === 'completed');

    let totalQuestionsAttempted = 0;
    let totalScoreSum = 0;
    let scoredAnswersCount = 0;

    const topicScores: Record<string, { sum: number; count: number }> = {};
    const diffScores: Record<'Easy' | 'Medium' | 'Hard', { sum: number; count: number }> = {
      Easy: { sum: 0, count: 0 },
      Medium: { sum: 0, count: 0 },
      Hard: { sum: 0, count: 0 },
    };

    userSessions.forEach((sess) => {
      sess.questions.forEach((q) => {
        const ans = sess.answers[q.id];
        if (ans && ans.evaluation) {
          totalQuestionsAttempted++;
          totalScoreSum += ans.evaluation.score;
          scoredAnswersCount++;

          // By topic
          if (!topicScores[q.topic]) {
            topicScores[q.topic] = { sum: 0, count: 0 };
          }
          topicScores[q.topic].sum += ans.evaluation.score;
          topicScores[q.topic].count++;

          // By difficulty
          if (diffScores[q.difficulty]) {
            diffScores[q.difficulty].sum += ans.evaluation.score;
            diffScores[q.difficulty].count++;
          }
        }
      });
    });

    const recentScores = completed.slice(0, 10).map((sess) => ({
      date: new Date(sess.completedAt || sess.createdAt).toLocaleDateString(),
      score: sess.finalReport ? sess.finalReport.averageScore : 0,
      title: sess.title,
    }));

    const topicProficiency = Object.entries(topicScores).map(([topic, data]) => ({
      topic,
      score: Math.round(data.sum / data.count),
      questionsAnswered: data.count,
    }));

    return {
      totalInterviews: completed.length,
      totalQuestionsAttempted,
      overallAverageScore: scoredAnswersCount > 0 ? Math.round(totalScoreSum / scoredAnswersCount) : 0,
      recentScores,
      topicProficiency,
      difficultyPerformance: {
        Easy: diffScores.Easy.count > 0 ? Math.round(diffScores.Easy.sum / diffScores.Easy.count) : 0,
        Medium: diffScores.Medium.count > 0 ? Math.round(diffScores.Medium.sum / diffScores.Medium.count) : 0,
        Hard: diffScores.Hard.count > 0 ? Math.round(diffScores.Hard.sum / diffScores.Hard.count) : 0,
      },
    };
  },
};
