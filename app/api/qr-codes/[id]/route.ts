import { type NextRequest, NextResponse } from "next/server"
import db, { type QRCode } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const qrCode = db
    .prepare(
      `
    SELECT qc.*, 
           COUNT(f.id) as feedback_count,
           COALESCE(AVG(f.rating), 0) as avg_rating
    FROM qr_codes qc
    LEFT JOIN feedbacks f ON f.qr_id = qc.id
    WHERE qc.id = ? AND qc.user_id = ?
    GROUP BY qc.id
  `,
    )
    .get(id, user.id)

  if (!qrCode) {
    return NextResponse.json({ error: "QR code non trouvé" }, { status: 404 })
  }

  return NextResponse.json(qrCode)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const body = await request.json()
  const { name, location } = body

  const qrCode = db.prepare("SELECT * FROM qr_codes WHERE id = ? AND user_id = ?").get(id, user.id) as
    | QRCode
    | undefined

  if (!qrCode) {
    return NextResponse.json({ error: "QR code non trouvé" }, { status: 404 })
  }

  db.prepare("UPDATE qr_codes SET name = ?, location = ? WHERE id = ?").run(
    name || qrCode.name,
    location ?? qrCode.location,
    id,
  )

  const updated = db.prepare("SELECT * FROM qr_codes WHERE id = ?").get(id)
  return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const qrCode = db.prepare("SELECT * FROM qr_codes WHERE id = ? AND user_id = ?").get(id, user.id)

  if (!qrCode) {
    return NextResponse.json({ error: "QR code non trouvé" }, { status: 404 })
  }

  db.prepare("DELETE FROM qr_codes WHERE id = ?").run(id)

  return NextResponse.json({ success: true })
}
