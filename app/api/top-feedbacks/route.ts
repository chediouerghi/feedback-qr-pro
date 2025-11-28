import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || "best"
  const limit = Number.parseInt(searchParams.get("limit") || "20")

  let query = `
    SELECT 
      f.*,
      qc.name as qr_name,
      qc.location as qr_location,
      r.display_name as reviewer_name,
      r.avatar_url as reviewer_avatar,
      r.badge as reviewer_badge,
      r.total_reviews as reviewer_total_reviews,
      r.engagement_score as reviewer_engagement_score
    FROM feedbacks f
    INNER JOIN qr_codes qc ON qc.id = f.qr_id
    LEFT JOIN reviewers r ON r.id = f.reviewer_id
    WHERE qc.user_id = ?
  `
  const params: (string | number)[] = [user.id]

  // Different sorting strategies based on category
  switch (category) {
    case "best":
      // Best rated feedbacks with comments
      query += " AND f.rating >= 4 AND f.comment IS NOT NULL AND f.comment != ''"
      query += " ORDER BY f.rating DESC, f.helpful_votes DESC, f.created_at DESC"
      break
    case "helpful":
      // Most helpful feedbacks
      query += " AND f.helpful_votes > 0"
      query += " ORDER BY f.helpful_votes DESC, f.rating DESC"
      break
    case "recent":
      // Most recent feedbacks
      query += " ORDER BY f.created_at DESC"
      break
    case "detailed":
      // Feedbacks with longest comments
      query += " AND f.comment IS NOT NULL AND LENGTH(f.comment) > 50"
      query += " ORDER BY LENGTH(f.comment) DESC, f.rating DESC"
      break
    case "critical":
      // Critical feedbacks (low ratings with comments)
      query += " AND f.rating <= 2 AND f.comment IS NOT NULL"
      query += " ORDER BY f.created_at DESC"
      break
    default:
      query += " ORDER BY f.created_at DESC"
  }

  query += " LIMIT ?"
  params.push(limit)

  const feedbacks = db.prepare(query).all(...params)

  // Get stats
  const stats = db
    .prepare(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN f.rating >= 4 THEN 1 END) as positive,
      COUNT(CASE WHEN f.rating <= 2 THEN 1 END) as negative,
      COUNT(CASE WHEN f.comment IS NOT NULL AND f.comment != '' THEN 1 END) as with_comments,
      AVG(f.rating) as avg_rating
    FROM feedbacks f
    INNER JOIN qr_codes qc ON qc.id = f.qr_id
    WHERE qc.user_id = ?
  `)
    .get(user.id) as {
    total: number
    positive: number
    negative: number
    with_comments: number
    avg_rating: number
  }

  return NextResponse.json({
    feedbacks,
    stats,
  })
}
