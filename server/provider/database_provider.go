package provider

import (
	"database/sql"
	"fmt"

	"github.com/nr-chan/NRchan/config"
	"github.com/samber/do"
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

func RegisterDatabase(injector *do.Injector) {

	// Register mongoapi HTTP Client
	do.ProvideNamed(injector, "Database", func(i *do.Injector) (*sql.DB, error) {
		cfg := do.MustInvokeNamed[*config.AppConfig](i, "AppConfig")
		return cfg.DatabaseConfig.SetupClient()
	})

	// Register DatabaseProvider
	do.ProvideNamed(injector, "DatabaseProvider", func(i *do.Injector) (*DatabaseProvider, error) {
		db := do.MustInvokeNamed[*sql.DB](i, "Database")

		fmt.Println("%+v", db)
		return NewDatabaseProvider(db), nil
	})
}
