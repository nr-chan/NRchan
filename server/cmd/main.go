package main

import (
	"log"
	"net/http"

	"github.com/nr-chan/NRchan/middleware"
	"github.com/nr-chan/NRchan/provider"
	"github.com/nr-chan/NRchan/routes"
	"github.com/syumai/workers"
)

func main() {
	mux := http.DefaultServeMux

	// Apply CORS middleware to all routes
	handler := middleware.CORSMiddleware(mux)

	container, err := provider.NewContainer()
	if err != nil {
		log.Fatal("Failed to create container: ", err)
	}

	// Register routes
	if err := routes.RegisterRoutes(mux, container); err != nil {
		log.Fatal("Failed to register routes: ", err)
	}

	// Start the server
	workers.Serve(handler)
}
