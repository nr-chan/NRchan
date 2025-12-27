package controller

import (
	"net/http"

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
	board := r.PathValue("board")
	threads, err := c.boardService.GetThreads(r.Context(), board)
	if err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to get threads", err.Error(), nil)
		return
	}

	utils.BuildResponseSuccess(w, http.StatusOK, "Successfully got threads", threads)
}

func (c *BoardController) GetAllBoards(w http.ResponseWriter, r *http.Request) {
	boards, err := c.boardService.GetAllBoards(r.Context())
	if err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to get boards", err.Error(), nil)
		return
	}

	utils.BuildResponseSuccess(w, http.StatusOK, "Successfully got boards", boards)
}

func (c *BoardController) GetBoardsData(w http.ResponseWriter, r *http.Request) {
	data, err := c.boardService.GetBoardsData(r.Context())
	if err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to get boards data", err.Error(), nil)
		return
	}
	utils.BuildResponseSuccess(w, http.StatusOK, "Successfully got boards data", data)
}

func (c *BoardController) GetPosterStats(w http.ResponseWriter, r *http.Request) {
	data, err := c.boardService.GetPosterStats(r.Context())
	if err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to get poster stats", err.Error(), nil)
		return
	}
	utils.BuildResponseSuccess(w, http.StatusOK, "Successfully got poster stats", data)
}
