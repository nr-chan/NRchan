package repository

import (
	"context"
	"database/sql"

	"github.com/nr-chan/NRchan/dto"
)

type (
	ReplyRepository interface {
		DeleteReplyWithId(ctx context.Context, id string) error
		GetRepliesByThreadID(ctx context.Context, threadID interface{}) ([]dto.Reply, error)
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

func (r *replyRepository) GetRepliesByThreadID(ctx context.Context, threadID interface{}) ([]dto.Reply, error) {
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
			rp dto.Reply
			parent sql.NullInt64
			image sql.NullInt64
			isOPInt int64
		)
		if err := rows.Scan(&rp.ID, &rp.ThreadID, &parent, &rp.Username, &rp.Content, &image, &rp.CreatedAt, &isOPInt, &rp.PosterID); err != nil {
			return nil, err
		}
		if parent.Valid { rp.ParentReply = &parent.Int64 }
		if image.Valid { rp.ImageID = &image.Int64 }
		rp.IsOP = isOPInt == 1
		replies = append(replies, rp)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return replies, nil
}
