package provider

import (
	"github.com/samber/do"
)

func RegisterDependencies(injector *do.Injector) {
	RegisterAppConfig(injector)
	RegisterDatabase(injector)
	RegisterRepositories(injector)
	RegisterServices(injector)
	RegisterHandlers(injector)
}
