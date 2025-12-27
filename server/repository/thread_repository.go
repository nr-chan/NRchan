package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/nr-chan/NRchan/dto"
)

type (
	ThreadRepository interface {
		GetThreadById(ctx context.Context, id string) (dto.Thread, error)
		// High-level CreateThread is handled in service
		InsertThread(ctx context.Context, boardID, subject, content, posterID, username string) (int64, error)
		InsertImage(ctx context.Context, url string, sizeBytes int64, width, height, thumbWidth, thumbHeight int) (int64, error)
		UpdateThreadImage(ctx context.Context, threadID, imageID int64) error
		DeleteByID(ctx context.Context, id string) error
		GetPosterId(ctx context.Context, threadId string) (string, error)
		// GetAllThreads(ctx context.Context) ([]dto.Thread, error)

		// Vote
		GetVote(ctx context.Context, threadID, voterID string) (int, error)
		InsertVote(ctx context.Context, threadID, voterID string, voteType int) error
		UpdateVoteType(ctx context.Context, threadID, voterID string, voteType int) error
	}
	threadRepository struct {
		db *sql.DB
	}
)

func NewThreadRepository(db *sql.DB) *threadRepository {
	return &threadRepository{db: db}
}

func (r *threadRepository) InsertThread(ctx context.Context, boardKey, subject, content, posterID, username string) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
        INSERT INTO threads_new (board_key, subject, content, poster_id, username)
        VALUES (?, ?, ?, ?, ?)`,
		boardKey, subject, content, posterID, username,
	)
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
	_, err := r.db.ExecContext(ctx, "UPDATE threads_new SET image_id = ? WHERE id = ?", imageID, threadID)
	return err
}

func (r *threadRepository) GetThreadById(ctx context.Context, id string) (dto.Thread, error) {
	var (
		th        dto.Thread
		imageID   sql.NullInt64
		img       dto.Image
		imgID     sql.NullInt64
		imgURL    sql.NullString
		imgSize   sql.NullInt64
		imgW      sql.NullInt64
		imgH      sql.NullInt64
		imgTW     sql.NullInt64
		imgTH     sql.NullInt64
		lockedInt int64
		stickyInt int64
	)

	err := r.db.QueryRowContext(ctx, `
        SELECT 
            t.id, t.board_key, t.username, t.subject, t.content, t.image_id,
            t.created_at, t.last_bump, t.poster_id, t.locked, t.sticky,
            i.id, i.url, i.size, i.width, i.height, i.thumb_width, i.thumb_height
        FROM threads_new t
        LEFT JOIN images i ON i.id = t.image_id
        WHERE t.id = ?`,
		id,
	).Scan(
		&th.ID, &th.BoardKey, &th.Username, &th.Subject, &th.Content, &imageID,
		&th.CreatedAt, &th.LastBump, &th.PosterID, &lockedInt, &stickyInt,
		&imgID, &imgURL, &imgSize, &imgW, &imgH, &imgTW, &imgTH,
	)

	if err != nil {
		return dto.Thread{}, fmt.Errorf("failed to get thread: %w", err)
	}

	th.Locked = lockedInt == 1
	th.Sticky = stickyInt == 1
	if imageID.Valid {
		th.ImageID = &imageID.Int64
	}
	if imgID.Valid {
		img.ID = imgID.Int64
		if imgURL.Valid {
			img.URL = imgURL.String
		}
		if imgSize.Valid {
			img.Size = imgSize.Int64
		}
		if imgW.Valid {
			img.Width = imgW.Int64
		}
		if imgH.Valid {
			img.Height = imgH.Int64
		}
		if imgTW.Valid {
			img.ThumbWidth = imgTW.Int64
		}
		if imgTH.Valid {
			img.ThumbHeight = imgTH.Int64
		}
		th.Image = &img
	}

	return th, nil
}

func (r *threadRepository) GetPosterId(ctx context.Context, threadId string) (string, error) {
	var posterId string
	if err := r.db.QueryRowContext(ctx, "SELECT poster_id FROM threads_new WHERE id = ?", threadId).Scan(&posterId); err != nil {
		return "", errors.New("invalid thread ID")
	}
	return posterId, nil
}

func (r *threadRepository) DeleteByID(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM threads_new WHERE id = ?", id)
	return err
}

func (r *threadRepository) GetVote(ctx context.Context, threadID, voterID string) (int, error) {
	var vote int
	err := r.db.QueryRowContext(
		ctx,
		`SELECT vote_type FROM votes_new WHERE thread_id = ? AND voter_id = ?`,
		threadID, voterID,
	).Scan(&vote)
	return vote, err
}

func (r *threadRepository) InsertVote(ctx context.Context, threadID, voterID string, voteType int) error {
	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO votes_new (thread_id, voter_id, vote_type) VALUES (?, ?, ?)`,
		threadID, voterID, voteType,
	)
	return err
}

func (r *threadRepository) UpdateVoteType(ctx context.Context, threadID, voterID string, voteType int) error {
	_, err := r.db.ExecContext(
		ctx,
		`UPDATE votes_new 
		 SET vote_type = ?, created_at = CURRENT_TIMESTAMP
		 WHERE thread_id = ? AND voter_id = ?`,
		voteType, threadID, voterID,
	)
	return err
}
