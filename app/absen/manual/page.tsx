"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Hash,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  Clock,
  Award,
  Zap,
  TrendingUp,
  UserCheck,
  Calendar,
  Search,
  BellRing,
  Lock,
  User,
  QrCode,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale/id";

export default function AbsenManualPage() {
  const router = useRouter();

  // State untuk form dan loading
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nomorAnggota, setNomorAnggota] = useState("");

  // State untuk data yang ditampilkan
  const [recentAbsen, setRecentAbsen] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalHariIni: 0,
    hadir: 0,
    izin: 0,
    totalAnggota: 0,
    persentase: 0,
  });
  const [lastAbsen, setLastAbsen] = useState<any>(null);
  const [isLibur, setIsLibur] = useState(false);
  const [keteranganLibur, setKeteranganLibur] = useState("");

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const today = format(new Date(), "yyyy-MM-dd");

    try {
      const { data: pengaturan } = await supabase
        .from("pengaturan_absen")
        .select("*")
        .eq("tanggal", today)
        .maybeSingle();

      if (pengaturan?.status === "tutup") {
        setIsLibur(true);
        setKeteranganLibur(pengaturan.keterangan || "Hari libur");
      } else {
        setIsLibur(false);
        setKeteranganLibur("");
      }

      const { data: recent } = await supabase
        .from("absensi")
        .select(
          `
          *,
          anggota:anggota_id (
            nama,
            nomor_anggota,
            foto
          )
        `
        )
        .eq("tanggal", today)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentAbsen(recent || []);

      const { data: semuaAbsen } = await supabase
        .from("absensi")
        .select("status")
        .eq("tanggal", today);

      const hadir = semuaAbsen?.filter((a) => a.status === "hadir").length || 0;
      const izin =
        semuaAbsen?.filter((a) => ["izin", "sakit"].includes(a.status)).length || 0;

      const { count: totalAnggota } = await supabase
        .from("anggota")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      setStats({
        totalHariIni: semuaAbsen?.length || 0,
        hadir,
        izin,
        totalAnggota: totalAnggota || 0,
        persentase: totalAnggota ? Math.round((hadir / totalAnggota) * 100) : 0,
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const today = format(new Date(), "yyyy-MM-dd");

    try {
      // CEK LIBUR
      const { data: pengaturan } = await supabase
        .from("pengaturan_absen")
        .select("*")
        .eq("tanggal", today)
        .maybeSingle();

      if (pengaturan?.status === "tutup") {
        setError(`Hari ini libur: ${pengaturan.keterangan || "Tutup absensi"}`);
        setLoading(false);
        return;
      }

      // VALIDASI NOMOR
      const nomor = parseInt(nomorAnggota);
      if (nomor < 2425001 || nomor > 2425100) {
        setError("Nomor anggota tidak valid. Harus antara 2425001 - 2425100");
        setLoading(false);
        return;
      }

      // CEK ANGGOTA
      const { data: anggota, error: cekError } = await supabase
        .from("anggota")
        .select("*")
        .eq("nomor_anggota", nomorAnggota)
        .single();

      if (cekError || !anggota) {
        setError(`Anggota dengan nomor ${nomorAnggota} tidak ditemukan`);
        setLoading(false);
        return;
      }

      if (!anggota.is_active) {
        setError(`Anggota ${anggota.nama} (${nomorAnggota}) tidak aktif`);
        setLoading(false);
        return;
      }

      // CEK SUDAH ABSEN
      const { data: absenHariIni } = await supabase
        .from("absensi")
        .select("*")
        .eq("anggota_id", anggota.id)
        .eq("tanggal", today)
        .maybeSingle();

      if (absenHariIni) {
        setError(`Anggota ${anggota.nama} sudah absen hari ini dengan status: ${absenHariIni.status}`);
        setLoading(false);
        return;
      }

      // HITUNG STREAK
      const poinHadir = 10;
      let streakBaru = (anggota.streak || 0) + 1;
      const kemarin = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");

      const { data: liburKemarin } = await supabase
        .from("pengaturan_absen")
        .select("*")
        .eq("tanggal", kemarin)
        .eq("status", "tutup")
        .maybeSingle();

      const { data: absenKemarin } = await supabase
        .from("absensi")
        .select("*")
        .eq("anggota_id", anggota.id)
        .eq("tanggal", kemarin)
        .maybeSingle();

      if (!liburKemarin) {
        if (!absenKemarin || absenKemarin.status !== "hadir") {
          streakBaru = 1;
        }
      } else {
        streakBaru = anggota.streak || 0;
      }

      const bonusStreak = streakBaru % 7 === 0 ? 5 : 0;

      // INSERT ABSENSI
      const { error: insertError } = await supabase.from("absensi").insert({
        anggota_id: anggota.id,
        tanggal: today,
        status: "hadir",
        poin: poinHadir + bonusStreak,
        keterangan: `Absen manual oleh petugas`,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          setError(`Anggota ${anggota.nama} sudah absen hari ini.`);
        } else {
          throw insertError;
        }
        setLoading(false);
        return;
      }

      // HITUNG ULANG TOTAL POIN
      const { data: semuaAbsensi } = await supabase
        .from("absensi")
        .select("poin")
        .eq("anggota_id", anggota.id);

      const totalPoinBaru = semuaAbsensi?.reduce((sum, a) => sum + a.poin, 0) || 0;

      // UPDATE ANGGOTA
      const { error: updateError } = await supabase
        .from("anggota")
        .update({
          poin: totalPoinBaru,
          streak: streakBaru,
          last_absen: today,
        })
        .eq("id", anggota.id);

      if (updateError) throw updateError;

      // SET HASIL SUKSES
      setLastAbsen({
        ...anggota,
        poinDidapat: poinHadir + bonusStreak,
        streakBaru,
        bonus: bonusStreak > 0,
        waktu: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });
      setSuccess(true);
      setNomorAnggota("");

      await loadData();

      setTimeout(() => {
        setSuccess(false);
        setLastAbsen(null);
      }, 7000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Absen Manual</h1>
        <p className="text-slate-600 mt-1">
          Input nomor anggota untuk mencatat kehadiran
        </p>
      </div>

      {/* Alert Libur */}
      {isLibur && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <Lock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            Hari ini libur: {keteranganLibur}. Absensi ditutup.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistik */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Absen</p>
                <p className="text-3xl font-bold text-blue-700">{stats.totalHariIni}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Hadir</p>
                <p className="text-3xl font-bold text-green-700">{stats.hadir}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Izin/Sakit</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.izin}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Persentase</p>
                <p className="text-3xl font-bold text-purple-700">{stats.persentase}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid 2 Kolom */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Absen */}
        <Card className="border-2 hover:border-blue-200 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Form Absensi
            </CardTitle>
            <CardDescription>
              Masukkan nomor anggota (2425001 - 2425100)
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && lastAbsen ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    <div className="font-semibold text-lg mb-2">✅ Absen Berhasil!</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{lastAbsen.nama}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        <span className="font-mono">{lastAbsen.nomor_anggota}</span>
                      </div>
                      <div className="flex gap-4 mt-2 pt-2 border-t border-green-200">
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" /> +{lastAbsen.poinDidapat} poin
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4" /> Streak: {lastAbsen.streakBaru} hari
                        </span>
                        {lastAbsen.bonus && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Award className="w-4 h-4" /> Bonus streak!
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Waktu: {lastAbsen.waktu}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="nomor">Nomor Anggota</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="nomor"
                    placeholder="Contoh: 2425001"
                    className="pl-9 text-center text-lg font-mono"
                    value={nomorAnggota}
                    onChange={(e) => setNomorAnggota(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                    disabled={loading || isLibur}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-2 h-12 text-lg"
                disabled={loading || isLibur}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : isLibur ? (
                  <>
                    <Lock className="w-5 h-5" />
                    Libur - Tidak Bisa Absen
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Absen Sekarang
                  </>
                )}
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-blue-600" />
              Absen Terbaru Hari Ini
            </CardTitle>
            <CardDescription>5 kehadiran terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAbsen.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Belum ada absen hari ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAbsen.map((absen) => (
                  <div
                    key={absen.id}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {absen.anggota?.nama?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    <div className="flex-1">
                      <p className="font-medium">{absen.anggota?.nama}</p>
                      <p className="text-xs text-slate-500">{absen.anggota?.nomor_anggota}</p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-600">
                        <Award className="w-4 h-4" />
                        <span className="font-semibold">+{absen.poin}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(absen.created_at), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Target Kehadiran</span>
                <span className="font-medium">
                  {stats.hadir}/{stats.totalAnggota} anggota
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.persentase}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Hadir: +10 poin</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Izin/Sakit: +5 poin</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Bonus streak 7 hari: +5 poin</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Hari libur: streak aman</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}