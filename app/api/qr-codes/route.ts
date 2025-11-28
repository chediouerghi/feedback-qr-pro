import { type NextRequest, NextResponse } from "next/server"
import db, { type QRCode } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { nanoid } from "nanoid"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sortBy = searchParams.get("sortBy") || "recent"
  const minRating = searchParams.get("minRating")
  const maxRating = searchParams.get("maxRating")
  const search = searchParams.get("search")
  const level = searchParams.get("level")

  let query = `
    SELECT qc.*, 
           COUNT(f.id) as feedback_count,
           COALESCE(AVG(f.rating), 0) as avg_rating,
           COALESCE(qp.level, 'bronze') as performance_level,
           COALESCE(qp.response_rate, 0) as response_rate,
           COALESCE(qp.satisfaction_rate, 0) as satisfaction_rate,
           COALESCE(qp.share_count, 0) as share_count
    FROM qr_codes qc
    LEFT JOIN feedbacks f ON f.qr_id = qc.id
    LEFT JOIN qr_performance qp ON qp.qr_id = qc.id
    WHERE qc.user_id = ?
  `
  const params: (string | number)[] = [user.id]

  // Search filter
  if (search) {
    query += " AND (qc.name LIKE ? OR qc.location LIKE ?)"
    params.push(`%${search}%`, `%${search}%`)
  }

  // Level filter
  if (level && ["bronze", "silver", "gold", "platinum"].includes(level)) {
    query += " AND COALESCE(qp.level, 'bronze') = ?"
    params.push(level)
  }

  query += " GROUP BY qc.id"

  // Rating filters (applied after grouping)
  if (minRating) {
    query += " HAVING avg_rating >= ?"
    params.push(Number(minRating))
  }
  if (maxRating) {
    if (minRating) {
      query += " AND avg_rating <= ?"
    } else {
      query += " HAVING avg_rating <= ?"
    }
    params.push(Number(maxRating))
  }

  // Sorting options
  const sortOptions: Record<string, string> = {
    recent: "qc.created_at DESC",
    oldest: "qc.created_at ASC",
    rating_high: "avg_rating DESC",
    rating_low: "avg_rating ASC",
    popular: "feedback_count DESC",
    scans: "qc.scans_count DESC",
    name: "qc.name ASC",
  }
  query += ` ORDER BY ${sortOptions[sortBy] || sortOptions.recent}`

  const qrCodes = db.prepare(query).all(...params)

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

    db.prepare(`
      INSERT INTO qr_performance (qr_id, response_rate, satisfaction_rate, level)
      VALUES (?, 0, 0, 'bronze')
    `).run(qrCode.id)

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error("QR creation error:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
