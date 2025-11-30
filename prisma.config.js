require("dotenv").config()

const { defineConfig } = require("prisma/config")

const DEFAULT_DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/calendar_db"

module.exports = defineConfig({
    schema: "./prisma/schema.prisma",
    datasource: {
        url: DEFAULT_DATABASE_URL,
    },
    migrations: {
        path: "./prisma/migrations",
        seed: "node_modules/.bin/tsx ./prisma/seed.ts"
    },
})
