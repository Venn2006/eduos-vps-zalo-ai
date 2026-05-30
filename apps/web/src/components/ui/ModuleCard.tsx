import * as React from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface ModuleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  bgColor?: string
}

export function ModuleCard({
  title,
  description,
  icon,
  href,
  bgColor = "bg-primary/10 text-primary",
  className,
  ...props
}: ModuleCardProps) {
  return (
    <Link href={href} className="block w-full h-full">
      <Card className={cn("hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full cursor-pointer group border-transparent hover:border-primary/20", className)} {...props}>
        <CardContent className="p-8 flex flex-col items-center text-center space-y-5 h-full relative overflow-hidden">
          {/* Subtle background glow effect */}
          <div className={cn("absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-60", bgColor.split(' ')[0])} />
          
          <div className={cn("p-5 rounded-2xl transition-all duration-300 transform group-hover:scale-110", bgColor, "group-hover:bg-primary group-hover:text-white shadow-sm")}>
            {icon}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
          </div>
          <div className="pt-2 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <span className="text-xs font-semibold text-primary flex items-center gap-1">Truy cập <ArrowRight className="w-3 h-3"/></span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
