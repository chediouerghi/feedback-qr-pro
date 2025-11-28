"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  trend?: number
  icon: React.ComponentType<{ className?: string }>
  variant?: "default" | "success" | "warning" | "danger"
}

export function KpiCard({ title, value, trend, icon: Icon, variant = "default" }: KpiCardProps) {
  const variantClasses = {
    default: "bg-secondary/10 text-secondary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-1">
                {trend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-4 w-4 text-danger" />
                ) : (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend > 0 ? "text-success" : trend < 0 ? "text-danger" : "text-muted-foreground",
                  )}
                >
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </span>
                <span className="text-sm text-muted-foreground">vs semaine dernière</span>
              </div>
            )}
          </div>
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", variantClasses[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
