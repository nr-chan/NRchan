package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/provider"
)

func RegisterRoutes(server *gin.Engine, container *provider.Container) error {
	Board(server, container)
	Admin(server, container)
	Home(server, container)
	Thread(server, container)
	return nil
}
