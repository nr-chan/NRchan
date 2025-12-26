package dto

type Image struct {
	ID          int64  `json:"-"`
	URL         string `json:"url"`
	Size        int64  `json:"size,omitempty"`
	Width       int64  `json:"width,omitempty"`
	Height      int64  `json:"height,omitempty"`
	ThumbWidth  int64  `json:"thumb_width,omitempty"`
	ThumbHeight int64  `json:"thumb_height,omitempty"`
}

type VoteInfo struct {
	Count int      `json:"count"`
	IDs   []string `json:"-"`
}

type Thread struct {
	ID        int64    `json:"id"`
	BoardID   int64    `json:"board_id"`
	Username  string   `json:"posterID,omitempty"`
	Subject   string   `json:"subject,omitempty"`
	Content   string   `json:"content"`
	ImageID   *int64   `json:"image_id,omitempty"`
	Image     *Image   `json:"image,omitempty"`
	CreatedAt string   `json:"created_at,omitempty"`
	LastBump  string   `json:"last_bump,omitempty"`
	PosterID  string   `json:"-"`
	Locked    bool     `json:"locked"`
	Sticky    bool     `json:"sticky"`
	Replies   []Reply  `json:"replies,omitempty"`
	Upvotes   VoteInfo `json:"upvotes,omitempty"`
	Downvotes VoteInfo `json:"downvotes,omitempty"`
}
