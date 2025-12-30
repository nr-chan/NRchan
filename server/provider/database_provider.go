package provider

import (
	"database/sql"
)

type DatabaseProvider struct {
	database *sql.DB
}

func NewDatabaseProvider(db *sql.DB) *DatabaseProvider {
	return &DatabaseProvider{
		database: db,
	}
}

func RegisterDatabase(cfgCnt *ConfigContainer) (*DatabaseProvider, error) {

	db, err := cfgCnt.Config.DatabaseConfig.SetupClient()
	if err != nil {
		return nil, err
	}

	return NewDatabaseProvider(db), nil
}
