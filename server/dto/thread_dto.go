package dto

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ImageInfo struct {
	URL             string `bson:"url,omitempty" json:"url,omitempty"`
	Size            int    `bson:"size,omitempty" json:"size,omitempty"`
	Width           int    `bson:"width,omitempty" json:"width,omitempty"`
	Height          int    `bson:"height,omitempty" json:"height,omitempty"`
	ThumbnailWidth  int    `bson:"thumbnailWidth,omitempty" json:"thumbnailWidth,omitempty"`
	ThumbnailHeight int    `bson:"thumbnailHeight,omitempty" json:"thumbnailHeight,omitempty"`
}

type VoteInfo struct {
	Count int      `bson:"count" json:"count"`
	IDs   []string `bson:"ids" json:"ids"`
}

type Thread struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Username  string             `bson:"username,omitempty" json:"username,omitempty"`
	Board     string             `bson:"board" json:"board"`
	Subject   string             `bson:"subject,omitempty" json:"subject,omitempty"`
	Content   string             `bson:"content" json:"content"`
	Image     *ImageInfo         `bson:"image,omitempty" json:"image,omitempty"`
	Created   time.Time          `bson:"created,omitempty" json:"created,omitempty"`
	LastBump  time.Time          `bson:"lastBump,omitempty" json:"lastBump,omitempty"`
	Replies   []*Reply           `bson:"replies,omitempty" json:"replies,omitempty"`
	PosterID  string             `bson:"posterID,omitempty" json:"posterID,omitempty"`
	Locked    bool               `bson:"locked,omitempty" json:"locked,omitempty"`
	Sticky    bool               `bson:"sticky,omitempty" json:"sticky,omitempty"`
	Upvotes   VoteInfo           `bson:"upvotes,omitempty" json:"upvotes,omitempty"`
	Downvotes VoteInfo           `bson:"downvotes,omitempty" json:"downvotes,omitempty"`
}
