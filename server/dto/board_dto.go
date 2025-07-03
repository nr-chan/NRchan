package dto

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type BoardCategory struct {
	Title  string   `bson:"title" json:"title"`
	Boards []string `bson:"boards" json:"boards"`
}

type BoardData struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Boards    []BoardCategory    `bson:"boards" json:"boards"`
	Links     []string           `bson:"links" json:"links"`
	BoardList []string           `bson:"board_list" json:"board_list"`
	CreatedAt time.Time          `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt time.Time          `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}
