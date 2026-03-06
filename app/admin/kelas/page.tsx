"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TabelKelas } from "./components/TabelKelas";
import ModalKelas from "./components/ModalKelas";
import { Kelas, KelasFormData } from "./components/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

export default function KelasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Kelas[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"tambah" | "edit">("tambah");
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: kelas } = await supabase
      .from("kelas")
      .select("*")
      .order("nama", { ascending: true });

    setData(kelas || []);
    setLoading(false);
  };

  const handleSave = async (formData: KelasFormData, id?: number) => {
    const supabase = createClient();

    if (id) {
      // Edit
      const { error } = await supabase
        .from("kelas")
        .update({
          nama: formData.nama,
          deskripsi: formData.deskripsi,
        })
        .eq("id", id);

      if (error) throw error;


      setMessage({ type: "success", text: "Kelas berhasil diupdate" });
    } else {
      // Tambah
      const { error } = await supabase.from("kelas").insert({
        nama: formData.nama,
        deskripsi: formData.deskripsi,
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Nama kelas sudah ada");
        }
        throw error;
      }

      setMessage({ type: "success", text: "Kelas berhasil ditambahkan" });
    }

    loadData();
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Yakin ingin menghapus kelas ini? Anggota dengan kelas ini akan menjadi null.",
      )
    )
      return;

    const supabase = createClient();
    const kelasYangDihapus = data.find((k) => k.id === id);


    // Update anggota dengan kelas ini menjadi null dulu
    await supabase
      .from("anggota")
      .update({ kelas: null })
      .eq("kelas", kelasYangDihapus?.nama);

    // Hapus kelas
    const { error } = await supabase.from("kelas").delete().eq("id", id);

    if (error) throw error;

    setMessage({ type: "success", text: "Kelas berhasil dihapus" });
    loadData();
    setTimeout(() => setMessage(null), 3000);
  };

  const handleEdit = (kelas: Kelas) => {
    setSelectedKelas(kelas);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedKelas(null);
    setModalMode("tambah");
    setShowModal(true);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Kelas</h1>
            <p className="text-slate-600 mt-1">
              Kelola data kelas untuk dropdown anggota
            </p>
          </div>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kelas
        </Button>
      </div>

      {/* Pesan Notifikasi */}
      {message && (
        <Alert
          className={
            message.type === "success"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }
        >
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabel Kelas */}
      <TabelKelas
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <ModalKelas
        open={showModal}
        onOpenChange={setShowModal}
        mode={modalMode}
        data={selectedKelas}
        onSave={handleSave}
      />
    </div>
  );
}