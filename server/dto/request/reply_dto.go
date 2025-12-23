package request

import "mime/multipart"

type ReplyRequest struct {
	Content      string                `form:"content" binding:"required"`
	ThreadID     int64                 `form:"thread_id"`
	ParentReply  *int64                `form:"replyto"`
	Username     string                `form:"username"`
	CaptchaToken string                `form:"captchaToken" binding:"required"`
	Image        *multipart.FileHeader `form:"image"`
	UUID         string                `form:"-"`
}
