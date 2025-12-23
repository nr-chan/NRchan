package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/nr-chan/NRchan/dto"
)

type (
	ThreadRepository interface {
		GetThreadById(ctx context.Context, id string) (dto.Thread, error)
		// High-level CreateThread is handled in service
		GetBoardIDByKey(ctx context.Context, boardKey string) (int64, error)
		InsertThread(ctx context.Context, boardID int64, subject, content, posterID, username string) (int64, error)
		InsertImage(ctx context.Context, url string, sizeBytes int64, width, height, thumbWidth, thumbHeight int) (int64, error)
		UpdateThreadImage(ctx context.Context, threadID, imageID int64) error
		// DeleteByID(ctx context.Context, id int64) error
		// GetAllThreads(ctx context.Context) ([]dto.Thread, error)
	}
	threadRepository struct {
		db *sql.DB
	}
)

func NewThreadRepository(db *sql.DB) *threadRepository {
	return &threadRepository{db: db}
}

// SQL helpers moved from repository.CreateThread to be orchestrated by service
func (r *threadRepository) GetBoardIDByKey(ctx context.Context, boardKey string) (int64, error) {
	var id int64
	if err := r.db.QueryRowContext(ctx, "SELECT id FROM boards WHERE board_key = ?", boardKey).Scan(&id); err != nil {
		return 0, errors.New("invalid board name")
	}
	return id, nil
}

func (r *threadRepository) InsertThread(ctx context.Context, boardID int64, subject, content, posterID, username string) (int64, error) {
	res, err := r.db.ExecContext(ctx, "INSERT INTO threads (board_id, subject, content, poster_id, username) VALUES (?, ?, ?, ?, ?)", boardID, subject, content, posterID, username)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *threadRepository) InsertImage(ctx context.Context, url string, sizeBytes int64, width, height, thumbWidth, thumbHeight int) (int64, error) {
	res, err := r.db.ExecContext(ctx, "INSERT INTO images (url, size, width, height, thumb_width, thumb_height) VALUES (?, ?, ?, ?, ?, ?)", url, sizeBytes, width, height, thumbWidth, thumbHeight)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *threadRepository) UpdateThreadImage(ctx context.Context, threadID, imageID int64) error {
	_, err := r.db.ExecContext(ctx, "UPDATE threads SET image_id = ? WHERE id = ?", imageID, threadID)
	return err
}

func (r *threadRepository) GetThreadById(ctx context.Context, id string) (dto.Thread, error) {
	var thread dto.Thread
	if err := r.db.QueryRowContext(ctx, "SELECT * FROM threads WHERE id = ?", id).Scan(&thread); err != nil {
		return dto.Thread{}, err
	}
	return thread, nil
}
