package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/nr-chan/NRchan/dto"
	"github.com/nr-chan/NRchan/repository"
)

type (
	HomeService interface {
		GetRecent(ctx context.Context) ([]dto.Thread, error)
		GetUUID(ctx context.Context) string
	}
	homeService struct {
		homeRepository repository.HomeRepository
		jwtService     JWTService
	}
)

func NewHomeService(boardRepository repository.HomeRepository, jwt JWTService) HomeService {
	return &homeService{homeRepository: boardRepository, jwtService: jwt}
}

func (h *homeService) GetRecent(ctx context.Context) ([]dto.Thread, error) {
	return h.homeRepository.GetRecents(ctx)
}

func (h *homeService) GetUUID(ctx context.Context) string {
	return uuid.NewString()
}
