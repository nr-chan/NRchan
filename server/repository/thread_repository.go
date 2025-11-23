package repository

// import (
// 	"context"

// 	"github.com/nr-chan/NRchan/dto"
// 	db "github.com/nr-chan/NRchan/mongo"
// 	"go.mongodb.org/mongo-driver/bson/primitive"
// )

// type (
// 	ThreadRepository interface {
// 		GetThreadById(ctx context.Context, id string) (dto.Thread, error)
// 		DeleteByID(ctx context.Context, id primitive.ObjectID) error
// 		PostReply(ctx context.Context, id primitive.ObjectID, username string) error
// 		GetAllThreads(ctx context.Context) ([]dto.Thread, error)
// 	}
// 	threadRepository struct {
// 		db db.Database
// 	}
// )

// func NewThreadRepository(db db.Database) *threadRepository {
// 	return &threadRepository{
// 		db: db,
// 	}
// }

// func (r *threadRepository) GetThreadById(ctx context.Context, id string) (dto.Thread, error) {
// 	var result dto.Thread

// 	return result, nil
// }
