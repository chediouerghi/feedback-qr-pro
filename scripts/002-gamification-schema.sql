-- Reviewer profiles (clients qui laissent des avis)
CREATE TABLE IF NOT EXISTS reviewers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  total_reviews INTEGER DEFAULT 0,
  avg_rating_given REAL DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  badge TEXT DEFAULT 'new' CHECK(badge IN ('new', 'trusted', 'expert')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_review_at DATETIME
);

-- Update feedbacks to link to reviewers
ALTER TABLE feedbacks ADD COLUMN reviewer_id INTEGER REFERENCES reviewers(id);
ALTER TABLE feedbacks ADD COLUMN is_helpful INTEGER DEFAULT 0;
ALTER TABLE feedbacks ADD COLUMN helpful_votes INTEGER DEFAULT 0;

-- QR code performance metrics
CREATE TABLE IF NOT EXISTS qr_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qr_id INTEGER NOT NULL UNIQUE,
  response_rate REAL DEFAULT 0,
  satisfaction_rate REAL DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  level TEXT DEFAULT 'bronze' CHECK(level IN ('bronze', 'silver', 'gold', 'platinum')),
  rank_position INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (qr_id) REFERENCES qr_codes(id) ON DELETE CASCADE
);

-- Helpful votes tracking
CREATE TABLE IF NOT EXISTS helpful_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feedback_id INTEGER NOT NULL,
  voter_ip TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(feedback_id, voter_ip),
  FOREIGN KEY (feedback_id) REFERENCES feedbacks(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviewers_badge ON reviewers(badge);
CREATE INDEX IF NOT EXISTS idx_reviewers_score ON reviewers(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_helpful ON feedbacks(helpful_votes DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_reviewer ON feedbacks(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_qr_performance_level ON qr_performance(level);
