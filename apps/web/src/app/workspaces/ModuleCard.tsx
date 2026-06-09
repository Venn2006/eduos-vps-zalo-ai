"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ModuleCard({
  title,
  description,
  href,
  icon,
  disabled,
  badge
}: {
  title: string,
  description: string,
  href: string,
  icon: React.ReactNode,
  disabled?: boolean,
  badge?: string,
  gradient?: string
}) {
  const CardContent = (
    <div className={cn(
      "flex flex-col p-5 rounded-lg border transition-all duration-200 h-full relative overflow-hidden group shadow-sm",
      disabled
        ? "bg-slate-50 border-slate-200 opacity-90 cursor-not-allowed"
        : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md"
    )}>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center border transition-transform duration-200",
            disabled ? "bg-slate-200 text-slate-500 border-slate-200" : "bg-slate-50 text-slate-800 border-slate-200 group-hover:scale-105"
          )}>
            {icon}
          </div>
          {badge && (
            <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-50 text-slate-600 border border-slate-200">
              {badge}
            </span>
          )}
          {!disabled && !badge && (
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-slate-200">
              <ArrowRight className="w-4 h-4 text-slate-700" />
            </div>
          )}
        </div>

        <h3 className={cn("text-lg font-bold mb-2 tracking-tight", disabled ? "text-slate-600" : "text-slate-800 group-hover:text-slate-900 transition-colors")}>
          {title}
        </h3>
        <p className="text-sm flex-1 leading-relaxed font-medium" style={{ color: disabled ? '#64748b' : 'rgba(15, 23, 42, 0.7)' }}>
          {description}
        </p>
      </div>
    </div>
  );

  if (disabled) {
    return (
      <div aria-disabled="true" className="block h-full cursor-not-allowed">
        {CardContent}
      </div>
    );
  }

  return (
    <Link href={href} className="block h-full outline-none focus-visible:ring-4 rounded-lg focus-visible:ring-indigo-500/30">
      {CardContent}
    </Link>
  );
}
