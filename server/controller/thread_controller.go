package controller

// import (
// 	"net/http"

// 	"github.com/gin-gonic/gin"
// 	"github.com/nr-chan/NRchan/dto/request"
// 	"github.com/nr-chan/NRchan/service"
// )

// type ThreadController struct {
// 	threadService service.ThreadService
// }

// func NewThreadController(ts service.ThreadService) *ThreadController {
// 	return &ThreadController{threadService: ts}
// }

// func (c *ThreadController) PostThread(ctx *gin.Context) {
// 	var threadRequest request.ThreadRequest
// 	if err := ctx.ShouldBindJSON(&threadRequest); err != nil {
// 		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	thread, err := c.threadService.PostThread(ctx, threadRequest)
// 	if err != nil {
// 		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	ctx.JSON(http.StatusOK, thread)
// }
