import { NextResponse } from "next/server"
import db from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  // Get all QR codes for user
  const qrCodes = db.prepare("SELECT id FROM qr_codes WHERE user_id = ?").all(user.id) as { id: number }[]
  const qrIds = qrCodes.map((q) => q.id)

  if (qrIds.length === 0) {
    return NextResponse.json({
      totalFeedbacks: 0,
      avgRating: 0,
      nps: 0,
      activeQRs: 0,
      recentFeedbacks: [],
      weeklyStats: [],
      urgentAlerts: [],
    })
  }

  const placeholders = qrIds.map(() => "?").join(",")

  // Total feedbacks
  const totalResult = db
    .prepare(`SELECT COUNT(*) as count FROM feedbacks WHERE qr_id IN (${placeholders})`)
    .get(...qrIds) as { count: number }

  // Average rating
  const avgResult = db
    .prepare(`SELECT AVG(rating) as avg FROM feedbacks WHERE qr_id IN (${placeholders})`)
    .get(...qrIds) as { avg: number | null }

  // NPS calculation (% promoters - % detractors)
  const npsResult = db
    .prepare(
      `
    SELECT 
      CAST(SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) AS REAL) * 100 / COUNT(*) as promoters,
      CAST(SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) AS REAL) * 100 / COUNT(*) as detractors
    FROM feedbacks WHERE qr_id IN (${placeholders})
  `,
    )
    .get(...qrIds) as { promoters: number | null; detractors: number | null }

  const nps = (npsResult.promoters || 0) - (npsResult.detractors || 0)

  // Recent feedbacks
  const recentFeedbacks = db
    .prepare(
      `
    SELECT f.*, qc.name as qr_name 
    FROM feedbacks f
    JOIN qr_codes qc ON qc.id = f.qr_id
    WHERE f.qr_id IN (${placeholders})
    ORDER BY f.created_at DESC
    LIMIT 10
  `,
    )
    .all(...qrIds)

  // Weekly stats (last 7 days)
  const weeklyStats = db
    .prepare(
      `
    SELECT 
      date(created_at) as date,
      COUNT(*) as totalFeedbacks,
      AVG(rating) as avgRating
    FROM feedbacks 
    WHERE qr_id IN (${placeholders})
      AND created_at >= date('now', '-7 days')
    GROUP BY date(created_at)
    ORDER BY date ASC
  `,
    )
    .all(...qrIds)

  // Urgent alerts (rating < 3)
  const urgentAlerts = db
    .prepare(
      `
    SELECT f.*, qc.name as qr_name 
    FROM feedbacks f
    JOIN qr_codes qc ON qc.id = f.qr_id
    WHERE f.qr_id IN (${placeholders})
      AND f.is_urgent = 1
      AND f.created_at >= datetime('now', '-24 hours')
    ORDER BY f.created_at DESC
    LIMIT 5
  `,
    )
    .all(...qrIds)

  return NextResponse.json({
    totalFeedbacks: totalResult.count,
    avgRating: avgResult.avg ? Number(avgResult.avg.toFixed(2)) : 0,
    nps: Math.round(nps),
    activeQRs: qrIds.length,
    recentFeedbacks,
    weeklyStats,
    urgentAlerts,
  })
}
