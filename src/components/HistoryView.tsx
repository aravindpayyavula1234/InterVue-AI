import React from 'react';
import type { InterviewSession } from '../types/index.ts';
import {
  History,
  PlayCircle,
  Award,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface HistoryViewProps {
  sessions: InterviewSession[];
  onResumeSession: (session: InterviewSession) => void;
  onViewReport: (session: InterviewSession) => void;
  onDeleteSession: (id: string) => void;
  onStartNew: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onResumeSession,
  onViewReport,
  onDeleteSession,
  onStartNew,
}) => {
  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl bg-[#181818] border border-[#303030] p-10 sm:p-14 text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#202020] border border-[#303030] mx-auto flex items-center justify-center text-[#FF7900]">
          <History className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white">No Interview History</h3>
        <p className="text-xs sm:text-sm text-[#B3B3B3] leading-relaxed">
          You haven't conducted any mock interviews yet. Generate questions from your extracted topics to begin practicing.
        </p>
        <div className="pt-2">
          <button
            onClick={onStartNew}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors shadow-md shadow-[#FF7900]/25 inline-flex items-center gap-1.5"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start an Interview</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Interview Session History</h2>
          <p className="text-xs text-[#B3B3B3]">
            {sessions.length} total mock interview session{sessions.length > 1 ? 's' : ''} recorded for your account.
          </p>
        </div>
        <button
          onClick={onStartNew}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors shadow-md shadow-[#FF7900]/20 flex items-center gap-1.5"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>New Session</span>
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((sess) => {
          const answeredCount = Object.keys(sess.answers).length;
          const score = sess.finalReport ? sess.finalReport.averageScore : null;

          return (
            <div
              key={sess.id}
              className="p-5 rounded-2xl bg-[#181818] border border-[#303030] hover:border-[#454545] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white">{sess.title}</h3>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                      sess.status === 'completed'
                        ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                        : 'bg-[#FF9F43]/15 text-[#FF9F43] border-[#FF9F43]/30'
                    }`}
                  >
                    {sess.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#202020] text-[#B3B3B3] border border-[#303030]">
                    {sess.type === 'topic' ? 'Topic-Based' : 'Overall Resume'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#888888]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(sess.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>
                    {answeredCount}/{sess.questions.length} Questions Answered
                  </span>
                  {sess.selectedTopics.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">
                        Topics: {sess.selectedTopics.join(', ')}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {score !== null && (
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-sm border ${
                      score >= 75
                        ? 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]'
                        : score >= 50
                        ? 'bg-[#FF9F43]/10 border-[#FF9F43]/40 text-[#FF9F43]'
                        : 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
                    }`}
                  >
                    <span>{score}</span>
                    <span className="text-[9px] text-[#888888]">/100</span>
                  </div>
                )}

                {sess.finalReport ? (
                  <button
                    onClick={() => onViewReport(sess)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#202020] hover:bg-[#282828] border border-[#303030] transition-colors flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5 text-[#FF7900]" />
                    <span>View Report</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onResumeSession(sess)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors flex items-center gap-1.5 shadow-md shadow-[#FF7900]/20"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Resume Practice</span>
                  </button>
                )}

                <button
                  onClick={() => onDeleteSession(sess.id)}
                  title="Delete Session"
                  className="p-2 rounded-xl text-[#B3B3B3] hover:text-[#EF4444] hover:bg-[#202020] border border-[#303030] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
