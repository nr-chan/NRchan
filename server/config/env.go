package config

import (
	"github.com/spf13/viper"
)

func InitConfig() *viper.Viper {
	config := viper.New()

	config.SetConfigFile(`.env`)

	err := config.ReadInConfig()
	if err != nil {
		panic("Cant Find .env File")
	}

	return config
}
