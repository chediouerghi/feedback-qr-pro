"use client"

import useSWR from "swr"
import { KpiCard } from "./kpi-card"
import { TrendChart } from "./trend-chart"
import { RecentFeedbacks } from "./recent-feedbacks"
import { UrgentAlerts } from "./urgent-alerts"
import { MessageSquare, Star, TrendingUp, QrCode, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardData {
  totalFeedbacks: number
  avgRating: number
  nps: number
  activeQRs: number
  recentFeedbacks: Array<{
    id: number
    rating: number
    comment: string | null
    created_at: string
    qr_name: string
    is_urgent: boolean
  }>
  weeklyStats: Array<{
    date: string
    totalFeedbacks: number
    avgRating: number
  }>
  urgentAlerts: Array<{
    id: number
    rating: number
    comment: string | null
    created_at: string
    qr_name: string
    location: string | null
  }>
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function DashboardContent() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<DashboardData>("/api/dashboard", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-danger">Erreur lors du chargement des données</p>
        <Button variant="outline" onClick={() => mutate()} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  const getNpsVariant = (nps: number) => {
    if (nps >= 50) return "success"
    if (nps >= 0) return "warning"
    return "danger"
  }

  const getRatingVariant = (rating: number) => {
    if (rating >= 4) return "success"
    if (rating >= 3) return "warning"
    return "danger"
  }

  return (
    <div className="space-y-6">
      {/* Refresh indicator */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => mutate()} disabled={isValidating} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
          {isValidating ? "Actualisation..." : "Actualiser"}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Feedbacks"
          value={data.totalFeedbacks.toLocaleString("fr-FR")}
          icon={MessageSquare}
          variant="default"
        />
        <KpiCard
          title="Note Moyenne"
          value={`${data.avgRating}/5`}
          icon={Star}
          variant={getRatingVariant(data.avgRating)}
        />
        <KpiCard title="Score NPS" value={data.nps} icon={TrendingUp} variant={getNpsVariant(data.nps)} />
        <KpiCard title="QR Codes Actifs" value={data.activeQRs} icon={QrCode} variant="default" />
      </div>

      {/* Urgent Alerts */}
      <UrgentAlerts alerts={data.urgentAlerts} />

      {/* Charts and Recent Feedbacks */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TrendChart data={data.weeklyStats} />
        <RecentFeedbacks feedbacks={data.recentFeedbacks} />
      </div>
    </div>
  )
}
