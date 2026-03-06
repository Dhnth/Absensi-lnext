"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import Link from "next/link";

export default function AjukanAbsenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLibur, setIsLibur] = useState(false);
  const [keteranganLibur, setKeteranganLibur] = useState("");
  const [sudahAbsen, setSudahAbsen] = useState(false);
  const [statusAbsen, setStatusAbsen] = useState("");

  // Form state
  const [jenis, setJenis] = useState<"izin" | "sakit">("izin");
  const [alasan, setAlasan] = useState("");

  useEffect(() => {
    checkUserAndAbsen();
  }, []);

  const checkUserAndAbsen = async () => {
    setLoadingData(true);
    const supabase = createClient();
    const today = format(new Date(), "yyyy-MM-dd");

    try {
      // Cek user login
      const { data: { user } } = await supabase.auth.getUser();
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

      if (!anggota?.nomor_anggota) {
        router.push("/pairing");
        return;
      }

      setUserData(anggota);

      // CEK APAKAH HARI INI LIBUR
      const { data: pengaturan } = await supabase
        .from("pengaturan_absen")
        .select("*")
        .eq("tanggal", today)
        .maybeSingle();

      if (pengaturan?.status === "tutup") {
        setIsLibur(true);
        setKeteranganLibur(pengaturan.keterangan || "Hari libur");
      }

      // CEK APAKAH SUDAH ABSEN HARI INI
      const { data: absenHariIni } = await supabase
        .from("absensi")
        .select("*")
        .eq("anggota_id", anggota.id)
        .eq("tanggal", today)
        .maybeSingle();

      if (absenHariIni) {
        setSudahAbsen(true);
        setStatusAbsen(absenHariIni.status);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const today = format(new Date(), "yyyy-MM-dd");

    try {
      // CEK ULANG LIBUR
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

      // CEK ULANG SUDAH ABSEN
      const { data: absenHariIni } = await supabase
        .from("absensi")
        .select("*")
        .eq("anggota_id", userData.id)
        .eq("tanggal", today)
        .maybeSingle();

      if (absenHariIni) {
        setError(`Anda sudah absen hari ini dengan status: ${absenHariIni.status}`);
        setLoading(false);
        return;
      }

      // VALIDASI ALASAN
      if (!alasan.trim()) {
        setError("Alasan wajib diisi");
        setLoading(false);
        return;
      }

      // HITUNG POIN
      const poin = 5; // Izin/Sakit = 5 poin
      let streakBaru = (userData.streak || 0) + 1;

      // Cek kemarin
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
        .eq("anggota_id", userData.id)
        .eq("tanggal", kemarin)
        .maybeSingle();

      if (!liburKemarin) {
        if (!absenKemarin || absenKemarin.status !== "hadir") {
          streakBaru = 1; // Reset streak
        }
      } else {
        streakBaru = userData.streak || 0; // Streak tetap
      }

      // INSERT ABSENSI
      const { error: insertError } = await supabase.from("absensi").insert({
        anggota_id: userData.id,
        tanggal: today,
        status: jenis,
        poin: poin,
        keterangan: alasan,
      });

      if (insertError) throw insertError;

      // HITUNG ULANG TOTAL POIN
      const { data: semuaAbsensi } = await supabase
        .from("absensi")
        .select("poin")
        .eq("anggota_id", userData.id);

      const totalPoinBaru =
        semuaAbsensi?.reduce((sum, a) => sum + a.poin, 0) || 0;

      // UPDATE ANGGOTA
      const { error: updateError } = await supabase
        .from("anggota")
        .update({
          poin: totalPoinBaru,
          streak: streakBaru,
          last_absen: today,
        })
        .eq("id", userData.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="container mx-auto max-w-2xl">


        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6 text-blue-600" />
              Ajukan Izin / Sakit
            </CardTitle>
            <CardDescription>
              {userData?.nama} ({userData?.nomor_anggota})
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Alert Libur */}
            {isLibur && (
              <Alert className="bg-yellow-50 border-yellow-200 mb-6">
                <Lock className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Hari ini libur: {keteranganLibur}. Tidak bisa mengajukan
                  izin/sakit.
                </AlertDescription>
              </Alert>
            )}

            {/* Alert Sudah Absen */}
            {sudahAbsen && (
              <Alert className="bg-blue-50 border-blue-200 mb-6">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Anda sudah absen hari ini dengan status:{" "}
                  <span className="font-semibold uppercase">{statusAbsen}</span>
                </AlertDescription>
              </Alert>
            )}

            {/* Info Tanggal */}
            <div className="bg-slate-50 p-4 rounded-lg mb-6 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500">Tanggal</p>
                <p className="font-medium">
                  {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
                </p>
              </div>
            </div>

            {/* Form */}
            {!isLibur && !sudahAbsen && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      ✅ Pengajuan berhasil! Anda akan dialihkan ke dashboard.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Pilihan Jenis */}
                <div className="space-y-3">
                  <Label>Jenis Pengajuan</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setJenis("izin")}
                      className={`
                        p-4 rounded-xl border-2 transition-all
                        ${
                          jenis === "izin"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-200"
                        }
                      `}
                    >
                      <Clock className={`w-6 h-6 mx-auto mb-2 ${jenis === "izin" ? "text-blue-600" : "text-slate-400"}`} />
                      <p className={`font-medium ${jenis === "izin" ? "text-blue-600" : "text-slate-600"}`}>
                        Izin
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setJenis("sakit")}
                      className={`
                        p-4 rounded-xl border-2 transition-all
                        ${
                          jenis === "sakit"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-200"
                        }
                      `}
                    >
                      <FileText className={`w-6 h-6 mx-auto mb-2 ${jenis === "sakit" ? "text-blue-600" : "text-slate-400"}`} />
                      <p className={`font-medium ${jenis === "sakit" ? "text-blue-600" : "text-slate-600"}`}>
                        Sakit
                      </p>
                    </button>
                  </div>
                </div>

                {/* Alasan */}
                <div className="space-y-2">
                  <Label htmlFor="alasan">
                    Alasan {jenis === "izin" ? "Izin" : "Sakit"}
                  </Label>
                  <Textarea
                    id="alasan"
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    placeholder={`Tuliskan alasan ${jenis}...`}
                    rows={5}
                    required
                    disabled={loading || success}
                  />
                  <p className="text-xs text-slate-500">
                    * Alasan akan tercatat di riwayat absensi
                  </p>
                </div>

                {/* Info Poin */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <span className="font-semibold">Informasi:</span>
                    Izin/Sakit = +5 poin
                  </p>
                </div>

                {/* Tombol Submit */}
                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={loading || success}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Ajukan {jenis === "izin" ? "Izin" : "Sakit"}
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}