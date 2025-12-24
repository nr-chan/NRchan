package config

import (
	"database/sql"

	_ "github.com/syumai/workers/cloudflare/d1"
)

type DatabaseConfig struct {
	URI          string
	DatabaseName string
}

func NewDatabaseConfig() *DatabaseConfig {
	return &DatabaseConfig{}
}

func (dc *DatabaseConfig) SetupClient() (*sql.DB, error) {
	client, err := sql.Open("d1", "DB")
	if err != nil {
		return nil, err
	}
	return client, nil
}
