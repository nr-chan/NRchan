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

func (dp *DatabaseProvider) GetDatabase() *sql.DB {
	return dp.database
}

func RegisterDatabase(cfgCnt *ConfigContainer) (*DatabaseProvider, error) {

	// Register mongoapi HTTP Client

	db, err := cfgCnt.Config.DatabaseConfig.SetupClient()
	if err != nil {
		return nil, err
	}

	// Register DatabaseProvider

	return NewDatabaseProvider(db), nil
}
