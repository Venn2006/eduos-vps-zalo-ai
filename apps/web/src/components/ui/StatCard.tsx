import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn("hover:shadow-lg transition-all hover:-translate-y-0.5", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
        <CardTitle className="text-base font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon && <div className="p-2 rounded-lg bg-slate-100 text-slate-600">{icon}</div>}
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <div className="text-4xl font-extrabold text-slate-900 mt-1">{value}</div>
        {description && (
          <p className="text-sm text-slate-500 mt-2 font-medium flex items-center">
            {trend === "up" && <span className="text-success bg-success/10 px-1.5 rounded mr-2 inline-flex items-center">↑</span>}
            {trend === "down" && <span className="text-danger bg-danger/10 px-1.5 rounded mr-2 inline-flex items-center">↓</span>}
            {trend === "neutral" && <span className="text-slate-400 bg-slate-100 px-1.5 rounded mr-2 inline-flex items-center">-</span>}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
