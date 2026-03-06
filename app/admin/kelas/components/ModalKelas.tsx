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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Kelas, KelasFormData } from "./types";

interface ModalKelasProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "tambah" | "edit";
  data?: Kelas | null;
  onSave: (data: KelasFormData, id?: number) => Promise<void>;
}

export default function ModalKelas({
  open,
  onOpenChange,
  mode,
  data,
  onSave,
}: ModalKelasProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<KelasFormData>({
    nama: "",
    deskripsi: "",
  });

  useEffect(() => {
    if (data && mode === "edit") {
      setFormData({
        nama: data.nama,
        deskripsi: data.deskripsi || "",
      });
    } else {
      setFormData({ nama: "", deskripsi: "" });
    }
    setError("");
  }, [data, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      setError("Nama kelas wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave(formData, data?.id);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan kelas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "tambah" ? "Tambah Kelas Baru" : "Edit Kelas"}
          </DialogTitle>
          <DialogDescription>
            {mode === "tambah"
              ? "Tambahkan kelas baru untuk anggota"
              : "Edit data kelas yang sudah ada"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nama">
              Nama Kelas <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              placeholder="Contoh: A, B, 2024, Reguler"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              placeholder="Keterangan tambahan tentang kelas"
              rows={3}
            />
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
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
