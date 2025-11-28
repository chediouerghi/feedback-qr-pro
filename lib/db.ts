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

// Initialize schema
const schemaPath = path.join(process.cwd(), "scripts", "001-init-schema.sql")
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, "utf-8")
  db.exec(schema)
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
}

export interface FeedbackStats {
  id: number
  qr_id: number
  date: string
  total_feedbacks: number
  avg_rating: number
  satisfaction_rate: number
}
