package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

func out(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}
func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) { out(w, map[string]string{"service": "Pxxl Go API"}) })
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) { out(w, map[string]string{"status": "ok"}) })
	http.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) { out(w, map[string]string{"message": "Hello from Go"}) })
	p := os.Getenv("PORT")
	if p == "" {
		p = "8080"
	}
	log.Fatal(http.ListenAndServe("0.0.0.0:"+p, nil))
}
