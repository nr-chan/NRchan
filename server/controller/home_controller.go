package controller

import (
	"net/http"

	"github.com/nr-chan/NRchan/utils"

	"github.com/nr-chan/NRchan/service"
)

type HomeController struct {
	homeService service.HomeService
}

func NewHomeController(hs service.HomeService) *HomeController {
	return &HomeController{homeService: hs}
}

func (c *HomeController) HandleRecent(w http.ResponseWriter, r *http.Request) {
	threads, err := c.homeService.GetRecent(r.Context())
	if err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to get recent threads", err.Error(), nil)
		return
	}
	utils.BuildResponseSuccess(w, http.StatusOK, "Successfully got recent threads", threads)
}
