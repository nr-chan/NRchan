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
            t.id, t.board_id, t.username, t.subject, t.content, t.image_id,
            t.created_at, t.last_bump, t.poster_id, t.locked, t.sticky,
            i.id, i.url, i.size, i.width, i.height, i.thumb_width, i.thumb_height
        FROM threads t
        LEFT JOIN images i ON i.id = t.image_id
        ORDER BY t.last_bump DESC
        LIMIT 10
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	threads := []dto.Thread{}
	for rows.Next() {
		var (
			th dto.Thread
			imageID sql.NullInt64
			img dto.Image
			imgID sql.NullInt64
			imgURL sql.NullString
			imgSize sql.NullInt64
			imgW sql.NullInt64
			imgH sql.NullInt64
			imgTW sql.NullInt64
			imgTH sql.NullInt64
			lockedInt int64
			stickyInt int64
		)
		if err := rows.Scan(
			&th.ID, &th.BoardID, &th.Username, &th.Subject, &th.Content, &imageID,
			&th.CreatedAt, &th.LastBump, &th.PosterID, &lockedInt, &stickyInt,
			&imgID, &imgURL, &imgSize, &imgW, &imgH, &imgTW, &imgTH,
		); err != nil {
			return nil, err
		}
		th.Locked = lockedInt == 1
		th.Sticky = stickyInt == 1
		if imageID.Valid {
			th.ImageID = &imageID.Int64
		}
		if imgID.Valid {
			img.ID = imgID.Int64
			if imgURL.Valid { img.URL = imgURL.String }
			if imgSize.Valid { img.Size = imgSize.Int64 }
			if imgW.Valid { img.Width = imgW.Int64 }
			if imgH.Valid { img.Height = imgH.Int64 }
			if imgTW.Valid { img.ThumbWidth = imgTW.Int64 }
			if imgTH.Valid { img.ThumbHeight = imgTH.Int64 }
			th.Image = &img
		}
		threads = append(threads, th)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return threads, nil
}
