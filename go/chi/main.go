package main

import (
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"net/http"
	"os"
)

func main() {
	r := chi.NewRouter()
	send := func(v map[string]string) http.HandlerFunc {
		return func(w http.ResponseWriter, _ *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(v)
		}
	}
	r.Get("/", send(map[string]string{"service": "Pxxl Chi API"}))
	r.Get("/health", send(map[string]string{"status": "ok"}))
	r.Get("/api", send(map[string]string{"message": "Hello from Chi"}))
	p := os.Getenv("PORT")
	if p == "" {
		p = "8080"
	}
	http.ListenAndServe("0.0.0.0:"+p, r)
}
