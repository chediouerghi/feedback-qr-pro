import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

// Public API to get QR info and recent feedbacks for public display
export async function GET(request: NextRequest, { params }: { params: Promise<{ qrUrl: string }> }) {
  const { qrUrl } = await params
  const { searchParams } = new URL(request.url)
  const showBadges = searchParams.get("badges") !== "false"

  const qrCode = db
    .prepare(`
    SELECT 
      qc.id,
      qc.name,
      qc.location,
      qc.qr_url,
      u.company_name,
      COUNT(f.id) as feedback_count,
      COALESCE(AVG(f.rating), 0) as avg_rating,
      COALESCE(qp.level, 'bronze') as level,
      COALESCE(qp.satisfaction_rate, 0) as satisfaction_rate
    FROM qr_codes qc
    INNER JOIN users u ON u.id = qc.user_id
    LEFT JOIN feedbacks f ON f.qr_id = qc.id
    LEFT JOIN qr_performance qp ON qp.qr_id = qc.id
    WHERE qc.qr_url = ?
    GROUP BY qc.id
  `)
    .get(qrUrl) as
    | {
        id: number
        name: string
        location: string | null
        qr_url: string
        company_name: string
        feedback_count: number
        avg_rating: number
        level: string
        satisfaction_rate: number
      }
    | undefined

  if (!qrCode) {
    return NextResponse.json({ error: "QR code non trouvé" }, { status: 404 })
  }

  // Get recent public feedbacks
  let feedbackQuery = `
    SELECT 
      f.id,
      f.rating,
      f.comment,
      f.created_at,
      f.helpful_votes
  `

  if (showBadges) {
    feedbackQuery += `,
      r.display_name as reviewer_name,
      r.avatar_url as reviewer_avatar,
      r.badge as reviewer_badge
    `
  }

  feedbackQuery += `
    FROM feedbacks f
    LEFT JOIN reviewers r ON r.id = f.reviewer_id
    WHERE f.qr_id = ?
    AND f.comment IS NOT NULL AND f.comment != ''
    ORDER BY f.helpful_votes DESC, f.rating DESC, f.created_at DESC
    LIMIT 10
  `

  const recentFeedbacks = db.prepare(feedbackQuery).all(qrCode.id)

  // Rating distribution
  const distribution = db
    .prepare(`
    SELECT 
      rating,
      COUNT(*) as count
    FROM feedbacks
    WHERE qr_id = ?
    GROUP BY rating
    ORDER BY rating DESC
  `)
    .all(qrCode.id) as { rating: number; count: number }[]

  return NextResponse.json({
    qr: {
      name: qrCode.name,
      location: qrCode.location,
      company: qrCode.company_name,
      feedbackCount: qrCode.feedback_count,
      avgRating: qrCode.avg_rating,
      level: qrCode.level,
      satisfactionRate: qrCode.satisfaction_rate,
    },
    feedbacks: recentFeedbacks,
    distribution,
  })
}
