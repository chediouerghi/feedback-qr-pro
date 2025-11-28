import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ qrId: string }> }) {
  const { qrId } = await params
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "50")
  const offset = Number.parseInt(searchParams.get("offset") || "0")
  const sortBy = searchParams.get("sortBy") || "recent"
  const minRating = searchParams.get("minRating")
  const maxRating = searchParams.get("maxRating")

  // Verify QR belongs to user
  const qrCode = db.prepare("SELECT * FROM qr_codes WHERE id = ? AND user_id = ?").get(qrId, user.id)
  if (!qrCode) {
    return NextResponse.json({ error: "QR code non trouvé" }, { status: 404 })
  }

  let query = `
    SELECT 
      f.*,
      r.display_name as reviewer_name,
      r.avatar_url as reviewer_avatar,
      r.badge as reviewer_badge,
      r.total_reviews as reviewer_total_reviews
    FROM feedbacks f
    LEFT JOIN reviewers r ON f.reviewer_id = r.id
    WHERE f.qr_id = ?
  `
  const queryParams: (string | number)[] = [Number(qrId)]

  // Rating filters
  if (minRating) {
    query += " AND f.rating >= ?"
    queryParams.push(Number(minRating))
  }
  if (maxRating) {
    query += " AND f.rating <= ?"
    queryParams.push(Number(maxRating))
  }

  // Sorting options
  const sortOptions: Record<string, string> = {
    recent: "f.created_at DESC",
    oldest: "f.created_at ASC",
    highest: "f.rating DESC, f.created_at DESC",
    lowest: "f.rating ASC, f.created_at DESC",
    helpful: "f.helpful_votes DESC, f.created_at DESC",
  }
  query += ` ORDER BY ${sortOptions[sortBy] || sortOptions.recent}`
  query += " LIMIT ? OFFSET ?"
  queryParams.push(limit, offset)

  const feedbacks = db.prepare(query).all(...queryParams)

  // Get total count for pagination
  let countQuery = "SELECT COUNT(*) as count FROM feedbacks WHERE qr_id = ?"
  const countParams: (string | number)[] = [Number(qrId)]
  if (minRating) {
    countQuery += " AND rating >= ?"
    countParams.push(Number(minRating))
  }
  if (maxRating) {
    countQuery += " AND rating <= ?"
    countParams.push(Number(maxRating))
  }
  const total = db.prepare(countQuery).get(...countParams) as { count: number }

  return NextResponse.json({
    feedbacks,
    total: total.count,
    limit,
    offset,
  })
}
