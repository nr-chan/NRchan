package middleware

import "github.com/gin-gonic/gin"

func CorsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "https://loonix.in")
		c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	}
}
