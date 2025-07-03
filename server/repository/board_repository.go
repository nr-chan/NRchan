package repository

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/nr-chan/NRchan/dto"
	db "github.com/nr-chan/NRchan/mongo"
	"go.mongodb.org/mongo-driver/bson"
)

type (
	BoardRepository interface {
		GetBoards(ctx context.Context) ([]dto.BoardData, error)
		GetThreadsByBoard(ctx context.Context, board string) ([]dto.Thread, error)
	}
	boardRepository struct {
		db db.Database
	}
)

func NewBoardRepository(db db.Database) *boardRepository {
	return &boardRepository{
		db: db,
	}
}

func (b *boardRepository) GetBoards(ctx context.Context) ([]dto.BoardData, error) {
	var boards []dto.BoardData
	_, err := b.db.Collection("boards").Find(ctx, boards)
	if err != nil {
		return nil, err
	}

	return boards, nil
}

func (b *boardRepository) GetThreadsByBoard(ctx context.Context, board string) ([]dto.Thread, error) {
	var threads []dto.Thread

	pipeline := mongo.Pipeline{
		bson.D{{"$match", bson.D{{"board", board}}}},
		bson.D{{"$sort",
			bson.D{
				{"sticky", -1},
				{"lastBump", -1},
			}}},
		bson.D{{"$limit", 15}},
		bson.D{{"$lookup", bson.D{
			{"from", "replies"},
			{"localField", "_id"},
			{"foreignField", "threadID"},
			{"as", "replies"},
		}}},
	}

	cursor, err := b.db.Collection("threads").Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	if err := cursor.All(ctx, &threads); err != nil {
		return nil, err
	}

	return threads, nil
}
