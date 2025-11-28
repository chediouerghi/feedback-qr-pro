"use client"

import { cn } from "@/lib/utils"
import { Award, Shield, Star, Crown } from "lucide-react"

type BadgeType = "new" | "trusted" | "expert"
type LevelType = "bronze" | "silver" | "gold" | "platinum"

interface ReviewerBadgeProps {
  badge: BadgeType
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

interface QRLevelBadgeProps {
  level: LevelType
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

const badgeConfig: Record<BadgeType, { label: string; icon: typeof Star; className: string }> = {
  new: {
    label: "New Reviewer",
    icon: Star,
    className: "bg-muted text-muted-foreground border-border",
  },
  trusted: {
    label: "Trusted Reviewer",
    icon: Shield,
    className: "bg-secondary/10 text-secondary border-secondary/30",
  },
  expert: {
    label: "Expert Feedbacker",
    icon: Award,
    className: "bg-warning/10 text-warning border-warning/30",
  },
}

const levelConfig: Record<LevelType, { label: string; icon: typeof Crown; className: string }> = {
  bronze: {
    label: "Bronze",
    icon: Award,
    className: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400",
  },
  silver: {
    label: "Argent",
    icon: Award,
    className: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300",
  },
  gold: {
    label: "Or",
    icon: Crown,
    className: "bg-yellow-100 text-yellow-700 border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  platinum: {
    label: "Platine",
    icon: Crown,
    className: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400",
  },
}

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-xs gap-1",
  md: "px-2 py-1 text-sm gap-1.5",
  lg: "px-3 py-1.5 text-base gap-2",
}

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

export function ReviewerBadge({ badge, size = "md", showLabel = true }: ReviewerBadgeProps) {
  const config = badgeConfig[badge]
  const Icon = config.icon

  return (
    <span
      className={cn("inline-flex items-center rounded-full border font-medium", sizeClasses[size], config.className)}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}

export function QRLevelBadge({ level, size = "md", showLabel = true }: QRLevelBadgeProps) {
  const config = levelConfig[level]
  const Icon = config.icon

  return (
    <span
      className={cn("inline-flex items-center rounded-full border font-medium", sizeClasses[size], config.className)}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}
