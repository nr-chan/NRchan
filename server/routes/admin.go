package routes

import (
	"net/http"

	"github.com/nr-chan/NRchan/provider"
)

func Admin(route *http.ServeMux, container *provider.Container) {
	adminController := container.HandlerContainer.AdminController

	route.HandleFunc("POST /api/admin/login", adminController.LoginController)
	//routes.POST("/create", adminController.CreateAdmin)
	//routes.GET("/list", middleware.Authenticate(jwtService), adminController.ListAdmins)
	//routes.DELETE(":id", middleware.Authenticate(jwtService), adminController.Delete)
	//routes.PATCH("/password", middleware.Authenticate(jwtService), adminController.Update)
	//routes.POST("/:id/role", adminController.UpdateAdminRole)
	//routes.POST("/thread/:id", adminController.DeleteThread)
	//routes.POST("/lock/:id", adminController.LockThread)
	//routes.POST("/pin/:id", adminController.PinThread)
	//routes.DELETE("/reply/:id", adminController.DeleteReply)
}
