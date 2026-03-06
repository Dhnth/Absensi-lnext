'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Hash, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PairingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [nomorAnggota, setNomorAnggota] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUserEmail(user.email || null)

      // Cek apakah sudah punya nomor anggota
      const { data: anggota } = await supabase
        .from('anggota')
        .select('nomor_anggota')
        .eq('email', user.email)
        .single()

      if (anggota?.nomor_anggota) {
        router.push('/dashboard')
      }
    }

    getUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // AMBIL DATA USER
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Anda harus login')
      setLoading(false)
      return
    }

    // CEK STOK
    const { data: stok, error: cekStokError } = await supabase
      .from('stok_nomor_anggota')
      .select('*')
      .eq('nomor_anggota', nomorAnggota.trim())
      .eq('status', 'tersedia')
      .single()

    if (cekStokError || !stok) {
      setError('Nomor anggota tidak tersedia atau sudah dipakai')
      setLoading(false)
      return
    }

    // CEK APAKAH NOMOR SUDAH DIPAKAI DI TABEL ANGGOTA
    const { data: cekNomor } = await supabase
      .from('anggota')
      .select('id')
      .eq('nomor_anggota', nomorAnggota.trim())
      .maybeSingle()

    if (cekNomor) {
      setError('Nomor anggota sudah terdaftar dengan akun lain')
      setLoading(false)
      return
    }

    // UPDATE DATA ANGGOTA (bukan INSERT)
    const { error: updateError } = await supabase
      .from('anggota')
      .update({
        nomor_anggota: nomorAnggota.trim(),
        is_active: true,
      })
      .eq('email', user.email) // Update berdasarkan email yang sudah ada

    if (updateError) {
      console.error('Update error:', updateError)
      setError('Gagal menghubungkan akun: ' + updateError.message)
      setLoading(false)
      return
    }

    // UPDATE STATUS STOK
    await supabase
      .from('stok_nomor_anggota')
      .update({ status: 'terpakai' })
      .eq('nomor_anggota', nomorAnggota.trim())

    setSuccess(true)
    setLoading(false)

    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Hash className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-center">
              {success ? 'Berhasil!' : 'Masukkan Nomor Anggota'}
            </CardTitle>
            <CardDescription className="text-center">
              {success ? (
                'Akun Anda sudah terhubung. Mengalihkan ke dashboard...'
              ) : (
                <>
                  Halo <span className="font-medium text-slate-900">{userEmail}</span>
                  <br />
                  Masukkan nomor anggota yang diberikan oleh admin
                </>
              )}
            </CardDescription>
          </CardHeader>

          {!success && (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="nomor">Nomor Anggota</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="nomor"
                      placeholder="Contoh: 2425001"
                      className="pl-9 text-center text-lg font-mono"
                      value={nomorAnggota}
                      onChange={(e) => setNomorAnggota(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Nomor anggota bisa didapatkan dari admin komunitas
                  </p>
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" className="w-full gap-2 mt-5" disabled={loading}>
                  {loading ? 'Memproses...' : 'Hubungkan Akun'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </CardFooter>
            </form>
          )}

          {success && (
            <CardContent>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Akun berhasil dihubungkan! Anda akan diarahkan ke dashboard.
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>

        <p className="text-center text-sm text-slate-500 mt-8">
          Butuh bantuan? <button className="text-blue-600 hover:underline">Hubungi Admin</button>
        </p>
      </div>
    </div>
  )
}
