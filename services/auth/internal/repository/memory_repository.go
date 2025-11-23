package repository

import (
	"errors"
	"sync"

	"github.com/example/monorepo/auth/internal/models"
)

type InMemoryRepo struct {
	mu     sync.Mutex
	users  map[string]models.User
	nextID int64
}

func NewInMemoryRepo() *InMemoryRepo {
	return &InMemoryRepo{users: make(map[string]models.User), nextID: 1}
}

func (r *InMemoryRepo) Create(user models.User) (models.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, exists := r.users[user.Username]; exists {
		return models.User{}, errors.New("username already exists")
	}
	user.ID = r.nextID
	r.nextID++
	r.users[user.Username] = user
	return user, nil
}

func (r *InMemoryRepo) FindByUsername(username string) (models.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	user, ok := r.users[username]
	if !ok {
		return models.User{}, errors.New("user not found")
	}
	return user, nil
}

func (r *InMemoryRepo) Seed(user models.User) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, exists := r.users[user.Username]; !exists {
		user.ID = r.nextID
		r.nextID++
		r.users[user.Username] = user
	}
}
