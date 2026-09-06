# syntax=docker/dockerfile:1

# ---- build ----
FROM golang:1.25-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server && \
    CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/sweep  ./cmd/sweep

# ---- runtime ----
FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata && adduser -D -u 10001 vicar
COPY --from=build /out/server /out/sweep /usr/local/bin/
ENV PORT=6660 CDN_DIR=/data/cdn
RUN mkdir -p /data/cdn && chown -R vicar /data
USER vicar
WORKDIR /data
EXPOSE 6660
# Applies the Postgres schema on start (idempotent) and serves the API + socket.io.
CMD ["server"]
