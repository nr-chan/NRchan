package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/nr-chan/NRchan/dto"
)

const (
	VoteUp   = 1
	VoteDown = -1
)

type (
	ThreadRepository interface {
		GetThreadById(ctx context.Context, id string) (dto.Thread, error)
		// High-level CreateThread is handled in service
		GetBoardIDByKey(ctx context.Context, boardKey string) (int64, error)
		InsertThread(ctx context.Context, boardID int64, subject, content, posterID, username string) (int64, error)
		InsertImage(ctx context.Context, url string, sizeBytes int64, width, height, thumbWidth, thumbHeight int) (int64, error)
		UpdateThreadImage(ctx context.Context, threadID, imageID int64) error
		DeleteByID(ctx context.Context, id string) error
		GetPosterId(ctx context.Context, threadId string) (string, error)
		// GetAllThreads(ctx context.Context) ([]dto.Thread, error)

		UpdateVote(ctx context.Context, threadID, voterID string, isUpvote bool) error
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
	err := r.db.QueryRowContext(ctx, `
        SELECT id, board_id, subject, content, poster_id, username, 
               image_id, created_at, locked, sticky
        FROM threads 
        WHERE id = ?`,
		id,
	).Scan(
		&thread.ID,
		&thread.BoardID,
		&thread.Subject,
		&thread.Content,
		&thread.PosterID,
		&thread.Username,
		&thread.ImageID,
		&thread.CreatedAt,
		&thread.Locked,
		&thread.Sticky,
	)

	if err != nil {
		return dto.Thread{}, fmt.Errorf("failed to get thread: %w", err)
	}

	return thread, nil
}

func (r *threadRepository) GetPosterId(ctx context.Context, threadId string) (string, error) {
	var posterId string
	if err := r.db.QueryRowContext(ctx, "SELECT poster_id FROM threads WHERE id = ?", threadId).Scan(&posterId); err != nil {
		return "", errors.New("invalid thread ID")
	}
	return posterId, nil
}

func (r *threadRepository) DeleteByID(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM threads WHERE id = ?", id)
	return err
}

func (r *threadRepository) UpdateVote(ctx context.Context, threadID, voterID string, isUpvote bool) error {
	newVote := VoteDown
	if isUpvote {
		newVote = VoteUp
	}

	var existingVote int
	err := r.db.QueryRowContext(
		ctx,
		`SELECT vote_type FROM votes WHERE thread_id = ? AND voter_id = ?`,
		threadID, voterID,
	).Scan(&existingVote)

	// No existing vote → INSERT
	if err == sql.ErrNoRows {
		_, err = r.db.ExecContext(
			ctx,
			`INSERT INTO votes (thread_id, voter_id, vote_type) VALUES (?, ?, ?)`,
			threadID, voterID, newVote,
		)
		return err
	}

	if err != nil {
		return err
	}

	// Same vote again → DO NOTHING
	if existingVote == newVote {
		return nil
	}

	// Switch vote → UPDATE
	_, err = r.db.ExecContext(
		ctx,
		`UPDATE votes SET vote_type = ?, created_at = CURRENT_TIMESTAMP 
		 WHERE thread_id = ? AND voter_id = ?`,
		newVote, threadID, voterID,
	)
	return err
}
