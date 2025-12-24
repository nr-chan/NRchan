package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/provider"
)

func Board(route *gin.Engine, container *provider.Container) {
	boardController := container.HandlerContainer.BoardController
	routes := route.Group("/api/board")
	{
		routes.GET(":board/", boardController.GetThreadsByBoard)
	}
}
