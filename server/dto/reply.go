package dto

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Reply struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"_id"`
	Username    string              `bson:"username,omitempty" json:"username,omitempty"`
	Content     string              `bson:"content,omitempty" json:"content,omitempty"`
	Image       *ImageInfo          `bson:"image,omitempty" json:"image,omitempty"`
	Created     time.Time           `bson:"created,omitempty" json:"created,omitempty"`
	ParentReply *primitive.ObjectID `bson:"parentReply,omitempty" json:"parentReply,omitempty"`
	ThreadID    primitive.ObjectID  `bson:"threadID" json:"threadID"`
	IsOP        bool                `bson:"isOP,omitempty" json:"isOP,omitempty"`
	PosterID    string              `bson:"posterID,omitempty" json:"posterID,omitempty"`
}
