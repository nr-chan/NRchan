package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/provider"
)

func Home(route *gin.Engine, container *provider.Container) {
	homeController := container.HandlerContainer.HomeController
	routes := route.Group("/api/home")
	{
		routes.GET("/recent", homeController.HandleRecent)
	}
}
