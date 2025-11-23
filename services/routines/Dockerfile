FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o routines-service

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/routines-service .
EXPOSE 8083
CMD ["./routines-service"]
