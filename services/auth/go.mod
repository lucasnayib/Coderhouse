module github.com/example/monorepo/auth

go 1.22

require (
github.com/golang-jwt/jwt/v5 v5.2.1
golang.org/x/crypto v0.21.0
github.com/example/monorepo/common v0.0.0
)

replace github.com/example/monorepo/common => ../common
