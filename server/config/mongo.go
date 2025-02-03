package config

import (
	"os"

	log "github.com/charmbracelet/log"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func ConnectDB() (*mongo.Client,error) {
    MONGODB_URI := os.Getenv("MONGODB_URI")
    log.Info(MONGODB_URI)
    client, err := mongo.Connect(options.Client().ApplyURI(MONGODB_URI))
    
    if err!=nil{
        log.Fatal("Cannot Connect to mongoDB client ","error",err)   
        return nil,nil
    }
    
    log.Info("Connected to MongoDB")
	return client,nil 
}
