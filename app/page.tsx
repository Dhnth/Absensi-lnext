'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Calendar,
  QrCode,
  Trophy,
  Users,
  Loader2,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
  Award,
  ChartLine,
  Download,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Menu,
  X,
  LogIn,
  Handshake,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const cekLogin = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: anggota } = await supabase
          .from('anggota')
          .select('nomor_anggota')
          .eq('email', user.email)
          .single()

        if (anggota?.nomor_anggota) {
          router.push('/dashboard')
        } else {
          router.push('/pairing')
        }
      } else {
        setLoading(false)
      }
    }

    cekLogin()
  }, [router])

  const stats = [
    { label: 'Anggota Aktif', value: '500+', icon: <Users /> },
    { label: 'Total Absensi', value: '10K+', icon: <ChartLine /> },
    { label: 'Poin Dibagikan', value: '50K+', icon: <Trophy /> },
    { label: 'Komunitas', value: '25+', icon: <Handshake /> },
  ]

  const features = [
    {
      icon: <QrCode className="w-6 h-6" />,
      title: 'QR Code Unik',
      description: 'Setiap anggota punya QR Code unik untuk absen cepat 1 detik',
      gradient: 'from-blue-500 to-cyan-500',
      stats: 'Scan < 1 detik',
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Sistem Poin & Streak',
      description: 'Hadir +10 poin, Izin/Sakit +5 poin, bonus streak 7 hari',
      gradient: 'from-amber-500 to-orange-500',
      stats: '10.000+ poin',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Leaderboard Interaktif',
      description: 'Peringkat anggota dengan podium 3 besar dan filter kelas',
      gradient: 'from-purple-500 to-pink-500',
      stats: 'Top 5 anggota',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Manajemen Acara',
      description: 'Buat acara, undang anggota, dan lihat kehadiran di kalender',
      gradient: 'from-green-500 to-emerald-500',
      stats: '100+ acara',
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: 'Export Laporan Excel',
      description: 'Download rekap absensi dengan styling profesional',
      gradient: 'from-indigo-500 to-blue-500',
      stats: 'Format Excel',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Update Real-time',
      description: 'Leaderboard dan statistik update otomatis',
      gradient: 'from-red-500 to-rose-500',
      stats: 'Live update',
    },
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Daftar Akun',
      description: 'Registrasi menggunakan email atau Google. Admin akan memberikan nomor anggota.',
      icon: <Users className="w-8 h-8" />,
    },
    {
      step: '02',
      title: 'Dapatkan QR Code',
      description: 'Setiap anggota mendapat QR Code unik untuk absen cepat.',
      icon: <QrCode className="w-8 h-8" />,
    },
    {
      step: '03',
      title: 'Absen & Dapat Poin',
      description: 'Scan QR atau input nomor anggota. Dapatkan poin dan jaga streak.',
      icon: <Award className="w-8 h-8" />,
    },
    {
      step: '04',
      title: 'Lihat Leaderboard',
      description: 'Pantau peringkat dan bersaing dengan anggota lain.',
      icon: <Trophy className="w-8 h-8" />,
    },
  ]

  const testimonials = [
    {
      name: 'Budi Santoso',
      role: 'Ketua Komunitas X',
      content:
        'Aplikasi ini sangat membantu mengelola absensi 200+ anggota. Fitur poin bikin anggota semangat datang.',
      avatar: '👨‍💼',
    },
    {
      name: 'Siti Aminah',
      role: 'Anggota Komunitas Y',
      content:
        'QR Code bikin absen cepet banget, ga perlu antri. Suka lihat peringkat di leaderboard!',
      avatar: '👩‍💼',
    },
    {
      name: 'Ahmad Fauzi',
      role: 'Pengurus Komunitas Z',
      content:
        'Export Excel sangat membantu untuk laporan bulanan. Fitur acara juga memudahkan koordinasi.',
      avatar: '👨‍🔧',
    },
  ]

  const faq = [
    {
      q: 'Apakah aplikasi ini gratis?',
      a: 'Ya, aplikasi ini gratis untuk komunitas kecil dan menengah. Tersedia paket premium untuk fitur tambahan.',
    },
    {
      q: 'Bagaimana cara mendapatkan nomor anggota?',
      a: 'Setelah registrasi, admin komunitas akan memberikan nomor anggota. Anda bisa langsung login setelah pairing.',
    },
    {
      q: 'Apakah bisa digunakan di HP?',
      a: 'Tentu! Aplikasi ini responsive dan bisa diakses dari HP, tablet, maupun laptop.',
    },
    {
      q: 'Bagaimana jika ada hari libur?',
      a: 'Admin bisa mengatur hari libur. Streak anggota tetap aman dan tidak reset.',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 mt-6 text-lg font-medium">Memuat aplikasi...</p>
          <p className="text-slate-400 text-sm mt-2">Menyiapkan pengalaman terbaik untuk Anda</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 z-50 shadow-sm"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-lg">A</span>
            </motion.div>
            <span className="font-semibold text-lg bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Absensi Komunitas
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#fitur"
              className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              Fitur
            </Link>
            <Link
              href="#cara-kerja"
              className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              Cara Kerja
            </Link>
            <Link
              href="#testimoni"
              className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              Testimoni
            </Link>
            <Link
              href="#faq"
              className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              FAQ
            </Link>
            <div className="flex items-center gap-2 ml-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Masuk
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                >
                  Daftar
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link
                href="#fitur"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Fitur
              </Link>
              <Link
                href="#cara-kerja"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cara Kerja
              </Link>
              <Link
                href="#testimoni"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Testimoni
              </Link>
              <Link
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                FAQ
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Masuk
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    Daftar
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-blue-200/50 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Solusi Absensi Digital untuk Komunitas
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Absensi Jadi Lebih
            </span>
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
              Mudah & Menyenangkan
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto"
          >
            Kelola kehadiran anggota komunitas dengan sistem poin, streak, dan leaderboard
            interaktif. Dilengkapi QR Code untuk absen cepat!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/auth/register">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                Mulai Sekarang
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#fitur">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-6 text-lg border-2 hover:bg-slate-50 transition-all"
              >
                Lihat Fitur
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Fitur Section */}
      <section id="fitur" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Fitur Lengkap untuk Komunitas Anda
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola kehadiran anggota
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((fitur, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${fitur.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${fitur.gradient} rounded-xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  {fitur.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{fitur.title}</h3>
                <p className="text-slate-600 mb-4">{fitur.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`px-3 py-1 bg-gradient-to-r ${fitur.gradient} bg-opacity-10 text-slate-700 rounded-full font-medium`}
                  >
                    {fitur.stats}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section id="cara-kerja" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Cara Kerja
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Mulai dalam 4 langkah mudah</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-blue-100 absolute -top-4 -left-4 -z-10">
                  {item.step}
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.description}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 text-blue-300">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimoni" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Apa Kata Mereka
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Bergabung dengan 25+ komunitas yang sudah menggunakan aplikasi ini
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-2xl">
                    {testi.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testi.name}</h4>
                    <p className="text-sm text-slate-500">{testi.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 italic">&ldquo;{testi.content}&rdquo;</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Pertanyaan Umum
            </h2>
            <p className="text-xl text-slate-600">
              Temukan jawaban untuk pertanyaan yang sering diajukan
            </p>
          </motion.div>

          <div className="space-y-4">
            {faq.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                    Q
                  </span>
                  {item.q}
                </h3>
                <p className="text-slate-600 flex items-start gap-2">
                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold mt-0.5">
                    A
                  </span>
                  {item.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Siap Mencoba?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Gabung sekarang dan rasakan kemudahan mengelola absensi komunitas
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all px-8 py-6 text-lg shadow-xl"
              >
                Daftar Sekarang
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="font-semibold text-lg">Absensi Komunitas</span>
              </div>
              <p className="text-slate-400 text-sm">
                Solusi absensi digital modern untuk komunitas dan organisasi Anda.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#fitur" className="hover:text-white transition-colors">
                    Fitur
                  </Link>
                </li>
                <li>
                  <Link href="#cara-kerja" className="hover:text-white transition-colors">
                    Cara Kerja
                  </Link>
                </li>
                <li>
                  <Link href="/harga" className="hover:text-white transition-colors">
                    Harga
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/tentang" className="hover:text-white transition-colors">
                    Tentang
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-white transition-colors">
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ikuti Kami</h4>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>© 2026 Absensi Komunitas. Dhanis yg bikin</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
