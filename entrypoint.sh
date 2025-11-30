#!/bin/sh
set -eu

# Sadece mevcut DATABASE_URL ile migrate yap
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL tanımlı değil. Migration için zorunlu."
  exit 1
fi

echo "Running Prisma migrations..."
npx --no-install prisma migrate deploy
echo "Migrations completed."