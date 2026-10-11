import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { X, Star, MessageSquare, CheckCircle2, AlertCircle, Send } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>('interview_quality');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || message.trim().length === 0) {
      setError('Please provide feedback comments.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await api.submitFeedback({
        rating,
        category,
        message,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-[#181818] border border-[#303030] p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#B3B3B3] hover:text-white hover:bg-[#202020] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="w-10 h-10 rounded-xl bg-[#202020] border border-[#FF7900]/30 flex items-center justify-center text-[#FF7900]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Platform Feedback</h3>
          <p className="text-xs text-[#B3B3B3]">
            Help us improve InterVue interview realism, question accuracy, and scoring rubrics.
          </p>
        </div>

        {success ? (
          <div className="p-6 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#22C55E] mx-auto" />
            <h4 className="text-sm font-bold text-white">Thank You!</h4>
            <p className="text-xs text-[#B3B3B3]">Your feedback has been recorded.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Rating Stars */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#B3B3B3] block">Experience Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'text-[#FF7900] fill-[#FF7900]' : 'text-[#444444]'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono text-[#888888] ml-2">{rating}/5 Stars</span>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#B3B3B3] block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111111] border border-[#303030] text-xs text-white focus:outline-none focus:border-[#FF7900]"
              >
                <option value="interview_quality">Interview & Question Realism</option>
                <option value="evaluation_accuracy">Evaluation & Rubric Scoring</option>
                <option value="feature_request">Feature Request</option>
                <option value="bug_report">Bug Report</option>
                <option value="general">General Experience</option>
              </select>
            </div>

            {/* Comments */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#B3B3B3] block">Your Comments</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts on the question difficulty, feedback quality, or feature suggestions..."
                className="w-full p-3 rounded-xl bg-[#111111] border border-[#303030] text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#FF7900] transition-colors resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#FF7900]/25 disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
