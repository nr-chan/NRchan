package controller

import (
	"net/http"
	"strings"

	"github.com/nr-chan/NRchan/utils"

	"github.com/nr-chan/NRchan/service"
)

type BoardController struct {
	boardService service.BoardService
}

func NewBoardController(bs service.BoardService) *BoardController {
	return &BoardController{boardService: bs}
}
func (c *BoardController) GetThreadsByBoard(w http.ResponseWriter, r *http.Request) {
	board := strings.TrimPrefix(r.URL.Path, "/api/board/")
	if board == "" {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Board not specified", "missing board param", nil)
		return
	}

	threads, err := c.boardService.GetThreads(r.Context(), board)
	if err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to get threads", err.Error(), nil)
		return
	}

	utils.BuildResponseSuccess(w, http.StatusOK, "Successfully got threads", threads)
}
