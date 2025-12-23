package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/middleware"
	"github.com/nr-chan/NRchan/provider"
	"github.com/nr-chan/NRchan/routes"
	"github.com/samber/do"
	"github.com/syumai/workers"
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

	server.GET("/hello", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Hello, World!"})
	})
	workers.Serve(server)
}
