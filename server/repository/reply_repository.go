package repository

import (
	"context"
	"database/sql"

	"github.com/nr-chan/NRchan/dto"
)

type (
	ReplyRepository interface {
		AddReply(ctx context.Context, id string, parentReply *string, username string, posterID string, content string) (int64, error)
		DeleteReplyWithId(ctx context.Context, id string) error
		GetRepliesByThreadID(ctx context.Context, threadID string) ([]dto.Reply, error)
		GetPosterId(ctx context.Context, replyId string) (string, error)

		UpdateReplyImage(ctx context.Context, replyId int64, imageId int64) error
	}
	replyRepository struct {
		db *sql.DB
	}
)

func NewReplyRepository(db *sql.DB) *replyRepository {
	return &replyRepository{db: db}
}

func (r *replyRepository) DeleteReplyWithId(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM replies WHERE id = ?`, id)
	return err
}

func (r *replyRepository) GetRepliesByThreadID(ctx context.Context, threadID string) ([]dto.Reply, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, thread_id, parent_reply, username, content, image_id, created_at, is_op, poster_id
		FROM replies
		WHERE thread_id = ?
		ORDER BY created_at ASC
	`, threadID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	replies := []dto.Reply{}
	for rows.Next() {
		var (
			rp      dto.Reply
			parent  sql.NullInt64
			image   sql.NullInt64
			isOPInt int64
		)
		if err := rows.Scan(&rp.ID, &rp.ThreadID, &parent, &rp.Username, &rp.Content, &image, &rp.CreatedAt, &isOPInt, &rp.PosterID); err != nil {
			return nil, err
		}
		if parent.Valid {
			rp.ParentReply = &parent.Int64
		}
		if image.Valid {
			rp.ImageID = &image.Int64
		}
		rp.IsOP = isOPInt == 1
		replies = append(replies, rp)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return replies, nil
}

func (r *replyRepository) AddReply(ctx context.Context, id string, parentReply *string, username string, posterID string, content string) (int64, error) {
	res, err := r.db.ExecContext(ctx, "INSERT INTO replies (thread_id, parent_reply, username, poster_id, content) VALUES (?, ?, ?, ?, ?)", id, parentReply, username, posterID, content)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *replyRepository) UpdateReplyImage(ctx context.Context, replyId int64, imageId int64) error {
	_, err := r.db.ExecContext(ctx, "UPDATE replies SET image_id = ? WHERE id = ?", imageId, replyId)
	return err
}

func (r *replyRepository) GetPosterId(ctx context.Context, replyId string) (string, error) {
	var id string
	if err := r.db.QueryRowContext(ctx, "SELECT poster_id FROM replies WHERE id = ?", replyId).Scan(&id); err != nil {
		return "", err
	}
	return id, nil
}
