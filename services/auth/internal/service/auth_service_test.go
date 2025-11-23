package service

import (
	"testing"

	"github.com/example/monorepo/auth/internal/models"
	"github.com/example/monorepo/auth/internal/repository"
)

func TestRegisterAndLogin(t *testing.T) {
	repo := repository.NewInMemoryRepo()
	svc := NewAuthService(repo, "secret", "refresh")

	creds := models.Credentials{Username: "alice", Email: "alice@example.com", Password: "password", Role: "Alumno"}
	if _, err := svc.Register(creds); err != nil {
		t.Fatalf("register failed: %v", err)
	}

	access, refresh, err := svc.Login("alice", "password")
	if err != nil {
		t.Fatalf("login failed: %v", err)
	}
	if access == "" || refresh == "" {
		t.Fatalf("expected tokens to be generated")
	}
}

func TestRefresh(t *testing.T) {
	repo := repository.NewInMemoryRepo()
	svc := NewAuthService(repo, "secret", "refresh")
	creds := models.Credentials{Username: "bob", Email: "bob@example.com", Password: "password", Role: "Profesor"}
	if _, err := svc.Register(creds); err != nil {
		t.Fatalf("register failed: %v", err)
	}
	_, refresh, _ := svc.Login("bob", "password")
	newAccess, err := svc.Refresh(refresh)
	if err != nil {
		t.Fatalf("refresh failed: %v", err)
	}
	if newAccess == "" {
		t.Fatalf("expected access token")
	}
}
