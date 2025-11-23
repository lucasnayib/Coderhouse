package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/example/monorepo/common/middleware"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/conversations", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode([]string{})
	})
	mux.HandleFunc("/messages", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(map[string]string{"status": "published"})
			return
		}
		json.NewEncoder(w).Encode([]string{})
	})

	secret := "dev-secret"
	handler := middleware.AuthMiddleware(secret)(middleware.RequireRoles("Alumno", "Profesor", "Admin")(mux))
	addr := ":8084"
	log.Printf("messaging-service listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, handler))
}
