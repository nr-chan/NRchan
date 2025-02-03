package controllers

import (
	"fmt"
	"net/http"
)

func BoardDataController(w http.ResponseWriter,r *http.Request) {
    fmt.Fprintf(w,"Testing bolte kya")
}

func BoardStatsController(w http.ResponseWriter,r *http.Request) {
    fmt.Fprintf(w,"Testing bolte kya")
}
