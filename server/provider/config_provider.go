package provider

import (
	"github.com/nr-chan/NRchan/config"
	"github.com/nr-chan/NRchan/service"
	"github.com/samber/do"
)

func RegisterAppConfig(injector *do.Injector) {
	do.ProvideNamed(injector, "AppConfig", func(i *do.Injector) (*config.AppConfig, error) {
		return config.LoadConfig()
	})

	do.ProvideNamed(injector, "JWTService", func(i *do.Injector) (service.JWTService, error) {
		cfg := do.MustInvokeNamed[*config.AppConfig](i, "AppConfig")
		return service.NewJWTService(cfg.JWTSecret), nil
	})

}
