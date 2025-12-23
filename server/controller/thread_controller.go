package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/nr-chan/NRchan/dto/request"
	"github.com/nr-chan/NRchan/service"
)

type ThreadController struct {
	threadService service.ThreadService
}

func NewThreadController(ts service.ThreadService) *ThreadController {
	return &ThreadController{threadService: ts}
}

func (c *ThreadController) PostThread(ctx *gin.Context) {
	var threadRequest request.ThreadRequest
	if err := ctx.ShouldBind(&threadRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}

	threadRequest.UUID = ctx.GetHeader("uuid")

	threadID, err := c.threadService.CreateThread(ctx, threadRequest)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Thread created successfully", "thread_id": threadID})
}

func (c *ThreadController) PostReply(ctx *gin.Context) {
	idStr := ctx.Param("id")
	if idStr == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "thread id is required in URL"})
		return
	}
	threadID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid thread id"})
		return
	}

	var replyRequest request.ReplyRequest
	if err := ctx.ShouldBind(&replyRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	replyRequest.ThreadID = threadID

	replyRequest.UUID = ctx.GetHeader("uuid")

	if err := c.threadService.AddReply(ctx, replyRequest); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Reply added successfully"})
}
