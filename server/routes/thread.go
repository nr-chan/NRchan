package routes

import (
	"net/http"

	"github.com/nr-chan/NRchan/provider"
)

func Thread(route *http.ServeMux, container *provider.Container) {
	threadController := container.HandlerContainer.ThreadController

	route.HandleFunc("POST /api/thread", threadController.PostThread)
	route.HandleFunc("GET /api/thread/{id}", threadController.GetThread)
	route.HandleFunc("DELETE /api/thread/{id}", threadController.DeleteThread)

	route.HandleFunc("POST /api/thread/{id}/reply", threadController.PostReply)
	route.HandleFunc("DELETE /api/reply/{replyId}", threadController.DeleteReply)

	route.HandleFunc("POST /api/votes/{id}", threadController.UpdateVote)

}
