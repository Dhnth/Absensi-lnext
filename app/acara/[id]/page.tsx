'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Users,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { id as localeID } from 'date-fns/locale/id'
import { Acara, KehadiranAcara } from '../components/types'

export default function DetailAcaraPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [acara, setAcara] = useState<Acara | null>(null)
  const [kehadiran, setKehadiran] = useState<KehadiranAcara[]>([])
  const [userRole, setUserRole] = useState('')
  const [userId, setUserId] = useState<number | null>(null)
  const [userKehadiran, setUserKehadiran] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Get user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get user data
      const { data: userData } = await supabase
        .from('anggota')
        .select('id, role')
        .eq('email', user.email)
        .single()

      if (userData) {
        setUserRole(userData.role)
        setUserId(userData.id)
      }

      // Get acara detail
      const { data: acaraData, error: acaraError } = await supabase
        .from('acara')
        .select('*')
        .eq('id', id)
        .single()

      if (acaraError) {
        setError('Acara tidak ditemukan')
        setLoading(false)
        return
      }

      console.log('Acara data dari DB:', acaraData)
      setAcara(acaraData)

      // Get kehadiran
      const { data: kehadiranData } = await supabase
        .from('kehadiran_acara')
        .select(
          `
          *,
          anggota:anggota_id (
            nama,
            nomor_anggota
          )
        `
        )
        .eq('acara_id', id)

      setKehadiran(kehadiranData || [])

      // Cek kehadiran user
      const userHadir = kehadiranData?.find((k) => k.anggota_id === userData?.id)
      setUserKehadiran(userHadir?.status || null)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleKehadiran = async (status: 'hadir' | 'tidak' | 'izin') => {
    if (!userId || !acara) return

    const supabase = createClient()

    try {
      if (userKehadiran) {
        // Update
        await supabase
          .from('kehadiran_acara')
          .update({ status })
          .eq('acara_id', acara.id)
          .eq('anggota_id', userId)
      } else {
        // Insert
        await supabase.from('kehadiran_acara').insert({
          acara_id: acara.id,
          anggota_id: userId,
          status,
        })
      }

      setUserKehadiran(status)
      loadData()
    } catch (err) {
      console.error('Error updating kehadiran:', err)
    }
  }

  const handleDelete = async () => {
    if (!acara) return
    if (!confirm('Yakin ingin menghapus acara ini?')) return

    const supabase = createClient()

    try {
      await supabase.from('acara').delete().eq('id', acara.id)

      router.push('/acara')
    } catch (err) {
      console.error('Error deleting acara:', err)
    }
  }

  const getTipeColor = (tipe: string) => {
    switch (tipe) {
      case 'umum':
        return 'bg-blue-100 text-blue-700'
      case 'rapat':
        return 'bg-purple-100 text-purple-700'
      case 'kegiatan':
        return 'bg-green-100 text-green-700'
      case 'libur':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  // ========== FORMAT TANGGAL MANUAL (PASTI BERHASIL) ==========
  const formatTanggalIndonesia = (tanggal: string) => {
    if (!tanggal) return '-'

    try {
      const date = new Date(tanggal)

      if (isNaN(date.getTime())) return '-'

      return format(date, 'EEEE, dd MMMM yyyy HH:mm', {
        locale: localeID,
      })
    } catch {
      return '-'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !acara) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Acara tidak ditemukan'}</p>
        <Button onClick={() => router.back()} className="mt-4">
          Kembali
        </Button>
      </div>
    )
  }

  const canManage = userRole === 'admin' || userRole === 'pengurus'
  const isLibur = acara.tipe === 'libur'

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{acara.judul}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getTipeColor(acara.tipe)}>{acara.tipe}</Badge>
          </div>
        </div>

        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/acara/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </Button>
          </div>
        )}
      </div>

      {/* Info Acara */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Mulai</p>
                <p className="font-medium">{formatTanggalIndonesia(acara.tanggal_mulai)}</p>
                <p className="text-sm text-slate-500 mt-2">Selesai</p>
                <p className="font-medium">{formatTanggalIndonesia(acara.tanggal_selesai)}</p>
              </div>
            </div>

            {acara.lokasi && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Lokasi</p>
                  <p className="font-medium">{acara.lokasi}</p>
                </div>
              </div>
            )}
          </div>

          {acara.deskripsi && (
            <div>
              <p className="text-sm text-slate-500 mb-2">Deskripsi</p>
              <p className="text-slate-700 whitespace-pre-line">{acara.deskripsi}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Konfirmasi Kehadiran - HANYA UNTUK NON-LIBUR */}
      {!isLibur && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Konfirmasi Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={userKehadiran === 'hadir' ? 'default' : 'outline'}
                onClick={() => handleKehadiran('hadir')}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Hadir
              </Button>
              <Button
                variant={userKehadiran === 'izin' ? 'default' : 'outline'}
                onClick={() => handleKehadiran('izin')}
                className="gap-2"
              >
                <Clock className="w-4 h-4" />
                Izin
              </Button>
              <Button
                variant={userKehadiran === 'tidak' ? 'default' : 'outline'}
                onClick={() => handleKehadiran('tidak')}
                className="gap-2"
              >
                <XCircle className="w-4 h-4" />
                Tidak Hadir
              </Button>
            </div>
            {userKehadiran && (
              <p className="text-sm text-slate-500 mt-3">
                Status Anda:{' '}
                {userKehadiran === 'hadir'
                  ? 'Hadir'
                  : userKehadiran === 'izin'
                    ? 'Izin'
                    : 'Tidak Hadir'}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Untuk acara libur, tampilkan pesan */}
      {isLibur && (
        <Card>
          <CardContent className="p-6 text-center text-slate-500">
            <p>Ini adalah hari libur. Tidak ada konfirmasi kehadiran.</p>
          </CardContent>
        </Card>
      )}

      {/* Daftar Kehadiran - HANYA UNTUK NON-LIBUR */}
      {!isLibur && canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Daftar Kehadiran ({kehadiran.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kehadiran.length === 0 ? (
              <p className="text-center py-8 text-slate-400">Belum ada konfirmasi kehadiran</p>
            ) : (
              <div className="space-y-3">
                {kehadiran.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {item.anggota?.nama?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.anggota?.nama}</p>
                        <p className="text-xs text-slate-500">{item.anggota?.nomor_anggota}</p>
                      </div>
                    </div>
                    <Badge
                      className={
                        item.status === 'hadir'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'izin'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }
                    >
                      {item.status === 'hadir'
                        ? 'Hadir'
                        : item.status === 'izin'
                          ? 'Izin'
                          : 'Tidak Hadir'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
