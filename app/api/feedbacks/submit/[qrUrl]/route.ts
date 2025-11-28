import { type NextRequest, NextResponse } from "next/server"
import db, { type QRCode, type Reviewer, calculateBadge } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ qrUrl: string }> }) {
  const { qrUrl } = await params

  try {
    const body = await request.json()
    const { rating, comment, reviewer_name, reviewer_email } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Note entre 1 et 5 requise" }, { status: 400 })
    }

    // Find QR code
    const qrCode = db.prepare("SELECT * FROM qr_codes WHERE qr_url = ?").get(qrUrl) as QRCode | undefined
    if (!qrCode) {
      return NextResponse.json({ error: "QR code invalide" }, { status: 404 })
    }

    let reviewerId: number | null = null
    if (reviewer_name?.trim()) {
      // Check if reviewer exists by email
      let reviewer: Reviewer | undefined
      if (reviewer_email) {
        reviewer = db.prepare("SELECT * FROM reviewers WHERE email = ?").get(reviewer_email) as Reviewer | undefined
      }

      if (!reviewer) {
        // Create new reviewer
        const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(reviewer_name)}`
        const result = db
          .prepare(`
          INSERT INTO reviewers (display_name, email, avatar_url)
          VALUES (?, ?, ?)
        `)
          .run(reviewer_name, reviewer_email || null, avatarUrl)
        reviewerId = result.lastInsertRowid as number
      } else {
        reviewerId = reviewer.id
      }

      // Update reviewer stats
      if (reviewerId) {
        const reviewerStats = db
          .prepare(`
          SELECT COUNT(*) as count, AVG(rating) as avg_rating 
          FROM feedbacks WHERE reviewer_id = ?
        `)
          .get(reviewerId) as { count: number; avg_rating: number }

        const newCount = (reviewerStats?.count || 0) + 1
        const newAvg = reviewerStats?.avg_rating
          ? (reviewerStats.avg_rating * reviewerStats.count + rating) / newCount
          : rating

        // Calculate engagement score: reviews * 10 + (avg_rating * 5) + (comment ? 20 : 0)
        const engagementScore = newCount * 10 + Math.round(newAvg * 5) + (comment ? 20 : 0)
        const badge = calculateBadge(newCount, engagementScore)

        db.prepare(`
          UPDATE reviewers 
          SET total_reviews = ?, avg_rating_given = ?, engagement_score = ?, badge = ?, last_review_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(newCount, newAvg, engagementScore, badge, reviewerId)
      }
    }

    // Insert feedback
    const isUrgent = rating < 3
    const result = db
      .prepare("INSERT INTO feedbacks (qr_id, rating, comment, is_urgent, reviewer_id) VALUES (?, ?, ?, ?, ?)")
      .run(qrCode.id, rating, comment || null, isUrgent ? 1 : 0, reviewerId)

    // Update scan count
    db.prepare("UPDATE qr_codes SET scans_count = scans_count + 1 WHERE id = ?").run(qrCode.id)

    // Update daily stats
    const today = new Date().toISOString().split("T")[0]
    const existingStats = db.prepare("SELECT * FROM feedback_stats WHERE qr_id = ? AND date = ?").get(qrCode.id, today)

    if (existingStats) {
      db.prepare(`
        UPDATE feedback_stats 
        SET total_feedbacks = total_feedbacks + 1,
            avg_rating = (SELECT AVG(rating) FROM feedbacks WHERE qr_id = ? AND date(created_at) = ?),
            satisfaction_rate = (SELECT CAST(SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) AS REAL) * 100 / COUNT(*) FROM feedbacks WHERE qr_id = ? AND date(created_at) = ?)
        WHERE qr_id = ? AND date = ?
      `).run(qrCode.id, today, qrCode.id, today, qrCode.id, today)
    } else {
      db.prepare(`
        INSERT INTO feedback_stats (qr_id, date, total_feedbacks, avg_rating, satisfaction_rate)
        VALUES (?, ?, 1, ?, ?)
      `).run(qrCode.id, today, rating, rating >= 4 ? 100 : 0)
    }

    const perfStats = db
      .prepare(`
      SELECT 
        COUNT(*) as total,
        AVG(rating) as avg_rating,
        CAST(SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) AS REAL) * 100 / COUNT(*) as satisfaction
      FROM feedbacks WHERE qr_id = ?
    `)
      .get(qrCode.id) as { total: number; avg_rating: number; satisfaction: number }

    const responseRate = qrCode.scans_count > 0 ? (perfStats.total / (qrCode.scans_count + 1)) * 100 : 0
    const level =
      responseRate >= 80 && perfStats.satisfaction >= 90
        ? "platinum"
        : responseRate >= 60 && perfStats.satisfaction >= 75
          ? "gold"
          : responseRate >= 40 && perfStats.satisfaction >= 50
            ? "silver"
            : "bronze"

    db.prepare(`
      INSERT INTO qr_performance (qr_id, response_rate, satisfaction_rate, level)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(qr_id) DO UPDATE SET
        response_rate = excluded.response_rate,
        satisfaction_rate = excluded.satisfaction_rate,
        level = excluded.level,
        updated_at = CURRENT_TIMESTAMP
    `).run(qrCode.id, responseRate, perfStats.satisfaction || 0, level)

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
