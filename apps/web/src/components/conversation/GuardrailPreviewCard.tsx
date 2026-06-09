import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

import {
  GuardrailCheckResult,
  GuardrailSeverity,
  GuardrailStatus,
} from '@eduos/shared/src/lib/messageQualityGuardrails';

import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface GuardrailPreviewCardProps {
  result: GuardrailCheckResult;
}

const statusConfig: Record<GuardrailStatus, { label: string; icon: React.ReactNode; color: string }> = {
  SAFE: {
    label: 'An toàn',
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
    color: 'bg-green-100 text-green-800',
  },
  NEEDS_REVIEW: {
    label: 'Cần kiểm tra',
    icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    color: 'bg-yellow-100 text-yellow-800',
  },
  BLOCKED: {
    label: 'Bị chặn',
    icon: <ShieldAlert className="w-4 h-4 text-red-500" />,
    color: 'bg-red-100 text-red-800',
  },
};

const severityConfig: Record<GuardrailSeverity, { label: string; color: string }> = {
  LOW: { label: 'Thấp', color: 'bg-gray-100 text-gray-800' },
  MEDIUM: { label: 'Trung bình', color: 'bg-blue-100 text-blue-800' },
  HIGH: { label: 'Cao', color: 'bg-orange-100 text-orange-800' },
  CRITICAL: { label: 'Rất cao', color: 'bg-red-100 text-red-800' },
};

function cleanGuardrailText(text: string) {
  return text
    .replace('Thiếu lời kêu gọi hành động (Call to Action) để giữ tương tác.', 'Thiếu lời mời phản hồi rõ ràng để giữ tương tác.')
    .replace('Call to Action', 'lời mời phản hồi')
    .replace(/\bLOW\b/g, 'Thấp')
    .replace(/\bMEDIUM\b/g, 'Trung bình')
    .replace(/\bHIGH\b/g, 'Cao')
    .replace(/\bCRITICAL\b/g, 'Rất cao')
    .replace('Kiá»ƒm tra', 'Kiểm tra')
    .replace('LÃ½ do', 'Lý do')
    .replace('Gá»£i Ã½', 'Gợi ý');
}

export function GuardrailPreviewCard({ result }: GuardrailPreviewCardProps) {
  const config = statusConfig[result.status];

  return (
    <Card className="w-full mt-4 border-dashed border-2 bg-slate-50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center gap-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500" />
            Kiểm tra an toàn tin nhắn
          </CardTitle>
          <Badge className={config.color + ' border-none'}>
            <div className="flex items-center gap-1">
              {config.icon}
              {config.label}
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-3">{cleanGuardrailText(result.safeSummary)}</p>

        {result.issues.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-700 mb-2 uppercase">Lý do cần kiểm tra:</p>
            <ul className="space-y-2">
              {result.issues.map((issue, idx) => {
                const severity = severityConfig[issue.severity];

                return (
                  <li key={idx} className="text-sm flex items-start gap-2 bg-white p-2 rounded-md border shadow-sm">
                    <Badge className={severity.color + ' text-[10px]'}>{severity.label}</Badge>
                    <span className="text-slate-700 leading-tight">{cleanGuardrailText(issue.description)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {result.suggestedRewrite && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-xs font-semibold text-green-800 mb-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Gợi ý sửa an toàn hơn:
            </p>
            <p className="text-sm text-green-900 italic whitespace-pre-wrap">
              {cleanGuardrailText(result.suggestedRewrite)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
