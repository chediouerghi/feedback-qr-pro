"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ReviewerBadge } from "@/components/ui/badge-level"
import { Star, Loader2, MessageSquare, ThumbsUp, Clock, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Feedback {
  id: number
  rating: number
  comment: string | null
  created_at: string
  is_urgent: boolean
  reviewer_name: string | null
  reviewer_avatar: string | null
  reviewer_badge: "new" | "trusted" | "expert" | null
  reviewer_total_reviews: number | null
  helpful_votes: number
}

interface FeedbacksResponse {
  feedbacks: Feedback[]
  total: number
  limit: number
  offset: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface FeedbacksListProps {
  qrId: number
  qrName: string
}

export function FeedbacksList({ qrId, qrName }: FeedbacksListProps) {
  const [filters, setFilters] = useState({
    sortBy: "recent",
    minRating: "",
    maxRating: "",
  })
  const [page, setPage] = useState(0)
  const limit = 20

  const queryParams = new URLSearchParams()
  queryParams.set("limit", String(limit))
  queryParams.set("offset", String(page * limit))
  if (filters.sortBy) queryParams.set("sortBy", filters.sortBy)
  if (filters.minRating) queryParams.set("minRating", filters.minRating)
  if (filters.maxRating) queryParams.set("maxRating", filters.maxRating)

  const { data, isLoading, error } = useSWR<FeedbacksResponse>(
    `/api/feedbacks/${qrId}?${queryParams.toString()}`,
    fetcher,
  )

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  const handleVoteHelpful = async (feedbackId: number) => {
    await fetch(`/api/feedbacks/${qrId}/helpful`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedbackId }),
    })
  }

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
        <p className="text-destructive">Erreur lors du chargement des avis</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtres:</span>
        </div>
        <Select
          value={filters.sortBy}
          onValueChange={(v) => {
            setFilters({ ...filters, sortBy: v })
            setPage(0)
          }}
        >
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récents</SelectItem>
            <SelectItem value="oldest">Plus anciens</SelectItem>
            <SelectItem value="highest">Meilleures notes</SelectItem>
            <SelectItem value="lowest">Notes basses</SelectItem>
            <SelectItem value="helpful">Plus utiles</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.minRating}
          onValueChange={(v) => {
            setFilters({ ...filters, minRating: v })
            setPage(0)
          }}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Note min" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Toutes</SelectItem>
            <SelectItem value="5">5 etoiles</SelectItem>
            <SelectItem value="4">4+ etoiles</SelectItem>
            <SelectItem value="3">3+ etoiles</SelectItem>
            <SelectItem value="2">2+ etoiles</SelectItem>
            <SelectItem value="1">1+ etoile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {data && (
        <p className="text-sm text-muted-foreground">
          {data.total} avis trouve{data.total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Feedbacks List */}
      {data && data.feedbacks.length > 0 ? (
        <div className="space-y-4">
          {data.feedbacks.map((feedback) => (
            <Card
              key={feedback.id}
              className={cn(
                "transition-shadow hover:shadow-md",
                feedback.is_urgent && "border-l-4 border-l-destructive",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    {feedback.reviewer_avatar ? (
                      <AvatarImage
                        src={feedback.reviewer_avatar || "/placeholder.svg"}
                        alt={feedback.reviewer_name || "Anonyme"}
                      />
                    ) : null}
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {feedback.reviewer_name ? feedback.reviewer_name.charAt(0).toUpperCase() : "A"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="font-medium text-foreground">{feedback.reviewer_name || "Anonyme"}</span>
                      {feedback.reviewer_badge && <ReviewerBadge badge={feedback.reviewer_badge} size="sm" />}
                      {feedback.reviewer_total_reviews && feedback.reviewer_total_reviews > 1 && (
                        <span className="text-xs text-muted-foreground">{feedback.reviewer_total_reviews} avis</span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-4 w-4",
                              star <= feedback.rating
                                ? feedback.rating >= 4
                                  ? "fill-primary text-primary"
                                  : feedback.rating >= 3
                                    ? "fill-warning text-warning"
                                    : "fill-destructive text-destructive"
                                : "fill-muted text-muted",
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true, locale: fr })}
                      </span>
                    </div>

                    {/* Comment */}
                    {feedback.comment && <p className="text-sm text-foreground mb-3">{feedback.comment}</p>}

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleVoteHelpful(feedback.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Utile {feedback.helpful_votes > 0 && `(${feedback.helpful_votes})`}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun avis</h3>
            <p className="text-muted-foreground text-center">Ce QR code n'a pas encore reçu d'avis</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
