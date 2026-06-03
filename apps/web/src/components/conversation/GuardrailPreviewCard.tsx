import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AlertCircle, CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react';
import { GuardrailCheckResult, GuardrailStatus, GuardrailSeverity } from '@eduos/shared/src/lib/messageQualityGuardrails';

interface GuardrailPreviewCardProps {
  result: GuardrailCheckResult;
}

const statusConfig: Record<GuardrailStatus, { label: string; icon: React.ReactNode; color: string }> = {
  SAFE: { label: "An toàn", icon: <CheckCircle className="w-4 h-4 text-green-500" />, color: "bg-green-100 text-green-800" },
  NEEDS_REVIEW: { label: "Cần kiểm tra", icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />, color: "bg-yellow-100 text-yellow-800" },
  BLOCKED: { label: "Bị chặn", icon: <ShieldAlert className="w-4 h-4 text-red-500" />, color: "bg-red-100 text-red-800" },
};

const severityColor: Record<GuardrailSeverity, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

export function GuardrailPreviewCard({ result }: GuardrailPreviewCardProps) {
  const config = statusConfig[result.status];

  return (
    <Card className="w-full mt-4 border-dashed border-2 bg-slate-50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500" />
            Kiểm tra an toàn tin nhắn
          </CardTitle>
          <Badge className={config.color + " border-none"}>
            <div className="flex items-center gap-1">
              {config.icon}
              {config.label}
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-3">{result.safeSummary}</p>
        
        {result.issues.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-700 mb-2 uppercase">Lý do cần kiểm tra:</p>
            <ul className="space-y-2">
              {result.issues.map((issue, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2 bg-white p-2 rounded-md border shadow-sm">
                  <Badge className={severityColor[issue.severity] + " text-[10px]"}>{issue.severity}</Badge>
                  <span className="text-slate-700 leading-tight">{issue.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.suggestedRewrite && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-xs font-semibold text-green-800 mb-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Gợi ý sửa an toàn hơn:
            </p>
            <p className="text-sm text-green-900 italic whitespace-pre-wrap">{result.suggestedRewrite}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
