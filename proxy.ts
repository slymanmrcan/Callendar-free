import { NextRequest, NextResponse } from "next/server"

const RATE_LIMIT_WINDOW_MS = 60_000 // 1 dakika
const RATE_LIMIT_MAX = 60 // dakikada en fazla 60 istek

// Basit bellek içi sayaç (tek süreçli/tek bölge için uygun)
const ipStore = new Map<string, { count: number; expiresAt: number }>()

function isRateLimited(ip: string) {
    const now = Date.now()
    const record = ipStore.get(ip)

    if (!record || record.expiresAt < now) {
        ipStore.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS })
        return false
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return true
    }

    record.count += 1
    ipStore.set(ip, record)
    return false
}

export default function proxy(req: NextRequest) {
    // Sadece etkinlik API'larını sınırla
    if (
        !req.nextUrl.pathname.startsWith("/api/events") &&
        !req.nextUrl.pathname.startsWith("/api/auth")
    ) {
        return NextResponse.next()
    }

    let ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown"

    if (isRateLimited(ip)) {
        return NextResponse.json(
            { error: "Too many requests. Lütfen biraz bekleyin." },
            { status: 429 }
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/api/events/:path*", "/api/auth/:path*"],
}
