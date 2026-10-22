# ==============================================================================
# SENSORIUM GO GATEWAYS - DOCKER MULTI-STAGE BUILD
# Zero-Trust Reflex Layer & Action Layer Deployer (DORA Art. 12 Compliant)
# ==============================================================================
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Installation des certificats SSL/TLS racine et timezone
RUN apk add --no-cache ca-certificates tzdata

# Copie des sources Go du Neural Core & Action Layer
COPY neural_core/*.go ./

# Compilation statique sans CGO pour un binaire autonome pur
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /sensorium-gateway .

# ------------------------------------------------------------------------------
# Image finale minimale et durcie (Scratch ou distroless)
# ------------------------------------------------------------------------------
FROM alpine:3.19

RUN addgroup -S -g 10001 sensorium && \
    adduser -S -u 10001 -G sensorium -h /app -s /sbin/nologin sensorium && \
    mkdir -p /var/log/sensorium/audit && \
    chown -R sensorium:sensorium /var/log/sensorium

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /sensorium-gateway /usr/local/bin/sensorium-gateway

USER 10001:10001
WORKDIR /app

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/sensorium-gateway"]
