"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default function Header() {
    const { data: session } = useSession()
    const headerBadge = process.env.NEXT_PUBLIC_HEADER_BADGE || "Bilgisayar Kavramları Topluluğu"
    const headerTitle = process.env.NEXT_PUBLIC_HEADER_TITLE || "Etkinlik Takvimi"
    const headerSubtitle =
        process.env.NEXT_PUBLIC_HEADER_SUBTITLE || "Kampüs, çevrim içi ve atölye buluşmalarını tek ekranda takip edin."

    return (
        <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950 text-slate-50 shadow-2xl">
            <div className="absolute left-10 top-[-40px] h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="absolute right-6 bottom-[-60px] h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="relative mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-lg shadow-sky-900/40">
                        <Calendar className="h-6 w-6 text-sky-100" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/80">
                            {headerBadge}
                        </p>
                        <h1 className="text-2xl font-semibold leading-tight text-white">
                            {headerTitle}
                        </h1>
                        <p className="text-sm text-slate-200/80">
                            {headerSubtitle}
                        </p>
                    </div>
                </div>

                {session && (
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col text-right leading-tight text-xs text-slate-200 sm:text-sm">
                            <span className="text-white font-semibold">Hoş geldin</span>
                            <span className="text-slate-200/80 truncate max-w-[200px]">
                                {session.user?.name || session.user?.email}
                            </span>
                        </div>
                        <Button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            variant="secondary"
                            className="border border-white/20 bg-white/15 text-white hover:bg-white/25"
                        >
                            Çıkış Yap
                        </Button>
                    </div>
                )}
            </div>
        </header>
    )
}
