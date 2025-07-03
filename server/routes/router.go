package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/samber/do"
)

func RegisterRoutes(server *gin.Engine, injector *do.Injector) error {
	Board(server, injector)
	Admin(server, injector)
	Home(server, injector)
	return nil
}
