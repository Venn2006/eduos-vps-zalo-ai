import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
}

export function SectionHeader({ title, description, action, className, ...props }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6", className)} {...props}>
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="mt-4 sm:mt-0 flex items-center space-x-2">{action}</div>}
    </div>
  )
}
