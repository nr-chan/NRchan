package provider

import (
	"github.com/nr-chan/NRchan/config"
	"github.com/nr-chan/NRchan/service"
	"github.com/nr-chan/NRchan/utils"
)

// Container holds all the application dependencies
type ConfigContainer struct {
	// Config
	Config *config.AppConfig

	// Utils
	ImageBucket *utils.ImageBucket
	JWTService  service.JWTService
}

type Container struct {
	//DB
	*DatabaseProvider

	//Cache
	CacheService service.CacheService

	ConfigContainer
	RepositoryContainer
	ServiceContainer
	HandlerContainer
}

// NewContainer creates and initializes a new container with all dependencies
func NewContainer() (*Container, error) {
	container := &Container{}

	// Initialize config first as other dependencies depend on it
	cfg, err := config.LoadConfig()
	if err != nil {
		return nil, err
	}
	container.Config = cfg

	// Initialize utils
	container.ImageBucket = utils.NewImageBucket("NR_BUCKET")
	container.JWTService = service.NewJWTService(cfg.JWTSecret)
	container.CacheService = service.NewCacheService("CACHE_NAMESPACE")

	// Initialize database
	container.DatabaseProvider, err = RegisterDatabase(&container.ConfigContainer)
	if err != nil {
		return nil, err
	}

	container.RepositoryContainer = RegisterRepositories(container.DatabaseProvider)

	// Initialize services
	container.ServiceContainer = RegisterServices(container)

	// Initialize handlers
	container.HandlerContainer = RegisterHandlers(&container.ServiceContainer)

	return container, nil
}

// RegisterDependencies is kept for backward compatibility during transition
// TODO: Remove this once all code is migrated to use Container directly
func RegisterDependencies() (*Container, error) {
	return NewContainer()
}
