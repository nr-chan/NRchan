package dto

// D1 (SQLite) schema-aligned DTOs for board-related data

type Board struct {
	BoardKey    string          `json:"board_key"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	CreatedAt   string          `json:"created_at,omitempty"`
	UpdatedAt   string          `json:"updated_at,omitempty"`
	Categories  []BoardCategory `json:"categories,omitempty"`
	Links       []BoardLink     `json:"links,omitempty"`
}

type BoardCategory struct {
	ID       int64  `json:"id"`
	Category string `json:"category"`
	BoardID  int64  `json:"board_id"`
}

type BoardLink struct {
	ID      int64  `json:"id"`
	BoardID int64  `json:"board_id"`
	Link    string `json:"link"`
}

type BoardStats struct {
	TotalThreads int64 `json:"total_threads"`
	TotalPosts   int64 `json:"total_posts"`
}
