#!/bin/sh
set -eu

# Default DB URL (Docker host erişimi için host.docker.internal kullanır)
DEFAULT_DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/callendar?schema=public"

# Eğer env gelmemişse fallback kullan
FINAL_DATABASE_URL="${DATABASE_URL:-$DEFAULT_DATABASE_URL}"

# Container içinde localhost kullanımı başarısız olacağı için otomatik host.docker.internal'a çevir
if echo "$FINAL_DATABASE_URL" | grep -q "localhost:"; then
  echo "DATABASE_URL points to localhost; rewriting host to host.docker.internal"
  FINAL_DATABASE_URL=$(echo "$FINAL_DATABASE_URL" | sed 's/localhost/host.docker.internal/')
fi

export DATABASE_URL="$FINAL_DATABASE_URL"

npx --no-install prisma migrate deploy
exec node server.js
