"use client"

import { useState } from "react"
import useSWR from "swr"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QRLevelBadge, ReviewerBadge } from "@/components/ui/badge-level"
import { Trophy, Medal, Award, Star, QrCode, Users, TrendingUp, Loader2, MapPin, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface QRRanking {
  id: number
  name: string
  location: string | null
  scans_count: number
  feedback_count: number
  avg_rating: number
  level: "bronze" | "silver" | "gold" | "platinum"
  satisfaction_rate: number
  response_rate: number
  positive_rate: number
  rank: number
}

interface ReviewerRanking {
  id: number
  display_name: string
  avatar_url: string | null
  badge: "new" | "trusted" | "expert"
  total_reviews: number
  avg_rating_given: number
  engagement_score: number
  qr_codes_reviewed: number
  comments_count: number
  rank: number
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />
  if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />
  return (
    <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-muted-foreground">{rank}</span>
  )
}

export function RankingsContent() {
  const [reviewerSort, setReviewerSort] = useState("engagement")
  const [reviewerBadge, setReviewerBadge] = useState("all")

  const { data: qrRankings, isLoading: qrLoading } = useSWR<QRRanking[]>("/api/rankings/qr", fetcher)

  const reviewerParams = new URLSearchParams()
  reviewerParams.set("sortBy", reviewerSort)
  if (reviewerBadge !== "all") reviewerParams.set("badge", reviewerBadge)

  const { data: reviewerRankings, isLoading: reviewerLoading } = useSWR<ReviewerRanking[]>(
    `/api/rankings/reviewers?${reviewerParams.toString()}`,
    fetcher,
  )

  return (
    <Tabs defaultValue="qr" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="qr" className="flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          QR Codes
        </TabsTrigger>
        <TabsTrigger value="reviewers" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Reviewers
        </TabsTrigger>
      </TabsList>

      {/* QR Rankings */}
      <TabsContent value="qr" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top QR Codes
            </CardTitle>
            <CardDescription>Classement basé sur la note moyenne et le nombre de feedbacks</CardDescription>
          </CardHeader>
          <CardContent>
            {qrLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : qrRankings && qrRankings.length > 0 ? (
              <div className="space-y-3">
                {qrRankings.map((qr) => (
                  <div
                    key={qr.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                      qr.rank <= 3 ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-muted/50",
                    )}
                  >
                    <RankIcon rank={qr.rank} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold truncate">{qr.name}</span>
                        <QRLevelBadge level={qr.level} size="sm" />
                      </div>
                      {qr.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {qr.location}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Note</p>
                        <p className="font-semibold flex items-center gap-1">
                          {qr.avg_rating.toFixed(1)}
                          <Star className="h-3 w-3 fill-warning text-warning" />
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Avis</p>
                        <p className="font-semibold">{qr.feedback_count}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Satisfaction</p>
                        <p
                          className={cn(
                            "font-semibold",
                            qr.satisfaction_rate >= 80
                              ? "text-primary"
                              : qr.satisfaction_rate >= 50
                                ? "text-warning"
                                : "text-destructive",
                          )}
                        >
                          {qr.satisfaction_rate?.toFixed(0) || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun QR code avec des feedbacks pour le moment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Reviewer Rankings */}
      <TabsContent value="reviewers" className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Select value={reviewerSort} onValueChange={setReviewerSort}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="reviews">Nombre d'avis</SelectItem>
              <SelectItem value="recent">Plus récent</SelectItem>
              <SelectItem value="rating">Note moyenne</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reviewerBadge} onValueChange={setReviewerBadge}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Badge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les badges</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
              <SelectItem value="trusted">Trusted</SelectItem>
              <SelectItem value="new">New</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-secondary" />
              Top Reviewers
            </CardTitle>
            <CardDescription>Vos clients les plus engagés dans le partage de feedbacks</CardDescription>
          </CardHeader>
          <CardContent>
            {reviewerLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reviewerRankings && reviewerRankings.length > 0 ? (
              <div className="space-y-3">
                {reviewerRankings.map((reviewer) => (
                  <div
                    key={reviewer.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                      reviewer.rank <= 3 ? "bg-secondary/5 border-secondary/20" : "bg-card hover:bg-muted/50",
                    )}
                  >
                    <RankIcon rank={reviewer.rank} />

                    <Avatar className="h-10 w-10">
                      {reviewer.avatar_url ? (
                        <AvatarImage src={reviewer.avatar_url || "/placeholder.svg"} alt={reviewer.display_name} />
                      ) : null}
                      <AvatarFallback className="bg-muted">
                        {reviewer.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold truncate">{reviewer.display_name}</span>
                        <ReviewerBadge badge={reviewer.badge} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground">Score: {reviewer.engagement_score} pts</p>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Avis</p>
                        <p className="font-semibold">{reviewer.total_reviews}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Note moy.</p>
                        <p className="font-semibold flex items-center gap-1">
                          {reviewer.avg_rating_given.toFixed(1)}
                          <Star className="h-3 w-3 fill-warning text-warning" />
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Commentaires</p>
                        <p className="font-semibold flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {reviewer.comments_count}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun reviewer pour le moment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
