package models

import (
	"go.mongodb.org/mongo-driver/v2/bson"
)

type Reply struct {
	ID          bson.ObjectID      `bson:"_id,omitempty" json:"_id"`
	Username    string             `bson:"username,omitempty" json:"username,omitempty"`
	Content     string             `bson:"content" json:"content"`
	Image       *Image             `bson:"image,omitempty" json:"image,omitempty"`
	Created     bson.DateTime      `bson:"created" json:"created"`
	ParentReply bson.ObjectID      `bson:"parentReply,omitempty" json:"parentReply,omitempty"`
	ThreadID    bson.ObjectID      `bson:"threadID" json:"threadID"`
	IsOP        bool               `bson:"isOP" json:"isOP"`
	Upvotes     *Votes              `bson:"upvotes" json:"upvotes"`
	Downvotes   *Votes              `bson:"downvotes" json:"downvotes"`
	PosterID    string             `bson:"posterID,omitempty" json:"posterID,omitempty"`
}
