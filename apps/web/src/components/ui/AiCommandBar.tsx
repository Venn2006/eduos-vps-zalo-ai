'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Loader2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AiCommandBar({ initialPrompt = '' }: { initialPrompt?: string }) {
  const [query, setQuery] = useState(initialPrompt ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setQuery(initialPrompt ?? '');
  }, [initialPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ai/ceo-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      if (res.ok) {
        setQuery('');
        router.refresh();
      } else {
        alert('Lỗi xử lý yêu cầu AI. Vui lòng thử lại.');
      }
    } catch (err) {
      alert('Không thể kết nối API AI.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 shadow-sm relative overflow-hidden">
      <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
        <div className="flex items-center gap-2 text-primary font-extrabold shrink-0">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-lg tracking-tight">CEO Chat</span>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 w-full flex relative">
          <input 
            type="text" 
            placeholder="Ví dụ: Hôm nay có vấn đề gì nghiêm trọng không?" 
            className="w-full bg-white text-slate-900 border border-primary/20 rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSubmitting}
          />
          <button 
            type="submit" 
            disabled={isSubmitting || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-md hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {initialPrompt && query === initialPrompt && (
        <div className="mt-3 flex items-start gap-2 bg-indigo-50/80 text-indigo-700 text-sm p-3 rounded-lg border border-indigo-100/50 relative z-10 mx-1">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>Câu hỏi đã được điền sẵn. Bấm <span className="font-semibold">Gửi</span> để hỏi AI.</p>
        </div>
      )}
      
      {/* Suggested Prompts */}
      <div className="mt-4 flex flex-wrap gap-2 relative z-10 pl-1 md:pl-[140px]">
        {[
          "Hôm nay có vấn đề gì nghiêm trọng không?",
          "Hôm nay có tin nhắn nào cần xử lý gấp không?",
          "Phụ huynh nào đang không hài lòng?",
          "Lead nào chưa được phản hồi?",
          "Học viên nào có nguy cơ nghỉ?",
          "Zalo/Facebook có lỗi gì không?"
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => setQuery(prompt)}
            className="text-xs bg-white/60 hover:bg-white text-primary-hover border border-primary/20 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
