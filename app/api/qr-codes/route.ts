import { type NextRequest, NextResponse } from "next/server"
import db, { type QRCode } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { nanoid } from "nanoid"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const qrCodes = db
    .prepare(
      `
    SELECT qc.*, 
           COUNT(f.id) as feedback_count,
           COALESCE(AVG(f.rating), 0) as avg_rating
    FROM qr_codes qc
    LEFT JOIN feedbacks f ON f.qr_id = qc.id
    WHERE qc.user_id = ?
    GROUP BY qc.id
    ORDER BY qc.created_at DESC
  `,
    )
    .all(user.id)

  return NextResponse.json(qrCodes)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  // Check QR limit
  const count = db.prepare("SELECT COUNT(*) as count FROM qr_codes WHERE user_id = ?").get(user.id) as {
    count: number
  }

  if (count.count >= user.qr_limit) {
    return NextResponse.json(
      { error: `Limite de ${user.qr_limit} QR codes atteinte. Passez au plan Pro pour plus.` },
      { status: 403 },
    )
  }

  try {
    const body = await request.json()
    const { name, location } = body

    if (!name) {
      return NextResponse.json({ error: "Nom du QR code requis" }, { status: 400 })
    }

    const qrUrl = nanoid(12)
    const result = db
      .prepare("INSERT INTO qr_codes (user_id, name, location, qr_url) VALUES (?, ?, ?, ?)")
      .run(user.id, name, location || null, qrUrl)

    const qrCode = db.prepare("SELECT * FROM qr_codes WHERE id = ?").get(result.lastInsertRowid) as QRCode

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error("QR creation error:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
