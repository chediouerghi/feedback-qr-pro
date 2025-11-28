-- Users (propriétaires entreprises)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company_name TEXT NOT NULL,
  plan TEXT DEFAULT 'free' CHECK(plan IN ('free','pro','enterprise')),
  qr_limit INTEGER DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- QR Codes générés
CREATE TABLE IF NOT EXISTS qr_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  qr_url TEXT UNIQUE NOT NULL,
  scans_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Feedbacks collectés
CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qr_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_urgent BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (qr_id) REFERENCES qr_codes(id) ON DELETE CASCADE
);

-- Stats agrégées quotidiennes
CREATE TABLE IF NOT EXISTS feedback_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qr_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  total_feedbacks INTEGER DEFAULT 0,
  avg_rating REAL DEFAULT 0,
  satisfaction_rate REAL DEFAULT 0,
  UNIQUE(qr_id, date),
  FOREIGN KEY (qr_id) REFERENCES qr_codes(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedbacks_qr_created ON feedbacks(qr_id, created_at);
CREATE INDEX IF NOT EXISTS idx_stats_qr_date ON feedback_stats(qr_id, date);
