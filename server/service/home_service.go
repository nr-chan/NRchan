package service

import (
	"context"

	"github.com/nr-chan/NRchan/dto"
	"github.com/nr-chan/NRchan/repository"
)

type (
	HomeService interface {
		GetRecent(ctx context.Context) ([]dto.Thread, error)
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
