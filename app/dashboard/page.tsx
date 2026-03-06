"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Calendar,
  Award,
  TrendingUp,
  Activity,
  UserCheck,
  UserX,
  Clock,
  QrCode,
  Trophy,
  ClipboardList,
  ChevronRight,
  Star,
  Zap,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale/id";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
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
  });
  const [userRole, setUserRole] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topAnggota, setTopAnggota] = useState<any[]>([]);
  const [acaraTerdekat, setAcaraTerdekat] = useState<any[]>([]);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Set greeting berdasarkan waktu
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Selamat Pagi");
    else if (hour < 15) setGreeting("Selamat Siang");
    else if (hour < 18) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");

    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const supabase = createClient();

    // Ambil user login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Ambil data anggota
    const { data: anggota } = await supabase
      .from("anggota")
      .select("*")
      .eq("email", user.email)
      .single();

    setUserData(anggota);
    setUserRole(anggota?.role || "anggota");

    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    // ========== STATISTIK ==========
    
    // Total anggota & status
    const { data: semuaAnggota } = await supabase
      .from("anggota")
      .select("id, is_active");

    const totalAnggota = semuaAnggota?.length || 0;
    const anggotaAktif = semuaAnggota?.filter((a) => a.is_active).length || 0;
    const anggotaTidakAktif = totalAnggota - anggotaAktif;

    // Absensi hari ini
    const { data: absensiHariIni } = await supabase
      .from("absensi")
      .select("status")
      .eq("tanggal", today);

    const hadir = absensiHariIni?.filter((a) => a.status === "hadir").length || 0;
    const izin = absensiHariIni?.filter((a) => a.status === "izin").length || 0;
    const sakit = absensiHariIni?.filter((a) => a.status === "sakit").length || 0;
    const alpha = totalAnggota - hadir - izin - sakit;

    // Total poin
    const { data: poinData } = await supabase.from("anggota").select("poin");
    const totalPoin = poinData?.reduce((acc, curr) => acc + (curr.poin || 0), 0) || 0;
    const rataPoin = totalAnggota ? Math.round(totalPoin / totalAnggota) : 0;

    // Acara
    const { data: acara } = await supabase
      .from("acara")
      .select("*")
      .gte("tanggal_mulai", now)
      .order("tanggal_mulai", { ascending: true })
      .limit(5);

    const acaraMendatang = acara?.length || 0;
    const acaraHariIni = acara?.filter((a) => 
      new Date(a.tanggal_mulai).toISOString().split("T")[0] === today
    ).length || 0;

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
    });

    // ========== TOP 5 ANGGOTA ==========
    const { data: top } = await supabase
      .from("anggota")
      .select("id, nomor_anggota, nama, poin, streak, kelas, foto")
      .eq("is_active", true)
      .order("poin", { ascending: false })
      .order("streak", { ascending: false })
      .limit(5);

    setTopAnggota(top || []);

    // ========== ACARA TERDEKAT ==========
    setAcaraTerdekat(acara || []);

    setLoading(false);
  };

  const getInitials = (nama: string) => {
    return nama
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "hadir":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "izin":
        return <HelpCircle className="w-4 h-4 text-yellow-600" />;
      case "sakit":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case "alpha":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getAksiIcon = (aksi: string) => {
    if (aksi.includes("absen")) return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (aksi.includes("create")) return <Award className="w-4 h-4 text-blue-600" />;
    if (aksi.includes("update")) return <TrendingUp className="w-4 h-4 text-yellow-600" />;
    if (aksi.includes("delete")) return <XCircle className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-slate-600" />;
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header dengan Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {greeting}, {userData?.nama}!
          </h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              userRole === "admin"
                ? "bg-purple-100 text-purple-700"
                : userRole === "pengurus"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }
          >
            {userRole === "admin" ? "👑 Administrator" : userRole === "pengurus" ? "📋 Pengurus" : "👤 Anggota"}
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistik Utama */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Anggota
            </CardTitle>
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
            <CardTitle className="text-sm font-medium text-slate-500">
              Kehadiran Hari Ini
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.hadirHariIni}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">
                {((stats.hadirHariIni / stats.totalAnggota) * 100).toFixed(1)}% kehadiran
              </span>
            </div>
            <Progress 
              value={(stats.hadirHariIni / stats.totalAnggota) * 100} 
              className="h-1 mt-2"
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Izin / Sakit
            </CardTitle>
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
                <div className="text-xl font-bold text-red-600">
                  {stats.alphaHariIni}
                </div>
                <p className="text-xs text-slate-500">Alpha</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Poin
            </CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalPoin.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rata-rata {stats.rataPoin} poin/anggota
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid 2 Kolom untuk Konten Tambahan */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kolom Kiri (2/3) - Top Anggota & Acara */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 5 Anggota */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
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
                    className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="relative">
                      {index === 0 && (
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-800">
                          1
                        </div>
                      )}
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(anggota.nama)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{anggota.nama}</p>
                      <p className="text-xs text-slate-500">
                        {anggota.nomor_anggota} • {anggota.kelas || "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{anggota.poin}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
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
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
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
                  <p>Tidak ada acara mendatang</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {acaraTerdekat.map((acara) => {
                    const tgl = new Date(acara.tanggal_mulai);
                    const isToday = tgl.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={acara.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        onClick={() => router.push(`/acara/${acara.id}`)}
                      >
                        <div
                          className={`
                            w-12 h-12 rounded-lg flex flex-col items-center justify-center
                            ${
                              isToday
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-200 text-slate-700"
                            }
                          `}
                        >
                          <span className="text-lg font-bold">{format(tgl, "dd")}</span>
                          <span className="text-xs">{format(tgl, "MMM")}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{acara.judul}</p>
                          <p className="text-xs text-slate-500">
                            {format(tgl, "EEEE, HH:mm", { locale: id })} • {acara.lokasi || "No location"}
                          </p>
                        </div>
                        <Badge
                          className={
                            acara.tipe === "umum"
                              ? "bg-blue-100 text-blue-700"
                              : acara.tipe === "rapat"
                              ? "bg-purple-100 text-purple-700"
                              : acara.tipe === "kegiatan"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }
                        >
                          {acara.tipe}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan (1/3) - Aktivitas Terkini */}
        <div className="space-y-6">
          
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Statistik Cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Acara Hari Ini</span>
                <Badge variant="outline" className="bg-blue-50">
                  {stats.acaraHariIni}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Acara Mendatang</span>
                <Badge variant="outline" className="bg-green-50">
                  {stats.acaraMendatang}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Poin</span>
                <Badge variant="outline" className="bg-purple-50">
                  {stats.totalPoin.toLocaleString()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Rata-rata Poin</span>
                <Badge variant="outline" className="bg-yellow-50">
                  {stats.rataPoin}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Aksi Cepat */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/absen/qr">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-0">
                <QrCode className="w-6 h-6" />
                <span className="font-semibold">Scan QR</span>
                <span className="text-xs">Absen cepat dengan QR</span>
              </Button>
            </Link>

            {(userRole === "admin" || userRole === "pengurus") && (
              <Link href="/absen/manual">
                <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-0">
                  <ClipboardList className="w-6 h-6" />
                  <span className="font-semibold">Absen Manual</span>
                  <span className="text-xs">Input nomor anggota</span>
                </Button>
              </Link>
            )}

            <Link href="/leaderboard">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-0">
                <Trophy className="w-6 h-6" />
                <span className="font-semibold">Leaderboard</span>
                <span className="text-xs">Lihat peringkat</span>
              </Button>
            </Link>

            <Link href="/acara">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-0">
                <CalendarDays className="w-6 h-6" />
                <span className="font-semibold">Acara</span>
                <span className="text-xs">Jadwal kegiatan</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}