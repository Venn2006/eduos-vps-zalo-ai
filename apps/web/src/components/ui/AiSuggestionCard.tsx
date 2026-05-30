import * as React from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { Sparkles, ArrowRight, Clock, CheckCircle, Zap } from "lucide-react"

export type AiBadgeType = "ai-generated" | "needs-review" | "urgent" | "automated" | "security" | "system"

interface AiSuggestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  type?: "draft" | "alert" | "insight" | "success"
  badges?: AiBadgeType[]
}

const BadgeItem = ({ type }: { type: AiBadgeType }) => {
  switch(type) {
    case "ai-generated": return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20"><Sparkles className="w-3 h-3"/> AI Generated</span>;
    case "needs-review": return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning px-2 py-0.5 rounded border border-warning/20"><Clock className="w-3 h-3"/> Cần duyệt</span>;
    case "urgent": return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-danger/10 text-danger px-2 py-0.5 rounded border border-danger/20">Khẩn cấp</span>;
    case "automated": return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success px-2 py-0.5 rounded border border-success/20"><Zap className="w-3 h-3"/> Tự động hóa</span>;
    case "security": return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-danger/10 text-danger px-2 py-0.5 rounded border border-danger/20">Bảo mật</span>;
    case "system": return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">Hệ thống</span>;
  }
}

export function AiSuggestionCard({
  title,
  description,
  actionLabel = "Xem chi tiết",
  onAction,
  type = "insight",
  badges = ["ai-generated"],
  className,
  ...props
}: AiSuggestionCardProps) {
  const typeStyles = {
    draft: "border-primary/40 bg-gradient-to-r from-primary/5 to-transparent",
    alert: "border-warning/40 bg-gradient-to-r from-warning/5 to-transparent",
    insight: "border-info/40 bg-gradient-to-r from-info/5 to-transparent",
    success: "border-success/40 bg-gradient-to-r from-success/5 to-transparent",
  }

  const iconStyles = {
    draft: "text-primary bg-primary/10",
    alert: "text-warning bg-warning/10",
    insight: "text-info bg-info/10",
    success: "text-success bg-success/10",
  }

  const IconComponent = type === 'success' ? CheckCircle : Sparkles;

  return (
    <Card className={cn("overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-shadow", typeStyles[type], className)} {...props}>
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className={cn("p-2.5 rounded-full shrink-0", iconStyles[type])}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-slate-900">{title}</h4>
            {badges.map(b => <BadgeItem key={b} type={b} />)}
          </div>
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{description}</p>
        </div>
        <Button variant={type === 'alert' ? 'default' : 'outline'} size="sm" onClick={onAction} className={cn("shrink-0 w-full sm:w-auto font-semibold", type === 'alert' && "bg-warning hover:bg-warning/90 text-white border-0")}>
          {actionLabel} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}
