package service

import (
	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/repository"
)

type AdminService interface {
	Login(ctx *gin.Context) (string, error)
}

type adminService struct {
	boardRepository repository.BoardRepository
	jwtService      JWTService
}

func NewAdminService(boardRepository repository.BoardRepository, jwt JWTService) AdminService {
	return &adminService{boardRepository: boardRepository, jwtService: jwt}
}

func (j *adminService) Login(ctx *gin.Context) (string, error) {
	return "", nil
}
