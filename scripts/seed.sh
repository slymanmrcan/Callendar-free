#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL tanımlı değil."
  exit 1
fi

echo "Running Prisma seed..."
node_modules/.bin/tsx prisma/seed.ts
