FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o messaging-service

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/messaging-service .
EXPOSE 8084
CMD ["./messaging-service"]
