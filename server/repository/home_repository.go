package repository

import (
	"context"
	"database/sql"

	"github.com/nr-chan/NRchan/dto"
)

type (
	HomeRepository interface {
		GetRecents(ctx context.Context) ([]dto.Thread, error)
	}
	homeRepository struct {
		db *sql.DB
	}
)

func NewHomeRepository(db *sql.DB) *homeRepository {
	return &homeRepository{db: db}
}

func (b *homeRepository) GetRecents(ctx context.Context) ([]dto.Thread, error) {
	rows, err := b.db.QueryContext(ctx, `
        SELECT 
			t.id, t.board_key, t.username, t.subject, t.content, t.image_id,
			t.created_at, t.last_bump, t.poster_id, t.uuid, t.locked, t.sticky,
			i.id, i.url, i.size, i.width, i.height, i.thumb_width, i.thumb_height,
			COALESCE(SUM(CASE WHEN v.vote_type = 1 THEN 1 ELSE 0 END), 0)  AS upvotes,
			COALESCE(SUM(CASE WHEN v.vote_type = -1 THEN 1 ELSE 0 END), 0) AS downvotes
		FROM threads_new t
		LEFT JOIN images i ON i.id = t.image_id
		LEFT JOIN votes_new v ON v.thread_id = t.id
		GROUP BY t.id
		ORDER BY t.last_bump DESC
		LIMIT 10
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var threads []dto.Thread

	for rows.Next() {
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
			upCnt     int
			downCnt   int
		)

		if err := rows.Scan(
			&th.ID, &th.BoardKey, &th.Username, &th.Subject, &th.Content, &imageID,
			&th.CreatedAt, &th.LastBump, &th.PosterID, &th.UUID, &lockedInt, &stickyInt,

			&imgID, &imgURL, &imgSize, &imgW, &imgH, &imgTW, &imgTH,

			&upCnt, &downCnt,
		); err != nil {
			return nil, err
		}

		th.Locked = lockedInt == 1
		th.Sticky = stickyInt == 1

		// 👇 Populate VoteInfo (DTO unchanged)
		th.Upvotes.Count = upCnt
		th.Downvotes.Count = downCnt

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

		threads = append(threads, th)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return threads, nil
}
