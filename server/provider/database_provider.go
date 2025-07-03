package provider

import (
	"github.com/nr-chan/NRchan/config"
	"github.com/nr-chan/NRchan/mongo"
	"github.com/samber/do"
)

type DatabaseProvider struct {
	client   mongo.Client
	database mongo.Database
}

func NewDatabaseProvider(client mongo.Client, databaseName string) *DatabaseProvider {
	return &DatabaseProvider{
		client:   client,
		database: client.Database(databaseName),
	}
}

func (dp *DatabaseProvider) GetCollection(name string) mongo.Collection {
	return dp.database.Collection(name)
}

func (dp *DatabaseProvider) GetClient() mongo.Client {
	return dp.client
}

func (dp *DatabaseProvider) GetDatabase() mongo.Database {
	return dp.database
}

func RegisterDatabase(injector *do.Injector) {

	// Register database client
	do.ProvideNamed(injector, "MongoClient", func(i *do.Injector) (mongo.Client, error) {
		cfg := do.MustInvokeNamed[*config.AppConfig](i, "AppConfig")
		return cfg.DatabaseConfig.SetupClient()
	})

	// Register database provider
	do.ProvideNamed(injector, "DatabaseProvider", func(i *do.Injector) (*DatabaseProvider, error) {
		client := do.MustInvokeNamed[mongo.Client](i, "MongoClient")
		cfg := do.MustInvokeNamed[*config.AppConfig](i, "AppConfig")
		return NewDatabaseProvider(client, cfg.DatabaseConfig.DatabaseName), nil
	})

	// Register specific collections
	do.ProvideNamed(injector, "UsersCollection", func(i *do.Injector) (mongo.Collection, error) {
		dbProvider := do.MustInvokeNamed[*DatabaseProvider](i, "DatabaseProvider")
		return dbProvider.GetCollection("users"), nil
	})

	do.ProvideNamed(injector, "PostsCollection", func(i *do.Injector) (mongo.Collection, error) {
		dbProvider := do.MustInvokeNamed[*DatabaseProvider](i, "DatabaseProvider")
		return dbProvider.GetCollection("posts"), nil
	})
}
