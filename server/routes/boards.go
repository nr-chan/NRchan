package routes

import (
	"net/http"

	"github.com/nr-chan/NRchan/controllers"
)

func boardHandler(w http.ResponseWriter,r *http.Request){
    router := http.NewServeMux()
    router.HandleFunc("GET /boards/data/",controllers.BoardDataController)
    router.HandleFunc("GET /boards/stats/",controllers.BoardDataController)
    router.HandleFunc("GET /boards/stats/",controllers.BoardStatsController)
    router.ServeHTTP(w,r);
}
