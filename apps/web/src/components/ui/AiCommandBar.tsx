'use client';
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AiCommandBar() {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSubmitting(true);
    // Push to the CEO chat page with the query in URL, so the chat page can auto-submit it
    router.push(`/ai-center?q=${encodeURIComponent(query)}`);
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
      
      {/* Suggested Prompts */}
      <div className="mt-4 flex flex-wrap gap-2 relative z-10 pl-1 md:pl-[140px]">
        {[
          "Hôm nay có vấn đề gì nghiêm trọng không?",
          "Hôm nay tuyển được bao nhiêu?",
          "Ai chưa đóng tiền?",
          "Lớp nào có rủi ro học viên nghỉ?",
          "Báo cáo phụ huynh nào chờ duyệt?",
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
