import { NextResponse } from "next/server"
import db from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const qrCodes = db.prepare("SELECT id FROM qr_codes WHERE user_id = ?").all(user.id) as { id: number }[]
  const qrIds = qrCodes.map((q) => q.id)

  if (qrIds.length === 0) {
    return NextResponse.json([])
  }

  const placeholders = qrIds.map(() => "?").join(",")

  const alerts = db
    .prepare(
      `
    SELECT f.*, qc.name as qr_name, qc.location
    FROM feedbacks f
    JOIN qr_codes qc ON qc.id = f.qr_id
    WHERE f.qr_id IN (${placeholders})
      AND f.is_urgent = 1
    ORDER BY f.created_at DESC
    LIMIT 20
  `,
    )
    .all(...qrIds)

  return NextResponse.json(alerts)
}
