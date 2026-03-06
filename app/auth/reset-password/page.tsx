"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });

  useEffect(() => {
    // Cek apakah user datang dari email reset
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth/login");
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validasi password match
    if (passwords.new !== passwords.confirm) {
      setError("Password tidak sama");
      setLoading(false);
      return;
    }

    // Validasi panjang password
    if (passwords.new.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect ke login setelah 3 detik
    setTimeout(() => {
      router.push("/auth/login");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {success ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : (
                <Lock className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <CardTitle className="text-2xl text-center">
              {success ? "Password Berhasil Diubah!" : "Buat Password Baru"}
            </CardTitle>
            <CardDescription className="text-center">
              {success
                ? "Password Anda sudah diperbarui. Mengalihkan ke login..."
                : "Masukkan password baru untuk akun Anda"}
            </CardDescription>
          </CardHeader>

          {!success ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="new">Password Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="new"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      className="pl-9"
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Konfirmasi Password Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="Ketik ulang password"
                      className="pl-9"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Password strength indicator */}
                {passwords.new && (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">
                      Kekuatan password:
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwords.new.length < 6
                            ? "w-1/3 bg-red-500"
                            : passwords.new.length < 8
                              ? "w-2/3 bg-yellow-500"
                              : "w-full bg-green-500"
                        }`}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      {passwords.new.length < 6
                        ? "Terlalu pendek"
                        : passwords.new.length < 8
                          ? "Sedang"
                          : "Kuat"}
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-4 mt-5">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Menyimpan..." : "Ubah Password"}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Password berhasil diubah! Anda akan dialihkan ke halaman
                  login.
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
