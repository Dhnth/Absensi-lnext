"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Award, TrendingUp, Activity, UserCheck, UserX, Clock, QrCode, Trophy } from "lucide-react"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAnggota: 0,
    hadirHariIni: 0,
    izinHariIni: 0,
    alphaHariIni: 0,
    totalPoin: 0,
    rataPoin: 0,
    anggotaAktif: 0,
    acaraMendatang: 0
  })
  const [userRole, setUserRole] = useState<string>('')
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      const supabase = createClient()
      
      // Ambil user login
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Ambil data anggota
      const { data: anggota } = await supabase
        .from('anggota')
        .select('*')
        .eq('email', user.email)
        .single()

      setUserData(anggota)
      setUserRole(anggota?.role || 'anggota')

      // Hitung statistik
      const today = new Date().toISOString().split('T')[0]

      // Total anggota
      const { count: totalAnggota } = await supabase
        .from('anggota')
        .select('*', { count: 'exact', head: true })

      // Anggota aktif
      const { count: anggotaAktif } = await supabase
        .from('anggota')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Absensi hari ini
      const { data: absensiHariIni } = await supabase
        .from('absensi')
        .select('status')
        .eq('tanggal', today)

      const hadir = absensiHariIni?.filter(a => a.status === 'hadir').length || 0
      const izin = absensiHariIni?.filter(a => ['izin', 'sakit'].includes(a.status)).length || 0
      const alpha = (totalAnggota || 0) - hadir - izin

      // Total poin
      const { data: poinData } = await supabase
        .from('anggota')
        .select('poin')
      
      const totalPoin = poinData?.reduce((acc, curr) => acc + (curr.poin || 0), 0) || 0
      const rataPoin = totalAnggota ? Math.round(totalPoin / totalAnggota) : 0

      // Acara mendatang
      const { count: acaraMendatang } = await supabase
        .from('acara')
        .select('*', { count: 'exact', head: true })
        .gte('tanggal_mulai', new Date().toISOString())

      setStats({
        totalAnggota: totalAnggota || 0,
        hadirHariIni: hadir,
        izinHariIni: izin,
        alphaHariIni: alpha,
        totalPoin,
        rataPoin,
        anggotaAktif: anggotaAktif || 0,
        acaraMendatang: acaraMendatang || 0
      })

      setLoading(false)
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Selamat datang kembali, {userData?.nama}!
          {userRole === 'admin' && ' 👑 Anda login sebagai Administrator'}
          {userRole === 'pengurus' && ' 📋 Anda login sebagai Pengurus'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Anggota
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnggota}</div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.anggotaAktif} anggota aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Hadir Hari Ini
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.hadirHariIni}</div>
            <p className="text-xs text-slate-500 mt-1">
              {((stats.hadirHariIni / stats.totalAnggota) * 100).toFixed(1)}% kehadiran
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Izin/Sakit
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.izinHariIni}</div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.alphaHariIni} alpha
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Poin
            </CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalPoin}</div>
            <p className="text-xs text-slate-500 mt-1">
              Rata-rata {stats.rataPoin} poin/anggota
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <button className="p-4 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <QrCode className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-semibold">Scan QR</h3>
              <p className="text-sm text-slate-600">Absen cepat dengan QR Code</p>
            </button>
            
            {(userRole === 'admin' || userRole === 'pengurus') && (
              <button className="p-4 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <ClipboardList className="h-6 w-6 text-green-600 mb-2" />
                <h3 className="font-semibold">Absen Manual</h3>
                <p className="text-sm text-slate-600">Input nomor anggota</p>
              </button>
            )}
            
            <button className="p-4 text-left bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Trophy className="h-6 w-6 text-purple-600 mb-2" />
              <h3 className="font-semibold">Leaderboard</h3>
              <p className="text-sm text-slate-600">Lihat peringkat anggota</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity (khusus admin & pengurus) */}
      {(userRole === 'admin' || userRole === 'pengurus') && (
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terkini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Ini nanti diisi dengan data real dari log_aktivitas */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Budi Santoso melakukan absen manual</p>
                  <p className="text-xs text-slate-500">2 menit yang lalu</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Admin menambahkan anggota baru</p>
                  <p className="text-xs text-slate-500">15 menit yang lalu</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}