package repository

import (
	"context"
	"database/sql"
	"strings"

	"github.com/nr-chan/NRchan/dto"
)

type (
	BoardRepository interface {
		GetBoards(ctx context.Context) ([]dto.Board, error)
		GetThreadsByBoard(ctx context.Context, board string) ([]dto.Thread, error)
	}
	boardRepository struct {
		db *sql.DB
	}
)

func NewBoardRepository(db *sql.DB) *boardRepository {
	return &boardRepository{db: db}
}

func (b *boardRepository) GetBoards(ctx context.Context) ([]dto.Board, error) {
	rows, err := b.db.QueryContext(ctx, `
		SELECT id, board_key, title, created_at, updated_at
		FROM boards
		ORDER BY id ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	boards := []dto.Board{}
	for rows.Next() {
		var bd dto.Board
		if err := rows.Scan(&bd.ID, &bd.BoardKey, &bd.Title, &bd.CreatedAt, &bd.UpdatedAt); err != nil {
			return nil, err
		}
		boards = append(boards, bd)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return boards, nil
}

func (b *boardRepository) GetThreadsByBoard(ctx context.Context, board string) ([]dto.Thread, error) {
	// find board id by board_key
	var boardID int64
	if err := b.db.QueryRowContext(ctx, `SELECT id FROM boards WHERE board_key = ?`, board).Scan(&boardID); err != nil {
		return nil, err
	}

	// fetch threads with optional image join
	rows, err := b.db.QueryContext(ctx, `
		SELECT 
			t.id, t.board_id, t.username, t.subject, t.content, t.image_id,
			t.created_at, t.last_bump, t.poster_id, t.locked, t.sticky,
			i.id, i.url, i.size, i.width, i.height, i.thumb_width, i.thumb_height
		FROM threads t
		LEFT JOIN images i ON i.id = t.image_id
		WHERE t.board_id = ?
		ORDER BY t.sticky DESC, t.last_bump DESC
		LIMIT 15
	`, boardID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	threads := []dto.Thread{}
	threadIndex := map[int64]int{}
	ids := []int64{}
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
		threadIndex[th.ID] = len(threads)
		ids = append(ids, th.ID)
		threads = append(threads, th)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(ids) == 0 {
		return threads, nil
	}

	// load replies for these threads in batch
	// Build a variable number of placeholders for IN clause
	placeholders := make([]string, len(ids))
	args := make([]interface{}, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args[i] = id
	}
	query := "SELECT id, thread_id, parent_reply, username, content, image_id, created_at, is_op, poster_id FROM replies WHERE thread_id IN (" + strings.Join(placeholders, ",") + ") ORDER BY created_at ASC"

	repRows, err := b.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer repRows.Close()

	for repRows.Next() {
		var r dto.Reply
		var parent sql.NullInt64
		var image sql.NullInt64
		var isOPInt int64
		if err := repRows.Scan(&r.ID, &r.ThreadID, &parent, &r.Username, &r.Content, &image, &r.CreatedAt, &isOPInt, &r.PosterID); err != nil {
			return nil, err
		}
		if parent.Valid {
			r.ParentReply = &parent.Int64
		}
		if image.Valid {
			r.ImageID = &image.Int64
		}
		r.IsOP = isOPInt == 1
		if idx, ok := threadIndex[r.ThreadID]; ok {
			threads[idx].Replies = append(threads[idx].Replies, r)
		}
	}
	if err := repRows.Err(); err != nil {
		return nil, err
	}

	return threads, nil
}
