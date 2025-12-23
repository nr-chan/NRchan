package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/controller"
	"github.com/samber/do"
)

func Thread(route *gin.Engine, injector *do.Injector) {
	threadController := do.MustInvokeNamed[*controller.ThreadController](injector, "ThreadController")
	routes := route.Group("/api/thread")
	{
		routes.POST("/", threadController.PostThread)
		routes.POST("/:id/reply", threadController.PostReply)
	}
}
