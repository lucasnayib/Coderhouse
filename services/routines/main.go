package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/example/monorepo/common/middleware"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/routines", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			json.NewEncoder(w).Encode(map[string]interface{}{"page": 1, "limit": 7, "data": []string{}})
			return
		}
		if r.Method == http.MethodPost {
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(map[string]string{"status": "created"})
			return
		}
		w.WriteHeader(http.StatusMethodNotAllowed)
	})
	mux.HandleFunc("/routines/", func(w http.ResponseWriter, r *http.Request) {
		id := r.URL.Path[len("/routines/"):]
		if r.Method == http.MethodGet {
			json.NewEncoder(w).Encode(map[string]string{"id": id, "title": "sample"})
			return
		}
		if r.Method == http.MethodPut || r.Method == http.MethodDelete {
			json.NewEncoder(w).Encode(map[string]string{"status": "ok", "id": id})
			return
		}
		w.WriteHeader(http.StatusMethodNotAllowed)
	})

	secret := "dev-secret"
	protected := middleware.AuthMiddleware(secret)(mux)
	roleGuard := middleware.RequireRoles("Alumno", "Profesor", "Admin")

	addr := ":8083"
	log.Printf("routines-service listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, roleGuard(protected)))
}

// Example helper to read pagination parameters.
func parsePagination(r *http.Request) (int, int) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit == 0 {
		limit = 7
	}
	if page == 0 {
		page = 1
	}
	return page, limit
}
