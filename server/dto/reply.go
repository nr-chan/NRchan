package dto

type Reply struct {
	ID          int64   `json:"id"`
	ThreadID    int64   `json:"thread_id"`
	ParentReply *int64  `json:"parent_reply,omitempty"`
	Username    string  `json:"username,omitempty"`
	Content     string  `json:"content"`
	ImageID     *int64  `json:"image_id,omitempty"`
	CreatedAt   string  `json:"created_at,omitempty"`
	IsOP        bool    `json:"is_op"`
	PosterID    string  `json:"poster_id,omitempty"`
}
