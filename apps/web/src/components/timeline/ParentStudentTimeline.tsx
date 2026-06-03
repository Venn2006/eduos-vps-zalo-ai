import React from 'react';
import { SafeTimelineEvent, filterTimelineForRole } from '@eduos/shared/src/lib/timelineBuilder';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, User, Phone, BookOpen, AlertCircle, CalendarDays, CheckCircle2, Bot, AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ParentStudentTimelineProps {
  events: SafeTimelineEvent[];
  userRole: "OWNER" | "ADMIN" | "SALE" | "TEACHER" | "ACCOUNTANT" | "UNKNOWN";
  isPreview?: boolean;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'LEAD_CREATED': return <User className="w-4 h-4 text-blue-500" />;
    case 'CALL_LOGGED': return <Phone className="w-4 h-4 text-green-500" />;
    case 'TRIAL_BOOKING_CREATED': return <CalendarDays className="w-4 h-4 text-purple-500" />;
    case 'TRIAL_ATTENDED': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case 'PAYMENT_RECORDED': return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
    case 'HOMEWORK_ASSIGNED': return <BookOpen className="w-4 h-4 text-indigo-500" />;
    case 'AI_DRAFT_CREATED': return <Bot className="w-4 h-4 text-orange-500" />;
    case 'PARENT_COMPLAINT_DETECTED': return <ShieldAlert className="w-4 h-4 text-red-600" />;
    case 'RISK_DETECTED': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default: return <Clock className="w-4 h-4 text-slate-400" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export function ParentStudentTimeline({ events, userRole, isPreview = false }: ParentStudentTimelineProps) {
  const safeEvents = filterTimelineForRole(events, userRole);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800">Hành trình học viên / phụ huynh</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Tóm tắt các tương tác quan trọng theo thời gian.</p>
          </div>
          {isPreview && (
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
              Bản xem trước AI từ dữ liệu hiện có
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {safeEvents.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm italic border rounded-lg bg-slate-50">
            Chưa có dữ liệu hành trình.
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {safeEvents.map((event, index) => (
              <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10",
                  event.severity === 'CRITICAL' || event.severity === 'HIGH' ? 'bg-red-50' : ''
                )}>
                  {getEventIcon(event.type)}
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-sm">{event.title}</span>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border">
                      {format(event.occurredAt, "dd/MM/yyyy HH:mm", { locale: vi })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{event.safeSummary}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase text-slate-500 font-semibold bg-slate-50">
                      Nguồn: {event.source}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] text-slate-500 font-semibold">
                      Thực hiện: {event.actorLabel}
                    </Badge>
                    {(event.severity === 'HIGH' || event.severity === 'CRITICAL') && (
                      <Badge variant="outline" className={cn("text-[10px] font-semibold", getSeverityColor(event.severity))}>
                        {event.severity}
                      </Badge>
                    )}
                    {event.tags && event.tags.map(tag => (
                      <Badge key={tag} className="text-[10px] font-semibold bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
