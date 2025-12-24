package routes

import (
	"net/http"

	"github.com/nr-chan/NRchan/provider"
)

func Board(route *http.ServeMux, container *provider.Container) {
	boardController := container.HandlerContainer.BoardController

	route.HandleFunc("GET /api/board/{board}", boardController.GetThreadsByBoard)
	route.HandleFunc("GET /api/boards", boardController.GetAllBoards)
}
