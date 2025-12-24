package routes

import (
	"net/http"

	"github.com/nr-chan/NRchan/provider"
)

func RegisterRoutes(server *http.ServeMux, container *provider.Container) error {
	Board(server, container)
	Admin(server, container)
	Home(server, container)
	Thread(server, container)
	return nil
}
