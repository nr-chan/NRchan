package config

type AppConfig struct {
	DatabaseConfig *DatabaseConfig
	JWTSecret      string
	Port           string
	R2BucketName   string
}

func LoadConfig() (*AppConfig, error) {
	config := InitConfig()

	dbConfig := NewDatabaseConfig()
	dbConfig.URI = config.MONGODB_URI
	dbConfig.DatabaseName = config.DATABASE_NAME

	return &AppConfig{
		DatabaseConfig: dbConfig,
		JWTSecret:      config.SECRETACCESSKEY,
		Port:           config.PORT,
		R2BucketName:   config.BUCKETNAME,
	}, nil
}
