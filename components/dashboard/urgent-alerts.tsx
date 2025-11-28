"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Star, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Alert {
  id: number
  rating: number
  comment: string | null
  created_at: string
  qr_name: string
  location: string | null
}

interface UrgentAlertsProps {
  alerts: Alert[]
}

export function UrgentAlerts({ alerts }: UrgentAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card className="border-success/50 bg-success/5">
        <CardContent className="flex items-center gap-4 py-6">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Aucune alerte</h3>
            <p className="text-sm text-muted-foreground">Pas de feedback négatif dans les dernières 24h</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-danger/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-danger">
          <AlertTriangle className="h-5 w-5" />
          Alertes urgentes
        </CardTitle>
        <CardDescription>Feedbacks négatifs (note {"<"} 3) des dernières 24h</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-3 rounded-lg bg-danger/5 border border-danger/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {alert.rating}/5
                  </Badge>
                  <span className="text-sm font-medium text-foreground">{alert.qr_name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(alert.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </div>
              </div>
              {alert.comment && <p className="text-sm text-foreground">{alert.comment}</p>}
              {alert.location && <p className="text-xs text-muted-foreground">{alert.location}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
