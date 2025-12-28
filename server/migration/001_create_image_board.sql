CREATE TABLE boards ( 
	board_key TEXT PRIMARY KEY, 
	name TEXT NOT NULL, 
	description TEXT, 
	created_at TEXT DEFAULT CURRENT_TIMESTAMP, 
	updated_at TEXT DEFAULT CURRENT_TIMESTAMP 
)

CREATE TABLE images (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    url               TEXT NOT NULL,
    size              INTEGER,
    width             INTEGER,
    height            INTEGER,
    thumb_width       INTEGER,
    thumb_height      INTEGER
)