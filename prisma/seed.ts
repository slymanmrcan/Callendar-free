import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { hash } from "bcryptjs"

const DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/calendar_db"
const databaseUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL

if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL env missing during seed. Using default local Postgres URL.")
}

const adapter = new PrismaPg(
    new pg.Pool({
        connectionString: databaseUrl,
    })
)

const prisma = new PrismaClient({ adapter })

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const registerCode = process.env.REGISTER_CODE

    if (!adminEmail || !adminPassword) {
        throw new Error("ADMIN_EMAIL ve ADMIN_PASSWORD seed için zorunludur.")
    }

    if (!registerCode) {
        throw new Error("REGISTER_CODE seed için zorunludur.")
    }

    const hashed = await hash(adminPassword, 10)

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: { password: hashed },
        create: {
            email: adminEmail,
            password: hashed,
            name: "Admin",
        },
    })

    await prisma.registrationCode.upsert({
        where: { code: registerCode },
        update: { isActive: true },
        create: {
            code: registerCode,
            isActive: true,
        },
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
