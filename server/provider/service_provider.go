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

func RegisterServices(data *RepositoryContainer, container *Container) ServiceContainer {
	return ServiceContainer{
		boardService:  service.NewBoardService(data.boardRepository, container.JWTService),
		adminService:  service.NewAdminService(data.boardRepository, container.JWTService),
		homeService:   service.NewHomeService(data.homeRepository, container.JWTService),
		threadService: service.NewThreadService(data.threadRepository, data.replyRepository, container.JWTService, container.ImageBucket),
	}
}
