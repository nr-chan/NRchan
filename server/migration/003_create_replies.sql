CREATE TABLE replies (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id     INTEGER NOT NULL,
  parent_reply  INTEGER,
  username      TEXT,
  uuid          TEXT NOT NULL,
  content       TEXT NOT NULL,
  image_id      INTEGER,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP,
  is_op         INTEGER DEFAULT 0,
  poster_id     TEXT,
  FOREIGN KEY (thread_id)    REFERENCES threads(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_reply) REFERENCES replies(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id)     REFERENCES images(id)
)