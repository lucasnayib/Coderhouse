package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

const (
	UserIDKey   = "userID"
	UserRoleKey = "userRole"
)

// AuthMiddleware validates JWT and stores claims in request context.
func AuthMiddleware(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenString := extractToken(r.Header.Get("Authorization"))
			if tokenString == "" {
				http.Error(w, "missing token", http.StatusUnauthorized)
				return
			}

			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, errors.New("unexpected signing method")
				}
				return []byte(secret), nil
			})
			if err != nil || !token.Valid {
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				http.Error(w, "invalid claims", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, claims["sub"])
			ctx = context.WithValue(ctx, UserRoleKey, claims["role"])
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireRoles ensures the authenticated user has one of the allowed roles.
func RequireRoles(roles ...string) func(http.Handler) http.Handler {
	allowed := map[string]struct{}{}
	for _, r := range roles {
		allowed[r] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, _ := r.Context().Value(UserRoleKey).(string)
			if _, ok := allowed[role]; !ok {
				http.Error(w, "forbidden", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func extractToken(authHeader string) string {
	parts := strings.Split(authHeader, " ")
	if len(parts) == 2 && strings.EqualFold(parts[0], "bearer") {
		return parts[1]
	}
	return ""
}
