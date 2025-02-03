package models

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type BannedUUID struct {
    ID        bson.ObjectID     `bson:"_id,omitempty" json:"_id"`
    UUID      string            `bson:"uuid" json:"uuid"`
    CreatedAt time.Time         `bson:"createdAt" json:"createdAt"`
    UpdatedAt time.Time         `bson:"updatedAt" json:"updatedAt"`
}

func CreateUniqueIndex(collection *mongo.Collection) error {
    indexModel := mongo.IndexModel{
        Keys: bson.D{{Key: "uuid", Value: 1}}, 
        Options: options.Index().SetUnique(true),
    }
    _, err := collection.Indexes().CreateOne(context.Background(), indexModel)
    return err
}

func InsertBannedUUID(collection *mongo.Collection, uuid string) (*mongo.InsertOneResult, error) {
    now := time.Now()

    bannedUUID := BannedUUID{
        UUID:      uuid,
        CreatedAt: now,
        UpdatedAt: now,
    }

    return collection.InsertOne(context.Background(), bannedUUID)
}
