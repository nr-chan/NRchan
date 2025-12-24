package request

import "mime/multipart"

// Thread Request is in the form of a form-data
type ThreadRequest struct {
	Content      string                `form:"content" binding:"required"`
	Board        string                `form:"board" binding:"required"`
	Username     string                `form:"username"`
	Subject      string                `form:"subject"`
	CaptchaToken string                `form:"captchaToken" binding:"required"`
	Image        *multipart.FileHeader `form:"image"`
	UUID         string                `form:"-"`
}

type VoteRequest struct {
	IsUpvote bool   `form:"up" binding:"required"`
	UUID     string `form:"uuid" binding:"required"`
}
