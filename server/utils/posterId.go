package utils

import (
	"crypto/sha1"
	"encoding/hex"
)

// UUIDToPosterID hashes a UUID using SHA-1 and returns first 6 hex chars.
// Assumes UUID is already validated.
func UUIDToPosterID(uuid string) string {
	sum := sha1.Sum([]byte(uuid))
	return hex.EncodeToString(sum[:])[:6]
}
