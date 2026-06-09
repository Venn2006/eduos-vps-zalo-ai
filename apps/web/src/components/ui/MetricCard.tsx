import * as React from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  subtitle?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon?: React.ReactNode
  color?: "primary" | "success" | "danger" | "warning" | "info" | "default"
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = "default",
  className,
  ...props
}: MetricCardProps) {
  
  const accentStyles = {
    primary: "border-l-indigo-500",
    success: "border-l-emerald-500",
    danger: "border-l-rose-500",
    warning: "border-l-amber-500",
    info: "border-l-blue-500",
    default: "border-l-slate-500"
  }

  const iconStyles = {
    primary: "bg-indigo-50 text-indigo-700 border-indigo-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    default: "bg-slate-50 text-slate-700 border-slate-100"
  }

  const activeAccentStyle = accentStyles[color];
  const activeIconStyle = iconStyles[color];

  return (
    <Card className={cn(
      "group relative overflow-hidden rounded-lg border border-l-4 border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
      activeAccentStyle,
      className
    )} {...props}>
      <CardContent className="relative z-10 p-5 lg:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2.5">
            <p className="text-sm font-bold leading-5 text-slate-500 lg:text-[0.95rem]">{title}</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="whitespace-nowrap text-3xl font-black tracking-tight text-slate-950 lg:text-[2rem]">{value}</h3>
              {trend && (
                <div className={cn(
                  "flex items-center text-[10px] font-bold px-2 py-1 rounded-full border whitespace-nowrap",
                  trend === "up" ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
                  trend === "down" ? "text-rose-700 bg-rose-50 border-rose-100" :
                  "text-slate-600 bg-slate-50 border-slate-100"
                )}>
                  {trend === "up" && <TrendingUp className="w-3 h-3 mr-1" />}
                  {trend === "down" && <TrendingDown className="w-3 h-3 mr-1" />}
                  {trend === "neutral" && <Minus className="w-3 h-3 mr-1" />}
                  {trendValue}
                </div>
              )}
            </div>
            {subtitle && <p className="text-sm font-medium leading-5 text-slate-500">{subtitle}</p>}
          </div>
          {icon && (
            <div className={cn("ml-2 shrink-0 rounded-lg border p-3 shadow-sm transition-transform duration-200 group-hover:scale-105", activeIconStyle)}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
