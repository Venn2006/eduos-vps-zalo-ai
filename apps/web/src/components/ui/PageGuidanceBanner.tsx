import React from 'react';
import { Info } from 'lucide-react';

export function PageGuidanceBanner({ title, description }: { title: string, description: string }) {
  return (
    <div className="mb-6 flex items-start gap-4 rounded-lg border border-blue-200/70 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm lg:p-5">
      <div className="shrink-0 rounded-lg border border-blue-100 bg-white p-2 shadow-sm">
        <Info className="h-5 w-5 text-blue-600 lg:h-6 lg:w-6" />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-950 lg:text-xl">{title}</h3>
        <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600 lg:text-base lg:leading-7">{description}</p>
      </div>
    </div>
  );
}
