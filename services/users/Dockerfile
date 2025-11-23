FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o users-service

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/users-service .
EXPOSE 8082
CMD ["./users-service"]
