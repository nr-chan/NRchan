package controller

import (
	"github.com/nr-chan/NRchan/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/service"
)

type HomeController struct {
	homeService service.HomeService
}

func NewHomeController(hs service.HomeService) *HomeController {
	return &HomeController{homeService: hs}
}

func (c *HomeController) HandleRecent(ctx *gin.Context) {
	threads, err := c.homeService.GetRecent(ctx)
	if err != nil {
		res := utils.BuildResponseFailed("Failed to get recent threads", err.Error(), nil)
		ctx.JSON(http.StatusOK, res)
		return
	}
	res := utils.BuildResponseSuccess("Successfully got recent threads", threads)
	ctx.JSON(http.StatusOK, res)
}
