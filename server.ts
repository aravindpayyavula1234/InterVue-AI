import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, StoredUser } from './server/db.ts';
import { geminiService } from './server/gemini.ts';
import type { InterviewSession } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'intervue_super_secret_jwt_key_2026';

const app = express();

// Increase JSON body limit for resume PDFs and audio uploads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Auth middleware
interface AuthRequest extends Request {
  user?: StoredUser;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// ----------------- AUTH ROUTES -----------------
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: StoredUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email,
      name: name?.trim() || email.split('@')[0],
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    db.createUser(newUser);
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    const { passwordHash: _, ...userSafe } = newUser;
    return res.status(201).json({ token, user: userSafe });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...userSafe } = user;
    return res.json({ token, user: userSafe });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const { passwordHash: _, ...userSafe } = req.user!;
  res.json({ user: userSafe });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully.' });
});

// ----------------- RESUME ROUTES -----------------
app.get('/api/resume', authenticateToken, (req: AuthRequest, res: Response) => {
  const resume = db.getResumeByUserId(req.user!.id);
  res.json({ resume: resume || null });
});

app.delete('/api/resume', authenticateToken, (req: AuthRequest, res: Response) => {
  const success = db.deleteResume(req.user!.id);
  res.json({ success, message: 'Resume deleted.' });
});

app.post('/api/resume/upload', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { rawText, fileBase64, mimeType, fileName, fileSize } = req.body;

    if (!rawText && !fileBase64) {
      return res.status(400).json({ error: 'No resume content provided. Please upload a file or text.' });
    }

    const analyzed = await geminiService.analyzeResume({
      rawText,
      fileBase64,
      mimeType,
      fileName: fileName || 'Uploaded_Resume.pdf',
      fileSize: fileSize || 102400,
    });

    const saved = db.saveResume(req.user!.id, analyzed);
    return res.json({ resume: saved });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    return res.status(500).json({ error: 'Resume analysis failed: ' + error.message });
  }
});

app.post('/api/resume/demo-sample', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sampleText = `
Alex Mercer
alex.mercer@techmail.com | San Francisco, CA | github.com/alexm-dev

PROFESSIONAL SUMMARY
Senior Full-Stack Engineer with 4+ years of experience designing high-throughput distributed web systems, REST/GraphQL APIs, and responsive React applications. Expertise in Python, TypeScript, Node.js, and PostgreSQL.

TECHNICAL SKILLS
- Programming Languages: Python, TypeScript, JavaScript, SQL, Go (Introductory)
- Frameworks & Libraries: React, Next.js, Express, FastAPI, Tailwind CSS, Redux Toolkit
- Databases: PostgreSQL, Redis, MongoDB
- Tools & Cloud: Docker, Kubernetes, AWS (S3, EC2), Git, Jest, GitHub Actions
- Core Concepts: REST APIs, Microservices Architecture, Database Indexing, Caching Strategies, Data Structures & Algorithms, Asynchronous Programming

PROJECTS
1. Distributed Cache & Analytics Engine (Python, Redis, FastAPI, Docker)
   - Architected an in-memory caching proxy handling 15,000 QPS with sub-5ms p99 latency using Redis pipelining and consistent hashing.
   - Built real-time query aggregation dashboards with FastAPI websockets.

2. Cloud Commerce Dashboard (React, TypeScript, PostgreSQL, Tailwind CSS)
   - Designed a full-stack e-commerce back-office portal supporting 50,000+ active SKU catalogs.
   - Optimized PostgreSQL queries with partial indexing and connection pooling, reducing slow query bottlenecks by 42%.

EXPERIENCE
Software Engineer | Apex Cloud Systems (2022 - Present)
- Developed and maintained 12+ mission-critical microservices deployed across AWS ECS.
- Designed database migrations and transaction-safe schema changes in PostgreSQL for payment reconciliation.
- Reduced cold-start latency of serverless endpoints by 60% through payload minimization and memory tuning.

Associate Full-Stack Developer | DevForge Studio (2020 - 2022)
- Built interactive customer-facing web apps with React, TypeScript, and Node.js.
- Implemented comprehensive unit and integration testing pipelines with Jest and Playwright.

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2020)
`;

    const analyzed = await geminiService.analyzeResume({
      rawText: sampleText,
      fileName: 'Alex_Mercer_FullStack_Resume.pdf',
      fileSize: 45200,
    });

    const saved = db.saveResume(req.user!.id, analyzed);
    return res.json({ resume: saved });
  } catch (error: any) {
    console.error('Demo resume error:', error);
    return res.status(500).json({ error: 'Sample resume analysis failed: ' + error.message });
  }
});

// ----------------- JOB DESCRIPTION ROUTES -----------------
app.get('/api/jd', authenticateToken, (req: AuthRequest, res: Response) => {
  const jd = db.getJobDescriptionByUserId(req.user!.id);
  res.json({ jd: jd || null });
});

app.delete('/api/jd', authenticateToken, (req: AuthRequest, res: Response) => {
  const success = db.deleteJobDescription(req.user!.id);
  res.json({ success, message: 'Job description deleted.' });
});

app.post('/api/jd/analyze', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { jdText } = req.body;
    if (!jdText || jdText.trim().length < 20) {
      return res.status(400).json({ error: 'Job description text must be at least 20 characters.' });
    }

    const resume = db.getResumeByUserId(req.user!.id);
    if (!resume) {
      return res.status(400).json({ error: 'Please upload and analyze a resume first before analyzing a Job Description.' });
    }

    const analyzed = await geminiService.analyzeJobDescription(jdText, resume);
    const saved = db.saveJobDescription(req.user!.id, analyzed);
    return res.json({ jd: saved });
  } catch (error: any) {
    console.error('JD analysis error:', error);
    return res.status(500).json({ error: 'JD analysis failed: ' + error.message });
  }
});

// ----------------- QUESTION & INTERVIEW SESSION ROUTES -----------------
app.post('/api/interviews/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { type, selectedTopicNames, questionCount } = req.body;
    const resume = db.getResumeByUserId(req.user!.id);
    if (!resume) {
      return res.status(400).json({ error: 'No uploaded resume found. Please upload a resume first.' });
    }

    const jd = db.getJobDescriptionByUserId(req.user!.id);

    const questions = await geminiService.generateInterviewQuestions({
      type: type || 'topic',
      selectedTopicNames: selectedTopicNames || (resume.topics.map((t) => t.name).slice(0, 3)),
      resume,
      jd,
      questionCount: Number(questionCount) || (type === 'topic' ? 30 : 20),
    });

    return res.json({ questions });
  } catch (error: any) {
    console.error('Question generation error:', error);
    return res.status(500).json({ error: 'Question generation failed: ' + error.message });
  }
});

app.post('/api/interviews/start', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { title, type, selectedTopics, questions } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Interview questions are required to start a session.' });
    }

    const session: InterviewSession = {
      id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: req.user!.id,
      title: title || (type === 'topic' ? `Mock Interview: ${selectedTopics.join(', ')}` : 'Comprehensive Resume Mock Interview'),
      type: type || 'topic',
      selectedTopics: selectedTopics || [],
      questions,
      answers: {},
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    };

    const saved = db.saveInterview(session);
    return res.status(201).json({ session: saved });
  } catch (error: any) {
    console.error('Start interview error:', error);
    return res.status(500).json({ error: 'Failed to start interview: ' + error.message });
  }
});

app.get('/api/interviews', authenticateToken, (req: AuthRequest, res: Response) => {
  const sessions = db.getInterviewsByUserId(req.user!.id);
  res.json({ sessions });
});

app.get('/api/interviews/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const session = db.getInterviewById(req.params.id, req.user!.id);
  if (!session) {
    return res.status(404).json({ error: 'Interview session not found.' });
  }
  res.json({ session });
});

app.delete('/api/interviews/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const deleted = db.deleteInterview(req.params.id, req.user!.id);
  res.json({ success: deleted });
});

app.post('/api/interviews/:id/submit-answer', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { questionId, userAnswer, audioUsed } = req.body;
    const session = db.getInterviewById(req.params.id, req.user!.id);
    if (!session) {
      return res.status(404).json({ error: 'Interview session not found.' });
    }

    const question = session.questions.find((q) => q.id === questionId);
    if (!question) {
      return res.status(400).json({ error: 'Question not found in this session.' });
    }

    const resume = db.getResumeByUserId(req.user!.id)!;
    const jd = db.getJobDescriptionByUserId(req.user!.id);

    // AI answer evaluation agent
    const evaluation = await geminiService.evaluateAnswer({
      question,
      userAnswer: userAnswer || '',
      resume,
      jd,
    });

    session.answers[questionId] = {
      questionId,
      userAnswer: userAnswer || '',
      audioUsed: Boolean(audioUsed),
      submittedAt: new Date().toISOString(),
      evaluation,
    };

    const updated = db.saveInterview(session);
    return res.json({ session: updated, evaluation });
  } catch (error: any) {
    console.error('Answer submission error:', error);
    return res.status(500).json({ error: 'Evaluation failed: ' + error.message });
  }
});

app.post('/api/interviews/:id/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const session = db.getInterviewById(req.params.id, req.user!.id);
    if (!session) {
      return res.status(404).json({ error: 'Interview session not found.' });
    }

    const finalReport = await geminiService.generateFinalReport(session);
    session.status = 'completed';
    session.completedAt = new Date().toISOString();
    session.finalReport = finalReport;

    const updated = db.saveInterview(session);
    return res.json({ session: updated, finalReport });
  } catch (error: any) {
    console.error('Complete interview error:', error);
    return res.status(500).json({ error: 'Report generation failed: ' + error.message });
  }
});

// ----------------- AUDIO TTS & TRANSCRIBE ROUTES -----------------
app.post('/api/audio/tts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS.' });
    }
    const audioBase64 = await geminiService.generateSpeechTTS(text);
    return res.json({ audioBase64 });
  } catch (error: any) {
    console.error('TTS endpoint error:', error);
    return res.status(500).json({ error: 'TTS failed: ' + error.message });
  }
});

app.post('/api/audio/transcribe', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required.' });
    }
    const text = await geminiService.transcribeAudio(audioBase64, mimeType || 'audio/webm');
    return res.json({ text });
  } catch (error: any) {
    console.error('Transcribe error:', error);
    return res.status(500).json({ error: 'Transcription failed: ' + error.message });
  }
});

// ----------------- ANALYTICS & HISTORY -----------------
app.get('/api/analytics', authenticateToken, (req: AuthRequest, res: Response) => {
  const analytics = db.getAnalytics(req.user!.id);
  res.json({ analytics });
});

app.get('/api/history', authenticateToken, (req: AuthRequest, res: Response) => {
  const sessions = db.getInterviewsByUserId(req.user!.id);
  res.json({ history: sessions });
});

// ----------------- FEEDBACK -----------------
app.post('/api/feedback', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { category, rating, message } = req.body;
    if (!message || !rating) {
      return res.status(400).json({ error: 'Rating and message are required.' });
    }

    const saved = db.addFeedback({
      id: `fb-${Date.now()}`,
      userId: req.user!.id,
      userEmail: req.user!.email,
      category: category || 'general',
      rating: Number(rating),
      message,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ feedback: saved, message: 'Thank you for your feedback!' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record feedback: ' + error.message });
  }
});

// ----------------- VITE / STATIC SERVING -----------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[InterVue Server] Listening on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
