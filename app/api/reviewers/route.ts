import { type NextRequest, NextResponse } from "next/server"
import db, { type Reviewer } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const badge = searchParams.get("badge")
  const sortBy = searchParams.get("sortBy") || "engagement_score"
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const offset = Number.parseInt(searchParams.get("offset") || "0")

  let query = `
    SELECT * FROM reviewers
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (badge && ["new", "trusted", "expert"].includes(badge)) {
    query += " AND badge = ?"
    params.push(badge)
  }

  // Sort options
  const sortOptions: Record<string, string> = {
    engagement_score: "engagement_score DESC",
    total_reviews: "total_reviews DESC",
    recent: "last_review_at DESC",
    avg_rating: "avg_rating_given DESC",
  }
  query += ` ORDER BY ${sortOptions[sortBy] || sortOptions.engagement_score}`
  query += " LIMIT ? OFFSET ?"
  params.push(limit, offset)

  const reviewers = db.prepare(query).all(...params) as Reviewer[]
  const total = db.prepare("SELECT COUNT(*) as count FROM reviewers").get() as { count: number }

  return NextResponse.json({
    reviewers,
    total: total.count,
    limit,
    offset,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { display_name, email } = body

    if (!display_name?.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 })
    }

    // Check if reviewer exists by email
    if (email) {
      const existing = db.prepare("SELECT * FROM reviewers WHERE email = ?").get(email) as Reviewer | undefined
      if (existing) {
        return NextResponse.json(existing)
      }
    }

    // Generate avatar URL
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(display_name)}`

    const result = db
      .prepare(`
      INSERT INTO reviewers (display_name, email, avatar_url)
      VALUES (?, ?, ?)
    `)
      .run(display_name, email || null, avatarUrl)

    const reviewer = db.prepare("SELECT * FROM reviewers WHERE id = ?").get(result.lastInsertRowid) as Reviewer

    return NextResponse.json(reviewer)
  } catch (error) {
    console.error("Create reviewer error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
