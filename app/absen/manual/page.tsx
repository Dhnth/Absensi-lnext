"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Hash, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Calendar, Award, Zap } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { id } from "date-fns/locale/id"

export default function AbsenManualPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nomorAnggota, setNomorAnggota] = useState("")
  const [dataAnggota, setDataAnggota] = useState<any>(null)
  const [poinInfo, setPoinInfo] = useState<{ poin: number; streak: number; bonus: boolean } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    setDataAnggota(null)
    setPoinInfo(null)

    const supabase = createClient()

    // VALIDASI: Nomor anggota harus antara 2425001-2425100
    const nomor = parseInt(nomorAnggota)
    if (nomor < 2425001 || nomor > 2425100) {
      setError("Nomor anggota tidak valid. Harus antara 2425001 - 2425100")
      setLoading(false)
      return
    }

    try {
      // CEK APAKAH ANGGOTA ADA DI DATABASE
      const { data: anggota, error: cekError } = await supabase
        .from('anggota')
        .select('*')
        .eq('nomor_anggota', nomorAnggota)
        .single()

      if (cekError || !anggota) {
        setError(`Anggota dengan nomor ${nomorAnggota} tidak ditemukan`)
        setLoading(false)
        return
      }

      // CEK APAKAH ANGGOTA AKTIF
      if (!anggota.is_active) {
        setError(`Anggota ${anggota.nama} (${nomorAnggota}) tidak aktif`)
        setLoading(false)
        return
      }

      // CEK APAKAH SUDAH ABSEN HARI INI
      const today = format(new Date(), 'yyyy-MM-dd')
      const { data: absenHariIni } = await supabase
        .from('absensi')
        .select('*')
        .eq('anggota_id', anggota.id)
        .eq('tanggal', today)
        .maybeSingle()

      if (absenHariIni) {
        setError(`Anggota ${anggota.nama} sudah absen hari ini dengan status: ${absenHariIni.status}`)
        setLoading(false)
        return
      }

      // HITUNG POIN DAN STREAK
      const poinHadir = 10
      let streakBaru = (anggota.streak || 0) + 1
      
      // Cek absen kemarin untuk bonus streak
      const kemarin = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
      const { data: absenKemarin } = await supabase
        .from('absensi')
        .select('*')
        .eq('anggota_id', anggota.id)
        .eq('tanggal', kemarin)
        .maybeSingle()

      // Reset streak jika kemarin tidak hadir
      if (!absenKemarin || absenKemarin.status !== 'hadir') {
        streakBaru = 1
      }

      // Bonus streak setiap 7 hari
      const bonusStreak = streakBaru % 7 === 0 ? 5 : 0
      const totalPoin = anggota.poin + poinHadir + bonusStreak

      // INSERT ABSENSI BARU
      const { error: insertError } = await supabase
        .from('absensi')
        .insert({
          anggota_id: anggota.id,
          status: 'hadir',
          poin: poinHadir + bonusStreak,
          keterangan: `Absen manual via nomor anggota`
        })

      if (insertError) {
        throw new Error("Gagal mencatat absensi")
      }

      // UPDATE POIN DAN STREAK ANGGOTA
      const { error: updateError } = await supabase
        .from('anggota')
        .update({
          poin: totalPoin,
          streak: streakBaru,
          last_absen: today
        })
        .eq('id', anggota.id)

      if (updateError) {
        throw new Error("Gagal memperbarui poin")
      }

      // LOG AKTIVITAS
      await supabase
        .from('log_aktivitas')
        .insert({
          anggota_id: anggota.id,
          aksi: 'absen_manual',
          detail: { nomor_anggota: nomorAnggota, metode: 'manual' }
        })

      // TAMPILKAN SUKSES
      setDataAnggota(anggota)
      setPoinInfo({
        poin: poinHadir + bonusStreak,
        streak: streakBaru,
        bonus: bonusStreak > 0
      })
      setSuccess(true)
      
      // Reset form setelah 3 detik
      setTimeout(() => {
        setNomorAnggota("")
        setSuccess(false)
        setDataAnggota(null)
        setPoinInfo(null)
      }, 5000)

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header dengan tombol back */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Absen Manual</h1>
          <p className="text-slate-600">Masukkan nomor anggota untuk absen</p>
        </div>

        {/* Form Absen */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Form Absensi</CardTitle>
            <CardDescription>
              Nomor anggota tersedia: 2425001 - 2425100
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && dataAnggota && poinInfo && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    <div className="font-semibold mb-2">✅ Absen Berhasil!</div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">{dataAnggota.nama}</span> ({nomorAnggota})</p>
                      <div className="flex gap-4 mt-2">
                        <span className="flex items-center gap-1"><Award className="w-4 h-4" /> +{poinInfo.poin} poin</span>
                        <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> Streak: {poinInfo.streak} hari</span>
                        {poinInfo.bonus && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Calendar className="w-4 h-4" /> Bonus streak!
                          </span>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
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
                    onChange={(e) => setNomorAnggota(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                    disabled={loading || success}
                  />
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Nomor anggota 5 digit setelah 2425 (contoh: 2425001)
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Berhasil!
                  </>
                ) : (
                  <>
                    <Hash className="w-4 h-4" />
                    Absen Sekarang
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Info Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informasi Absensi</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <p><span className="font-medium">Hadir:</span> +10 poin + streak bertambah</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs">📝</span>
              </div>
              <p><span className="font-medium">Izin/Sakit:</span> +5 poin, streak tetap (hanya untuk pengajuan)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-xs">⚡</span>
              </div>
              <p><span className="font-medium">Bonus Streak:</span> Setiap 7 hari berturut-turut dapat +5 poin tambahan</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-xs">⏰</span>
              </div>
              <p><span className="font-medium">Catatan:</span> 1 anggota hanya bisa 1x absen per hari</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}