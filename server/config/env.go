package config

import (
	"github.com/syumai/workers/cloudflare"
)

type Config struct {
	SECRETACCESSKEY       string
	REDIS_URI             string
	R2_ENDPOINT           string
	MONGODB_URI           string
	CLOUDFLAREID          string
	CLOUDFLAREACCESSKEYID string
	CAPTCHA_SECRET        string
	BUCKETNAME            string
	PORT                  string
	JWT_SECRET            string
	DATABASE_NAME         string
}

func InitConfig() Config {
	return Config{
		SECRETACCESSKEY:       cloudflare.Getenv("SECRETACCESSKEY"),
		REDIS_URI:             cloudflare.Getenv("REDIS_URI"),
		R2_ENDPOINT:           cloudflare.Getenv("R2_ENDPOINT"),
		MONGODB_URI:           cloudflare.Getenv("MONGODB_URI"),
		CLOUDFLAREID:          cloudflare.Getenv("CLOUDFLAREID"),
		CLOUDFLAREACCESSKEYID: cloudflare.Getenv("CLOUDFLAREACCESSKEYID"),
		CAPTCHA_SECRET:        cloudflare.Getenv("CAPTCHA_SECRET"),
		BUCKETNAME:            cloudflare.Getenv("BUCKETNAME"),
		PORT:                  cloudflare.Getenv("PORT"),
		JWT_SECRET:            cloudflare.Getenv("JWT_SECRET"),
		DATABASE_NAME:         cloudflare.Getenv("DATABASE_NAME"),
	}
}
