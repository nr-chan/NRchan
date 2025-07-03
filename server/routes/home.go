package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/controller"
	"github.com/samber/do"
)

func Home(route *gin.Engine, injector *do.Injector) {
	homeController := do.MustInvokeNamed[*controller.HomeController](injector, "HomeController")
	routes := route.Group("/api/home")
	{
		routes.GET("/recent", homeController.HandleRecent)
	}
}
