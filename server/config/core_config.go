package config

type AppConfig struct {
	DatabaseConfig *DatabaseConfig
	JWTSecret      string
	Port           string
}

func LoadConfig() (*AppConfig, error) {
	viper := InitConfig()

	dbConfig := NewDatabaseConfig()
	dbConfig.URI = viper.GetString("MONGODB_URI")
	dbConfig.DatabaseName = viper.GetString("DATABASE_NAME")

	return &AppConfig{
		DatabaseConfig: dbConfig,
		JWTSecret:      viper.GetString("JWT_SECRET"),
		Port:           viper.GetString("PORT"),
	}, nil
}
