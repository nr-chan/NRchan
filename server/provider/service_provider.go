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

func RegisterServices(container *Container) ServiceContainer {
	return ServiceContainer{
		boardService:  service.NewBoardService(container.boardRepository, container.JWTService),
		adminService:  service.NewAdminService(container.boardRepository, container.JWTService),
		homeService:   service.NewHomeService(container.homeRepository, container.JWTService),
		threadService: service.NewThreadService(container.threadRepository, container.replyRepository, container.JWTService, container.ImageBucket, container.CacheService),
	}
}
