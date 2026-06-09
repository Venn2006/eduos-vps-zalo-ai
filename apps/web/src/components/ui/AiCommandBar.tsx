'use client';

import React, { useState } from 'react';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

type AiCommandBarProps = {
  initialPrompt?: string;
  suggestions?: string[];
};

export function AiCommandBar({ initialPrompt = '', suggestions = [] }: AiCommandBarProps) {
  const [query, setQuery] = useState(initialPrompt ?? '');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const message = query.trim();
    if (!message) return;

    setIsSubmitting(true);
    setAnswer('');
    try {
      const res = await fetch('/api/ai/ceo-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.error || 'Không thể hỏi trợ lý lúc này.');
      }

      setAnswer(body.answer || 'Chưa có kết quả phù hợp.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể hỏi trợ lý lúc này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const askSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setAnswer('');
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="flex min-h-12 flex-1 items-center gap-3 rounded-lg border border-white/40 bg-white px-4 shadow-sm ring-1 ring-slate-100">
          <Sparkles className="h-5 w-5 shrink-0 text-violet-600" />
          <input
            type="text"
            placeholder="Hỏi nhanh: Hôm nay trung tâm cần chú ý gì?"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !query.trim()}
          className="inline-flex h-12 min-w-32 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Hỏi trợ lý
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => askSuggestion(suggestion)}
              className="rounded-lg border border-white/50 bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-white hover:text-violet-700"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {answer && (
        <div data-testid="ceo-ai-answer" className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium leading-6 text-emerald-950">
          {answer}
        </div>
      )}
    </div>
  );
}
