package routes

import (
	"net/http"
)

func Handler(w http.ResponseWriter, r *http.Request) { //Main handler for all routes
    router := http.NewServeMux()
    router.HandleFunc("/boards/",boardHandler)
    // router.HandleFunc("/admin/",adminHandler)
    // router.HandleFunc("/recent/",recentHandler)
    // router.HandleFunc("/reply/",replyHandler)
    // router.HandleFunc("/thread/",threadHandler)
    // router.HandleFunc("/votes/",votesHandler)
    router.ServeHTTP(w, r)
}
