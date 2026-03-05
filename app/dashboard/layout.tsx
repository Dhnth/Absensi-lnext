"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Home,
  Users,
  QrCode,
  Trophy,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Hash,
  ClipboardList,
  UserPlus,
  BarChart3,
  Activity,
  ChevronDown,
  Award,
  FileText
} from "lucide-react"

type UserRole = 'admin' | 'pengurus' | 'anggota'

interface MenuItem {
  title: string
  href: string
  icon: React.ReactNode
  roles: UserRole[]
  submenu?: MenuItem[]
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole>('anggota')
  const [userData, setUserData] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  useEffect(() => {
    const getUserData = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
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
      setUserRole(anggota.role as UserRole)
      setLoading(false)
    }

    getUserData()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  // Menu items berdasarkan role
  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="w-5 h-5" />,
      roles: ['admin', 'pengurus', 'anggota']
    },
    {
      title: "Absensi",
      href: "#",
      icon: <QrCode className="w-5 h-5" />,
      roles: ['admin', 'pengurus', 'anggota'],
      submenu: [
        {
          title: "Absen QR",
          href: "/absen/qr",
          icon: <QrCode className="w-5 h-5" />,
          roles: ['admin', 'pengurus', 'anggota']
        },
        {
          title: "Absen Manual",
          href: "/absen/manual",
          icon: <ClipboardList className="w-5 h-5" />,
          roles: ['admin', 'pengurus']
        },
        {
          title: "Riwayat Absensi",
          href: "/absen/riwayat",
          icon: <FileText className="w-5 h-5" />,
          roles: ['admin', 'pengurus', 'anggota']
        }
      ]
    },
    {
      title: "Manajemen Anggota",
      href: "#",
      icon: <Users className="w-5 h-5" />,
      roles: ['admin', 'pengurus'],
      submenu: [
        {
          title: "Daftar Anggota",
          href: "/anggota",
          icon: <Users className="w-5 h-5" />,
          roles: ['admin', 'pengurus']
        },
        {
          title: "Tambah Anggota",
          href: "/anggota/tambah",
          icon: <UserPlus className="w-5 h-5" />,
          roles: ['admin', 'pengurus']
        },
        {
          title: "Stok Nomor",
          href: "/admin/stok-nomor",
          icon: <Hash className="w-5 h-5" />,
          roles: ['admin']
        }
      ]
    },
    {
      title: "Leaderboard",
      href: "/leaderboard",
      icon: <Trophy className="w-5 h-5" />,
      roles: ['admin', 'pengurus', 'anggota']
    },
    {
      title: "Acara",
      href: "/acara",
      icon: <Calendar className="w-5 h-5" />,
      roles: ['admin', 'pengurus', 'anggota']
    },
    {
      title: "Laporan",
      href: "#",
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['admin', 'pengurus'],
      submenu: [
        {
          title: "Rekap Absensi",
          href: "/laporan/rekap",
          icon: <FileText className="w-5 h-5" />,
          roles: ['admin', 'pengurus']
        },
        {
          title: "Export Excel",
          href: "/laporan/export",
          icon: <FileText className="w-5 h-5" />,
          roles: ['admin', 'pengurus']
        }
      ]
    },
    {
      title: "Admin",
      href: "#",
      icon: <Settings className="w-5 h-5" />,
      roles: ['admin'],
      submenu: [
        {
          title: "Log Aktivitas",
          href: "/admin/log-aktivitas",
          icon: <Activity className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          title: "Pengaturan",
          href: "/admin/pengaturan",
          icon: <Settings className="w-5 h-5" />,
          roles: ['admin']
        }
      ]
    }
  ]

  // Filter menu berdasarkan role
  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(userRole)
  )

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title)
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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r transition-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-6 border-b">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <span className="font-semibold text-lg">Absensi Komunitas</span>
        </div>

        {/* User Info */}
        <div className="p-4 border-b bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {userData?.nama?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userData?.nama}</p>
              <p className="text-xs text-slate-500">
                {userRole === 'admin' ? '👑 Administrator' : 
                 userRole === 'pengurus' ? '📋 Pengurus' : '👤 Anggota'}
              </p>
              <p className="text-xs text-slate-400 truncate">{userData?.nomor_anggota}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-200px)]">
          {filteredMenu.map((item) => (
            <div key={item.title}>
              {item.submenu ? (
                // Menu dengan submenu
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={`
                      w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg
                      ${openSubmenu === item.title ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}
                    `}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.title}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      openSubmenu === item.title ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {/* Submenu */}
                  {openSubmenu === item.title && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu
                        .filter(sub => sub.roles.includes(userRole))
                        .map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                              flex items-center gap-3 px-4 py-2 text-sm rounded-lg
                              ${pathname === sub.href 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-slate-600 hover:bg-slate-100'}
                            `}
                          >
                            {sub.icon}
                            {sub.title}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                // Menu biasa
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2 text-sm rounded-lg
                    ${pathname === item.href 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-600 hover:bg-slate-100'}
                  `}
                >
                  {item.icon}
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        transition-all duration-300
        lg:ml-64 p-8
        ${sidebarOpen ? 'ml-64' : 'ml-0'}
      `}>
        {children}
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}