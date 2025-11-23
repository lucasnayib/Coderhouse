package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/example/monorepo/common/middleware"
)

func main() {
	secret := "dev-secret"
	mux := http.NewServeMux()
	mux.HandleFunc("/me", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]string{"message": "me profile placeholder"})
	})
	mux.HandleFunc("/students", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode([]string{"alice", "bob"})
	})
	mux.HandleFunc("/users/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodDelete {
			json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
			return
		}
		w.WriteHeader(http.StatusMethodNotAllowed)
	})

	handler := middleware.AuthMiddleware(secret)(middleware.RequireRoles("Admin", "Profesor", "Alumno")(mux))
	addr := ":8082"
	log.Printf("users-service listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, handler))
}
