package routes

import (
	"net/http"

	"github.com/nr-chan/NRchan/provider"
)

func Board(route *http.ServeMux, container *provider.Container) {
	boardController := container.HandlerContainer.BoardController

	// Prefix match
	route.HandleFunc("/api/board/", boardController.GetThreadsByBoard)
}
