"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Feedback {
  id: number
  rating: number
  comment: string | null
  created_at: string
  qr_name: string
  is_urgent: boolean
}

interface RecentFeedbacksProps {
  feedbacks: Feedback[]
}

export function RecentFeedbacks({ feedbacks }: RecentFeedbacksProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-success"
    if (rating === 3) return "text-warning"
    return "text-danger"
  }

  const getRatingBg = (rating: number) => {
    if (rating >= 4) return "bg-success/10"
    if (rating === 3) return "bg-warning/10"
    return "bg-danger/10"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedbacks récents
        </CardTitle>
        <CardDescription>Les 10 derniers avis reçus</CardDescription>
      </CardHeader>
      <CardContent>
        {feedbacks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucun feedback pour le moment</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className={cn(
                  "p-4 rounded-lg border transition-colors",
                  feedback.is_urgent ? "border-danger/50 bg-danger/5" : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-normal">
                        {feedback.qr_name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(feedback.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                    {feedback.comment && <p className="text-sm text-foreground">{feedback.comment}</p>}
                  </div>
                  <div className={cn("flex items-center gap-1 px-2 py-1 rounded-md", getRatingBg(feedback.rating))}>
                    <Star className={cn("h-4 w-4 fill-current", getRatingColor(feedback.rating))} />
                    <span className={cn("font-semibold", getRatingColor(feedback.rating))}>{feedback.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
