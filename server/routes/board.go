package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/controller"
	"github.com/samber/do"
)

func Board(route *gin.Engine, injector *do.Injector) {
	boardController := do.MustInvokeNamed[*controller.BoardController](injector, "BoardController")
	routes := route.Group("/api/board")
	{
		routes.GET(":board/", boardController.GetThreadsByBoard)
	}
}
