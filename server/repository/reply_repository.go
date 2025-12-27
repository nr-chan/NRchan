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
	_, err := r.db.ExecContext(ctx, `DELETE FROM replies_new WHERE id = ?`, id)
	return err
}

func (r *replyRepository) GetRepliesByThreadID(ctx context.Context, threadID string) ([]dto.Reply, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT 
			r.id, r.thread_id, r.parent_reply, r.username, r.content, r.image_id, 
			r.created_at, r.is_op, r.poster_id,
			i.id, i.url, i.size, i.width, i.height, i.thumb_width, i.thumb_height
		FROM replies_new r
		LEFT JOIN images i ON i.id = r.image_id
		WHERE r.thread_id = ?
		ORDER BY r.created_at ASC
	`, threadID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var replies []dto.Reply
	for rows.Next() {
		var (
			rp      dto.Reply
			parent  sql.NullInt64
			imageID sql.NullInt64
			isOPInt int64

			imgID   sql.NullInt64
			imgURL  sql.NullString
			imgSize sql.NullInt64
			imgW    sql.NullInt64
			imgH    sql.NullInt64
			imgTW   sql.NullInt64
			imgTH   sql.NullInt64
			img     dto.Image
		)

		if err := rows.Scan(
			&rp.ID, &rp.ThreadID, &parent, &rp.Username, &rp.Content, &imageID,
			&rp.CreatedAt, &isOPInt, &rp.PosterID,
			&imgID, &imgURL, &imgSize, &imgW, &imgH, &imgTW, &imgTH,
		); err != nil {
			return nil, err
		}

		if parent.Valid {
			rp.ParentReply = &parent.Int64
		}
		if imageID.Valid {
			rp.ImageID = &imageID.Int64
		}
		rp.IsOP = isOPInt == 1

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
			rp.Image = &img
		}

		replies = append(replies, rp)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return replies, nil
}

func (r *replyRepository) AddReply(ctx context.Context, id string, parentReply *string, username string, posterID string, content string) (int64, error) {
	res, err := r.db.ExecContext(ctx, "INSERT INTO replies_new (thread_id, parent_reply, username, poster_id, content) VALUES (?, ?, ?, ?, ?)", id, parentReply, username, posterID, content)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *replyRepository) UpdateReplyImage(ctx context.Context, replyId int64, imageId int64) error {
	_, err := r.db.ExecContext(ctx, "UPDATE replies_new SET image_id = ? WHERE id = ?", imageId, replyId)
	return err
}

func (r *replyRepository) GetPosterId(ctx context.Context, replyId string) (string, error) {
	var id string
	if err := r.db.QueryRowContext(ctx, "SELECT poster_id FROM replies_new WHERE id = ?", replyId).Scan(&id); err != nil {
		return "", err
	}
	return id, nil
}
