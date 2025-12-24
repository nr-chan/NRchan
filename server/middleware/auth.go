package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/nr-chan/NRchan/dto"
	"github.com/nr-chan/NRchan/service"
	"github.com/nr-chan/NRchan/utils"
)

// Authenticate is a middleware that validates JWT tokens
func Authenticate(jwtService service.JWTService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")

			if authHeader == "" {
				utils.BuildResponseFailed(w, http.StatusUnauthorized, dto.MESSAGE_FAILED_PROSES_REQUEST, dto.MESSAGE_FAILED_TOKEN_NOT_FOUND, nil)
				return
			}

			if !strings.HasPrefix(authHeader, "Bearer ") {
				utils.BuildResponseFailed(w, http.StatusUnauthorized, dto.MESSAGE_FAILED_PROSES_REQUEST, dto.MESSAGE_FAILED_TOKEN_NOT_VALID, nil)
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			token, err := jwtService.ValidateToken(tokenString)
			if err != nil || !token.Valid {
				utils.BuildResponseFailed(w, http.StatusUnauthorized, dto.MESSAGE_FAILED_PROSES_REQUEST, dto.MESSAGE_FAILED_TOKEN_NOT_VALID, nil)
				return
			}

			userID, err := jwtService.GetUserIDByToken(tokenString)
			if err != nil {
				utils.BuildResponseFailed(w, http.StatusUnauthorized, dto.MESSAGE_FAILED_PROSES_REQUEST, err.Error(), nil)
				return
			}

			// Create a new request with the user ID in the context
			ctx := r.Context()
			ctx = context.WithValue(ctx, "user_id", userID)
			ctx = context.WithValue(ctx, "token", tokenString)

			// Call the next handler with the updated context
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
