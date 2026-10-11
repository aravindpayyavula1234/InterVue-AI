import React, { useState } from 'react';
import type { FinalReport, InterviewSession } from '../types/index.ts';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  BookOpen,
  TrendingUp,
  BarChart2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

interface FinalReportModalProps {
  session: InterviewSession;
  finalReport: FinalReport;
  onClose: () => void;
  onRestartPractice: () => void;
}

export const FinalReportModal: React.FC<FinalReportModalProps> = ({
  session,
  finalReport,
  onClose,
  onRestartPractice,
}) => {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#141414] border border-[#303030] p-6 sm:p-8 shadow-2xl space-y-8 my-auto glow-orange-sm">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#B3B3B3] hover:text-white bg-[#1C1C1C] hover:bg-[#282828] border border-[#303030] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#262626]">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FF7900]/15 text-[#FF7900] text-[11px] font-semibold border border-[#FF7900]/30">
              <Award className="w-3.5 h-3.5" /> Performance Report
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{session.title}</h2>
            <p className="text-xs text-[#B3B3B3]">
              Topics Covered: {session.selectedTopics.join(', ') || 'General Mock'} • Completed {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border font-mono font-extrabold shadow-lg ${
                finalReport.averageScore >= 75
                  ? 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]'
                  : finalReport.averageScore >= 55
                  ? 'bg-[#FF9F43]/10 border-[#FF9F43]/40 text-[#FF9F43]'
                  : 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
              }`}
            >
              <span className="text-3xl leading-none">{finalReport.averageScore}</span>
              <span className="text-[11px] text-[#888888]">/100 Avg</span>
            </div>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] space-y-1">
            <div className="text-[11px] text-[#888888] uppercase">Attempted</div>
            <div className="text-xl font-bold font-mono text-white">
              {finalReport.attemptedQuestions} / {finalReport.totalQuestions}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] space-y-1">
            <div className="text-[11px] text-[#888888] uppercase">Easy Tier Avg</div>
            <div className="text-xl font-bold font-mono text-[#22C55E]">
              {finalReport.difficultyScores.easyAvg}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] space-y-1">
            <div className="text-[11px] text-[#888888] uppercase">Medium Tier Avg</div>
            <div className="text-xl font-bold font-mono text-[#FF9F43]">
              {finalReport.difficultyScores.mediumAvg}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] space-y-1">
            <div className="text-[11px] text-[#888888] uppercase">Hard Tier Avg</div>
            <div className="text-xl font-bold font-mono text-[#EF4444]">
              {finalReport.difficultyScores.hardAvg}%
            </div>
          </div>
        </div>

        {/* Topic Breakdown Grid */}
        {finalReport.topicPerformance.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#B3B3B3]">
              Performance by Topic
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {finalReport.topicPerformance.map((t, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#181818] border border-[#282828] space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">{t.topic}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        t.status === 'Strong'
                          ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                          : t.status === 'Average'
                          ? 'bg-[#FF9F43]/15 text-[#FF9F43] border-[#FF9F43]/30'
                          : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[#888888]">
                    <span>Score: {t.avgScore}/100</span>
                    <span>{t.count} answers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Synthesis: Strengths & Improvement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#181818] border border-[#22C55E]/20 space-y-3">
            <div className="text-xs font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Strongest Competencies
            </div>
            <ul className="space-y-2">
              {finalReport.strongestAreas.map((item, i) => (
                <li key={i} className="text-xs text-[#B3B3B3] flex items-start gap-2">
                  <span className="text-[#22C55E]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#181818] border border-[#EF4444]/20 space-y-3">
            <div className="text-xs font-bold text-[#EF4444] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Priority Improvement Areas
            </div>
            <ul className="space-y-2">
              {finalReport.improvementAreas.map((item, i) => (
                <li key={i} className="text-xs text-[#B3B3B3] flex items-start gap-2">
                  <span className="text-[#EF4444]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Revision & Next Steps */}
        <div className="p-5 rounded-2xl bg-[#181818] border border-[#FF7900]/30 space-y-3">
          <div className="text-xs font-bold text-[#FF9F43] uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> Recommended Revision Checklist
          </div>
          <div className="flex flex-wrap gap-2">
            {finalReport.recommendedRevision.map((rev, i) => (
              <span key={i} className="px-3 py-1 rounded-lg text-xs bg-[#202020] text-white border border-[#303030]">
                {rev}
              </span>
            ))}
          </div>
          <div className="text-xs text-[#B3B3B3] pt-2 border-t border-[#252525]">
            <span className="font-semibold text-white">Suggested Next Session: </span>
            {finalReport.suggestedNextSession}
          </div>
        </div>

        {/* Question-by-Question Review List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#B3B3B3]">
            Question-by-Question Detailed Review
          </h3>
          <div className="space-y-3">
            {session.questions.map((q, idx) => {
              const ans = session.answers[q.id];
              const isExpanded = expandedQuestionId === q.id;
              return (
                <div key={q.id} className="rounded-xl border border-[#282828] bg-[#181818] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1C1C1C] transition-colors"
                  >
                    <div className="flex items-center gap-3 pr-2">
                      <span className="text-xs font-mono text-[#888888] shrink-0">#{idx + 1}</span>
                      <span className="text-xs font-semibold text-white line-clamp-1">{q.text}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ans?.evaluation ? (
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                            ans.evaluation.score >= 75
                              ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                              : ans.evaluation.score >= 50
                              ? 'bg-[#FF9F43]/15 text-[#FF9F43] border-[#FF9F43]/30'
                              : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                          }`}
                        >
                          {ans.evaluation.score}/100
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#666666]">Unanswered</span>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#888888]" /> : <ChevronDown className="w-4 h-4 text-[#888888]" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-5 border-t border-[#252525] space-y-4 text-xs bg-[#111111]">
                      {ans?.userAnswer ? (
                        <div className="space-y-1">
                          <span className="font-semibold text-[#888888]">Your Answer:</span>
                          <div className="p-3 rounded-lg bg-[#181818] border border-[#282828] text-white whitespace-pre-line">
                            {ans.userAnswer}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[#888888] italic">No answer submitted for this question.</div>
                      )}

                      {ans?.evaluation?.modelAnswer && (
                        <div className="space-y-1">
                          <span className="font-semibold text-[#FF9F43]">Exemplary Model Answer:</span>
                          <div className="p-3 rounded-lg bg-[#181818] border border-[#282828] font-mono text-white whitespace-pre-line leading-relaxed">
                            {ans.evaluation.modelAnswer}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
          <button
            onClick={onRestartPractice}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#202020] hover:bg-[#282828] border border-[#303030] transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Practice Another Topic</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors shadow-lg shadow-[#FF7900]/25"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
