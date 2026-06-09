import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bot, AlertCircle, ArrowRight, Tag } from 'lucide-react';
import { IntelligenceResult } from '@eduos/shared/src/lib/conversationIntelligence';
import { intentTranslations, severityTranslations, getSeverityBadgeVariant } from './translations';

interface Props {
  result: IntelligenceResult;
}

export function ConversationIntelligenceCard({ result }: Props) {
  return (
    <Card className="border-l-4 border-l-primary shadow-sm bg-blue-50/30">
      <CardHeader className="py-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center text-primary">
            <Bot className="w-4 h-4 mr-2" />
            Gợi ý trợ lý
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-white">
              {intentTranslations[result.intent]}
            </Badge>
            <Badge variant={getSeverityBadgeVariant(result.severity)}>
              {severityTranslations[result.severity]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2 pb-4 text-sm space-y-3">
        <div className="text-muted-foreground italic">
          "{result.safeSummary}"
        </div>
        
        {result.suggestedNextAction && (
          <div className="flex items-start text-sm text-foreground">
            <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-primary" />
            <span>
              <span className="font-medium mr-1">Đề xuất:</span>
              {result.suggestedNextAction}
            </span>
          </div>
        )}

        {result.suggestedTags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <Tag className="w-4 h-4 text-muted-foreground mr-1" />
            {result.suggestedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
