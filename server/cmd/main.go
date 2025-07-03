package main

import (
	"github.com/charmbracelet/log"
	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/middleware"
	"github.com/nr-chan/NRchan/provider"
	"github.com/nr-chan/NRchan/routes"
	"github.com/samber/do"
)

func main() {
	var (
		injector = do.New()
	)

	server := gin.Default()
	server.Use(middleware.CorsMiddleware())

	provider.RegisterDependencies(injector)

	if err := routes.RegisterRoutes(server, injector); err != nil {
		log.Fatal("Failed to register routes: ", err)
	}
	if err := server.Run(":8080"); err != nil {
		log.Fatal("error running server", err)
	}
}
