CREATE TABLE threads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  board_key   TEXT NOT NULL,
  username    TEXT NOT NULL,
  uuid        TEXT NOT NULL,
  subject     TEXT NOT NULL,
  content     TEXT NOT NULL,
  image_id    INTEGER,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
  last_bump   TEXT DEFAULT CURRENT_TIMESTAMP,
  poster_id   TEXT NOT NULL,
  locked      INTEGER DEFAULT 0,
  sticky      INTEGER DEFAULT 0,
  FOREIGN KEY (board_key) REFERENCES boards(board_key) ON DELETE CASCADE,
  FOREIGN KEY (image_id)  REFERENCES images(id)          ON DELETE SET NULL
)