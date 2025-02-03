package main

import (
	"net/http"

	log "github.com/charmbracelet/log"
	"github.com/joho/godotenv"
	"github.com/nr-chan/NRchan/config"
	routes "github.com/nr-chan/NRchan/routes"
)

func main(){
    err := godotenv.Load(".env")
    if err!=nil{
        log.Fatal("env not loaded exiting program")
    }

    go config.ConnectDB()

    http.HandleFunc("/",routes.Handler) // Handle apex route
    log.Info("Listening to port 8080")
    http.ListenAndServe(":8080",nil)
}
