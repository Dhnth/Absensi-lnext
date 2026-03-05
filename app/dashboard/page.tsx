"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User, Hash, Calendar, Trophy } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const getUserData = async () => {
      const supabase = createClient()
      
      // Ambil user login
      const { data: { user } } = await supabase.auth.getUser()
      
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

      if (!anggota?.nomor_anggota) {
        router.push('/pairing')
        return
      }

      setUserData(anggota)
      setLoading(false)
    }

    getUserData()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-semibold">Dashboard</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Selamat Datang, {userData.nama}!</h1>
        <p className="text-slate-600 mb-8">Senang melihat Anda kembali</p>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Hash className="w-4 h-4" /> Nomor Anggota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{userData.nomor_anggota}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Total Poin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{userData.poin || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{userData.streak || 0} hari</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Grid */}
        <h2 className="text-xl font-semibold mb-4">Menu</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Absen QR", desc: "Scan QR Code untuk absen", icon: "📱", href: "/absen/qr" },
            { title: "Absen Manual", desc: "Input nomor anggota", icon: "📝", href: "/absen/manual" },
            { title: "Leaderboard", desc: "Lihat peringkat", icon: "🏆", href: "/leaderboard" },
            { title: "Riwayat", desc: "Lihat histori absensi", icon: "📊", href: "/riwayat" },
            { title: "QR Code Saya", desc: "Download QR pribadi", icon: "🔳", href: "/qr-saya" },
            { title: "Acara", desc: "Jadwal kegiatan", icon: "📅", href: "/acara" },
            { title: "Kalender", desc: "Lihat kalender acara", icon: "📆", href: "/kalender" },
            { title: "Profil", desc: "Edit profil", icon: "👤", href: "/profil" },
          ].map((menu, i) => (
            <Card key={i} className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="text-3xl mb-3">{menu.icon}</div>
                <h3 className="font-semibold mb-1">{menu.title}</h3>
                <p className="text-sm text-slate-500">{menu.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}