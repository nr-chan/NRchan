package repository

import (
	"context"
	"database/sql"

	"github.com/nr-chan/NRchan/dto"
)

type (
	ThreadRepository interface {
		GetThreadById(ctx context.Context, id string) (dto.Thread, error)
		DeleteByID(ctx context.Context, id int64) error
		PostReply(ctx context.Context, id int64, username string) error
		GetAllThreads(ctx context.Context) ([]dto.Thread, error)
	}
	threadRepository struct {
		db *sql.DB
	}
)

func NewThreadRepository(db *sql.DB) *threadRepository {
	return &threadRepository{
		db: db,
	}
}

func (r *threadRepository) GetThreadById(ctx context.Context, id string) (dto.Thread, error) {
	var result dto.Thread

	return result, nil
}
