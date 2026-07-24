package main

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"net/http"
	"os"
)

func main() {
	r := mux.NewRouter()
	send := func(v map[string]string) http.HandlerFunc {
		return func(w http.ResponseWriter, _ *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(v)
		}
	}
	r.HandleFunc("/", send(map[string]string{"service": "Pxxl Gorilla API"}))
	r.HandleFunc("/health", send(map[string]string{"status": "ok"}))
	r.HandleFunc("/api", send(map[string]string{"message": "Hello from Gorilla"}))
	p := os.Getenv("PORT")
	if p == "" {
		p = "8080"
	}
	http.ListenAndServe("0.0.0.0:"+p, r)
}
