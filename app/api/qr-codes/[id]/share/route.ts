import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  // Verify QR belongs to user
  const qrCode = db.prepare("SELECT * FROM qr_codes WHERE id = ? AND user_id = ?").get(id, user.id)
  if (!qrCode) {
    return NextResponse.json({ error: "QR code non trouvé" }, { status: 404 })
  }

  // Increment share count
  db.prepare(`
    UPDATE qr_performance 
    SET share_count = share_count + 1, updated_at = CURRENT_TIMESTAMP
    WHERE qr_id = ?
  `).run(id)

  return NextResponse.json({ success: true })
}
