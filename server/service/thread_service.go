package service

import (
	"context"
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

type (
	ThreadService interface {
		CreateThread(ctx context.Context, thread request.ThreadRequest) (int64, error)
		GetThreadById(ctx context.Context, id string) (dto.Thread, error)
		DeleteThread(ctx context.Context, threadId, posterId string) error

		// Reply to thread
		AddReply(ctx context.Context, reply request.ReplyRequest) (int64, error)
		DeleteReply(ctx context.Context, replyID string, posterId string) error
		UpdateVote(ctx context.Context, threadId, posterId string, isUpvote bool) error
	}
	threadService struct {
		threadRepository repository.ThreadRepository
		replyRepository  repository.ReplyRepository

		imageBucket *utils.ImageBucket
		jwtService  JWTService
	}
)

func NewThreadService(threadRepository repository.ThreadRepository, replyRepository repository.ReplyRepository, jwt JWTService) *threadService {
	bucket := utils.NewImageBucket("NR_BUCKET")

	if bucket == nil {
		return nil
	}

	return &threadService{threadRepository: threadRepository, replyRepository: replyRepository, jwtService: jwt, imageBucket: bucket}
}

func (b *threadService) CreateThread(ctx context.Context, thread request.ThreadRequest) (int64, error) {
	// 1) Resolve board id
	boardID, err := b.threadRepository.GetBoardIDByKey(ctx, thread.Board)
	if err != nil {
		return -1, err
	}

	username := utils.UUIDToPosterID(thread.UUID)

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
			if err := b.imageBucket.Post(key, f, contentType); err != nil {
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
				ctx, key, thread.Image.Size, cfg.Width, cfg.Height, cfg.Width, cfg.Height,
			)
			if err != nil {
				imgErrCh <- err
				return
			}
			imgIDCh <- imageID
		}()
	}

	// 3) Insert the thread row immediately (without image_id)
	threadID, err := b.threadRepository.InsertThread(ctx, boardID, thread.Subject, thread.Content, thread.UUID, username)
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

func (b *threadService) DeleteThread(ctx context.Context, threadId, posterId string) error {
	replyPosterId, err := b.threadRepository.GetPosterId(ctx, threadId)

	if err != nil {
		return err
	}

	if posterId != replyPosterId {
		return errors.New("you are not the poster of this reply")
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
	username := utils.UUIDToPosterID(reply.UUID)

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
			if err := b.imageBucket.Post(key, f, contentType); err != nil {
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
				ctx, key, reply.Image.Size, cfg.Width, cfg.Height, cfg.Width, cfg.Height,
			)
			if err != nil {
				imgErrCh <- err
				return
			}
			imgIDCh <- imageID
		}()
	}

	// 3) Insert the thread row immediately (without image_id)
	replyId, err := b.replyRepository.AddReply(ctx, reply.ThreadID, reply.ParentReply, username, reply.UUID, reply.Content)
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

func (b *threadService) DeleteReply(ctx context.Context, replyID string, posterId string) error {

	replyPosterId, err := b.replyRepository.GetPosterId(ctx, replyID)

	if err != nil {
		return err
	}

	if posterId != replyPosterId {
		return errors.New("you are not the poster of this reply")
	}

	return b.replyRepository.DeleteReplyWithId(ctx, replyID)
}

func (b *threadService) UpdateVote(ctx context.Context, threadId, posterId string, isUpvote bool) error {
	return b.threadRepository.UpdateVote(ctx, threadId, posterId, isUpvote)
}
