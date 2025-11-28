import { NextResponse } from "next/server"
import db from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  // Get QR rankings for this user's QR codes
  const rankings = db
    .prepare(`
    SELECT 
      qc.id,
      qc.name,
      qc.location,
      qc.scans_count,
      COUNT(f.id) as feedback_count,
      COALESCE(AVG(f.rating), 0) as avg_rating,
      COALESCE(qp.level, 'bronze') as level,
      COALESCE(qp.satisfaction_rate, 0) as satisfaction_rate,
      COALESCE(qp.response_rate, 0) as response_rate,
      COALESCE(qp.share_count, 0) as share_count,
      CAST(SUM(CASE WHEN f.rating >= 4 THEN 1 ELSE 0 END) AS REAL) * 100 / NULLIF(COUNT(f.id), 0) as positive_rate
    FROM qr_codes qc
    LEFT JOIN feedbacks f ON f.qr_id = qc.id
    LEFT JOIN qr_performance qp ON qp.qr_id = qc.id
    WHERE qc.user_id = ?
    GROUP BY qc.id
    HAVING feedback_count > 0
    ORDER BY avg_rating DESC, feedback_count DESC
    LIMIT 50
  `)
    .all(user.id)

  // Add rank position
  const rankedData = rankings.map((qr, index) => ({
    ...qr,
    rank: index + 1,
  }))

  return NextResponse.json(rankedData)
}
