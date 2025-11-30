import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import prisma from "@/lib/prisma"

const registerSchema = z.object({
    email: z.string().email("Geçersiz e-posta"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    name: z.string().min(1, "İsim zorunludur").max(100, "İsim en fazla 100 karakter olabilir").optional(),
    registerCode: z.string().min(4, "Kayıt kodu zorunludur"),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, name, registerCode } = registerSchema.parse(body)

        const code = await prisma.registrationCode.findFirst({
            where: { code: registerCode, isActive: true },
        })

        if (!code) {
            return NextResponse.json({ error: "Geçersiz kayıt kodu" }, { status: 401 })
        }

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ error: "Bu email zaten kayıtlı" }, { status: 409 })
        }

        const hashed = await hash(password, 10)

        await prisma.user.create({
            data: {
                email,
                password: hashed,
                name,
            },
        })

        return NextResponse.json({ ok: true }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0]?.message || "Geçersiz veri" }, { status: 400 })
        }

        console.error("Register error", error)
        return NextResponse.json({ error: "Beklenmeyen hata" }, { status: 500 })
    }
}
