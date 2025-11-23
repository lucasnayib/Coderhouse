FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o auth-service

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/auth-service .
EXPOSE 8081
CMD ["./auth-service"]
