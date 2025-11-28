"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ReviewerBadge } from "@/components/ui/badge-level"
import { Star, Loader2, ThumbsUp, Clock, MessageSquare, TrendingUp, AlertTriangle, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Feedback {
  id: number
  rating: number
  comment: string | null
  created_at: string
  is_urgent: boolean
  qr_name: string
  qr_location: string | null
  reviewer_name: string | null
  reviewer_avatar: string | null
  reviewer_badge: "new" | "trusted" | "expert" | null
  reviewer_total_reviews: number | null
  reviewer_engagement_score: number | null
  helpful_votes: number
}

interface Stats {
  total: number
  positive: number
  negative: number
  with_comments: number
  avg_rating: number
}

interface TopFeedbacksResponse {
  feedbacks: Feedback[]
  stats: Stats
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const categories = [
  { id: "best", label: "Meilleurs", icon: Star, description: "Avis 4-5 etoiles avec commentaires" },
  { id: "helpful", label: "Plus utiles", icon: ThumbsUp, description: "Avis les plus votes" },
  { id: "recent", label: "Recents", icon: Clock, description: "Derniers avis recus" },
  { id: "detailed", label: "Detailles", icon: FileText, description: "Commentaires les plus complets" },
  { id: "critical", label: "Critiques", icon: AlertTriangle, description: "Avis negatifs a traiter" },
]

export function TopFeedbacksContent() {
  const [category, setCategory] = useState("best")

  const { data, isLoading, error } = useSWR<TopFeedbacksResponse>(
    `/api/top-feedbacks?category=${category}&limit=30`,
    fetcher,
  )

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">Total Avis</span>
              </div>
              <p className="text-2xl font-bold">{data.stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-primary mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Positifs</span>
              </div>
              <p className="text-2xl font-bold text-primary">{data.stats.positive}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">Négatifs</span>
              </div>
              <p className="text-2xl font-bold text-destructive">{data.stats.negative}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-xs">Avec commentaire</span>
              </div>
              <p className="text-2xl font-bold">{data.stats.with_comments}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-warning mb-1">
                <Star className="h-4 w-4" />
                <span className="text-xs">Note moyenne</span>
              </div>
              <p className="text-2xl font-bold">{data.stats.avg_rating?.toFixed(1) || "-"}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border data-[state=active]:border-primary data-[state=active]:bg-primary/5",
                  cat.id === "critical" &&
                    "data-[state=active]:border-destructive data-[state=active]:bg-destructive/5",
                )}
              >
                <Icon className={cn("h-4 w-4", cat.id === "critical" ? "text-destructive" : "")} />
                {cat.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <cat.icon className={cn("h-5 w-5", cat.id === "critical" ? "text-destructive" : "text-primary")} />
                  {cat.label}
                </CardTitle>
                <CardDescription>{cat.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : data && data.feedbacks.length > 0 ? (
                  <div className="space-y-4">
                    {data.feedbacks.map((feedback, index) => (
                      <div
                        key={feedback.id}
                        className={cn(
                          "flex gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50",
                          index < 3 && category === "best" && "bg-primary/5 border-primary/20",
                          feedback.is_urgent && "border-l-4 border-l-destructive",
                        )}
                      >
                        {/* Rank for top 3 in best category */}
                        {category === "best" && index < 3 && (
                          <div
                            className={cn(
                              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                              index === 0
                                ? "bg-yellow-100 text-yellow-700"
                                : index === 1
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-orange-100 text-orange-700",
                            )}
                          >
                            {index + 1}
                          </div>
                        )}

                        {/* Avatar */}
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

                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <span className="font-medium">{feedback.reviewer_name || "Anonyme"}</span>
                            {feedback.reviewer_badge && <ReviewerBadge badge={feedback.reviewer_badge} size="sm" />}
                            <span className="text-xs text-muted-foreground">sur</span>
                            <span className="text-xs font-medium text-secondary">{feedback.qr_name}</span>
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
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true, locale: fr })}
                            </span>
                          </div>

                          {/* Comment */}
                          {feedback.comment && <p className="text-sm text-foreground mb-2">{feedback.comment}</p>}

                          {/* Footer stats */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {feedback.helpful_votes > 0 && (
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {feedback.helpful_votes} votes utiles
                              </span>
                            )}
                            {feedback.reviewer_total_reviews && feedback.reviewer_total_reviews > 1 && (
                              <span>{feedback.reviewer_total_reviews} avis au total</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <cat.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun avis dans cette catégorie</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
