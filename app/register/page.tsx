"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [registerCode, setRegisterCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setLoading(true)

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name, registerCode }),
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                setError(data.error || "Kayıt başarısız")
                return
            }

            setSuccess("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...")
            setTimeout(() => {
                router.push("/login")
                router.refresh()
            }, 800)
        } catch (err) {
            setError("Bir hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Kayıt Ol</CardTitle>
                    <CardDescription>Admin tarafından verilen kayıt kodu ile hesap oluşturun.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Ad Soyad</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Adınız"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="kullanici@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Şifre</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-muted-foreground">En az 6 karakter olmalı.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="registerCode">Kayıt Kodu</Label>
                            <Input
                                id="registerCode"
                                type="text"
                                placeholder="Admin kodu"
                                value={registerCode}
                                onChange={(e) => setRegisterCode(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {success && <p className="text-sm text-green-600">{success}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                            Zaten hesabın var mı?{" "}
                            <Link href="/login" className="underline">
                                Giriş Yap
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
