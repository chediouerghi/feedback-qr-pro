import { type NextRequest, NextResponse } from "next/server"
import db, { type QRCode } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ qrUrl: string }> }) {
  const { qrUrl } = await params

  try {
    const body = await request.json()
    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Note entre 1 et 5 requise" }, { status: 400 })
    }

    // Find QR code
    const qrCode = db.prepare("SELECT * FROM qr_codes WHERE qr_url = ?").get(qrUrl) as QRCode | undefined
    if (!qrCode) {
      return NextResponse.json({ error: "QR code invalide" }, { status: 404 })
    }

    // Insert feedback
    const isUrgent = rating < 3
    const result = db
      .prepare("INSERT INTO feedbacks (qr_id, rating, comment, is_urgent) VALUES (?, ?, ?, ?)")
      .run(qrCode.id, rating, comment || null, isUrgent ? 1 : 0)

    // Update scan count
    db.prepare("UPDATE qr_codes SET scans_count = scans_count + 1 WHERE id = ?").run(qrCode.id)

    // Update daily stats
    const today = new Date().toISOString().split("T")[0]
    const existingStats = db.prepare("SELECT * FROM feedback_stats WHERE qr_id = ? AND date = ?").get(qrCode.id, today)

    if (existingStats) {
      db.prepare(
        `
        UPDATE feedback_stats 
        SET total_feedbacks = total_feedbacks + 1,
            avg_rating = (SELECT AVG(rating) FROM feedbacks WHERE qr_id = ? AND date(created_at) = ?),
            satisfaction_rate = (SELECT CAST(SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) AS REAL) * 100 / COUNT(*) FROM feedbacks WHERE qr_id = ? AND date(created_at) = ?)
        WHERE qr_id = ? AND date = ?
      `,
      ).run(qrCode.id, today, qrCode.id, today, qrCode.id, today)
    } else {
      db.prepare(
        `
        INSERT INTO feedback_stats (qr_id, date, total_feedbacks, avg_rating, satisfaction_rate)
        VALUES (?, ?, 1, ?, ?)
      `,
      ).run(qrCode.id, today, rating, rating >= 4 ? 100 : 0)
    }

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
    })
  } catch (error) {
    console.error("Feedback submission error:", error)
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ qrUrl: string }> }) {
  const { qrUrl } = await params

  const qrCode = db.prepare("SELECT id, name, location FROM qr_codes WHERE qr_url = ?").get(qrUrl)
  if (!qrCode) {
    return NextResponse.json({ error: "QR code invalide" }, { status: 404 })
  }

  return NextResponse.json(qrCode)
}
