package service

import (
	"context"

	"github.com/nr-chan/NRchan/dto"
	"github.com/nr-chan/NRchan/repository"
)

type (
	BoardService interface {
		GetThreads(ctx context.Context, board string) ([]dto.Thread, error)
		GetAllBoards(ctx context.Context) ([]dto.Board, error)

		GetBoardsData(ctx context.Context) ([]dto.BoardData, error)
		GetPosterStats(ctx context.Context) ([]dto.PosterStats, error)
	}
	boardService struct {
		boardRepository repository.BoardRepository
		jwtService      JWTService
	}
)

func NewBoardService(boardRepository repository.BoardRepository, jwt JWTService) BoardService {
	return &boardService{boardRepository: boardRepository, jwtService: jwt}
}

func (s *boardService) GetThreads(ctx context.Context, board string) ([]dto.Thread, error) {
	return s.boardRepository.GetThreadsByBoard(ctx, board)
}

func (s *boardService) GetAllBoards(ctx context.Context) ([]dto.Board, error) {
	return s.boardRepository.GetBoards(ctx)
}

func (s *boardService) GetBoardsData(ctx context.Context) ([]dto.BoardData, error) {
	return s.boardRepository.GetBoardsData(ctx)
}

func (s *boardService) GetPosterStats(ctx context.Context) ([]dto.PosterStats, error) {
	return s.boardRepository.GetPosterStats(ctx)
}
