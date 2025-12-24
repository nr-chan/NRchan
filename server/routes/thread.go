package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/provider"
)

func Thread(route *gin.Engine, container *provider.Container) {
	threadController := container.HandlerContainer.ThreadController
	routes := route.Group("/api/thread")
	{
		routes.POST("/", threadController.PostThread)
		routes.POST("/:id/reply", threadController.PostReply)
	}
}
