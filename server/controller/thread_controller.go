package controller

import (
	"encoding/json"
	"net/http"

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
	if err := r.ParseMultipartForm(10 << 20); err != nil { // ~10MB max upload size
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Invalid form data", err.Error(), nil)
		return
	}

	req := request.ThreadRequest{
		Subject:      r.FormValue("subject"),
		Content:      r.FormValue("content"),
		Board:        r.FormValue("board"),
		CaptchaToken: r.FormValue("captchaToken"),
		UUID:         r.Header.Get("uuid"),
	}

	if _, h, err := r.FormFile("image"); err == nil {
		req.Image = h
	}

	if req.Subject == "" || req.Content == "" || req.Board == "" {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Missing required fields", nil, nil)
		return
	}

	threadID, err := c.threadService.CreateThread(r.Context(), req)
	if err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to create thread", err.Error(), nil)
		return
	}

	utils.BuildResponseSuccess(
		w,
		http.StatusOK,
		"Thread created successfully",
		map[string]any{"thread_id": threadID},
	)
}

func (c *ThreadController) PostReply(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Invalid thread ID", nil, nil)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil { // ~10MB max upload size
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Invalid form data", err.Error(), nil)
		return
	}

	req := request.ReplyRequest{
		Content:      r.FormValue("content"),
		Username:     r.FormValue("username"),
		CaptchaToken: r.FormValue("captchaToken"),
		ThreadID:     id,
		UUID:         r.Header.Get("uuid"),
	}

	if req.UUID == "" || req.Content == "" || req.CaptchaToken == "" {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Missing required fields", nil, nil)
		return
	}

	if _, h, err := r.FormFile("image"); err == nil {
		req.Image = h
	}

	replyId, err := c.threadService.AddReply(r.Context(), req)
	if err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to add reply", err.Error(), nil)
		return
	}

	utils.BuildResponseSuccess(w, http.StatusOK, "Reply added successfully", map[string]any{"reply_id": replyId})
}

func (c *ThreadController) GetThread(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Invalid thread ID", nil, nil)
		return
	}

	thread, err := c.threadService.GetThreadById(r.Context(), id)
	if err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to get thread", err.Error(), nil)
		return
	}

	utils.BuildResponseSuccess(w, http.StatusOK, "Thread retrieved successfully", thread)
}

func (c *ThreadController) DeleteThread(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Invalid thread ID", nil, nil)
		return
	}

	uuid := r.Header.Get("uuid")

	if uuid == "" {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Missing UUID", nil, nil)
		return
	}

	if err := c.threadService.DeleteThread(r.Context(), id, uuid); err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to delete thread", err.Error(), nil)
		return
	}

	utils.BuildResponseSuccess(w, http.StatusOK, "Thread deleted successfully", nil)
}

func (c *ThreadController) DeleteReply(w http.ResponseWriter, r *http.Request) {
	replyId := r.PathValue("replyId")
	if replyId == "" {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Invalid reply ID", nil, nil)
		return
	}

	uuid := r.Header.Get("uuid")

	if uuid == "" {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Missing UUID", nil, nil)
		return
	}

	if err := c.threadService.DeleteReply(r.Context(), replyId, uuid); err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to delete reply", err.Error(), nil)
		return
	}

	utils.BuildResponseSuccess(w, http.StatusOK, "Reply deleted successfully", nil)
}

func (c *ThreadController) UpdateVote(w http.ResponseWriter, r *http.Request) {
	threadId := r.PathValue("id")
	if threadId == "" {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Invalid thread ID", nil, nil)
		return
	}

	var req request.VoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Invalid JSON body", err.Error(), nil)
		return
	}

	if req.UUID == "" {
		utils.BuildResponseFailed(w, http.StatusBadRequest, "Missing UUID", nil, nil)
		return
	}

	if err := c.threadService.UpdateVote(
		r.Context(),
		threadId,
		req.UUID,
		req.IsUpvote,
	); err != nil {
		utils.BuildResponseFailed(w, http.StatusInternalServerError, "Failed to update vote", err.Error(), nil)
		return
	}

	utils.BuildResponseSuccess(w, http.StatusOK, "Vote updated successfully", nil)
}
