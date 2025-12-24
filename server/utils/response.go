package utils

import (
	"encoding/json"
	"net/http"
)

type Response struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Error   any    `json:"error,omitempty"`
	Data    any    `json:"data,omitempty"`
	Meta    any    `json:"meta,omitempty"`
}

func BuildResponseSuccess(
	w http.ResponseWriter,
	status int,
	message string,
	data any,
) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	res := Response{
		Status:  true,
		Message: message,
		Data:    data,
	}

	_ = json.NewEncoder(w).Encode(res)
}

func BuildResponseFailed(
	w http.ResponseWriter,
	status int,
	message string,
	err any,
	data any,
) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	res := Response{
		Status:  false,
		Message: message,
		Error:   err,
		Data:    data,
	}

	_ = json.NewEncoder(w).Encode(res)
}
