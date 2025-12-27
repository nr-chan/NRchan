package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"sync"
	"time"

	"github.com/nr-chan/NRchan/dto"
	"github.com/nr-chan/NRchan/dto/request"
	"github.com/nr-chan/NRchan/repository"
	"github.com/nr-chan/NRchan/utils"
)

var BOARDS = map[string]bool{
	"ph": true, "f": true, "mm": true, "p": true, "v": true, "c": true, "a": true, "sp": true, "m": true, "par": true, "ka": true, "np": true, "gif": true, "rnt": true, "pol": true, "cs": true,
}

type (
	ThreadService interface {
		CreateThread(ctx context.Context, thread request.ThreadRequest) (int64, error)
		GetThreadById(ctx context.Context, id string) (dto.Thread, error)
		DeleteThread(ctx context.Context, threadId, posterId string) error

		// Reply to thread
		AddReply(ctx context.Context, reply request.ReplyRequest) (int64, error)
		DeleteReply(ctx context.Context, replyID string, posterId string) error
		UpdateVote(ctx context.Context, threadId, posterId string, isUpvote bool) error
		GetVote(ctx context.Context, threadId string) (int, error)
	}
	threadService struct {
		threadRepository repository.ThreadRepository
		replyRepository  repository.ReplyRepository

		imageBucket *utils.ImageBucket
		jwtService  JWTService
	}
)

func NewThreadService(threadRepository repository.ThreadRepository, replyRepository repository.ReplyRepository, jwt JWTService, imageBucket *utils.ImageBucket) *threadService {
	return &threadService{threadRepository: threadRepository, replyRepository: replyRepository, jwtService: jwt, imageBucket: imageBucket}
}

func (b *threadService) CreateThread(ctx context.Context, thread request.ThreadRequest) (int64, error) {

	if !BOARDS[thread.Board] {
		return 0, fmt.Errorf("board %s not allowed", thread.Board)
	}

	posterID := utils.UUIDToPosterID(thread.UUID)

	// 2) Kick off image processing in parallel (if present)
	var (
		wg       sync.WaitGroup
		imgIDCh  chan int64
		imgErrCh chan error
		hasImage = thread.Image != nil
	)

	if hasImage {
		imgIDCh = make(chan int64, 1)
		imgErrCh = make(chan error, 1)

		wg.Add(1)
		go func() {
			defer wg.Done()

			// Open uploaded file
			f, err := thread.Image.Open()
			if err != nil {
				imgErrCh <- err
				return
			}
			defer f.Close()

			// Upload to R2
			key := fmt.Sprintf("img_%d", time.Now().UnixNano())
			contentType := thread.Image.Header.Get("Content-Type")
			imgURL, err := b.imageBucket.Post(key, f, contentType)
			if err != nil {
				imgErrCh <- err
				return
			}

			// Rewind and decode dimensions
			if _, err := f.Seek(0, 0); err != nil {
				imgErrCh <- err
				return
			}
			cfg, _, err := image.DecodeConfig(f)
			if err != nil {
				imgErrCh <- err
				return
			}

			// Insert image metadata; thumb dims same as full for now
			imageID, err := b.threadRepository.InsertImage(
				ctx, imgURL, thread.Image.Size, cfg.Width, cfg.Height, cfg.Width, cfg.Height,
			)
			if err != nil {
				imgErrCh <- err
				return
			}
			imgIDCh <- imageID
		}()
	}

	// 3) Insert the thread row immediately (without image_id)
	threadID, err := b.threadRepository.InsertThread(ctx, thread.Board, thread.Subject, thread.Content, posterID, thread.UUID, thread.Username)
	if err != nil {
		return -1, err
	}

	// 4) If an image exists, wait for the image task and then update the thread with image_id
	if hasImage {
		wg.Wait()

		select {
		case err := <-imgErrCh:
			if err != nil {
				return -1, err
			}
		default:
			// no image error
		}

		select {
		case imgID := <-imgIDCh:
			if imgID != 0 {
				if err := b.threadRepository.UpdateThreadImage(ctx, threadID, imgID); err != nil {
					return -1, err
				}
			}
		default:
			// no image id returned (shouldn't happen if no error)
		}
	}

	return threadID, nil
}

func (b *threadService) DeleteThread(ctx context.Context, threadId, uuid string) error {
	replyUUID, err := b.threadRepository.GetPosterId(ctx, threadId)

	if err != nil {
		return err
	}

	if uuid != replyUUID {
		return errors.New("you are not the poster of this thread")
	}

	return b.threadRepository.DeleteByID(ctx, threadId)
}

func (b *threadService) GetThreadById(ctx context.Context, id string) (dto.Thread, error) {
	thread, err := b.threadRepository.GetThreadById(ctx, id)
	if err != nil {
		return dto.Thread{}, err
	}

	replies, err := b.replyRepository.GetRepliesByThreadID(ctx, id)
	if err != nil {
		return dto.Thread{}, err
	}

	thread.Replies = replies
	return thread, nil
}

func (b *threadService) AddReply(ctx context.Context, reply request.ReplyRequest) (int64, error) {
	posterID := utils.UUIDToPosterID(reply.UUID)

	// 2) Kick off image processing in parallel (if present)
	var (
		wg       sync.WaitGroup
		imgIDCh  chan int64
		imgErrCh chan error
		hasImage = reply.Image != nil
	)

	if hasImage {
		imgIDCh = make(chan int64, 1)
		imgErrCh = make(chan error, 1)

		wg.Add(1)
		go func() {
			defer wg.Done()

			// Open uploaded file
			f, err := reply.Image.Open()
			if err != nil {
				imgErrCh <- err
				return
			}
			defer f.Close()

			// Upload to R2
			key := fmt.Sprintf("img_%d", time.Now().UnixNano())
			contentType := reply.Image.Header.Get("Content-Type")
			imgURL, err := b.imageBucket.Post(key, f, contentType)
			if err != nil {
				imgErrCh <- err
				return
			}

			// Rewind and decode dimensions
			if _, err := f.Seek(0, 0); err != nil {
				imgErrCh <- err
				return
			}
			cfg, _, err := image.DecodeConfig(f)
			if err != nil {
				imgErrCh <- err
				return
			}

			// Insert image metadata; thumb dims same as full for now
			imageID, err := b.threadRepository.InsertImage(
				ctx, imgURL, reply.Image.Size, cfg.Width, cfg.Height, cfg.Width, cfg.Height,
			)
			if err != nil {
				imgErrCh <- err
				return
			}
			imgIDCh <- imageID
		}()
	}

	// 3) Insert the thread row immediately (without image_id)
	replyId, err := b.replyRepository.AddReply(ctx, reply.ThreadID, reply.ParentReply, reply.Username, reply.UUID, posterID, reply.Content)
	if err != nil {
		return -1, err
	}

	// 4) If an image exists, wait for the image task and then update the thread with image_id
	if hasImage {
		wg.Wait()

		select {
		case err := <-imgErrCh:
			if err != nil {
				return -1, err
			}
		default:
			// no image error
		}

		select {
		case imgID := <-imgIDCh:
			if imgID != 0 {
				if err := b.replyRepository.UpdateReplyImage(ctx, replyId, imgID); err != nil {
					return -1, err
				}
			}
		default:
			// no image id returned (shouldn't happen if no error)
		}
	}

	return replyId, nil
}

func (b *threadService) DeleteReply(ctx context.Context, replyID string, uuid string) error {

	replyUUID, err := b.replyRepository.GetUUID(ctx, replyID)

	if err != nil {
		return err
	}

	if uuid != replyUUID {
		return errors.New("you are not the poster of this reply")
	}

	return b.replyRepository.DeleteReplyWithId(ctx, replyID)
}

func (b *threadService) UpdateVote(ctx context.Context, threadID, voterID string, isUpvote bool) error {
	newVote := -1
	if isUpvote {
		newVote = 1
	}

	existingVote, err := b.threadRepository.GetVote(ctx, threadID, voterID)

	if err == sql.ErrNoRows {
		return b.threadRepository.InsertVote(ctx, threadID, voterID, newVote)
	}

	if err != nil {
		return err
	}

	if existingVote == newVote {
		return nil
	}

	return b.threadRepository.UpdateVoteType(
		ctx,
		threadID,
		voterID,
		newVote,
	)
}

func (b *threadService) GetVote(ctx context.Context, threadId string) (int, error) {
	vote, err := b.threadRepository.GetVoteCount(ctx, threadId)
	if err != nil {
		return 0, err
	}
	return vote, nil
}
