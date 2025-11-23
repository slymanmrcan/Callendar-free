FROM node:20-slim AS base
RUN apt-get update && apt-get install -y openssl

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma Client üret
RUN npx prisma generate

# Next build (placeholder DATABASE_URL, build arg ile override edilebilir)
ARG DATABASE_URL=postgresql://user:pass@localhost:5432/db
ENV DATABASE_URL=${DATABASE_URL}
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app

# output standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# PRISMA CLIENT DOSYALARINI EKLE (KRİTİK)
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

EXPOSE 3000
CMD ["node", "server.js"]
