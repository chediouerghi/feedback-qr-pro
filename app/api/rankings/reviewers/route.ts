import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sortBy = searchParams.get("sortBy") || "engagement"
  const badge = searchParams.get("badge")

  // Get top reviewers who have reviewed this user's QR codes
  let query = `
    SELECT 
      r.id,
      r.display_name,
      r.avatar_url,
      r.badge,
      r.total_reviews,
      r.avg_rating_given,
      r.engagement_score,
      r.created_at,
      r.last_review_at,
      COUNT(DISTINCT f.qr_id) as qr_codes_reviewed,
      COUNT(CASE WHEN f.comment IS NOT NULL AND f.comment != '' THEN 1 END) as comments_count
    FROM reviewers r
    INNER JOIN feedbacks f ON f.reviewer_id = r.id
    INNER JOIN qr_codes qc ON qc.id = f.qr_id
    WHERE qc.user_id = ?
  `
  const params: (string | number)[] = [user.id]

  if (badge && ["new", "trusted", "expert"].includes(badge)) {
    query += " AND r.badge = ?"
    params.push(badge)
  }

  query += " GROUP BY r.id"

  const sortOptions: Record<string, string> = {
    engagement: "r.engagement_score DESC",
    reviews: "r.total_reviews DESC",
    recent: "r.last_review_at DESC",
    rating: "r.avg_rating_given DESC",
  }
  query += ` ORDER BY ${sortOptions[sortBy] || sortOptions.engagement}`
  query += " LIMIT 50"

  const reviewers = db.prepare(query).all(...params)

  // Add rank position
  const rankedData = reviewers.map((reviewer, index) => ({
    ...reviewer,
    rank: index + 1,
  }))

  return NextResponse.json(rankedData)
}
