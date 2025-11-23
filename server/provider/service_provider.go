package provider

import (
	"github.com/nr-chan/NRchan/repository"
	"github.com/nr-chan/NRchan/service"
	"github.com/samber/do"
)

func RegisterServices(injector *do.Injector) {

	do.ProvideNamed(injector, "BoardService", func(i *do.Injector) (service.BoardService, error) {
		boardRepository := do.MustInvokeNamed[repository.BoardRepository](i, "BoardRepository")
		jwtService := do.MustInvokeNamed[service.JWTService](i, "JWTService")
		return service.NewBoardService(boardRepository, jwtService), nil
	})

	do.ProvideNamed(injector, "AdminService", func(i *do.Injector) (service.AdminService, error) {
		boardRepository := do.MustInvokeNamed[repository.BoardRepository](i, "BoardRepository")
		jwtService := do.MustInvokeNamed[service.JWTService](i, "JWTService")
		return service.NewAdminService(boardRepository, jwtService), nil
	})

	do.ProvideNamed(injector, "HomeService", func(i *do.Injector) (service.HomeService, error) {
		homeRepository := do.MustInvokeNamed[repository.HomeRepository](i, "HomeRepository")
		jwtService := do.MustInvokeNamed[service.JWTService](i, "JWTService")
		return service.NewHomeService(homeRepository, jwtService), nil
	})

	// do.ProvideNamed(injector, "ThreadService", func(i *do.Injector) (service.ThreadService, error) {
	// 	threadRepository := do.MustInvokeNamed[repository.ThreadRepository](i, "ThreadRepository")
	// 	jwtService := do.MustInvokeNamed[service.JWTService](i, "JWTService")
	// 	return service.NewThreadService(threadRepository, jwtService), nil
	// })
}
