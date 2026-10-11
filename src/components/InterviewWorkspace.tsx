import React, { useState, useEffect, useRef } from 'react';
import type { InterviewSession, Question, SubmittedAnswer, AnswerEvaluation, FinalReport } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  XCircle,
  Play,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface InterviewWorkspaceProps {
  session: InterviewSession;
  onUpdateSession: (updated: InterviewSession) => void;
  onSessionCompleted: (finalReport: FinalReport) => void;
  onExit: () => void;
}

export const InterviewWorkspace: React.FC<InterviewWorkspaceProps> = ({
  session,
  onUpdateSession,
  onSessionCompleted,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [activeAudioObj, setActiveAudioObj] = useState<HTMLAudioElement | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);

  const currentQuestion: Question = session.questions[currentIndex] || session.questions[0];
  const existingAnswer: SubmittedAnswer | undefined = session.answers[currentQuestion?.id];

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update editor text when navigating between questions
  useEffect(() => {
    if (existingAnswer) {
      setAnswerText(existingAnswer.userAnswer);
    } else {
      setAnswerText('');
    }
    setShowModelAnswer(false);
    setErrorNotice(null);
  }, [currentIndex, session.id]);

  // Clean up any playing audio when switching questions or unmounting
  useEffect(() => {
    return () => {
      if (activeAudioObj) {
        activeAudioObj.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeAudioObj, currentIndex]);

  // Read question aloud (TTS)
  const handlePlayTTS = async () => {
    if (isTtsPlaying) {
      if (activeAudioObj) {
        activeAudioObj.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsTtsPlaying(false);
      return;
    }

    setIsTtsPlaying(true);
    try {
      const res = await api.requestTTS(currentQuestion.text);
      if (res.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${res.audioBase64}`);
        setActiveAudioObj(audio);
        audio.onended = () => setIsTtsPlaying(false);
        audio.onerror = () => {
          fallbackSpeechSynthesis(currentQuestion.text);
        };
        await audio.play();
      } else {
        fallbackSpeechSynthesis(currentQuestion.text);
      }
    } catch {
      fallbackSpeechSynthesis(currentQuestion.text);
    }
  };

  const fallbackSpeechSynthesis = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsTtsPlaying(false);
      utterance.onerror = () => setIsTtsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsTtsPlaying(false);
    }
  };

  // Speech Recognition / Voice Input
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    setErrorNotice(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let interimFull = answerText;

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setAnswerText((prev) => {
            const base = prev.endsWith(' ') || prev.length === 0 ? prev : prev + ' ';
            return base + transcript;
          });
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition warning:', err);
          if (err.error === 'not-allowed') {
            setErrorNotice('Microphone permission denied. Please allow microphone access or use text input.');
          }
          stopRecording();
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
        setIsRecording(true);
        setRecordingSeconds(0);
        return;
      } catch (err) {
        console.warn('Browser speech recognition failed to start, falling back to MediaRecorder', err);
      }
    }

    // MediaRecorder fallback with Gemini audio transcription
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size > 100) {
            const reader = new FileReader();
            reader.onload = async () => {
              const base64 = (reader.result as string).split(',')[1];
              try {
                const res = await api.transcribeAudio(base64, 'audio/webm');
                if (res.text) {
                  setAnswerText((prev) => (prev ? `${prev} ${res.text}` : res.text));
                }
              } catch (e) {
                console.error('Transcription error:', e);
              }
            };
            reader.readAsDataURL(audioBlob);
          }
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        setRecordingSeconds(0);
      } catch (err: any) {
        setErrorNotice('Could not access microphone: ' + (err.message || 'Permission denied'));
      }
    } else {
      setErrorNotice('Speech recording is not supported in this browser. Please type your response.');
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  // Submit Answer for AI Evaluation
  const handleSubmitAnswer = async () => {
    if (isRecording) {
      stopRecording();
    }

    if (!answerText || answerText.trim().length === 0) {
      setErrorNotice('Please provide an answer before submitting for evaluation.');
      return;
    }

    setErrorNotice(null);
    setIsSubmitting(true);
    try {
      const res = await api.submitAnswer(session.id, {
        questionId: currentQuestion.id,
        userAnswer: answerText,
        audioUsed: Boolean(recordingSeconds > 0),
      });

      onUpdateSession(res.session);
    } catch (err: any) {
      setErrorNotice(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete Interview
  const handleFinishInterview = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.completeInterview(session.id);
      onUpdateSession(res.session);
      onSessionCompleted(res.finalReport);
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to complete interview session.');
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(session.answers).length;
  const progressPercent = Math.round((answeredCount / session.questions.length) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Workspace Header Bar */}
      <div className="rounded-2xl bg-[#181818] border border-[#303030] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2 rounded-xl text-[#B3B3B3] hover:text-white bg-[#111111] border border-[#303030] hover:border-[#454545] transition-colors"
            title="Exit Interview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1">{session.title}</h2>
            <div className="flex items-center gap-2 text-xs text-[#B3B3B3]">
              <span className="text-[#FF7900] font-semibold">Question {currentIndex + 1} of {session.questions.length}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#888888]" /> {formatTime(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[11px] text-[#B3B3B3]">Progress: {answeredCount}/{session.questions.length} Answered</span>
            <div className="w-32 h-1.5 rounded-full bg-[#111111] overflow-hidden mt-1">
              <div
                className="h-full bg-[#FF7900] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleFinishInterview}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors shadow-md shadow-[#FF7900]/20 disabled:opacity-50"
          >
            Finish & View Report
          </button>
        </div>
      </div>

      {/* Progress Bar (Mobile) */}
      <div className="md:hidden w-full h-1.5 rounded-full bg-[#181818] overflow-hidden">
        <div
          className="h-full bg-[#FF7900] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="rounded-2xl bg-[#181818] border border-[#303030] p-6 sm:p-8 space-y-6">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                currentQuestion.difficulty === 'Easy'
                  ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                  : currentQuestion.difficulty === 'Medium'
                  ? 'bg-[#FF9F43]/15 text-[#FF9F43] border-[#FF9F43]/30'
                  : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
              }`}
            >
              {currentQuestion.difficulty}
            </span>

            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-[#202020] text-white border border-[#303030]">
              {currentQuestion.topic}
            </span>

            <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg text-xs font-mono text-[#888888] bg-[#111111]">
              Type: {currentQuestion.type.replace('_', ' ')}
            </span>
          </div>

          {/* TTS Audio Question Player */}
          <button
            onClick={handlePlayTTS}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isTtsPlaying
                ? 'bg-[#FF7900]/20 text-[#FF7900] border-[#FF7900] animate-pulse'
                : 'bg-[#202020] text-[#B3B3B3] hover:text-white border-[#303030]'
            }`}
          >
            {isTtsPlaying ? <VolumeX className="w-3.5 h-3.5 text-[#FF7900]" /> : <Volume2 className="w-3.5 h-3.5 text-[#FF7900]" />}
            <span>{isTtsPlaying ? 'Stop Audio' : 'Listen to Question'}</span>
          </button>
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {currentQuestion.text}
          </h3>

          {/* Expected Competencies tags */}
          {currentQuestion.expectedCompetencies?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[10px] uppercase tracking-wider text-[#888888] font-semibold mr-1">
                Target Signals:
              </span>
              {currentQuestion.expectedCompetencies.map((comp, ci) => (
                <span
                  key={ci}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#111111] text-[#B3B3B3] border border-[#252525]"
                >
                  {comp}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Answer Submission Area */}
        <div className="space-y-3 pt-2 border-t border-[#202020]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#B3B3B3]">
              Your Response
            </label>

            <div className="flex items-center gap-2">
              {/* Mic Speech Button */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isRecording
                    ? 'bg-[#EF4444] text-white border-[#EF4444] animate-pulse shadow-md shadow-[#EF4444]/30'
                    : 'bg-[#202020] text-[#FF9F43] hover:text-white border-[#303030] hover:border-[#FF7900]/40'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Stop Recording' : 'Speak Answer'}</span>
              </button>
            </div>
          </div>

          <textarea
            rows={7}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type your response or click 'Speak Answer' to talk into your microphone..."
            className="w-full p-4 rounded-xl bg-[#111111] border border-[#303030] text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#FF7900] transition-colors resize-y font-sans leading-relaxed"
          />

          {errorNotice && (
            <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Submission Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-[#888888]">
              {existingAnswer?.evaluation ? (
                <span className="text-[#22C55E] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Answer Evaluated (Score: {existingAnswer.evaluation.score}/100)
                </span>
              ) : (
                <span>Submit to receive instant AI score, rubric breakdown, and model answer.</span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || answerText.trim().length === 0}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#FF7900]/25 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating Answer...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{existingAnswer ? 'Re-Evaluate Answer' : 'Submit for Evaluation'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Answer Evaluation Report */}
      {existingAnswer?.evaluation && (
        <div className="rounded-2xl bg-[#181818] border border-[#FF7900]/40 p-6 sm:p-8 space-y-6 glow-orange-sm animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202020]">
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-mono font-extrabold ${
                  existingAnswer.evaluation.score >= 80
                    ? 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]'
                    : existingAnswer.evaluation.score >= 60
                    ? 'bg-[#FF9F43]/10 border-[#FF9F43]/40 text-[#FF9F43]'
                    : 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
                }`}
              >
                <span className="text-xl leading-none">{existingAnswer.evaluation.score}</span>
                <span className="text-[10px] text-[#888888]">/100</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#FF7900]" /> Evaluation Report
                </h4>
                <p className="text-xs text-[#B3B3B3]">
                  {existingAnswer.evaluation.score >= 80
                    ? 'Excellent technical delivery and conceptual reasoning.'
                    : existingAnswer.evaluation.score >= 60
                    ? 'Solid foundation with specific technical areas to deepen.'
                    : 'Foundational gaps identified. Review the model answer below.'}
                </p>
              </div>
            </div>

            <div className="text-xs text-[#888888] font-mono">
              Evaluated {new Date(existingAnswer.evaluation.reviewedAt).toLocaleTimeString()}
            </div>
          </div>

          {/* 4 Rubric Dimensions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#111111] border border-[#262626] space-y-1">
              <div className="text-[10px] text-[#888888] uppercase">Technical Correctness</div>
              <div className="text-base font-mono font-bold text-white">
                {existingAnswer.evaluation.rubricBreakdown.technicalCorrectness} pts
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#111111] border border-[#262626] space-y-1">
              <div className="text-[10px] text-[#888888] uppercase">Clarity & Structure</div>
              <div className="text-base font-mono font-bold text-white">
                {existingAnswer.evaluation.rubricBreakdown.clarityAndStructure} pts
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#111111] border border-[#262626] space-y-1">
              <div className="text-[10px] text-[#888888] uppercase">Practical Depth</div>
              <div className="text-base font-mono font-bold text-white">
                {existingAnswer.evaluation.rubricBreakdown.practicalDepth} pts
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#111111] border border-[#262626] space-y-1">
              <div className="text-[10px] text-[#888888] uppercase">Reasoning & Tradeoffs</div>
              <div className="text-base font-mono font-bold text-white">
                {existingAnswer.evaluation.rubricBreakdown.reasoningAndTradeoffs} pts
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#111111] border border-[#22C55E]/20 space-y-2">
              <div className="text-xs font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
              </div>
              <ul className="space-y-1.5">
                {existingAnswer.evaluation.strengths.map((str, i) => (
                  <li key={i} className="text-xs text-[#B3B3B3] flex items-start gap-2">
                    <span className="text-[#22C55E]">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#EF4444]/20 space-y-2">
              <div className="text-xs font-bold text-[#EF4444] uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Improvement Opportunities
              </div>
              <ul className="space-y-1.5">
                {existingAnswer.evaluation.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-[#B3B3B3] flex items-start gap-2">
                    <span className="text-[#EF4444]">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Model Answer (Accordion) */}
          <div className="rounded-xl border border-[#303030] overflow-hidden bg-[#111111]">
            <button
              type="button"
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="w-full p-4 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-white hover:bg-[#161616] transition-colors"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FF7900]" />
                <span>Reference Model Answer & Candidate Improvement</span>
              </span>
              {showModelAnswer ? <ChevronUp className="w-4 h-4 text-[#888888]" /> : <ChevronDown className="w-4 h-4 text-[#888888]" />}
            </button>

            {showModelAnswer && (
              <div className="p-5 border-t border-[#202020] space-y-4 text-xs">
                <div className="space-y-1.5">
                  <div className="font-semibold text-[#FF9F43]">Exemplary Model Answer:</div>
                  <div className="p-3.5 rounded-xl bg-[#181818] border border-[#282828] font-mono text-white leading-relaxed whitespace-pre-line">
                    {existingAnswer.evaluation.modelAnswer}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="font-semibold text-[#22C55E]">How to Improve Your Answer:</div>
                  <div className="p-3.5 rounded-xl bg-[#181818] border border-[#282828] text-[#B3B3B3] leading-relaxed">
                    {existingAnswer.evaluation.improvedAnswer}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#202020] border border-[#303030] text-[11px] text-[#B3B3B3]">
                  <span className="font-semibold text-white">Topic Advice: </span>
                  {existingAnswer.evaluation.topicSpecificFeedback}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#181818] hover:bg-[#202020] border border-[#303030] disabled:opacity-40 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Question</span>
        </button>

        <div className="text-xs font-mono text-[#888888]">
          {currentIndex + 1} / {session.questions.length}
        </div>

        <button
          onClick={() => setCurrentIndex((prev) => Math.min(session.questions.length - 1, prev + 1))}
          disabled={currentIndex === session.questions.length - 1}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-md shadow-[#FF7900]/20"
        >
          <span>Next Question</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#181818] border border-[#303030] p-6 space-y-4 text-center">
            <XCircle className="w-10 h-10 text-[#FF7900] mx-auto" />
            <h4 className="text-base font-bold text-white">Exit Mock Interview?</h4>
            <p className="text-xs text-[#B3B3B3]">
              Your answers evaluated so far are saved. You can resume this session anytime from the History tab.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white bg-[#202020] hover:bg-[#282828] border border-[#303030]"
              >
                Continue Practice
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43]"
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
