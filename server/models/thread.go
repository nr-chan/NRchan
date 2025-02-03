package models;

import (
	"go.mongodb.org/mongo-driver/v2/bson"
)

type Thread struct {
	ID        bson.ObjectID      `bson:"_id,omitempty" json:"_id"`
	Username  string             `bson:"username,omitempty" json:"username,omitempty"`
	Board     string             `bson:"board" json:"board"`
	Subject   string             `bson:"subject,omitempty" json:"subject,omitempty"`
	Content   string             `bson:"content" json:"content"`
	Image     *Image             `bson:"image,omitempty" json:"image,omitempty"`
	Created   bson.DateTime      `bson:"created" json:"created"`
	LastBump  bson.DateTime      `bson:"lastBump" json:"lastBump"`
	Replies   []bson.ObjectID    `bson:"replies" json:"replies"`
	PosterID  string             `bson:"posterID,omitempty" json:"posterID,omitempty"`
	Locked    bool               `bson:"locked" json:"locked"`
	Sticky    bool               `bson:"sticky" json:"sticky"`
	Upvotes   *Votes             `bson:"upvotes" json:"upvotes"`
	Downvotes *Votes             `bson:"downvotes" json:"downvotes"`
}


