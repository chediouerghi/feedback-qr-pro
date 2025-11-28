"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Star, MapPin, Clock, Loader2, CheckCircle, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Alert {
  id: number
  rating: number
  comment: string | null
  created_at: string
  qr_name: string
  location: string | null
  is_urgent: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AlertsList() {
  const {
    data: alerts,
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR<Alert[]>("/api/alerts", fetcher, {
    refreshInterval: 15000, // Refresh every 15 seconds
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-danger">Erreur lors du chargement des alertes</p>
        <Button variant="outline" onClick={() => mutate()} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Refresh */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {alerts?.length || 0} alerte{(alerts?.length || 0) > 1 ? "s" : ""} trouvée
          {(alerts?.length || 0) > 1 ? "s" : ""}
        </p>
        <Button variant="ghost" size="sm" onClick={() => mutate()} disabled={isValidating} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {alerts && alerts.length === 0 ? (
        <Card className="border-success/50 bg-success/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Tout va bien !</h3>
            <p className="text-muted-foreground text-center">Aucun feedback négatif à traiter pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts?.map((alert) => (
            <Card key={alert.id} className="border-danger/30 hover:border-danger/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-danger" />
                    <CardTitle className="text-base">{alert.qr_name}</CardTitle>
                  </div>
                  <Badge variant="destructive" className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {alert.rating}/5
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-4 text-xs">
                  {alert.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {alert.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(alert.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </CardDescription>
              </CardHeader>
              {alert.comment && (
                <CardContent className="pt-0">
                  <div className="p-3 bg-danger/5 rounded-lg border border-danger/10">
                    <p className="text-sm text-foreground">{alert.comment}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
