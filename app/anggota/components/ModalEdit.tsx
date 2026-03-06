"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";
import { Anggota } from "./types";

interface ModalEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anggota: Anggota | null;
  onSuccess: () => void;
  onResetPassword: (password: string, email: string) => void;
}

export default function ModalEdit({
  open,
  onOpenChange,
  anggota,
  onSuccess,
  onResetPassword,
}: ModalEditProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stokNomor, setStokNomor] = useState<string[]>([]);
  const [kelasOptions, setKelasOptions] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    nomor_anggota: "",
    nama: "",
    email: "",
    role: "anggota" as "admin" | "pengurus" | "anggota",
    kelas: "",
    is_active: true,
  });

  useEffect(() => {
    if (open && anggota) {
      setFormData({
        nomor_anggota: anggota.nomor_anggota,
        nama: anggota.nama,
        email: anggota.email || "",
        role: anggota.role,
        kelas: anggota.kelas || "",
        is_active: anggota.is_active,
      });
      loadStokNomor();
      loadKelas();
    }
  }, [open, anggota]);

  const loadStokNomor = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("stok_nomor_anggota")
      .select("nomor_anggota")
      .eq("status", "tersedia")
      .order("nomor_anggota");

    setStokNomor(data?.map((s) => s.nomor_anggota) || []);
  };

  const loadKelas = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("kelas").select("nama").order("nama");

    setKelasOptions(data?.map((k) => k.nama) || []);
  };

  const handleResetPassword = async () => {
    if (!anggota) return;

    setLoading(true);
    const supabase = createClient();

    try {
      const plainPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const { error } = await supabase
        .from("anggota")
        .update({ password: hashedPassword })
        .eq("id", anggota.id);

      if (error) throw error;

      onResetPassword(plainPassword, anggota.email);
    } catch (err: any) {
      setError(err.message || "Gagal reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anggota) return;

    setLoading(true);
    setError("");

    const supabase = createClient();

    try {
      // Cek email unik
      if (formData.email !== anggota.email) {
        const { data: cekEmail } = await supabase
          .from("anggota")
          .select("id")
          .eq("email", formData.email)
          .maybeSingle();

        if (cekEmail) {
          setError("Email sudah terdaftar oleh anggota lain!");
          return;
        }
      }

      // Cek perubahan nomor
      const nomorBerubah = formData.nomor_anggota !== anggota.nomor_anggota;

      if (nomorBerubah) {
        const { data: cekNomor } = await supabase
          .from("anggota")
          .select("id")
          .eq("nomor_anggota", formData.nomor_anggota)
          .neq("id", anggota.id)
          .maybeSingle();

        if (cekNomor) {
          setError("Nomor anggota sudah digunakan anggota lain!");
          return;
        }

        await supabase
          .from("stok_nomor_anggota")
          .update({ status: "tersedia" })
          .eq("nomor_anggota", anggota.nomor_anggota);

        await supabase
          .from("stok_nomor_anggota")
          .update({ status: "terpakai" })
          .eq("nomor_anggota", formData.nomor_anggota);
      }

      // Update anggota
      const { error } = await supabase
        .from("anggota")
        .update({
          nomor_anggota: formData.nomor_anggota,
          nama: formData.nama,
          email: formData.email,
          role: formData.role,
          kelas: formData.kelas || null,
          is_active: formData.is_active,
        })
        .eq("id", anggota.id);

      if (error) throw error;


      onSuccess();
    } catch (err: any) {
      setError(err.message || "Gagal mengupdate anggota");
    } finally {
      setLoading(false);
    }
  };

  if (!anggota) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Anggota</DialogTitle>
          <DialogDescription>
            Edit data anggota {anggota.nama}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Nomor Anggota */}
          <div className="space-y-2">
            <Label>Nomor Anggota</Label>
            <Select
              value={formData.nomor_anggota}
              onValueChange={(value) =>
                setFormData({ ...formData, nomor_anggota: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih nomor anggota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={anggota.nomor_anggota}>
                  {anggota.nomor_anggota} (saat ini)
                </SelectItem>
                {stokNomor
                  .filter((nomor) => nomor !== anggota.nomor_anggota)
                  .map((nomor) => (
                    <SelectItem key={`stok-${nomor}`} value={nomor}>
                      {nomor} (tersedia)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nama */}
          <div className="space-y-2">
            <Label>Nama Lengkap</Label>
            <Input
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: any) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anggota">Anggota</SelectItem>
                <SelectItem value="pengurus">Pengurus</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Kelas - DROPDOWN DENGAN VALUE KHUSUS UNTUK KOSONG */}
          <div className="space-y-2">
            <Label>Kelas</Label>
            <Select
              value={formData.kelas || "no-class"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  kelas: value === "no-class" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-class">Tidak Ada Kelas</SelectItem>
                {kelasOptions.map((kelas) => (
                  <SelectItem key={kelas} value={kelas}>
                    {kelas}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Aktif */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4"
            />
            <Label htmlFor="edit-is_active">Aktif</Label>
          </div>

          {/* Tombol Reset Password */}
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetPassword}
              className="w-full"
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Password
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
