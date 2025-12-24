package routes

import (
	"net/http"

	"github.com/nr-chan/NRchan/provider"
)

func Home(route *http.ServeMux, container *provider.Container) {
	homeController := container.HandlerContainer.HomeController
	route.HandleFunc("GET /api/home/recent", homeController.HandleRecent)
}
