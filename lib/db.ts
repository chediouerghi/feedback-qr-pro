import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

const DB_PATH = process.env.DATABASE_PATH || "./data/feedbackqr.db"

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(DB_PATH)

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")

// Initialize schemas
const schemaFiles = ["001-init-schema.sql", "002-gamification-schema.sql"]
for (const file of schemaFiles) {
  const schemaPath = path.join(process.cwd(), "scripts", file)
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, "utf-8")
    try {
      db.exec(schema)
    } catch (e) {
      // Ignore ALTER TABLE errors for already existing columns
      if (!(e instanceof Error && e.message.includes("duplicate column"))) {
        console.error(`Schema error in ${file}:`, e)
      }
    }
  }
}

export default db

// Type definitions
export interface User {
  id: number
  email: string
  password_hash: string
  company_name: string
  plan: "free" | "pro" | "enterprise"
  qr_limit: number
  created_at: string
}

export interface QRCode {
  id: number
  user_id: number
  name: string
  location: string | null
  qr_url: string
  scans_count: number
  created_at: string
}

export interface Feedback {
  id: number
  qr_id: number
  rating: number
  comment: string | null
  created_at: string
  is_urgent: boolean
  reviewer_id: number | null
  is_helpful: number
  helpful_votes: number
}

export interface FeedbackStats {
  id: number
  qr_id: number
  date: string
  total_feedbacks: number
  avg_rating: number
  satisfaction_rate: number
}

export interface Reviewer {
  id: number
  display_name: string
  email: string | null
  avatar_url: string | null
  total_reviews: number
  avg_rating_given: number
  engagement_score: number
  badge: "new" | "trusted" | "expert"
  created_at: string
  last_review_at: string | null
}

export interface QRPerformance {
  id: number
  qr_id: number
  response_rate: number
  satisfaction_rate: number
  share_count: number
  level: "bronze" | "silver" | "gold" | "platinum"
  rank_position: number
  updated_at: string
}

// Helper functions for gamification
export function calculateBadge(totalReviews: number, engagementScore: number): Reviewer["badge"] {
  if (totalReviews >= 50 && engagementScore >= 500) return "expert"
  if (totalReviews >= 10 && engagementScore >= 100) return "trusted"
  return "new"
}

export function calculateQRLevel(satisfactionRate: number, responseRate: number): QRPerformance["level"] {
  const score = satisfactionRate * 0.6 + responseRate * 0.4
  if (score >= 90) return "platinum"
  if (score >= 75) return "gold"
  if (score >= 50) return "silver"
  return "bronze"
}
