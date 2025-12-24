package routes

import (
	"net/http"

	"github.com/nr-chan/NRchan/provider"
)

func Thread(route *http.ServeMux, container *provider.Container) {
	// threadController := container.HandlerContainer.ThreadController
	// routes := route.Group("/api/thread")
	// {
	// 	routes.POST("/", threadController.PostThread)
	// 	routes.POST("/:id/reply", threadController.PostReply)
	// }
}
