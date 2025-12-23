package provider

import (
	"github.com/nr-chan/NRchan/controller"
	"github.com/nr-chan/NRchan/service"
	"github.com/samber/do"
)

func RegisterHandlers(injector *do.Injector) {
	// Board Handler
	do.ProvideNamed(injector, "BoardController", func(i *do.Injector) (*controller.BoardController, error) {
		boardService := do.MustInvokeNamed[service.BoardService](i, "BoardService")
		return controller.NewBoardController(boardService), nil
	})

	// Admin Handler
	do.ProvideNamed(injector, "AdminController", func(i *do.Injector) (*controller.AdminController, error) {
		adminService := do.MustInvokeNamed[service.AdminService](i, "AdminService")
		return controller.NewAdminController(adminService), nil
	})

	//Home Handler
	do.ProvideNamed(injector, "HomeController", func(i *do.Injector) (*controller.HomeController, error) {
		homeService := do.MustInvokeNamed[service.HomeService](i, "HomeService")
		return controller.NewHomeController(homeService), nil
	})

	//Thread Handler
	do.ProvideNamed(injector, "ThreadController", func(i *do.Injector) (*controller.ThreadController, error) {
		threadService := do.MustInvokeNamed[service.ThreadService](i, "ThreadService")
		return controller.NewThreadController(threadService), nil
	})
}
