import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const DEFAULT_DATABASE_URL = "postgresql://postgres:Sifre123@localhost:15432/calendar"

const databaseUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL

if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL env is missing. Falling back to default local Postgres URL.")
}

const adapter = new PrismaPg(
    new pg.Pool({
        connectionString: databaseUrl,
    })
)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: ["query", "error", "warn"],
    })

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
}

export default prisma
