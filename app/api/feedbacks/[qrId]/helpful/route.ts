import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ qrId: string }> }) {
  const { qrId } = await params
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { feedbackId } = body

    // Verify QR belongs to user
    const qrCode = db.prepare("SELECT * FROM qr_codes WHERE id = ? AND user_id = ?").get(qrId, user.id)
    if (!qrCode) {
      return NextResponse.json({ error: "QR code non trouvé" }, { status: 404 })
    }

    // Get voter IP (simplified - in production use proper fingerprinting)
    const voterIp = request.headers.get("x-forwarded-for") || "unknown"

    // Check if already voted
    const existingVote = db
      .prepare("SELECT * FROM helpful_votes WHERE feedback_id = ? AND voter_ip = ?")
      .get(feedbackId, voterIp)

    if (existingVote) {
      return NextResponse.json({ error: "Déjà voté" }, { status: 400 })
    }

    // Add vote
    db.prepare("INSERT INTO helpful_votes (feedback_id, voter_ip) VALUES (?, ?)").run(feedbackId, voterIp)
    db.prepare("UPDATE feedbacks SET helpful_votes = helpful_votes + 1 WHERE id = ?").run(feedbackId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Helpful vote error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
