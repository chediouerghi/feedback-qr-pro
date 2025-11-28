"use client"

import useSWR from "swr"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ReviewerBadge, QRLevelBadge } from "@/components/ui/badge-level"
import { Star, Loader2, MessageSquare, Building, MapPin, ThumbsUp, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface QRInfo {
  name: string
  location: string | null
  company: string
  feedbackCount: number
  avgRating: number
  level: "bronze" | "silver" | "gold" | "platinum"
  satisfactionRate: number
}

interface Feedback {
  id: number
  rating: number
  comment: string
  created_at: string
  helpful_votes: number
  reviewer_name: string | null
  reviewer_avatar: string | null
  reviewer_badge: "new" | "trusted" | "expert" | null
}

interface Distribution {
  rating: number
  count: number
}

interface PublicQRResponse {
  qr: QRInfo
  feedbacks: Feedback[]
  distribution: Distribution[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface PublicQRDisplayProps {
  qrUrl: string
}

export function PublicQRDisplay({ qrUrl }: PublicQRDisplayProps) {
  const { data, isLoading, error } = useSWR<PublicQRResponse>(`/api/public/qr/${qrUrl}?badges=true`, fetcher)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Page non trouvée</h2>
            <p className="text-muted-foreground">Ce QR code n'existe pas ou a été supprimé.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { qr, feedbacks, distribution } = data
  const totalRatings = distribution.reduce((acc, d) => acc + d.count, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">FeedbackQR Pro</span>
          </Link>
          <Link href={`/feedback/${qrUrl}`}>
            <Button className="bg-primary hover:bg-primary/90">Donner mon avis</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* QR Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{qr.name}</CardTitle>
                  <QRLevelBadge level={qr.level} size="md" />
                </div>
                <CardDescription className="flex flex-col gap-1">
                  <span className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {qr.company}
                  </span>
                  {qr.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {qr.location}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span className="text-3xl font-bold">{qr.avgRating.toFixed(1)}</span>
                  <Star className="h-7 w-7 fill-warning text-warning" />
                </div>
                <p className="text-sm text-muted-foreground">{qr.feedbackCount} avis</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const item = distribution.find((d) => d.rating === rating)
                const count = item?.count || 0
                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm w-16 flex items-center gap-1">
                      {rating} <Star className="h-3 w-3 fill-warning text-warning" />
                    </span>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 pt-6 border-t flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{qr.satisfactionRate.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Satisfaction</p>
              </div>
              <Link href={`/feedback/${qrUrl}`}>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Donner mon avis
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Feedbacks */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Avis récents
        </h2>

        {feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <Card key={feedback.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      {feedback.reviewer_avatar ? (
                        <AvatarImage
                          src={feedback.reviewer_avatar || "/placeholder.svg"}
                          alt={feedback.reviewer_name || "Anonyme"}
                        />
                      ) : null}
                      <AvatarFallback className="bg-muted">
                        {feedback.reviewer_name ? feedback.reviewer_name.charAt(0).toUpperCase() : "A"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="font-medium">{feedback.reviewer_name || "Anonyme"}</span>
                        {feedback.reviewer_badge && (
                          <ReviewerBadge badge={feedback.reviewer_badge} size="sm" showLabel={false} />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "h-4 w-4",
                                star <= feedback.rating ? "fill-warning text-warning" : "fill-muted text-muted",
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true, locale: fr })}
                        </span>
                      </div>

                      <p className="text-sm">{feedback.comment}</p>

                      {feedback.helpful_votes > 0 && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {feedback.helpful_votes} personnes ont trouvé cet avis utile
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Aucun avis pour le moment</p>
              <Link href={`/feedback/${qrUrl}`}>
                <Button className="mt-4 bg-primary hover:bg-primary/90">Soyez le premier a donner votre avis</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Propulsé par{" "}
          <Link href="/" className="text-primary hover:underline">
            FeedbackQR Pro
          </Link>
        </div>
      </footer>
    </div>
  )
}
