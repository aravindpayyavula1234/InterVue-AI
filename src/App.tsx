import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { api } from './services/api.ts';
import type {
  ResumeData,
  JobDescriptionData,
  InterviewSession,
  AnalyticsSummary,
  Question,
  FinalReport,
} from './types/index.ts';

import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ResumeUploader } from './components/ResumeUploader.tsx';
import { TopicSelector } from './components/TopicSelector.tsx';
import { JobDescriptionPanel } from './components/JobDescriptionPanel.tsx';
import { InterviewWorkspace } from './components/InterviewWorkspace.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { FinalReportModal } from './components/FinalReportModal.tsx';
import { FeedbackModal } from './components/FeedbackModal.tsx';

function MainApp() {
  const { user, isLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Core application state
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [jd, setJd] = useState<JobDescriptionData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [viewingReport, setViewingReport] = useState<{
    session: InterviewSession;
    finalReport: FinalReport;
  } | null>(null);

  const [initialDataLoading, setInitialDataLoading] = useState(false);

  // Fetch user data when authenticated
  useEffect(() => {
    if (!user) {
      setResume(null);
      setJd(null);
      setAnalytics(null);
      setHistory([]);
      setActiveSession(null);
      return;
    }

    const loadUserData = async () => {
      setInitialDataLoading(true);
      try {
        const [resumeRes, jdRes, analyticsRes, historyRes] = await Promise.all([
          api.getResume(),
          api.getJobDescription(),
          api.getAnalytics(),
          api.getHistory(),
        ]);

        setResume(resumeRes.resume);
        setJd(jdRes.jd);
        setAnalytics(analyticsRes.analytics);
        setHistory(historyRes.history);

        // Check if there's an in-progress session
        const inProgress = historyRes.history.find((s) => s.status === 'in_progress');
        if (inProgress) {
          setActiveSession(inProgress);
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally {
        setInitialDataLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Handler for question generation
  const handleQuestionsReady = async (
    questions: Question[],
    mode: 'topic' | 'overall',
    selectedTopicNames: string[],
    title: string
  ) => {
    try {
      const res = await api.startInterview({
        title,
        type: mode,
        selectedTopics: selectedTopicNames,
        questions,
      });

      setActiveSession(res.session);
      setHistory((prev) => [res.session, ...prev]);
      setCurrentTab('practice');
    } catch (err) {
      console.error('Failed to start interview:', err);
    }
  };

  const handleSessionCompleted = async (finalReport: FinalReport) => {
    if (!activeSession) return;
    const completedSession: InterviewSession = {
      ...activeSession,
      status: 'completed',
      finalReport,
    };
    setActiveSession(null);
    setHistory((prev) =>
      prev.map((s) => (s.id === completedSession.id ? completedSession : s))
    );

    // Refresh analytics
    try {
      const analyticsRes = await api.getAnalytics();
      setAnalytics(analyticsRes.analytics);
    } catch (e) {
      console.error(e);
    }

    setViewingReport({ session: completedSession, finalReport });
  };

  const handleDeleteSession = async (id: string) => {
    if (window.confirm('Delete this interview session?')) {
      try {
        await api.deleteInterview(id);
        setHistory((prev) => prev.filter((s) => s.id !== id));
        if (activeSession?.id === id) {
          setActiveSession(null);
        }
        const analyticsRes = await api.getAnalytics();
        setAnalytics(analyticsRes.analytics);
      } catch (err) {
        console.error('Failed to delete session:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#B3B3B3]">Initializing InterVue...</span>
        </div>
      </div>
    );
  }

  // If user is not logged in, show the high-converting Landing Page
  if (!user) {
    return (
      <>
        <Navbar
          currentTab="landing"
          setCurrentTab={() => {}}
          onOpenAuth={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
          hasResume={false}
        />

        <LandingPage
          onGetStarted={() => {
            setAuthModalMode('register');
            setIsAuthModalOpen(true);
          }}
          onLogin={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultMode={authModalMode}
        />

        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        hasResume={Boolean(resume)}
        activeSessionId={activeSession?.id}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {initialDataLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#B3B3B3]">Loading your interview profile...</span>
          </div>
        ) : (
          <>
            {/* TAB: DASHBOARD */}
            {currentTab === 'dashboard' && (
              <div className="space-y-8">
                <ResumeUploader
                  resume={resume}
                  onUploadSuccess={(newResume) => {
                    setResume(newResume);
                    setCurrentTab('topics');
                  }}
                  onDeleteSuccess={() => {
                    setResume(null);
                    setJd(null);
                  }}
                  onNavigateToTopics={() => setCurrentTab('topics')}
                />
              </div>
            )}

            {/* TAB: TOPICS */}
            {currentTab === 'topics' && (
              <>
                {resume ? (
                  <TopicSelector
                    resume={resume}
                    jd={jd}
                    onQuestionsReady={handleQuestionsReady}
                  />
                ) : (
                  <ResumeUploader
                    resume={null}
                    onUploadSuccess={(newResume) => setResume(newResume)}
                    onDeleteSuccess={() => setResume(null)}
                    onNavigateToTopics={() => {}}
                  />
                )}
              </>
            )}

            {/* TAB: JOB DESCRIPTION (JD) */}
            {currentTab === 'jd' && (
              <JobDescriptionPanel
                jd={jd}
                resume={resume}
                onJdUpdated={(updatedJd) => setJd(updatedJd)}
                onNavigateToTopics={() => setCurrentTab('topics')}
              />
            )}

            {/* TAB: PRACTICE WORKSPACE */}
            {currentTab === 'practice' && (
              <>
                {activeSession ? (
                  <InterviewWorkspace
                    session={activeSession}
                    onUpdateSession={(updated) => {
                      setActiveSession(updated);
                      setHistory((prev) =>
                        prev.map((s) => (s.id === updated.id ? updated : s))
                      );
                    }}
                    onSessionCompleted={handleSessionCompleted}
                    onExit={() => setCurrentTab('dashboard')}
                  />
                ) : (
                  <div className="rounded-2xl bg-[#181818] border border-[#303030] p-10 text-center space-y-4 max-w-lg mx-auto">
                    <h3 className="text-lg font-bold text-white">No Active Interview Session</h3>
                    <p className="text-xs text-[#B3B3B3]">
                      Select topics from your analyzed resume to launch a 30-question progressive mock interview.
                    </p>
                    <button
                      onClick={() => setCurrentTab(resume ? 'topics' : 'dashboard')}
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors shadow-md shadow-[#FF7900]/25"
                    >
                      {resume ? 'Choose Topics to Start' : 'Upload Resume'}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* TAB: ANALYTICS */}
            {currentTab === 'analytics' && (
              <AnalyticsView
                analytics={analytics}
                onStartPractice={() => setCurrentTab(resume ? 'topics' : 'dashboard')}
              />
            )}

            {/* TAB: HISTORY */}
            {currentTab === 'history' && (
              <HistoryView
                sessions={history}
                onResumeSession={(sess) => {
                  setActiveSession(sess);
                  setCurrentTab('practice');
                }}
                onViewReport={(sess) => {
                  if (sess.finalReport) {
                    setViewingReport({ session: sess, finalReport: sess.finalReport });
                  }
                }}
                onDeleteSession={handleDeleteSession}
                onStartNew={() => setCurrentTab(resume ? 'topics' : 'dashboard')}
              />
            )}
          </>
        )}
      </main>

      {/* Final Report Modal */}
      {viewingReport && (
        <FinalReportModal
          session={viewingReport.session}
          finalReport={viewingReport.finalReport}
          onClose={() => setViewingReport(null)}
          onRestartPractice={() => {
            setViewingReport(null);
            setCurrentTab('topics');
          }}
        />
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
