'use client'

import { QRCodeCanvas } from 'qrcode.react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Download,
  Loader2,
  QrCode as QrCodeIcon,
  User,
  Hash,
  Award,
  CheckCircle2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function QrSayaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  interface UserData {
    id: number
    nomor_anggota: string
    nama: string
    email: string
    poin: number
    streak: number
    kelas: string | null
  }
  const [userData, setUserData] = useState<UserData | null>(null)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  useEffect(() => {
    const getUserData = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: anggota } = await supabase
        .from('anggota')
        .select('*')
        .eq('email', user.email)
        .single()

      if (!anggota?.nomor_anggota) {
        router.push('/pairing')
        return
      }

      setUserData(anggota)
      setLoading(false)
    }

    getUserData()
  }, [router])

  const handleDownload = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `QR-${userData?.nomor_anggota}.png`
      link.href = url
      link.click()

      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }
  
  if (!userData) {
    return null
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">QR Code Saya</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Gunakan QR Code ini untuk absen cepat
        </p>
      </div>

      {/* Alert Download Sukses */}
      {downloadSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 text-sm sm:text-base">
            QR Code berhasil didownload!
          </AlertDescription>
        </Alert>
      )}

      {/* Grid 1 Kolom di HP, 2 Kolom di Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Kiri: QR Code */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <QrCodeIcon className="w-5 h-5 text-blue-600" />
              QR Code Anda
            </CardTitle>
            <CardDescription className="text-sm">Scan untuk absen cepat</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* QR Code */}
            <div className="bg-white p-3 sm:p-4 rounded-xl border-2 border-blue-100 mb-4">
              <QRCodeCanvas
                id="qr-code"
                value={userData.nomor_anggota}
                size={200}
                level="H"
                className="w-full max-w-[200px] sm:max-w-[250px] h-auto"
              />
            </div>

            {/* Info Nomor */}
            <div className="text-center mb-4">
              <p className="text-xs sm:text-sm text-slate-500">Nomor Anggota</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-blue-600 break-all">
                {userData.nomor_anggota}
              </p>
            </div>

            {/* Tombol Download */}
            <Button onClick={handleDownload} className="w-full gap-2 text-sm sm:text-base">
              <Download className="w-4 h-4" />
              Download QR Code
            </Button>
          </CardContent>
        </Card>

        {/* Kanan: Info Anggota */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Info Anggota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-500">Nama</p>
                <p className="font-semibold text-base sm:text-lg truncate">{userData.nama}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-slate-50 rounded-lg">
                <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mb-1 sm:mb-2" />
                <p className="text-xs text-slate-500">Nomor</p>
                <p className="font-bold font-mono text-sm sm:text-base break-all">
                  {userData.nomor_anggota}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-slate-50 rounded-lg">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mb-1 sm:mb-2" />
                <p className="text-xs text-slate-500">Poin</p>
                <p className="font-bold text-yellow-600 text-sm sm:text-base">{userData.poin}</p>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
              <p className="text-xs sm:text-sm text-green-700 mb-2">Cara Penggunaan:</p>
              <ol className="list-decimal list-inside text-xs sm:text-sm text-green-600 space-y-1">
                <li className="break-words">Download/simpan QR Code ini</li>
                <li className="break-words">Cetak atau simpan di HP</li>
                <li className="break-words">Tunjukkan ke petugas untuk scan</li>
                <li className="break-words">Atau scan sendiri (jika ada fitur)</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Tambahan */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-slate-600">
            <span className="font-semibold">Tips:</span> Simpan QR Code ini di HP atau cetak untuk
            memudahkan absen. Setiap scan akan otomatis mencatat kehadiran Anda.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
