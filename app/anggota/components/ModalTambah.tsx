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
import { AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";

interface ModalTambahProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (password: string, email: string) => void;
}

export default function ModalTambah({
  open,
  onOpenChange,
  onSuccess,
}: ModalTambahProps) {
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
    if (open) {
      loadStokNomor();
      loadKelas();
    }
  }, [open]);

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

  const resetForm = () => {
    setFormData({
      nomor_anggota: "",
      nama: "",
      email: "",
      role: "anggota",
      kelas: "",
      is_active: true,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    try {
      if (!formData.email) {
        setError("Email wajib diisi!");
        return;
      }

      if (!stokNomor.includes(formData.nomor_anggota)) {
        setError("Nomor anggota tidak tersedia di stok");
        return;
      }

      const { data: cekEmail } = await supabase
        .from("anggota")
        .select("id")
        .eq("email", formData.email)
        .maybeSingle();

      if (cekEmail) {
        setError("Email sudah terdaftar!");
        return;
      }

      const plainPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const { error } = await supabase.from("anggota").insert({
        nomor_anggota: formData.nomor_anggota,
        nama: formData.nama,
        email: formData.email,
        password: hashedPassword,
        role: formData.role,
        kelas: formData.kelas || null,
        is_active: formData.is_active,
        poin: 0,
        streak: 0,
      });

      if (error) throw error;


      await supabase
        .from("stok_nomor_anggota")
        .update({ status: "terpakai" })
        .eq("nomor_anggota", formData.nomor_anggota);

      resetForm();
      onSuccess(plainPassword, formData.email);
    } catch (err: any) {
      setError(err.message || "Gagal menambah anggota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Anggota Baru</DialogTitle>
          <DialogDescription>
            Isi data anggota. Email wajib diisi untuk login.
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
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih nomor anggota" />
              </SelectTrigger>
              <SelectContent>
                {stokNomor.map((nomor) => (
                  <SelectItem key={`stok-${nomor}`} value={nomor}>
                    {nomor} (tersedia)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {stokNomor.length === 0 && (
              <p className="text-xs text-red-500">
                Stok nomor habis! Tambah stok dulu.
              </p>
            )}
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
            <Label>Email (Wajib untuk login)</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder="contoh@email.com"
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
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4"
            />
            <Label htmlFor="is_active">Aktif</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || stokNomor.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
