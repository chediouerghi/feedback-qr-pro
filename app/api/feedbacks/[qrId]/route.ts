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

  // Verify QR belongs to user
  const qrCode = db.prepare("SELECT * FROM qr_codes WHERE id = ? AND user_id = ?").get(qrId, user.id)
  if (!qrCode) {
    return NextResponse.json({ error: "QR code non trouvé" }, { status: 404 })
  }

  const feedbacks = db
    .prepare(
      `
    SELECT * FROM feedbacks 
    WHERE qr_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `,
    )
    .all(qrId, limit)

  return NextResponse.json(feedbacks)
}
