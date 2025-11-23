package models

type User struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type Credentials struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}
