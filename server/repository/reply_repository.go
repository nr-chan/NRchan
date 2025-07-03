package repository

import (
	"context"

	"github.com/charmbracelet/log"
	"github.com/nr-chan/NRchan/dto"
	"github.com/nr-chan/NRchan/mongo"
	"go.mongodb.org/mongo-driver/bson"
)

type (
	ReplyRepository interface {
		DeleteReplyWithId(ctx context.Context, id string) error
		GetRepliesByThreadID(ctx context.Context, threadID interface{}) ([]dto.Reply, error)
	}
	replyRepository struct {
		db mongo.Database
	}
)

func NewReplyRepository(db mongo.Database) *replyRepository {
	return &replyRepository{
		db,
	}
}

func (r *replyRepository) DeleteReplyWithId(ctx context.Context, id string) error {
	deletedCount, err := r.db.Collection("replies").DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		return err
	}

	log.Infof("Deleted reply with id %s and count %d", id, deletedCount)

	return nil
}

func (r *replyRepository) GetRepliesByThreadID(ctx context.Context, threadID interface{}) ([]dto.Reply, error) {
	var replies []dto.Reply
	cursor, err := r.db.Collection("replies").Find(ctx, map[string]interface{}{"threadID": threadID})
	if err != nil {
		return nil, err
	}
	if err := cursor.All(ctx, &replies); err != nil {
		return nil, err
	}
	return replies, nil
}
