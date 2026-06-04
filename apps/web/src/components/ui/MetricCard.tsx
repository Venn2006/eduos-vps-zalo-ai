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
  
  const colorStyles = {
    primary: "from-primary/10 to-primary/5 text-primary border-primary/20",
    success: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-500/20",
    danger: "from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-500/20",
    warning: "from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-500/20",
    info: "from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-500/20",
    default: "from-slate-100 to-slate-50 text-slate-600 border-slate-200"
  }

  return (
    <Card className={cn(
      "relative overflow-hidden group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 border-slate-200/60 rounded-2xl",
      className
    )} {...props}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
              {trend && (
                <div className={cn(
                  "flex items-center text-xs font-semibold px-2 py-1 rounded-full",
                  trend === "up" ? "text-emerald-700 bg-emerald-100" :
                  trend === "down" ? "text-rose-700 bg-rose-100" :
                  "text-slate-600 bg-slate-100"
                )}>
                  {trend === "up" && <TrendingUp className="w-3 h-3 mr-1" />}
                  {trend === "down" && <TrendingDown className="w-3 h-3 mr-1" />}
                  {trend === "neutral" && <Minus className="w-3 h-3 mr-1" />}
                  {trendValue}
                </div>
              )}
            </div>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          {icon && (
            <div className={cn(
              "p-3 rounded-2xl bg-gradient-to-br shadow-sm transition-transform duration-300 group-hover:scale-110",
              colorStyles[color]
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
