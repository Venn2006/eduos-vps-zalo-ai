import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CEOIntelligenceOutput, CEORiskCard } from '@eduos/shared/src/lib/ceoConversationIntelligence';
import { AlertTriangle, Info, CheckCircle, Clock, Search, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CEOConversationIntelligenceCardProps {
  intelligence: CEOIntelligenceOutput;
}

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'PARENT_COMPLAINT': return <AlertTriangle className="w-5 h-5 text-red-600" />;
    case 'AI_DRAFT_PENDING': return <Bot className="w-5 h-5 text-orange-500" />;
    case 'UNANSWERED_LEAD': return <Clock className="w-5 h-5 text-yellow-600" />;
    default: return <Info className="w-5 h-5 text-blue-500" />;
  }
};

import Link from 'next/link';

function RiskCardView({ risk }: { risk: CEORiskCard }) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm flex flex-col gap-2 h-full">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(risk.category)}
            <h4 className="font-semibold text-slate-800 line-clamp-1">{risk.title}</h4>
          </div>
          <Badge className={cn("text-xs font-medium border shrink-0", getSeverityStyles(risk.severity))}>
            {risk.severity === 'CRITICAL' ? 'NGUY HIỂM' : 
             risk.severity === 'HIGH' ? 'CAO' : 
             risk.severity === 'MEDIUM' ? 'TRUNG BÌNH' : 'THẤP'}
          </Badge>
        </div>
        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{risk.safeSummary}</p>
        
        <div className="mt-3 p-3 bg-slate-50 rounded text-sm text-slate-700 border border-slate-100">
          <span className="font-semibold block mb-1 text-xs uppercase tracking-wider text-slate-500">Đề xuất xử lý:</span>
          <p className="line-clamp-2">{risk.recommendedAction}</p>
        </div>
      </div>
      
      {risk.actionUrl && risk.actionLabel && (
        <div className="pt-3 mt-1 border-t border-slate-100 flex justify-end">
          <Link href={risk.actionUrl} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-blue-600 text-white shadow hover:bg-blue-700 rounded-md">
            {risk.actionLabel}
          </Link>
        </div>
      )}
    </div>
  );
}

export function CEOConversationIntelligenceCard({ intelligence, isPreview = false }: CEOConversationIntelligenceCardProps & { isPreview?: boolean }) {
  const isUrgent = intelligence.overallStatus === 'URGENT';
  const isAttention = intelligence.overallStatus === 'NEEDS_ATTENTION';

  return (
    <Card className={cn(
      "w-full shadow-md border-t-4",
      isUrgent ? "border-t-red-500" : isAttention ? "border-t-yellow-500" : "border-t-green-500"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-500" />
              AI theo dõi hội thoại hôm nay
            </CardTitle>
            {isPreview && (
              <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200">
                Bản xem trước AI
              </Badge>
            )}
          </div>
          <Badge className={cn(
            "px-3 py-1 text-sm font-medium",
            isUrgent ? "bg-red-100 text-red-800 border-red-200" :
            isAttention ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
            "bg-green-100 text-green-800 border-green-200"
          )}>
            {isUrgent ? 'Cần xử lý gấp' : isAttention ? 'Cần chú ý' : 'Bình thường'}
          </Badge>
        </div>
        <p className="text-sm text-slate-500 mt-1">EduOS tự tóm tắt tin nhắn, follow-up và rủi ro cần xử lý.</p>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className={cn("text-base font-semibold mb-2", isUrgent ? "text-red-700" : isAttention ? "text-yellow-700" : "text-green-700")}>
            {intelligence.headline}
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
            {intelligence.summaryBullets.map((bullet, idx) => (
              <li key={idx}>{bullet}</li>
            ))}
          </ul>
        </div>

        {intelligence.urgentItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Cần xử lý gấp ({intelligence.urgentItems.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {intelligence.urgentItems.map(item => (
                <RiskCardView key={item.id} risk={item} />
              ))}
            </div>
          </div>
        )}

        {intelligence.riskCards.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" /> Rủi ro lớp/học viên & follow-up ({intelligence.riskCards.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {intelligence.riskCards.map(item => (
                <RiskCardView key={item.id} risk={item} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
