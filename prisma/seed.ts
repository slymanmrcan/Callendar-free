import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { hash } from "bcryptjs"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
    throw new Error("DATABASE_URL env variable is required for seeding.")
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

    if (!adminEmail || !adminPassword) {
        throw new Error("ADMIN_EMAIL ve ADMIN_PASSWORD seed için zorunludur.")
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
