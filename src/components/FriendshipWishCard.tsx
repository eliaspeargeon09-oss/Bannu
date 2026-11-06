import React, { useState } from 'react';
import { Heart, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { submitWish } from '../services/wishes';
import { sounds } from '../utils/audio';

interface FriendshipWishCardProps {
  onWishSent?: () => void;
}

export const FriendshipWishCard: React.FC<FriendshipWishCardProps> = ({ onWishSent }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const characterLimit = 1000;
  const charsRemaining = characterLimit - message.length;

  const handleSendWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = message.trim();

    // 1. Validate non-empty
    if (!trimmed) {
      setErrorMessage('Please write your wish before sending ❤️');
      sounds.playTap();
      return;
    }

    // 2. Validate max length
    if (trimmed.length > characterLimit) {
      setErrorMessage(`Message exceeds the ${characterLimit} character limit.`);
      sounds.playTap();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    sounds.playTap();

    try {
      // Option A: Strictly submit only { message: trimmed } to comply with Firestore security rules
      const result = await submitWish(trimmed, false);

      if (result.success) {
        sounds.playCelebration();
        setIsSuccess(true);
        if (onWishSent) {
          onWishSent();
        }
      } else {
        setErrorMessage(
          result.error || 'Failed to submit wish. Please check your connection and try again.'
        );
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(
        error?.message || 'A network error occurred while transmitting your wish.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="friendship-wish-card"
      className="w-full max-w-2xl mx-auto my-4 sm:my-6 rounded-2xl sm:rounded-3xl bg-slate-950/80 border border-amber-500/40 p-5 sm:p-7 backdrop-blur-md shadow-[0_0_40px_rgba(251,191,36,0.2)] text-left relative overflow-hidden transition-all"
    >
      {/* Dynamic ambient gold aura */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {!isSuccess ? (
        <form onSubmit={handleSendWish} className="space-y-4">
          {/* Header & Exact Required Privacy Labels */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Required Label: WRITE YOUR WISH */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/40 text-rose-300 text-[11px] sm:text-xs font-mono-tech uppercase tracking-wider">
                <span className="font-bold">WRITE YOUR WISH 💌</span>
              </div>

              {/* Required Exact Labels: 100% PRIVATE & SECURE / ONLY ELIA CAN READ YOUR WISH */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-mono-tech">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 font-bold tracking-wider">
                  100% PRIVATE &amp; SECURE
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 font-semibold tracking-wider">
                  ONLY ELIA CAN READ YOUR WISH
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed pt-1">
              &ldquo;Write Whatever u want I will close my eyes, just kidding, I wont be saving any of these write whole heartedly❤️&rdquo;
            </p>
          </div>

          {/* Multiline textarea */}
          <div className="relative">
            <textarea
              data-testid="wish-textarea"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Write your wish here..."
              rows={4}
              disabled={isSubmitting}
              className="w-full rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60 p-4 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 resize-none outline-none leading-relaxed transition-all disabled:opacity-50"
            />

            {/* Character limit countdown */}
            <div className="flex items-center justify-between mt-1 px-1 text-[10px] sm:text-xs font-mono-tech">
              <span className="text-slate-400">
                Limit: 1,000 characters
              </span>
              <span
                data-testid="char-counter"
                className={
                  charsRemaining < 50
                    ? 'text-rose-400 font-bold'
                    : 'text-slate-400'
                }
              >
                {message.length} / {characterLimit}
              </span>
            </div>
          </div>

          {/* Friendly Error Message Box */}
          {errorMessage && (
            <div
              data-testid="wish-error"
              className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-200 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Submit Button: SEND WISH ❤️ */}
          <div className="flex justify-center sm:justify-end pt-1">
            <button
              type="submit"
              data-testid="send-wish-button"
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[46px] px-7 py-3 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-display font-extrabold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:shadow-[0_0_35px_rgba(244,63,94,0.6)] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>TRANSMITTING WISH...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>SEND WISH ❤️</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Success Experience strictly matching requirements */
        <div
          data-testid="wish-success"
          className="py-4 sm:py-6 flex flex-col items-center text-center space-y-3 animate-fadeIn"
        >
          {/* Subtle Glowing Success Icon Animation */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.5)]">
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-slate-950 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-display text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-200 uppercase tracking-wide">
              WISH RECEIVED! ❤️
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 font-sans max-w-md mx-auto leading-relaxed">
              &ldquo;Your words mean more than you know. Thank you, Captain!&rdquo;
            </p>
          </div>

          <div className="pt-2 text-[11px] font-mono-tech text-emerald-400/90 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
            <span>TRANSMITTED WITH LOVE</span>
          </div>
        </div>
      )}
    </div>
  );
};
