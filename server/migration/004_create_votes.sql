CREATE TABLE votes(
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id  INTEGER,
  reply_id   INTEGER,
  voter_id   TEXT NOT NULL,
  vote_type  INTEGER NOT NULL, -- +1 / -1
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_id)  REFERENCES replies(id) ON DELETE CASCADE
)