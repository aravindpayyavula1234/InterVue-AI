import React from 'react';
import type { AnalyticsSummary } from '../types/index.ts';
import {
  TrendingUp,
  BarChart3,
  Award,
  HelpCircle,
  PlayCircle,
  FileQuestion,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
  onStartPractice: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, onStartPractice }) => {
  // If no completed interviews, show verified empty state (no fake charts)
  if (!analytics || analytics.totalInterviews === 0) {
    return (
      <div className="rounded-2xl bg-[#181818] border border-[#303030] p-10 sm:p-14 text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#202020] border border-[#303030] mx-auto flex items-center justify-center text-[#FF7900]">
          <BarChart3 className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white">No Interview Analytics Yet</h3>
        <p className="text-xs sm:text-sm text-[#B3B3B3] leading-relaxed">
          Analytics are derived strictly from your real submitted answers and evaluations. Complete your first mock session to generate verified performance charts.
        </p>
        <div className="pt-2">
          <button
            onClick={onStartPractice}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors shadow-md shadow-[#FF7900]/25 inline-flex items-center gap-1.5"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start Your First Mock Interview</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#181818] border border-[#303030] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#202020] border border-[#FF7900]/30 flex items-center justify-center text-[#FF7900]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-[#888888] uppercase tracking-wider font-semibold">Overall Avg Score</div>
            <div className="text-2xl font-extrabold font-mono text-white">
              {analytics.overallAverageScore}
              <span className="text-xs text-[#888888] font-normal"> /100</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#181818] border border-[#303030] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#202020] border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-[#888888] uppercase tracking-wider font-semibold">Completed Sessions</div>
            <div className="text-2xl font-extrabold font-mono text-white">
              {analytics.totalInterviews}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#181818] border border-[#303030] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#202020] border border-[#FF9F43]/30 flex items-center justify-center text-[#FF9F43]">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-[#888888] uppercase tracking-wider font-semibold">Questions Attempted</div>
            <div className="text-2xl font-extrabold font-mono text-white">
              {analytics.totalQuestionsAttempted}
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="p-6 rounded-2xl bg-[#181818] border border-[#303030] space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#B3B3B3] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#FF7900]" />
          <span>Performance by Question Difficulty</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-[#111111] border border-[#22C55E]/30 space-y-1">
            <span className="text-xs font-semibold text-[#22C55E]">Easy Questions</span>
            <div className="text-xl font-bold font-mono text-white">
              {analytics.difficultyPerformance.Easy}%
            </div>
            <p className="text-[10px] text-[#888888]">Core principles, basic definitions & syntax.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#111111] border border-[#FF9F43]/30 space-y-1">
            <span className="text-xs font-semibold text-[#FF9F43]">Medium Questions</span>
            <div className="text-xl font-bold font-mono text-white">
              {analytics.difficultyPerformance.Medium}%
            </div>
            <p className="text-[10px] text-[#888888]">Practical implementations & trade-off reasoning.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#111111] border border-[#EF4444]/30 space-y-1">
            <span className="text-xs font-semibold text-[#EF4444]">Hard Questions</span>
            <div className="text-xl font-bold font-mono text-white">
              {analytics.difficultyPerformance.Hard}%
            </div>
            <p className="text-[10px] text-[#888888]">Advanced distributed systems & edge cases.</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Progression Trend */}
        <div className="p-6 rounded-2xl bg-[#181818] border border-[#303030] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#B3B3B3] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FF7900]" />
              <span>Score Progression</span>
            </h3>
            <span className="text-[11px] text-[#888888]">Last 10 Mock Sessions</span>
          </div>

          <div className="h-64 w-full pt-2">
            {analytics.recentScores.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.recentScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
                  <XAxis dataKey="date" stroke="#666666" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#666666" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#181818',
                      borderColor: '#303030',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#FF7900"
                    strokeWidth={2.5}
                    dot={{ fill: '#FF7900', r: 4 }}
                    activeDot={{ r: 6, fill: '#FF9F43' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#888888]">
                Complete more sessions to see your score progression curve.
              </div>
            )}
          </div>
        </div>

        {/* Topic Proficiency Bar Chart */}
        <div className="p-6 rounded-2xl bg-[#181818] border border-[#303030] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#B3B3B3] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#FF9F43]" />
              <span>Topic Proficiency</span>
            </h3>
            <span className="text-[11px] text-[#888888]">Average Score %</span>
          </div>

          <div className="h-64 w-full pt-2">
            {analytics.topicProficiency.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topicProficiency.slice(0, 7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
                  <XAxis dataKey="topic" stroke="#666666" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#666666" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#181818',
                      borderColor: '#303030',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="score" fill="#FF7900" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#888888]">
                No topic scores accumulated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
