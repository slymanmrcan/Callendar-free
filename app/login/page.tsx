"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [captchaA, setCaptchaA] = useState(() => Math.floor(Math.random() * 5) + 3)
    const [captchaB, setCaptchaB] = useState(() => Math.floor(Math.random() * 5) + 2)
    const [captchaAnswer, setCaptchaAnswer] = useState("")
    const router = useRouter()

    const regenerateCaptcha = () => {
        setCaptchaA(Math.floor(Math.random() * 6) + 4)
        setCaptchaB(Math.floor(Math.random() * 6) + 3)
        setCaptchaAnswer("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const expected = captchaA + captchaB
            const given = parseInt(captchaAnswer, 10)

            if (!Number.isFinite(given) || given !== expected) {
                setError("Lütfen doğrulama sorusunu doğru yanıtlayın.")
                setLoading(false)
                regenerateCaptcha()
                return
            }

            const result = await signIn("credentials", {
                email,
                password,
                captchaA,
                captchaB,
                captchaAnswer: given,
                redirect: false,
            })

            if (result?.error) {
                setError("Geçersiz email veya şifre")
                regenerateCaptcha()
            } else {
                router.push("/")
                router.refresh()
            }
        } catch (err) {
            setError("Bir hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Admin Girişi</CardTitle>
                    <CardDescription>
                        Takvim yönetimi için giriş yapın
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
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
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="captcha">
                                Doğrulama: {captchaA} + {captchaB} = ?
                            </Label>
                            <div className="flex gap-3">
                                <Input
                                    id="captcha"
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={captchaAnswer}
                                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={regenerateCaptcha}
                                >
                                    Yenile
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Basit bir doğrulama ile bot girişlerini azaltıyoruz.
                            </p>
                        </div>
                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                            Hesabın yok mu?{" "}
                            <Link href="/register" className="underline">
                                Kayıt Ol
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
