import React, { useState, useRef } from 'react';
import type { ResumeData } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  UploadCloud,
  FileText,
  Trash2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ResumeUploaderProps {
  resume: ResumeData | null;
  onUploadSuccess: (resume: ResumeData) => void;
  onDeleteSuccess: () => void;
  onNavigateToTopics: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  resume,
  onUploadSuccess,
  onDeleteSuccess,
  onNavigateToTopics,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [loadingStage, setLoadingStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File selection
  const handleFile = async (file: File) => {
    setError(null);
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT resume.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File is too large. Maximum size is 15MB.');
      return;
    }

    try {
      setLoadingStage('Uploading document...');
      await new Promise((r) => setTimeout(r, 600));

      setLoadingStage('Extracting document text...');
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const result = reader.result as string;
          let fileBase64: string | undefined;
          let rawText: string | undefined;

          if (file.type.includes('pdf')) {
            fileBase64 = result.split(',')[1];
          } else {
            // Text or basic file
            rawText = atob(result.split(',')[1] || '') || result;
          }

          setLoadingStage('Analyzing resume via Gemini AI...');
          await new Promise((r) => setTimeout(r, 800));

          setLoadingStage('Identifying authentic technical topics...');
          const res = await api.uploadResume({
            fileBase64,
            rawText,
            mimeType: file.type || 'application/pdf',
            fileName: file.name,
            fileSize: file.size,
          });

          setLoadingStage('Analysis completed!');
          await new Promise((r) => setTimeout(r, 400));
          onUploadSuccess(res.resume);
        } catch (err: any) {
          setError(err.message || 'Failed to analyze resume document.');
        } finally {
          setLoadingStage(null);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Failed to read file.');
      setLoadingStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pastedText || pastedText.trim().length < 50) {
      setError('Please paste a comprehensive resume containing skills, experience, and education (min 50 chars).');
      return;
    }
    setError(null);
    try {
      setLoadingStage('Analyzing pasted resume...');
      const res = await api.uploadResume({
        rawText: pastedText,
        fileName: 'Pasted_Resume.txt',
        fileSize: pastedText.length,
        mimeType: 'text/plain',
      });
      setLoadingStage('Analysis completed!');
      await new Promise((r) => setTimeout(r, 300));
      onUploadSuccess(res.resume);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze pasted resume.');
    } finally {
      setLoadingStage(null);
    }
  };

  const handleSampleResume = async () => {
    setError(null);
    try {
      setLoadingStage('Loading sample engineering profile (Alex Mercer)...');
      await new Promise((r) => setTimeout(r, 600));
      setLoadingStage('Extracting Python, React, PostgreSQL & Systems skills...');
      const res = await api.loadDemoResume();
      setLoadingStage('Analysis completed!');
      await new Promise((r) => setTimeout(r, 300));
      onUploadSuccess(res.resume);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample resume.');
    } finally {
      setLoadingStage(null);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to remove your resume? Extracted topics will be cleared.')) {
      try {
        await api.deleteResume();
        onDeleteSuccess();
      } catch (err: any) {
        setError(err.message || 'Failed to delete resume.');
      }
    }
  };

  // If user already has an analyzed resume
  if (resume) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-[#181818] border border-[#303030] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#202020]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#202020] border border-[#FF7900]/40 flex items-center justify-center text-[#FF7900]">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{resume.fullName || 'Candidate Profile'}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                    Verified Analysis
                  </span>
                </div>
                <p className="text-xs text-[#B3B3B3]">
                  {resume.fileName} • {(resume.fileSize / 1024).toFixed(1)} KB • Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToTopics}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors flex items-center gap-1.5 shadow-md shadow-[#FF7900]/20"
              >
                <span>Select Topics ({resume.topics.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                title="Delete Resume"
                className="p-2 rounded-xl text-[#B3B3B3] hover:text-[#EF4444] hover:bg-[#202020] border border-[#303030] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Professional Summary */}
          {resume.summary && (
            <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#FF7900]">Professional Summary</div>
              <p className="text-xs text-[#B3B3B3] leading-relaxed">{resume.summary}</p>
            </div>
          )}

          {/* Technical Skills Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B3B3B3]">
              <Layers className="w-4 h-4 text-[#FF7900]" />
              <span>Extracted Technical Competencies</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {resume.skills.languages?.length > 0 && (
                <div className="p-3 rounded-xl bg-[#111111] border border-[#262626] space-y-1.5">
                  <div className="text-[11px] font-medium text-[#B3B3B3]">Languages</div>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.languages.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-[#181818] text-white border border-[#303030]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resume.skills.frameworks?.length > 0 && (
                <div className="p-3 rounded-xl bg-[#111111] border border-[#262626] space-y-1.5">
                  <div className="text-[11px] font-medium text-[#B3B3B3]">Frameworks & Libraries</div>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.frameworks.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-[#181818] text-[#FF9F43] border border-[#303030]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resume.skills.databases?.length > 0 && (
                <div className="p-3 rounded-xl bg-[#111111] border border-[#262626] space-y-1.5">
                  <div className="text-[11px] font-medium text-[#B3B3B3]">Databases</div>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.databases.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-[#181818] text-white border border-[#303030]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resume.skills.tools?.length > 0 && (
                <div className="p-3 rounded-xl bg-[#111111] border border-[#262626] space-y-1.5">
                  <div className="text-[11px] font-medium text-[#B3B3B3]">Tools & DevOps</div>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.tools.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-[#181818] text-white border border-[#303030]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resume.skills.coreConcepts?.length > 0 && (
                <div className="p-3 rounded-xl bg-[#111111] border border-[#262626] space-y-1.5 md:col-span-2">
                  <div className="text-[11px] font-medium text-[#B3B3B3]">Core Concepts</div>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.coreConcepts.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-[#181818] text-[#22C55E] border border-[#303030]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Projects and Work Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {resume.projects?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B3B3B3]">
                  <FolderGit2 className="w-4 h-4 text-[#FF7900]" />
                  <span>Projects ({resume.projects.length})</span>
                </div>
                <div className="space-y-2">
                  {resume.projects.slice(0, 2).map((p, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#111111] border border-[#262626] space-y-1">
                      <div className="text-xs font-semibold text-white">{p.title}</div>
                      <p className="text-[11px] text-[#B3B3B3] line-clamp-2">{p.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.techStack.map((tech, ti) => (
                          <span key={ti} className="text-[9px] px-1.5 py-0.5 rounded bg-[#181818] text-[#FF9F43]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resume.experience?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B3B3B3]">
                  <Briefcase className="w-4 h-4 text-[#FF7900]" />
                  <span>Experience ({resume.experience.length})</span>
                </div>
                <div className="space-y-2">
                  {resume.experience.slice(0, 2).map((exp, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#111111] border border-[#262626] space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-white">{exp.role}</span>
                        <span className="text-[10px] text-[#888888]">{exp.duration}</span>
                      </div>
                      <div className="text-[11px] text-[#FF7900]">{exp.company}</div>
                      <p className="text-[11px] text-[#B3B3B3] line-clamp-2">{exp.highlights[0]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mandatory Empty-State Behavior
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#181818] via-[#111111] to-[#181818] border border-[#303030] p-6 sm:p-8 space-y-3 relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FF7900]/10 border border-[#FF7900]/30 text-[11px] font-semibold text-[#FF7900]">
            <Sparkles className="w-3.5 h-3.5" /> Step 1 of Preparation
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Upload Your Resume to Begin
          </h2>
          <p className="text-xs sm:text-sm text-[#B3B3B3] leading-relaxed">
            InterVue requires your actual resume to extract your genuine technical stack, framework projects, and computer science concepts.
            No generic question banks are used—every practice session is grounded in your verified experience.
          </p>
        </div>
      </div>

      {/* Loading Overlay */}
      {loadingStage && (
        <div className="p-6 rounded-2xl bg-[#181818] border border-[#FF7900]/50 text-center space-y-3 glow-orange-sm animate-pulse">
          <div className="w-8 h-8 border-3 border-[#FF7900] border-t-transparent rounded-full animate-spin mx-auto" />
          <h4 className="text-sm font-semibold text-white">{loadingStage}</h4>
          <p className="text-xs text-[#B3B3B3]">Extracting skills, verifying project evidence, and mapping competencies.</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-3 text-xs text-[#EF4444]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Document Parsing Notice</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Upload Card */}
      <div className="rounded-2xl bg-[#181818] border border-[#303030] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#202020] pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'upload' ? 'bg-[#FF7900] text-black' : 'bg-[#202020] text-[#B3B3B3] hover:text-white'
              }`}
            >
              Upload Document (PDF / DOCX)
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'paste' ? 'bg-[#FF7900] text-black' : 'bg-[#202020] text-[#B3B3B3] hover:text-white'
              }`}
            >
              Paste Resume Text
            </button>
          </div>

          <button
            onClick={handleSampleResume}
            disabled={Boolean(loadingStage)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#FF9F43] bg-[#FF7900]/10 hover:bg-[#FF7900]/20 border border-[#FF7900]/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Resume (Alex Mercer)</span>
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 sm:p-14 text-center transition-all ${
              isDragging
                ? 'border-[#FF7900] bg-[#FF7900]/5 glow-orange-sm'
                : 'border-[#303030] hover:border-[#FF7900]/60 bg-[#111111]/70'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-[#181818] border border-[#303030] mx-auto flex items-center justify-center text-[#FF7900] shadow-lg mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">Drag & drop your resume file here</h4>
            <p className="text-xs text-[#B3B3B3] mt-1">Supports PDF and DOCX files up to 15MB</p>
            <div className="pt-4">
              <span className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-[#202020] text-[#FF9F43] border border-[#303030]">
                Or click to browse from device
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              rows={10}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your plain-text resume here... (Education, Skills, Experience, Projects)"
              className="w-full p-4 rounded-xl bg-[#111111] border border-[#303030] text-xs font-mono text-white placeholder-[#555555] focus:outline-none focus:border-[#FF7900] transition-colors resize-y"
            />
            <button
              onClick={handlePasteSubmit}
              disabled={Boolean(loadingStage)}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors flex items-center gap-2 shadow-md shadow-[#FF7900]/25 disabled:opacity-50"
            >
              <span>Analyze Pasted Text</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Informational Guidance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#202020]">
          <div className="p-3.5 rounded-xl bg-[#111111] border border-[#262626] space-y-1 text-xs">
            <span className="font-semibold text-white block">Real Skill Extraction</span>
            <p className="text-[#B3B3B3] text-[11px]">We only quiz you on languages, tools, and projects actually present in your document.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#111111] border border-[#262626] space-y-1 text-xs">
            <span className="font-semibold text-white block">30 Progressive Questions</span>
            <p className="text-[#B3B3B3] text-[11px]">Structured cleanly across Easy (10), Medium (10), and Hard (10) tiers.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#111111] border border-[#262626] space-y-1 text-xs">
            <span className="font-semibold text-white block">Optional Job Description</span>
            <p className="text-[#B3B3B3] text-[11px]">Add a target job spec to identify skill overlaps and missing competencies.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
