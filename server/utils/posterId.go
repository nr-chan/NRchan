package utils

import (
	"crypto/sha1"
	"encoding/hex"
	"strings"

	"github.com/google/uuid"
)

// UUIDToPosterID converts a UUID (string) into a 6-char hex poster ID.
// - Validates UUIDv4 shape (lightweight check).
// - Uses SHA-1 and returns first 6 hex chars.
// - Returns "000000" on invalid input.
func UUIDToPosterID(uuidString string) string {
	u := strings.ToLower(strings.TrimSpace(uuidString))
	if err := uuid.Validate(u); err != nil {
		return "000000"
	}
	h := sha1.Sum([]byte(u))
	return hex.EncodeToString(h[:])[:6]
}
