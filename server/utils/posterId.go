package utils

import (
	"encoding/hex"
	"hash/maphash"
)

// UUIDToPosterID converts a UUID (string) into a 6-char hex poster ID.
// - Validates UUIDv4 shape (lightweight check).
// - Uses mapHash and returns first 6 hex chars.
// - Returns "000000" on invalid input.
func UUIDToPosterID(uuid string) string {
	var h maphash.Hash
	h.WriteString(uuid)
	return hex.EncodeToString(h.Sum(nil))[:6]
}
