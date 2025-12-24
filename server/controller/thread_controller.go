package controller

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/nr-chan/NRchan/dto/request"
	"github.com/nr-chan/NRchan/service"
	"github.com/nr-chan/NRchan/utils"
)

type ThreadController struct {
	threadService service.ThreadService
}

func NewThreadController(ts service.ThreadService) *ThreadController {
	return &ThreadController{threadService: ts}
}

func (c *ThreadController) PostThread(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var threadRequest request.ThreadRequest
	if err := json.NewDecoder(r.Body).Decode(&threadRequest); err != nil {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Invalid request body", err.Error(), nil)
		return
	}
	threadRequest.UUID = r.Header.Get("uuid")

	threadID, err := c.threadService.CreateThread(r.Context(), threadRequest)
	if err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to create thread", err.Error(), nil)
		return
	}

	utils.BuildResponseSuccess(w, http.StatusOK, "Thread created successfully", map[string]interface{}{
		"thread_id": threadID,
	})
}

func (c *ThreadController) PostReply(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract thread ID from URL path
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 3 {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Invalid URL", "thread id is required in URL", nil)
		return
	}
	threadID, err := strconv.ParseInt(pathParts[len(pathParts)-1], 10, 64)
	if err != nil {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Invalid thread ID", "thread id must be a number", nil)
		return
	}

	var replyRequest request.ReplyRequest
	if err := json.NewDecoder(r.Body).Decode(&replyRequest); err != nil {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Invalid request body", err.Error(), nil)
		return
	}

	replyRequest.ThreadID = threadID
	replyRequest.UUID = r.Header.Get("uuid")

	if err := c.threadService.AddReply(r.Context(), replyRequest); err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to add reply", err.Error(), nil)
		return
	}

	utils.BuildResponseSuccess(w, http.StatusOK, "Reply added successfully", nil)
}
