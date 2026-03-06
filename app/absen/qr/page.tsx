'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  QrCode,
  Camera,
  CameraOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Award,
  Zap,
  User,
  RefreshCw,
  Scan,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Html5Qrcode } from 'html5-qrcode'
import { format } from 'date-fns'

export default function ScanQrPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [processing, setProcessing] = useState(false) // State untuk proses absen
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  interface ScanResult {
    id: number
    nama: string
    nomor_anggota: string
    poinDidapat: number
    streakBaru: number
    bonus: boolean
  }
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)

  const scannerRef = useRef<Html5Qrcode | null>(null)

  const startScanner = async () => {
    setError(null)
    setScanning(true)
    setProcessing(false)

    // Tunggu DOM siap
    setTimeout(async () => {
      try {
        const readerElement = document.getElementById('qr-reader')

        if (!readerElement) {
          setError('Element scanner tidak ditemukan')
          setScanning(false)
          return
        }

        // Kosongkan element
        readerElement.innerHTML = ''

        // Buat scanner baru
        const html5Qrcode = new Html5Qrcode('qr-reader')
        scannerRef.current = html5Qrcode

        const qrCodeSuccessCallback = (decodedText: string) => {
          // Getar kalau di HP
          if (navigator.vibrate) navigator.vibrate(200)

          // MATIKAN KAMERA & TAMPILKAN LOADING
          stopScanner()
          setProcessing(true)

          // Proses scan
          handleScan(decodedText)
        }

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        }

        // Mulai scanner
        await html5Qrcode.start(
          { facingMode: 'environment' },
          config,
          qrCodeSuccessCallback,
          (errorMessage) => {
            // Abaikan error scanning biasa
          }
        )
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Terjadi kesalahan')
        }
      }
    }, 1000)
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        await scannerRef.current.clear()
      } catch (err) {
        console.error('Stop scanner error:', err)
      } finally {
        scannerRef.current = null
        setScanning(false)
        setProcessing(false)

        const readerElement = document.getElementById('qr-reader')
        if (readerElement) {
          readerElement.innerHTML = ''
        }
      }
    }
  }

  const handleScan = async (decodedText: string) => {
    // Cegah double submit
    if (loading) return

    const nomorAnggota = decodedText.trim()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const today = format(new Date(), 'yyyy-MM-dd')

    console.log('========== DEBUG ABSEN QR ==========')
    console.log('1. Today (format date-fns):', today)
    console.log('2. Nomor anggota dari QR:', nomorAnggota)

    try {
      // CEK LIBUR
      const { data: pengaturan } = await supabase
        .from('pengaturan_absen')
        .select('*')
        .eq('tanggal', today)
        .maybeSingle()

      if (pengaturan?.status === 'tutup') {
        setError(`Hari ini libur: ${pengaturan.keterangan || 'Tutup absensi'}`)
        setLoading(false)
        setProcessing(false)
        return
      }

      // CEK ANGGOTA
      const { data: anggota, error: cekError } = await supabase
        .from('anggota')
        .select('*')
        .eq('nomor_anggota', nomorAnggota)
        .single()

      if (cekError || !anggota) {
        setError(`Anggota dengan nomor ${nomorAnggota} tidak ditemukan`)
        setLoading(false)
        setProcessing(false)
        return
      }

      if (!anggota.is_active) {
        setError(`Anggota ${anggota.nama} tidak aktif`)
        setLoading(false)
        setProcessing(false)
        return
      }

      // CEK ABSEN HARI INI
      const { data: absenHariIni } = await supabase
        .from('absensi')
        .select('*')
        .eq('anggota_id', anggota.id)
        .eq('tanggal', today)
        .maybeSingle()

      if (absenHariIni) {
        setError(`Sudah absen hari ini dengan status: ${absenHariIni.status}`)
        setLoading(false)
        setProcessing(false)

        // ========== TAMBAHKAN INI ==========
        setTimeout(() => {
          startScanner()
        }, 500)
        // =================================
        return
      }

      // HITUNG POIN DAN STREAK
      const poinHadir = 10
      let streakBaru = (anggota.streak || 0) + 1

      const kemarin = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')

      const { data: liburKemarin } = await supabase
        .from('pengaturan_absen')
        .select('*')
        .eq('tanggal', kemarin)
        .eq('status', 'tutup')
        .maybeSingle()

      const { data: absenKemarin } = await supabase
        .from('absensi')
        .select('*')
        .eq('anggota_id', anggota.id)
        .eq('tanggal', kemarin)
        .maybeSingle()

      if (!liburKemarin) {
        if (!absenKemarin || absenKemarin.status !== 'hadir') {
          streakBaru = 1
        }
      } else {
        streakBaru = anggota.streak || 0
      }

      const bonusStreak = streakBaru % 7 === 0 ? 5 : 0

      // INSERT ABSENSI
      const insertData = {
        anggota_id: anggota.id,
        tanggal: today,
        status: 'hadir',
        poin: poinHadir + bonusStreak,
        keterangan: `Absen via QR Code`,
      }

      const { error: insertError } = await supabase.from('absensi').insert(insertData)

      if (insertError) {
        if (insertError.code === '23505') {
          setError(`Anda sudah absen hari ini. Silakan refresh halaman.`)
        } else {
          setError(insertError.message)
        }
        setLoading(false)
        setProcessing(false)
        return
      }

      // HITUNG ULANG TOTAL POIN DARI SEMUA ABSENSI
      const { data: semuaAbsensi } = await supabase
        .from('absensi')
        .select('poin')
        .eq('anggota_id', anggota.id)

      const totalPoinBaru = semuaAbsensi?.reduce((sum, a) => sum + a.poin, 0) || 0

      // UPDATE ANGGOTA
      const { error: updateError } = await supabase
        .from('anggota')
        .update({
          poin: totalPoinBaru,
          streak: streakBaru,
          last_absen: today,
        })
        .eq('id', anggota.id)

      if (updateError) throw updateError

      setLastResult({
        ...anggota,
        poinDidapat: poinHadir + bonusStreak,
        streakBaru,
        bonus: bonusStreak > 0,
      })
      setSuccess(true)
      setProcessing(false)

      // ========== TAMBAHKAN INI ==========
      setTimeout(() => {
        startScanner()
      }, 500) // Delay 0.5 detik
      // =================================
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Terjadi kesalahan')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetScan = () => {
    setSuccess(false)
    setLastResult(null)
    setError(null)
    setProcessing(false)
  }

  const handleScanLagi = () => {
    resetScan()
    startScanner()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scan QR Code</h1>
        <p className="text-slate-600 mt-1">Arahkan kamera ke QR Code anggota untuk absen</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kiri: Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Kamera Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!scanning && !processing && !success && !loading ? (
              <div className="text-center py-12">
                <QrCode className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <Button onClick={startScanner} size="lg" className="gap-2">
                  <Camera className="w-4 h-4" />
                  Mulai Scan
                </Button>
              </div>
            ) : processing ? (
              <div className="text-center py-12">
                <div className="relative">
                  <QrCode className="w-16 h-16 mx-auto mb-4 text-blue-300 animate-pulse" />
                  <Loader2 className="w-8 h-8 absolute top-4 left-1/2 -translate-x-1/2 animate-spin text-blue-600" />
                </div>
                <p className="text-lg font-semibold text-blue-600 mb-2">Memproses Absen...</p>
                <p className="text-sm text-slate-500">Mohon tunggu sebentar</p>
              </div>
            ) : scanning ? (
              <div>
                {/* Mirror effect untuk video */}
                <style jsx global>{`
                  #qr-reader video {
                    transform: scaleX(-1) !important;
                  }
                `}</style>

                <div
                  id="qr-reader"
                  className="w-full overflow-hidden rounded-lg border-2 border-blue-200 bg-black"
                  style={{ minHeight: '300px' }}
                />

                {scanning && (
                  <Button onClick={stopScanner} variant="outline" className="mt-4 w-full gap-2">
                    <CameraOff className="w-4 h-4" />
                    Stop Kamera
                  </Button>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Kanan: Hasil Scan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Scan className="w-5 h-5 text-blue-600" />
              )}
              Hasil Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500">Memproses absen...</p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={handleScanLagi} className="w-full gap-2" variant="default">
                  <Camera className="w-4 h-4" />
                  Scan Ulang
                </Button>
              </div>
            ) : success && lastResult ? (
              <div className="space-y-6">
                {/* Alert Sukses */}
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    <span className="font-semibold text-lg">✅ Absen Berhasil!</span>
                  </AlertDescription>
                </Alert>

                {/* Kartu Identitas Anggota */}
                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Identitas Anggota
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Nama</p>
                      <p className="font-semibold">{lastResult.nama}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Nomor Anggota</p>
                      <p className="font-mono font-semibold">{lastResult.nomor_anggota}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Kelas</p>
                      <p className="font-medium">{lastResult.kelas || '-'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Role</p>
                      <p className="font-medium capitalize">{lastResult.role}</p>
                    </div>
                  </div>
                </div>

                {/* Kartu Detail Absensi */}
                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Detail Absensi
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600">Waktu Absen</p>
                      <p className="font-semibold text-blue-700">
                        {new Date().toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-blue-500">
                        {new Date().toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-600">Status</p>
                      <p className="font-semibold text-green-700">Hadir</p>
                      <p className="text-xs text-green-500">Via QR Code</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-xs text-yellow-600 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Poin Didapat
                      </p>
                      <p className="text-2xl font-bold text-yellow-700">
                        +{lastResult.poinDidapat}
                      </p>
                      <p className="text-xs text-yellow-600">
                        {lastResult.bonus ? '(Termasuk bonus streak)' : '(Poin dasar)'}
                      </p>
                    </div>

                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-purple-600 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Streak
                      </p>
                      <p className="text-2xl font-bold text-purple-700">
                        {lastResult.streakBaru} hari
                      </p>
                      <p className="text-xs text-purple-600">
                        {lastResult.bonus ? '🔥 Bonus streak aktif!' : 'Terus jaga streak'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kartu Total Poin */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Poin Saat Ini</p>
                      <p className="text-3xl font-bold">
                        {lastResult.poin + lastResult.poinDidapat}
                      </p>
                    </div>
                    <Award className="w-12 h-12 opacity-80" />
                  </div>
                  <p className="text-xs mt-2 opacity-75">
                    {lastResult.poin} + {lastResult.poinDidapat} poin baru
                  </p>
                </div>

                {/* Tombol Aksi */}
                <div className="flex gap-2">
                  <Button onClick={handleScanLagi} variant="default" className="flex-1 gap-2">
                    <Camera className="w-4 h-4" />
                    Scan Lagi
                  </Button>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Scan className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Belum ada scan</p>
                <p className="text-sm">Scan QR Code untuk memulai</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Scan otomatis +10 poin</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Kamera mati saat proses</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>1 anggota hanya 1x/hari</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
