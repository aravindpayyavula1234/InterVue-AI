import React from 'react';
import {
  FileCheck2,
  Cpu,
  SlidersHorizontal,
  Mic,
  Award,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Code2,
  Terminal,
  Volume2,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const features = [
    {
      title: 'Resume Intelligence',
      desc: 'Parses your authentic document to extract genuine programming skills, projects, and domain experience without generic templates.',
      icon: FileCheck2,
    },
    {
      title: 'Personalized Interview Questions',
      desc: 'Generates 30 progressive technical questions mapped directly to your actual projects, frameworks, and architecture decisions.',
      icon: Cpu,
    },
    {
      title: 'Topic-Based Preparation',
      desc: 'Fine-tune your session scope. Choose specific topics with strict Easy -> Medium -> Hard difficulty progressions.',
      icon: SlidersHorizontal,
    },
    {
      title: 'Audio Mock Interviews',
      desc: 'Practice realistic verbal communication with natural text-to-speech question reading and speech-to-text response capture.',
      icon: Mic,
    },
    {
      title: 'Answer Feedback & Rubrics',
      desc: 'Receive immediate 100-point rubric scores, strengths, weaknesses, pristine model answers, and candidate-tailored improvements.',
      icon: Award,
    },
    {
      title: 'Performance Analytics',
      desc: 'Track your growth across question difficulty, topic proficiencies, and recurring error patterns with interactive visualizations.',
      icon: TrendingUp,
    },
  ];

  const steps = [
    { num: '01', title: 'Upload your resume', desc: 'Securely upload your PDF, DOCX, or paste text to initialize parsing.' },
    { num: '02', title: 'Review & select extracted topics', desc: 'Inspect verified topics, evidence citations, and customize interview focus.' },
    { num: '03', title: 'Generate personalized questions', desc: 'Our AI agent creates 30 progressive, structured interview questions.' },
    { num: '04', title: 'Practice through text or audio', desc: 'Simulate a live interview environment with voice questions and speech input.' },
    { num: '05', title: 'Review feedback and improve', desc: 'Compare your answers against model answers and rubric breakdowns.' },
    { num: '06', title: 'Track progress over time', desc: 'Monitor your readiness trends, topic proficiencies, and revision checklist.' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-dot-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B]/40 via-transparent to-[#0B0B0B] pointer-events-none" />

        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#FF7900]/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#303030] text-xs font-medium text-[#FF9F43]">
            <span className="w-2 h-2 rounded-full bg-[#FF7900] animate-ping" />
            AI-Powered Technical Interview Engine
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Turn Your Resume Into Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7900] via-[#FF9F43] to-[#FF7900]">
              Interview Advantage.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-[#B3B3B3] leading-relaxed">
            Upload your resume, discover your interview topics, practice personalized questions, and improve with actionable feedback.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-all duration-200 shadow-xl shadow-[#FF7900]/25 flex items-center justify-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-medium text-white bg-[#181818] hover:bg-[#202020] border border-[#303030] hover:border-[#454545] transition-all flex items-center justify-center"
            >
              Explore Features
            </a>
          </div>

          {/* Interactive Preview Mockup Card */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-[#303030] bg-[#111111]/90 p-5 shadow-2xl backdrop-blur-xl glow-orange-sm text-left">
              <div className="flex items-center justify-between pb-4 border-b border-[#202020]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
                  <span className="w-3 h-3 rounded-full bg-[#FF9F43]/80" />
                  <span className="w-3 h-3 rounded-full bg-[#22C55E]/80" />
                  <span className="text-xs font-mono text-[#B3B3B3] ml-3">intervue-agent://session/runtime</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded bg-[#FF7900]/20 text-[#FF7900] border border-[#FF7900]/30 font-medium">
                  Mode: Progressive Topic-Based
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-3.5 rounded-xl bg-[#181818] border border-[#303030] space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-[#B3B3B3] font-semibold">Extracted Resume Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Python', 'React', 'PostgreSQL', 'Redis', 'Docker'].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-xs bg-[#202020] text-[#FF9F43] border border-[#303030]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#181818] border border-[#303030] space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#B3B3B3] font-semibold">
                    <span>Generated Question #14 (Medium)</span>
                    <span className="text-[#22C55E] flex items-center gap-1 font-mono">
                      <Volume2 className="w-3 h-3" /> Audio Enabled
                    </span>
                  </div>
                  <p className="text-xs text-white line-clamp-2">
                    "In your Distributed Cache project, how did you handle cache invalidation and stampede scenarios during traffic surges with Redis?"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#202020] bg-[#111111]/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#FF7900]">Core Capabilities</h2>
            <h3 className="text-3xl sm:text-4xl font-bold">Engineered for Technical Mastery</h3>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#B3B3B3]">
              Every tool in InterVue is designed to replicate real engineering interviews with precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#181818] border border-[#303030] hover:border-[#FF7900]/50 transition-all hover:translate-y-[-2px] space-y-3 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#202020] border border-[#303030] flex items-center justify-center text-[#FF7900] group-hover:scale-110 group-hover:bg-[#FF7900]/10 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-semibold text-white group-hover:text-[#FF7900] transition-colors">{f.title}</h4>
                  <p className="text-sm text-[#B3B3B3] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#202020] bg-[#0B0B0B]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#FF7900]">Step-by-Step Workflow</h2>
            <h3 className="text-3xl sm:text-4xl font-bold">How InterVue Works</h3>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#B3B3B3]">
              A deterministic six-step pipeline from raw resume to interview readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="p-6 rounded-2xl bg-[#181818] border border-[#303030] relative overflow-hidden space-y-3">
                <div className="font-mono text-3xl font-extrabold text-[#303030]">{step.num}</div>
                <h4 className="text-base font-semibold text-white">{step.title}</h4>
                <p className="text-xs sm:text-sm text-[#B3B3B3] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security and Privacy */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#202020] bg-[#111111]/50">
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-[#181818] border border-[#303030] space-y-6">
          <div className="flex items-center gap-3 text-[#22C55E]">
            <ShieldCheck className="w-8 h-8" />
            <h3 className="text-2xl font-bold text-white">Security & Privacy First</h3>
          </div>
          <p className="text-sm sm:text-base text-[#B3B3B3] leading-relaxed">
            Your career documents contain sensitive personal and professional details. InterVue enforces strict user data isolation.
            Uploaded resumes, job descriptions, voice captures, and evaluations are tied strictly to your authenticated session.
            We do not share your resumes, and you maintain complete control with one-click data deletion at any time.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#202020] border border-[#303030] text-xs space-y-1">
              <span className="font-semibold text-white">Isolated Accounts</span>
              <p className="text-[#B3B3B3]">Server-enforced session verification on every request.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#202020] border border-[#303030] text-xs space-y-1">
              <span className="font-semibold text-white">Ephemerality Option</span>
              <p className="text-[#B3B3B3]">Delete resume and past sessions whenever you choose.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#202020] border border-[#303030] text-xs space-y-1">
              <span className="font-semibold text-white">Zero Third-Party Leaks</span>
              <p className="text-[#B3B3B3]">No trackers or unverified public data repositories.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#303030] bg-[#0B0B0B] text-xs text-[#B3B3B3]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#FF7900] flex items-center justify-center text-black font-mono font-bold text-xs">
              IV
            </div>
            <span className="font-bold text-white">InterVue</span>
            <span className="text-[#666666]">— Your Resume. Your Skills. Your Interview.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <button onClick={onLogin} className="hover:text-[#FF7900] transition-colors">Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
