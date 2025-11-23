package service

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/example/monorepo/auth/internal/models"
	"github.com/example/monorepo/auth/internal/repository"
)

var (
	errInvalidCredentials = errors.New("invalid credentials")
)

type AuthService struct {
	repo          *repository.InMemoryRepo
	secret        string
	refreshSecret string
}

func NewAuthService(repo *repository.InMemoryRepo, secret, refreshSecret string) *AuthService {
	return &AuthService{repo: repo, secret: secret, refreshSecret: refreshSecret}
}

func (s *AuthService) Register(creds models.Credentials) (models.User, error) {
	if creds.Username == "" || creds.Email == "" || creds.Password == "" || creds.Role == "" {
		return models.User{}, errors.New("missing required fields")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(creds.Password), bcrypt.DefaultCost)
	if err != nil {
		return models.User{}, err
	}
	user := models.User{Username: creds.Username, Email: creds.Email, Password: string(hash), Role: creds.Role}
	return s.repo.Create(user)
}

func (s *AuthService) Login(username, password string) (string, string, error) {
	user, err := s.repo.FindByUsername(username)
	if err != nil {
		return "", "", errInvalidCredentials
	}
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		return "", "", errInvalidCredentials
	}

	access, err := s.generateToken(user, s.secret, 15*time.Minute)
	if err != nil {
		return "", "", err
	}
	refresh, err := s.generateToken(user, s.refreshSecret, 24*time.Hour)
	return access, refresh, err
}

func (s *AuthService) Refresh(refreshToken string) (string, error) {
	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(refreshToken, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.refreshSecret), nil
	})
	if err != nil {
		return "", errInvalidCredentials
	}

	user := models.User{Username: claims["sub"].(string), Role: claims["role"].(string)}
	return s.generateToken(user, s.secret, 15*time.Minute)
}

func (s *AuthService) generateToken(user models.User, secret string, ttl time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"sub":  user.Username,
		"role": user.Role,
		"exp":  time.Now().Add(ttl).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func (s *AuthService) SeedAdmin(username, email, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	s.repo.Seed(models.User{Username: username, Email: email, Password: string(hash), Role: "Admin"})
	return nil
}
