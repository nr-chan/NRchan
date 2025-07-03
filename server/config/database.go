package config

import (
	"context"
	"fmt"
	"time"

	"github.com/nr-chan/NRchan/mongo"
)

type DatabaseConfig struct {
	URI            string
	DatabaseName   string
	ConnectTimeout time.Duration
}

func NewDatabaseConfig() *DatabaseConfig {
	return &DatabaseConfig{
		ConnectTimeout: 10 * time.Second,
	}
}

func (dc *DatabaseConfig) SetupClient() (mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dc.ConnectTimeout)
	defer cancel()

	client, err := mongo.NewClient(dc.URI)
	if err != nil {
		return nil, fmt.Errorf("failed to create mongo client: %w", err)
	}

	if err = client.Connect(ctx); err != nil {
		return nil, fmt.Errorf("failed to connect to mongo: %w", err)
	}

	if err = client.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping mongo: %w", err)
	}

	return client, nil
}
