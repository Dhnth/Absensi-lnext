"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Login
        </Link>

        <Card>
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {success ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : (
                <Mail className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <CardTitle className="text-2xl text-center">
              {success ? "Cek Email Anda" : "Lupa Password?"}
            </CardTitle>
            <CardDescription className="text-center">
              {success ? (
                "Kami sudah mengirim link reset password ke email Anda"
              ) : (
                "Masukkan email Anda, kami akan kirim link untuk reset password"
              )}
            </CardDescription>
          </CardHeader>

          {!success ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full gap-2 mt-5" 
                  disabled={loading}
                >
                  {loading ? "Mengirim..." : "Kirim Link Reset"}
                  {!loading && <Send className="w-4 h-4" />}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-700 text-center">
                  Link reset password telah dikirim ke <strong>{email}</strong>
                </AlertDescription>
              </Alert>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  📧 Tidak menerima email? Cek folder spam atau 
                  <button 
                    onClick={handleSubmit} 
                    className="underline font-medium ml-1"
                    disabled={loading}
                  >
                    kirim ulang
                  </button>
                </p>
              </div>
            </CardContent>
          )}

          <CardFooter className="justify-center">
            <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
              Ingat password? Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}