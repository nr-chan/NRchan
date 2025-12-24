package provider

import (
	"github.com/nr-chan/NRchan/service"
)

type ServiceContainer struct {
	boardService  service.BoardService
	adminService  service.AdminService
	homeService   service.HomeService
	threadService service.ThreadService
}

func RegisterServices(data *RepositoryContainer, jwtService service.JWTService) ServiceContainer {
	return ServiceContainer{
		boardService:  service.NewBoardService(data.boardRepository, jwtService),
		adminService:  service.NewAdminService(data.boardRepository, jwtService),
		homeService:   service.NewHomeService(data.homeRepository, jwtService),
		threadService: service.NewThreadService(data.threadRepository, data.replyRepository, jwtService),
	}
}
