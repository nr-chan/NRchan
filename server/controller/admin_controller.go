package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/dto/request"
	"github.com/nr-chan/NRchan/service"
)

type AdminController struct {
	adminService service.AdminService
}

func NewAdminController(as service.AdminService) *AdminController {
	return &AdminController{adminService: as}
}

func (c *AdminController) LoginController(ctx *gin.Context) {
	var loginRequest request.LoginRequest
	if err := ctx.ShouldBindJSON(&loginRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	admin, err := c.adminService.Login(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, admin)
}
