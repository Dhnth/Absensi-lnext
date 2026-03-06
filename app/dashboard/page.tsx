'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  Calendar,
  Award,
  TrendingUp,
  UserCheck,
  Clock,
  QrCode,
  Trophy,
  ClipboardList,
  ChevronRight,
  Zap,
  CalendarDays,
  BarChart3,
  LogOut,
  Star,
  Sun,
  Moon,
  Sunrise,
  Sunset,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale/id'
import Link from 'next/link'

// ========== INTERFACES ==========
interface Stats {
  totalAnggota: number
  hadirHariIni: number
  izinHariIni: number
  sakitHariIni: number
  alphaHariIni: number
  totalPoin: number
  rataPoin: number
  anggotaAktif: number
  anggotaTidakAktif: number
  acaraMendatang: number
  acaraHariIni: number
}

interface UserData {
  id: number
  nama: string
  nomor_anggota: string
  email: string
  role: string
  kelas: string | null
  poin: number
  streak: number
}

interface TopAnggota {
  id: number
  nomor_anggota: string
  nama: string
  poin: number
  streak: number
  kelas: string | null
  foto?: string | null
}

interface Acara {
  id: number
  judul: string
  tanggal_mulai: string
  lokasi: string | null
  tipe: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalAnggota: 0,
    hadirHariIni: 0,
    izinHariIni: 0,
    sakitHariIni: 0,
    alphaHariIni: 0,
    totalPoin: 0,
    rataPoin: 0,
    anggotaAktif: 0,
    anggotaTidakAktif: 0,
    acaraMendatang: 0,
    acaraHariIni: 0,
  })
  const [userRole, setUserRole] = useState<string>('')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [topAnggota, setTopAnggota] = useState<TopAnggota[]>([])
  const [acaraTerdekat, setAcaraTerdekat] = useState<Acara[]>([])
  const [greeting, setGreeting] = useState('')
  const [greetingIcon, setGreetingIcon] = useState<React.ReactNode>(null)

  // ========== LOAD DASHBOARD ==========
  const loadDashboard = async () => {
    const supabase = createClient()

    // Ambil user login
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Ambil data anggota
    const { data: anggota } = await supabase
      .from('anggota')
      .select('*')
      .eq('email', user.email)
      .single()

    if (anggota) {
      setUserData(anggota)
      setUserRole(anggota.role || 'anggota')
    }

    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    // ========== STATISTIK ==========

    // Total anggota & status
    const { data: semuaAnggota } = await supabase.from('anggota').select('id, is_active')

    const totalAnggota = semuaAnggota?.length || 0
    const anggotaAktif = semuaAnggota?.filter((a) => a.is_active).length || 0
    const anggotaTidakAktif = totalAnggota - anggotaAktif

    // Absensi hari ini
    const { data: absensiHariIni } = await supabase
      .from('absensi')
      .select('status')
      .eq('tanggal', today)

    const hadir = absensiHariIni?.filter((a) => a.status === 'hadir').length || 0
    const izin = absensiHariIni?.filter((a) => a.status === 'izin').length || 0
    const sakit = absensiHariIni?.filter((a) => a.status === 'sakit').length || 0
    const alpha = totalAnggota - hadir - izin - sakit

    // Total poin
    const { data: poinData } = await supabase.from('anggota').select('poin')
    const totalPoin = poinData?.reduce((acc, curr) => acc + (curr.poin || 0), 0) || 0
    const rataPoin = totalAnggota ? Math.round(totalPoin / totalAnggota) : 0

    // Acara
    const { data: acara } = await supabase
      .from('acara')
      .select('*')
      .gte('tanggal_mulai', now)
      .order('tanggal_mulai', { ascending: true })
      .limit(5)

    const acaraMendatang = acara?.length || 0
    const acaraHariIni =
      acara?.filter((a) => new Date(a.tanggal_mulai).toISOString().split('T')[0] === today)
        .length || 0

    setStats({
      totalAnggota,
      hadirHariIni: hadir,
      izinHariIni: izin,
      sakitHariIni: sakit,
      alphaHariIni: alpha,
      totalPoin,
      rataPoin,
      anggotaAktif,
      anggotaTidakAktif,
      acaraMendatang,
      acaraHariIni,
    })

    // ========== TOP 5 ANGGOTA ==========
    const { data: top } = await supabase
      .from('anggota')
      .select('id, nomor_anggota, nama, poin, streak, kelas, foto')
      .eq('is_active', true)
      .order('poin', { ascending: false })
      .order('streak', { ascending: false })
      .limit(5)

    setTopAnggota(top || [])

    // ========== ACARA TERDEKAT ==========
    setAcaraTerdekat(acara || [])

    setLoading(false)
  }

  // Set greeting berdasarkan waktu
  const setGreetingByHour = () => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('Selamat Pagi')
      setGreetingIcon(<Sunrise className="w-6 h-6 text-yellow-500" />)
    } else if (hour < 15) {
      setGreeting('Selamat Siang')
      setGreetingIcon(<Sun className="w-6 h-6 text-orange-500" />)
    } else if (hour < 18) {
      setGreeting('Selamat Sore')
      setGreetingIcon(<Sunset className="w-6 h-6 text-orange-400" />)
    } else {
      setGreeting('Selamat Malam')
      setGreetingIcon(<Moon className="w-6 h-6 text-indigo-400" />)
    }
  }

  useEffect(() => {
    setGreetingByHour()
    loadDashboard()
  }, []) // ← router sudah tidak perlu di dependency karena loadDashboard didefinisikan di dalam

  const getInitials = (nama: string) => {
    return nama
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  const kehadiranPersen = stats.totalAnggota
    ? Math.round((stats.hadirHariIni / stats.totalAnggota) * 100)
    : 0

  return (
    <div className="space-y-6 pb-8">
      {/* Header dengan Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">{greetingIcon}</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              {greeting}, {userData?.nama?.split(' ')[0]}!
              {userRole === 'admin' && <Star className="w-6 h-6 text-yellow-300" />}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-white/80">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
            {userRole === 'admin'
              ? '👑 Administrator'
              : userRole === 'pengurus'
                ? '📋 Pengurus'
                : '👤 Anggota'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistik Utama */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Anggota</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnggota}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {stats.anggotaAktif} Aktif
              </Badge>
              {stats.anggotaTidakAktif > 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {stats.anggotaTidakAktif} Nonaktif
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Kehadiran Hari Ini</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.hadirHariIni}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">{kehadiranPersen}% kehadiran</span>
            </div>
            <Progress value={kehadiranPersen} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Izin / Sakit</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-yellow-600">
                  {stats.izinHariIni + stats.sakitHariIni}
                </div>
                <p className="text-xs text-slate-500">
                  Izin: {stats.izinHariIni} | Sakit: {stats.sakitHariIni}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-red-600">{stats.alphaHariIni}</div>
                <p className="text-xs text-slate-500">Alpha</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Poin</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalPoin.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Rata-rata {stats.rataPoin} poin/anggota</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid 2 Kolom */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kolom Kiri (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 5 Anggota */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Top 5 Anggota Berpoin
              </CardTitle>
              <Link href="/leaderboard">
                <Button variant="ghost" size="sm" className="gap-1">
                  Lihat Semua <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topAnggota.map((anggota, index) => (
                  <div
                    key={anggota.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {getInitials(anggota.nama)}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                          <Star className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{anggota.nama}</p>
                      <p className="text-xs text-slate-500">
                        {anggota.nomor_anggota} • {anggota.kelas || '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="font-bold text-yellow-700">{anggota.poin}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Zap className="w-3 h-3" />
                        {anggota.streak} streak
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Acara Terdekat */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarDays className="w-6 h-6 text-blue-600" />
                Acara Terdekat
              </CardTitle>
              <Link href="/acara">
                <Button variant="ghost" size="sm" className="gap-1">
                  Lihat Kalender <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {acaraTerdekat.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Tidak ada acara mendatang</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {acaraTerdekat.map((acara) => {
                    const tgl = new Date(acara.tanggal_mulai)
                    const isToday = tgl.toDateString() === new Date().toDateString()

                    return (
                      <div
                        key={acara.id}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                        onClick={() => router.push(`/acara/${acara.id}`)}
                      >
                        <div
                          className={`
                            w-16 h-16 rounded-xl flex flex-col items-center justify-center shadow-md
                            ${
                              isToday
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700'
                            }
                          `}
                        >
                          <span className="text-2xl font-bold">{format(tgl, 'dd')}</span>
                          <span className="text-xs uppercase">{format(tgl, 'MMM')}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{acara.judul}</h3>
                            {isToday && <Badge className="bg-green-500 text-white">Hari Ini</Badge>}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {format(tgl, 'EEEE, HH:mm', { locale: id })} •{' '}
                            {acara.lokasi || 'No location'}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan (1/3) */}
        <div className="space-y-6">
          {/* Ringkasan Cepat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Ringkasan Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Kehadiran</span>
                  <span className="font-medium">{kehadiranPersen}%</span>
                </div>
                <Progress value={kehadiranPersen} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-500">Acara Hari Ini</p>
                  <p className="text-xl font-bold">{stats.acaraHariIni}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-500">Akan Datang</p>
                  <p className="text-xl font-bold">{stats.acaraMendatang}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-500">Alpha</p>
                  <p className="text-xl font-bold text-red-600">{stats.alphaHariIni}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-500">Streak</p>
                  <p className="text-xl font-bold text-yellow-600">{topAnggota[0]?.streak || 0}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
                <p className="text-sm opacity-90">Total Poin Terkumpul</p>
                <p className="text-3xl font-bold mt-1">{stats.totalPoin.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">Dari {stats.totalAnggota} anggota aktif</p>
              </div>
            </CardContent>
          </Card>

          {/* Info Poin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Info Poin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Hadir</p>
                  <p className="text-xs text-slate-500">+10 poin, streak bertambah</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Izin/Sakit</p>
                  <p className="text-xs text-slate-500">+5 poin, streak tetap</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Bonus Streak</p>
                  <p className="text-xs text-slate-500">+5 poin setiap 7 hari</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Aksi Cepat */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <Link href="/absen/qr">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg">
                <QrCode className="w-6 h-6" />
                <span className="font-semibold">Scan QR</span>
                <span className="text-xs opacity-90">Absen cepat</span>
              </Button>
            </Link>

            {(userRole === 'admin' || userRole === 'pengurus') && (
              <Link href="/absen/manual">
                <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg">
                  <ClipboardList className="w-6 h-6" />
                  <span className="font-semibold">Absen Manual</span>
                  <span className="text-xs opacity-90">Input nomor</span>
                </Button>
              </Link>
            )}

            <Link href="/leaderboard">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg">
                <Trophy className="w-6 h-6" />
                <span className="font-semibold">Leaderboard</span>
                <span className="text-xs opacity-90">Lihat peringkat</span>
              </Button>
            </Link>

            <Link href="/acara">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg">
                <CalendarDays className="w-6 h-6" />
                <span className="font-semibold">Acara</span>
                <span className="text-xs opacity-90">Jadwal kegiatan</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
