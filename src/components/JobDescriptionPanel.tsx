import React, { useState } from 'react';
import type { JobDescriptionData, ResumeData } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Trash2,
  ArrowRight,
  FileText,
  Target,
  Sparkles,
} from 'lucide-react';

interface JobDescriptionPanelProps {
  jd: JobDescriptionData | null;
  resume: ResumeData | null;
  onJdUpdated: (jd: JobDescriptionData | null) => void;
  onNavigateToTopics: () => void;
}

export const JobDescriptionPanel: React.FC<JobDescriptionPanelProps> = ({
  jd,
  resume,
  onJdUpdated,
  onNavigateToTopics,
}) => {
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleJd = `
Senior Full-Stack Engineer | Fintech Platform
Location: Remote (US)

About the Role:
We are looking for a Senior Full-Stack Engineer to architect high-throughput transaction ledger microservices and modern responsive interfaces.

Key Responsibilities:
- Design distributed systems and high-throughput RESTful/GraphQL APIs handling thousands of financial requests per minute.
- Develop responsive, accessible web interfaces in React and TypeScript.
- Optimize database transactions, indexes, and connection pooling in PostgreSQL.
- Build resilient caching layers using Redis to minimize query latency.
- Collaborate with security teams on data encryption and audit compliance.

Required Qualifications:
- 4+ years software engineering experience in Python or Node.js.
- Deep expertise in React, TypeScript, and modern CSS frameworks.
- Strong proficiency in SQL (PostgreSQL), schema migrations, and indexing.
- Experience with Docker, Kubernetes, and CI/CD pipelines.

Preferred Qualifications:
- Experience with in-memory caching systems such as Redis or Memcached.
- Familiarity with Kafka or distributed message streaming.
`;

  const handleAnalyze = async () => {
    if (!resume) {
      setError('Please upload and verify your resume first before adding a target job description.');
      return;
    }
    if (!jdText || jdText.trim().length < 30) {
      setError('Please paste a job description with requirements and responsibilities (at least 30 characters).');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await api.analyzeJobDescription(jdText);
      onJdUpdated(res.jd);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze Job Description.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this Job Description comparison?')) {
      try {
        await api.deleteJobDescription();
        onJdUpdated(null);
      } catch (err: any) {
        setError(err.message || 'Failed to delete JD.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-[#181818] border border-[#303030] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#FF7900]" />
              <h2 className="text-xl font-bold text-white">Target Job Description (JD) Analysis</h2>
            </div>
            <p className="text-xs text-[#B3B3B3]">
              Compare your authentic resume directly against the job requirements of a company you want to interview for.
            </p>
          </div>

          {jd && (
            <button
              onClick={handleDelete}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#B3B3B3] hover:text-[#EF4444] bg-[#202020] border border-[#303030] hover:border-[#EF4444]/40 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove JD</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* If JD is analyzed, show comparison matrix */}
        {jd ? (
          <div className="space-y-6 pt-4 border-t border-[#202020]">
            {/* Target Role Overview */}
            <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FF7900]">Target Role</span>
                <h3 className="text-lg font-bold text-white">{jd.jobTitle}</h3>
                {jd.company && <p className="text-xs text-[#B3B3B3]">{jd.company}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onNavigateToTopics}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors flex items-center gap-1.5 shadow-md shadow-[#FF7900]/25"
                >
                  <span>Practice Role Questions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Match Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matching Skills */}
              <div className="p-5 rounded-xl bg-[#111111] border border-[#22C55E]/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#22C55E] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Matching Skills Verified ({jd.matchingSkills.length})</span>
                </div>
                <p className="text-xs text-[#B3B3B3]">
                  Technologies and requirements explicitly evidenced in your uploaded resume:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {jd.matchingSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="p-5 rounded-xl bg-[#111111] border border-[#EF4444]/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#EF4444] uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  <span>Skills Not Evidenced in Resume ({jd.missingSkills.length})</span>
                </div>
                <p className="text-xs text-[#B3B3B3]">
                  Expect questions on these topics during the interview; prioritize reviewing them beforehand:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {jd.missingSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Preparation Priorities */}
            {jd.recommendedFocus.length > 0 && (
              <div className="p-5 rounded-xl bg-[#111111] border border-[#FF7900]/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FF9F43] uppercase tracking-wider">
                  <Target className="w-4 h-4" />
                  <span>Preparation Priorities Recommended for this Role</span>
                </div>
                <ul className="space-y-2">
                  {jd.recommendedFocus.map((rec, i) => (
                    <li key={i} className="text-xs text-[#B3B3B3] flex items-start gap-2">
                      <span className="text-[#FF7900] font-mono font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Extracted Topics from JD */}
            {jd.extractedTopics && jd.extractedTopics.length > 0 && (
              <div className="p-5 rounded-xl bg-[#111111] border border-[#303030] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[#FF7900]" />
                    <span>Extracted Interview Topics from Job Description ({jd.extractedTopics.length})</span>
                  </div>
                  <button
                    onClick={onNavigateToTopics}
                    className="text-xs font-semibold text-[#FF7900] hover:underline flex items-center gap-1"
                  >
                    <span>View all in Topic Selector</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {jd.extractedTopics.map((topic, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#181818] border border-[#282828] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">{topic.name}</span>
                        <span
                          className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
                            topic.source === 'matched'
                              ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                              : 'bg-[#FF9F43]/15 text-[#FF9F43] border-[#FF9F43]/30'
                          }`}
                        >
                          {topic.source === 'matched' ? 'Matched' : 'JD Focus'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#B3B3B3] line-clamp-2">{topic.summary}</p>
                      <div className="text-[10px] text-[#888888] italic bg-[#0F0F0F] p-1.5 rounded line-clamp-2 border border-[#202020]">
                        "{topic.evidence}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty Input State */
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#B3B3B3]">Paste Job Specification</span>
              <button
                type="button"
                onClick={() => setJdText(sampleJd)}
                className="text-xs text-[#FF7900] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Use Sample Fintech Job Description
              </button>
            </div>

            <textarea
              rows={8}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste job posting text (job title, responsibilities, required skills, preferred qualifications)..."
              className="w-full p-4 rounded-xl bg-[#111111] border border-[#303030] text-xs font-mono text-white placeholder-[#555555] focus:outline-none focus:border-[#FF7900] transition-colors resize-y"
            />

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors flex items-center gap-2 shadow-md shadow-[#FF7900]/25 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Comparing Resume & JD...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze & Compare with Resume</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
