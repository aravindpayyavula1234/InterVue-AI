import React, { useState, useMemo } from 'react';
import type { ExtractedTopic, Question, ResumeData, JobDescriptionData } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  CheckSquare,
  Square,
  Search,
  Filter,
  Layers,
  Sparkles,
  AlertTriangle,
  PlayCircle,
  HelpCircle,
  FileCode,
  ShieldCheck,
  Zap,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

interface TopicSelectorProps {
  resume: ResumeData;
  jd?: JobDescriptionData | null;
  onQuestionsReady: (
    questions: Question[],
    mode: 'topic' | 'overall',
    selectedTopicNames: string[],
    title: string
  ) => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({ resume, jd, onQuestionsReady }) => {
  // Combine topics from both Resume and JD
  const combinedTopics = useMemo<ExtractedTopic[]>(() => {
    const list: ExtractedTopic[] = [];
    const seenNames = new Set<string>();

    const matchedNames = new Set<string>(
      (jd?.matchingSkills || []).map((s) => s.toLowerCase())
    );

    // 1. Add Resume Topics
    resume.topics.forEach((t) => {
      const isMatched = matchedNames.has(t.name.toLowerCase());
      seenNames.add(t.name.toLowerCase());
      list.push({
        ...t,
        source: isMatched ? 'matched' : 'resume',
      });
    });

    // 2. Add JD Topics if available
    if (jd && jd.extractedTopics) {
      jd.extractedTopics.forEach((jt) => {
        const lowerName = jt.name.toLowerCase();
        if (!seenNames.has(lowerName)) {
          seenNames.add(lowerName);
          list.push(jt);
        } else {
          // If already in list from resume, upgrade source to 'matched'
          const existing = list.find((item) => item.name.toLowerCase() === lowerName);
          if (existing) {
            existing.source = 'matched';
          }
        }
      });
    }

    return list;
  }, [resume, jd]);

  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(
    combinedTopics.slice(0, 4).map((t) => t.id)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'matched' | 'resume' | 'jd'>('all');
  const [interviewMode, setInterviewMode] = useState<'topic' | 'overall'>('topic');
  const [questionCount, setQuestionCount] = useState<number>(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available categories
  const categories = ['all', 'languages', 'frameworks', 'databases', 'concepts', 'projects', 'tools'];

  const filteredTopics = combinedTopics.filter((topic) => {
    const matchesSearch =
      topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.evidence.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (topic.projectReference && topic.projectReference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || topic.category === categoryFilter;

    const matchesSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'matched' && topic.source === 'matched') ||
      (sourceFilter === 'resume' && (topic.source === 'resume' || topic.source === 'matched')) ||
      (sourceFilter === 'jd' && (topic.source === 'jd' || topic.source === 'matched'));

    return matchesSearch && matchesCategory && matchesSource;
  });

  const toggleTopic = (id: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedTopicIds(filteredTopics.map((t) => t.id));
  };

  const handleClearAll = () => {
    setSelectedTopicIds([]);
  };

  const handleGenerate = async () => {
    if (interviewMode === 'topic' && selectedTopicIds.length === 0) {
      setError('Please select at least one topic to generate a topic-based interview.');
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const selectedTopics = combinedTopics.filter((t) => selectedTopicIds.includes(t.id));
      const selectedNames =
        interviewMode === 'topic'
          ? selectedTopics.map((t) => t.name)
          : combinedTopics.map((t) => t.name).slice(0, 6);

      const title =
        interviewMode === 'topic'
          ? `Mock Interview: ${selectedNames.join(', ')} (${questionCount} Questions)`
          : `Full Resume & Target Role Mock Interview (${questionCount} Questions)`;

      const res = await api.generateQuestions({
        type: interviewMode,
        selectedTopicNames: selectedNames,
        questionCount,
      });

      onQuestionsReady(res.questions, interviewMode, selectedNames, title);
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedCount = selectedTopicIds.length;
  const matchedCount = combinedTopics.filter((t) => t.source === 'matched').length;
  const jdOnlyCount = combinedTopics.filter((t) => t.source === 'jd').length;

  return (
    <div className="space-y-6">
      {/* Configuration Header Card */}
      <div className="rounded-2xl bg-[#181818] border border-[#303030] p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#202020]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-white">Extracted Interview Topics</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF7900]/15 text-[#FF7900] border border-[#FF7900]/30">
                {combinedTopics.length} Topics Extracted
              </span>
              {jd && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Includes Target Role: {jd.jobTitle}
                </span>
              )}
            </div>
            <p className="text-xs text-[#B3B3B3]">
              Topics extracted directly from your verified resume and target Job Description. Select your focus topics to launch your progressive mock interview.
            </p>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (interviewMode === 'topic' && selectedTopicIds.length === 0)}
              className="px-6 py-3 rounded-xl font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-all flex items-center gap-2 shadow-lg shadow-[#FF7900]/25 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Generating {questionCount} Questions...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Generate Interview ({selectedCount} Selected)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mode & Configuration Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#B3B3B3] block">
              Interview Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInterviewMode('topic')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  interviewMode === 'topic'
                    ? 'border-[#FF7900] bg-[#FF7900]/10 text-white'
                    : 'border-[#303030] bg-[#181818] text-[#B3B3B3] hover:text-white'
                }`}
              >
                <div className="font-semibold text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FF7900]" />
                  <span>Mode A: Topic-Based</span>
                </div>
                <p className="text-[11px] text-[#888888] mt-1">
                  Questions strictly for chosen topics with 10 Easy, 10 Medium, 10 Hard difficulty tiers.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setInterviewMode('overall')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  interviewMode === 'overall'
                    ? 'border-[#FF7900] bg-[#FF7900]/10 text-white'
                    : 'border-[#303030] bg-[#181818] text-[#B3B3B3] hover:text-white'
                }`}
              >
                <div className="font-semibold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF7900]" />
                  <span>Mode B: Overall Mock</span>
                </div>
                <p className="text-[11px] text-[#888888] mt-1">
                  Comprehensive mock covering self-intro, technical depth, project walkthroughs, behavioral & HR.
                </p>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#B3B3B3]">
                Target Question Volume
              </label>
              <span className="text-xs font-mono font-bold text-[#FF7900]">{questionCount} Questions</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 45].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    questionCount === cnt
                      ? 'border-[#FF7900] bg-[#FF7900] text-black shadow-sm'
                      : 'border-[#303030] bg-[#181818] text-[#B3B3B3] hover:text-white'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#888888]">
              {questionCount === 30
                ? 'Standard 30-Question Matrix: 10 Fundamental (Easy), 10 Applied (Medium), 10 Advanced (Hard).'
                : `${questionCount} questions distributed evenly across Easy, Medium, and Hard.`}
            </p>
          </div>
        </div>

        {/* Source Filter Tabs if JD is active */}
        {jd && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#202020]">
            <span className="text-xs text-[#888888] font-medium mr-1">Topic Source:</span>
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                sourceFilter === 'all'
                  ? 'bg-[#FF7900] text-black font-semibold'
                  : 'bg-[#202020] text-[#B3B3B3] hover:text-white'
              }`}
            >
              All Sources ({combinedTopics.length})
            </button>
            <button
              onClick={() => setSourceFilter('matched')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                sourceFilter === 'matched'
                  ? 'bg-[#22C55E] text-black font-semibold'
                  : 'bg-[#202020] text-[#22C55E] hover:text-white'
              }`}
            >
              Matched Skills ({matchedCount})
            </button>
            <button
              onClick={() => setSourceFilter('jd')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                sourceFilter === 'jd'
                  ? 'bg-[#FF9F43] text-black font-semibold'
                  : 'bg-[#202020] text-[#FF9F43] hover:text-white'
              }`}
            >
              Target JD Specific ({jdOnlyCount})
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by topic name, evidence citation, or project..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111111] border border-[#303030] text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#FF7900]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#FF7900] text-black font-semibold'
                    : 'bg-[#181818] text-[#B3B3B3] hover:text-white border border-[#303030]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 rounded-lg text-xs text-[#B3B3B3] hover:text-white bg-[#111111] border border-[#303030] transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg text-xs text-[#B3B3B3] hover:text-white bg-[#111111] border border-[#303030] transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => {
          const isSelected = selectedTopicIds.includes(topic.id);
          return (
            <div
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className={`cursor-pointer rounded-2xl p-5 border transition-all relative flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-[#181818] border-[#FF7900] shadow-md shadow-[#FF7900]/10 glow-orange-border'
                  : 'bg-[#141414] border-[#282828] hover:border-[#383838]'
              }`}
            >
              <div className="space-y-2.5">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-[#FF7900]"
                      aria-label={isSelected ? 'Deselect topic' : 'Select topic'}
                    >
                      {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-[#555555]" />}
                    </button>
                    <div>
                      <h3 className="font-bold text-sm text-white">{topic.name}</h3>
                      {topic.source === 'matched' && (
                        <span className="text-[10px] text-[#22C55E] flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Matched (Resume + JD)
                        </span>
                      )}
                      {topic.source === 'jd' && (
                        <span className="text-[10px] text-[#FF9F43] flex items-center gap-1 font-semibold">
                          <Briefcase className="w-3 h-3" /> Target JD Requirement
                        </span>
                      )}
                      {topic.source === 'resume' && (
                        <span className="text-[10px] text-[#888888] font-medium">
                          Resume Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Evidence Strength Badge */}
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border shrink-0 ${
                      topic.evidenceStrength === 'high'
                        ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                        : topic.evidenceStrength === 'medium'
                        ? 'bg-[#FF9F43]/15 text-[#FF9F43] border-[#FF9F43]/30'
                        : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                    }`}
                  >
                    {topic.evidenceStrength}
                  </span>
                </div>

                {/* Explanation */}
                <p className="text-xs text-[#B3B3B3] line-clamp-2">{topic.summary}</p>
              </div>

              {/* Evidence Quote Block */}
              <div className="pt-2 border-t border-[#222222] space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#FF7900] flex items-center justify-between">
                  <span>{topic.source === 'jd' ? 'Job Description Requirement' : 'Resume Citation'}</span>
                  {topic.isAmbiguous && (
                    <span className="text-[#FF9F43] lowercase flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> marked uncertain
                    </span>
                  )}
                </div>
                <div className="p-2 rounded-lg bg-[#0F0F0F] border border-[#202020] text-[11px] font-mono text-[#CCCCCC] italic line-clamp-2">
                  "{topic.evidence}"
                </div>

                {topic.projectReference && (
                  <div className="text-[10px] text-[#888888] flex items-center gap-1 pt-0.5">
                    <FileCode className="w-3 h-3 text-[#FF9F43]" />
                    <span className="truncate">Ref: {topic.projectReference}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
