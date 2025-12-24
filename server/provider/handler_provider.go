package provider

import (
	"github.com/nr-chan/NRchan/controller"
)

type HandlerContainer struct {
	BoardController  *controller.BoardController
	AdminController  *controller.AdminController
	HomeController   *controller.HomeController
	ThreadController *controller.ThreadController
}

func RegisterHandlers(ServiceContainer *ServiceContainer) HandlerContainer {
	// Board Handler

	return HandlerContainer{
		BoardController:  controller.NewBoardController(ServiceContainer.boardService),
		AdminController:  controller.NewAdminController(ServiceContainer.adminService),
		HomeController:   controller.NewHomeController(ServiceContainer.homeService),
		ThreadController: controller.NewThreadController(ServiceContainer.threadService),
	}

}
