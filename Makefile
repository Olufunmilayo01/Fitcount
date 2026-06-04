.PHONY: dev-web dev-api migrate-up migrate-down migrate-status seed install-tools

# Start the Next.js dev server (bound to 0.0.0.0 so the host can reach it on port 3000)
dev-web:
	cd apps/web && npm run dev -- -H 0.0.0.0

# Start the Go API dev server
dev-api:
	cd apps/api && go run ./cmd/server

# Run all pending migrations
migrate-up:
	cd apps/api && goose -dir migrations postgres "$(DATABASE_URL)" up

# Roll back the last migration
migrate-down:
	cd apps/api && goose -dir migrations postgres "$(DATABASE_URL)" down

# Show migration status
migrate-status:
	cd apps/api && goose -dir migrations postgres "$(DATABASE_URL)" status

# Run migrations 1-9 (schema only, no seed data)
migrate-schema:
	cd apps/api && goose -dir migrations postgres "$(DATABASE_URL)" up-to 9

# Run all migrations including seed data (up to 00010)
seed:
	cd apps/api && goose -dir migrations postgres "$(DATABASE_URL)" up-to 10

# Install goose (run once inside devbox)
install-tools:
	go install github.com/pressly/goose/v3/cmd/goose@latest

# Build the Go API binary
build-api:
	cd apps/api && go build -o bin/fitcount-api ./cmd/server

# Run Go tests
test-api:
	cd apps/api && go test ./...

# Run Go vet + lint
lint-api:
	cd apps/api && go vet ./...

# Build the Next.js production bundle
build-web:
	cd apps/web && npm run build

# Install frontend dependencies
install-web:
	cd apps/web && npm install
