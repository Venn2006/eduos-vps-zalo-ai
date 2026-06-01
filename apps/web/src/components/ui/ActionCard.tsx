import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button, buttonVariants } from '@/components/ui/Button';
import { AlertTriangle, Info, CheckCircle2, Bot, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export type Severity = 'critical' | 'warning' | 'info' | 'success';

export interface ActionCardProps {
  title: string;
  metric: string | number;
  severity: Severity;
  reason: string;
  ctaText: string;
  ctaHref: string;
  onAskAi?: () => void;
  icon?: React.ReactNode;
}

const severityConfig = {
  critical: {
    bg: 'bg-rose-50 border-rose-200',
    headerBg: 'bg-rose-100/50',
    iconColor: 'text-rose-600',
    metricColor: 'text-rose-700',
    icon: <AlertTriangle className="w-5 h-5" />
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    headerBg: 'bg-amber-100/50',
    iconColor: 'text-amber-600',
    metricColor: 'text-amber-700',
    icon: <AlertTriangle className="w-5 h-5" />
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    headerBg: 'bg-blue-100/50',
    iconColor: 'text-blue-600',
    metricColor: 'text-blue-700',
    icon: <Info className="w-5 h-5" />
  },
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    headerBg: 'bg-emerald-100/50',
    iconColor: 'text-emerald-600',
    metricColor: 'text-emerald-700',
    icon: <CheckCircle2 className="w-5 h-5" />
  }
};

export function ActionCard({
  title,
  metric,
  severity,
  reason,
  ctaText,
  ctaHref,
  onAskAi,
  icon
}: ActionCardProps) {
  const config = severityConfig[severity];

  return (
    <Card className={`border shadow-sm flex flex-col justify-between overflow-hidden transition-all hover:shadow-md ${config.bg}`}>
      <div>
        <CardHeader className={`p-4 pb-3 border-b border-black/5 flex flex-row items-center justify-between ${config.headerBg}`}>
          <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
            {icon || config.icon}
            {title}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-5 pb-2">
          <div className="flex items-end gap-3 mb-2">
            <span className={`text-4xl font-extrabold tracking-tight leading-none ${config.metricColor}`}>
              {metric}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-600 mt-2 line-clamp-2 min-h-[40px]">
            {reason}
          </p>
        </CardContent>
      </div>
      <CardFooter className="p-4 pt-3 flex items-center justify-between gap-2 border-t border-black/5 bg-white/40">
        <Link href={ctaHref} className={buttonVariants({ variant: "default", size: "sm", className: "w-full justify-between bg-white text-slate-800 border-slate-300 border hover:bg-slate-50 shadow-sm" })}>
          {ctaText} <ArrowRight className="w-4 h-4 opacity-50" />
        </Link>
        {onAskAi && (
          <Button variant="outline" size="icon" className="shrink-0 bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white" onClick={onAskAi} title="Hỏi AI về chỉ số này">
            <Bot className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
