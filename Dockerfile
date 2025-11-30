FROM node:20-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ortam değişkeni (override edilebilir); Prisma generate için build-time'da da set ediliyor
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/calendar_db
ENV DATABASE_URL=${DATABASE_URL}

# Prisma Client üret
RUN npx prisma generate

# Next build
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PRISMA_CONFIG_PATH=/app/prisma.config.js

# output standalone + public assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.js ./prisma.config.js

# Node modules tamamını kopyala (Prisma CLI bağımlılıkları dahil)
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
