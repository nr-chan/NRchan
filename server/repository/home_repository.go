package repository

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/nr-chan/NRchan/dto"
	db "github.com/nr-chan/NRchan/mongo"
	"go.mongodb.org/mongo-driver/bson"
)

type (
	HomeRepository interface {
		GetRecents(ctx context.Context) ([]dto.Thread, error)
	}
	homeRepository struct {
		db db.Database
	}
)

func NewHomeRepository(db db.Database) *homeRepository {
	return &homeRepository{
		db: db,
	}
}

type CombinedWrapper struct {
	Combined dto.Thread `bson:"combined"`
}

func (b *homeRepository) GetRecents(ctx context.Context) ([]dto.Thread, error) {
	var combinedResults []CombinedWrapper

	pipeline := mongo.Pipeline{
		{
			{"$facet", bson.D{
				{"threads", bson.A{
					bson.D{
						{"$project", bson.D{
							{"_id", 1},
							{"type", bson.D{{"$literal", "thread"}}},
							{"board", 1},
							{"subject", 1},
							{"content", 1},
							{"image", 1},
							{"created", 1},
							{"lastBump", 1},
							{"posterID", 1},
						}},
					},
					bson.D{
						{"$sort", bson.D{{"lastBump", -1}}},
					},
					bson.D{
						{"$limit", 10},
					},
				}},
				{"replies", bson.A{
					bson.D{
						{"$lookup", bson.D{
							{"from", "threads"},
							{"localField", "threadID"},
							{"foreignField", "_id"},
							{"as", "thread"},
						}},
					},
					bson.D{
						{"$unwind", "$thread"},
					},
					bson.D{
						{"$project", bson.D{
							{"_id", 1},
							{"type", bson.D{{"$literal", "reply"}}},
							{"board", "$thread.board"},
							{"content", 1},
							{"image", 1},
							{"created", 1},
							{"threadID", 1},
							{"posterID", 1},
						}},
					},
					bson.D{
						{"$sort", bson.D{{"created", -1}}},
					},
					bson.D{
						{"$limit", 10},
					},
				}},
			}},
		},
		{
			{"$project", bson.D{
				{"combined", bson.D{
					{"$concatArrays", bson.A{"$threads", "$replies"}},
				}},
			}},
		},
		{
			{"$unwind", "$combined"},
		},
		{
			{"$sort", bson.D{
				{"combined.lastBump", -1},
				{"combined.created", -1},
			}},
		},
		{
			{"$limit", 10},
		},
	}

	cursor, err := b.db.Collection("threads").Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	if err := cursor.All(ctx, &combinedResults); err != nil {
		return nil, err
	}

	threads := make([]dto.Thread, len(combinedResults))
	for i, result := range combinedResults {
		threads[i] = result.Combined
	}

	return threads, nil
}
