package http

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/example/monorepo/auth/internal/models"
	authrepo "github.com/example/monorepo/auth/internal/repository"
	"github.com/example/monorepo/auth/internal/service"
)

func NewServer(authSvc *service.AuthService) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		var creds models.Credentials
		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		user, err := authSvc.Register(creds)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		json.NewEncoder(w).Encode(user)
	})

	mux.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		var creds models.Credentials
		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		access, refresh, err := authSvc.Login(creds.Username, creds.Password)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"access": access, "refresh": refresh})
	})

	mux.HandleFunc("/refresh", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		var body struct {
			Refresh string `json:"refresh"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		token, err := authSvc.Refresh(body.Refresh)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"access": token})
	})

	return mux
}

func Run() {
	secret := envOrDefault("JWT_SECRET", "dev-secret")
	refresh := envOrDefault("REFRESH_SECRET", "refresh-secret")
	repo := service.NewAuthService(authrepo.NewInMemoryRepo(), secret, refresh)
	_ = repo.SeedAdmin(envOrDefault("ADMIN_USER", "admin"), envOrDefault("ADMIN_EMAIL", "admin@example.com"), envOrDefault("ADMIN_PASSWORD", "adminpass"))

	mux := NewServer(repo)
	addr := ":8081"
	log.Printf("auth-service listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

func envOrDefault(key, val string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return val
}
