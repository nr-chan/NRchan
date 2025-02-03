package models;

type Votes struct {
	Count int      `bson:"count" json:"count"`
	IDs   []string `bson:"ids" json:"ids"`
}

