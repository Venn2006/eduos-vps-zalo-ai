import React from 'react';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, message, icon, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50/50", className)} {...props}>
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-sm">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      {title && <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>}
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
