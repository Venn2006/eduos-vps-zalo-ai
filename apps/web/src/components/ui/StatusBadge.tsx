import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusType = "success" | "warning" | "danger" | "info" | "neutral" | "primary"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType
  label: string
  showDot?: boolean
}

export function StatusBadge({ status, label, showDot = true, className, ...props }: StatusBadgeProps) {
  
  const statusStyles: Record<StatusType, { bg: string, text: string, dot: string }> = {
    success: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    warning: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
    danger: { bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-500" },
    info: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    neutral: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
    primary: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
  }

  const style = statusStyles[status]

  return (
    <div 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-transparent shadow-sm",
        style.bg,
        style.text,
        className
      )}
      {...props}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", style.dot)} />
      )}
      {label}
    </div>
  )
}
