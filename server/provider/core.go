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

	ResizeImageService service.ResizeImageService

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
	container.ResizeImageService = service.NewResizeImageService(container.Config.ExternalURL)

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
