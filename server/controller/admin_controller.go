package controller

import (
	"encoding/json"
	"net/http"

	"github.com/nr-chan/NRchan/dto/request"
	"github.com/nr-chan/NRchan/service"
	"github.com/nr-chan/NRchan/utils"
)

type AdminController struct {
	adminService service.AdminService
}

func NewAdminController(as service.AdminService) *AdminController {
	return &AdminController{adminService: as}
}

func (c *AdminController) LoginController(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var loginRequest request.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginRequest); err != nil {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Invalid request body", err.Error(), nil)
		return
	}

	admin, err := c.adminService.Login(r.Context())
	if err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Login failed", err.Error(), nil)
		return
	}

	utils.BuildResponseSuccess(w, http.StatusOK, "Login successful", admin)
}
