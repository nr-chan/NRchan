package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/middleware"
	"github.com/nr-chan/NRchan/provider"
	"github.com/nr-chan/NRchan/routes"
	"github.com/syumai/workers"
)

func main() {

	server := gin.Default()
	server.Use(middleware.CorsMiddleware())

	container, err := provider.NewContainer()
	if err != nil {
		log.Fatal("Failed to create container: ", err)
	}

	if err := routes.RegisterRoutes(server, container); err != nil {
		log.Fatal("Failed to register routes: ", err)
	}

	server.GET("/hello", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Hello, World!"})
	})
	workers.Serve(server)
}
