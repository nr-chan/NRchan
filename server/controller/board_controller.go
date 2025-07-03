package controller

import (
	"github.com/nr-chan/NRchan/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/service"
)

type BoardController struct {
	boardService service.BoardService
}

func NewBoardController(bs service.BoardService) *BoardController {
	return &BoardController{boardService: bs}
}

func (c *BoardController) GetThreadsByBoard(ctx *gin.Context) {
	board := ctx.Param("board")
	threads, err := c.boardService.GetThreads(ctx, board)
	if err != nil {
		res := utils.BuildResponseFailed("Failed to get threads", err.Error(), nil)
		ctx.JSON(http.StatusOK, res)
		return
	}
	res := utils.BuildResponseSuccess("Successfully got threads", threads)
	ctx.JSON(http.StatusOK, res)
}
