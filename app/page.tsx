"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  QrCode,
  Trophy,
  Users,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cekLogin = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Cek apakah sudah punya nomor anggota
        const { data: anggota } = await supabase
          .from("anggota")
          .select("nomor_anggota")
          .eq("email", user.email)
          .single();

        if (anggota?.nomor_anggota) {
          router.push("/dashboard");
        } else {
          router.push("/pairing");
        }
      } else {
        setLoading(false);
      }
    };

    cekLogin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-semibold text-lg">Absensi Komunitas</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Daftar</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Solusi Absensi Digital untuk Komunitas
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Absensi Jadi Lebih
            <span className="block text-blue-600">Mudah & Menyenangkan</span>
          </h1>

          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Kelola kehadiran anggota komunitas dengan sistem poin, streak, dan
            leaderboard interaktif. Dilengkapi QR Code untuk absen cepat!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto gap-2 group">
                Mulai Sekarang
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#fitur">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Lihat Fitur
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {[
              { label: "Anggota Aktif", value: "500+", icon: "👥" },
              { label: "Total Absensi", value: "10K+", icon: "📊" },
              { label: "Poin Dibagikan", value: "50K+", icon: "🏆" },
              { label: "Komunitas", value: "25+", icon: "🤝" },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center group hover:scale-105 transition-transform"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-blue-600">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur Section */}
      <section id="fitur" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Fitur Lengkap untuk Komunitas Anda
          </h2>
          <p className="text-xl text-slate-600 text-center mb-16 max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk mengelola kehadiran anggota
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <QrCode className="w-8 h-8" />,
                title: "QR Code Unik",
                description:
                  "Setiap anggota punya QR Code unik untuk absen cepat 1 detik",
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "Sistem Poin & Streak",
                description:
                  "Hadir +10 poin, Izin/Sakit +5 poin, ada bonus streak beruntun",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Leaderboard Interaktif",
                description:
                  "Lihat peringkat anggota dengan podium 3 besar dan filter kelas",
              },
              {
                icon: <Calendar className="w-8 h-8" />,
                title: "Manajemen Acara",
                description:
                  "Buat acara, undang anggota, dan lihat kehadiran di kalender",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
                title: "Export Laporan",
                description:
                  "Download rekap absensi ke Excel dengan filter periode",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ),
                title: "Real-time Update",
                description:
                  "Leaderboard dan statistik update otomatis saat ada absen baru",
              },
            ].map((fitur, i) => (
              <div
                key={i}
                className="group p-8 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {fitur.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{fitur.title}</h3>
                <p className="text-slate-600">{fitur.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Mencoba?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Gabung sekarang dan rasakan kemudahan mengelola absensi komunitas
          </p>
          <Link href="/auth/register">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-transform"
            >
              Daftar Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="font-semibold">Absensi Komunitas</span>
            </div>
            <div className="text-sm text-slate-600">
              © 2026 Absensi Komunitas.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
