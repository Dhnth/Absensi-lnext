"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Trash2,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Hash,
  Search,
  Filter,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminStokNomor() {
  const [stok, setStok] = useState<any[]>([]);
  const [filteredStok, setFilteredStok] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNomor, setNewNomor] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "semua" | "tersedia" | "terpakai"
  >("semua");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadStok();
  }, []);

  useEffect(() => {
    filterStok();
  }, [searchTerm, filterStatus, stok]);

  const loadStok = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("stok_nomor_anggota")
      .select("*")
      .order("nomor_anggota");

    setStok(data || []);
    setLoading(false);
  };

  const filterStok = () => {
    let filtered = [...stok];

    // Filter berdasarkan pencarian
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.nomor_anggota.includes(searchTerm),
      );
    }

    // Filter berdasarkan status
    if (filterStatus !== "semua") {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    setFilteredStok(filtered);
  };

  const tambahNomor = async () => {
    if (!newNomor) {
      setMessage({ type: "error", text: "Masukkan nomor anggota" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const supabase = createClient();
    
    const { error } = await supabase
      .from("stok_nomor_anggota")
      .insert({ nomor_anggota: newNomor, status: "tersedia" });

    if (error) {
      setMessage({
        type: "error",
        text: "Nomor sudah ada atau gagal ditambahkan",
      });
    } else {

      setMessage({ type: "success", text: "Nomor berhasil ditambahkan" });
      setNewNomor("");
      loadStok();
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const hapusNomor = async (id: number, nomor: string) => {
    const supabase = createClient();
    

    const { error } = await supabase
      .from("stok_nomor_anggota")
      .delete()
      .eq("id", id);

    if (!error) {
      setMessage({ type: "success", text: "Nomor berhasil dihapus" });
      loadStok();
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const generateBanyak = async () => {
    setLoading(true);
    const supabase = createClient();

    // Cari nomor terakhir
    const lastNomor =
      stok.length > 0
        ? Math.max(...stok.map((s) => parseInt(s.nomor_anggota)))
        : 2425000;

    const newNomors = [];
    for (let i = 1; i <= 10; i++) {
      newNomors.push({
        nomor_anggota: (lastNomor + i).toString(),
        status: "tersedia",
      });
    }

    const { error } = await supabase
      .from("stok_nomor_anggota")
      .insert(newNomors);

    if (!error) {

      setMessage({ type: "success", text: "10 nomor berhasil digenerate" });
      loadStok();
    }
    setLoading(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const copyToClipboard = (nomor: string) => {
    navigator.clipboard.writeText(nomor);
    setMessage({ type: "success", text: "Nomor disalin!" });
    setTimeout(() => setMessage(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    if (status === "tersedia") {
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
          Tersedia
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-full">
          Terpakai
        </span>
      );
    }
  };

  const tersedia = stok.filter((s) => s.status === "tersedia").length;
  const terpakai = stok.filter((s) => s.status !== "tersedia").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Stok Nomor Anggota</h1>
        <p className="text-slate-600 mt-1">
          Kelola stok nomor anggota yang tersedia
        </p>
      </div>

      {/* Pesan */}
      {message && (
        <Alert
          className={
            message.type === "success"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription
            className={
              message.type === "success" ? "text-green-700" : "text-red-700"
            }
          >
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistik Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Stok</p>
                <p className="text-3xl font-bold">{stok.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Hash className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tersedia</p>
                <p className="text-3xl font-bold text-green-600">{tersedia}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Terpakai</p>
                <p className="text-3xl font-bold text-slate-600">{terpakai}</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-full">
                <Hash className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Tambah */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Nomor Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="2425001"
              value={newNomor}
              onChange={(e) => setNewNomor(e.target.value)}
              className="sm:max-w-xs"
            />
            <div className="flex gap-2">
              <Button onClick={tambahNomor} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah
              </Button>
              <Button
                variant="outline"
                onClick={generateBanyak}
                disabled={loading}
              >
                <Copy className="w-4 h-4 mr-2" />
                Generate 10
              </Button>
              <Button variant="outline" disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter & Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nomor..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "semua" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("semua")}
              >
                Semua
              </Button>
              <Button
                variant={filterStatus === "tersedia" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("tersedia")}
                className="text-green-600"
              >
                Tersedia
              </Button>
              <Button
                variant={filterStatus === "terpakai" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("terpakai")}
                className="text-slate-600"
              >
                Terpakai
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Stok Nomor */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            {filteredStok.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Hash className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Tidak ada nomor ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {filteredStok.map((item) => (
                  <div
                    key={item.id}
                    className={`
                      relative group p-3 rounded-lg border transition-all
                      ${
                        item.status === "tersedia"
                          ? "bg-green-50 border-green-200 hover:bg-green-100"
                          : "bg-slate-50 border-slate-200 opacity-70"
                      }
                    `}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-sm sm:text-base font-medium">
                        {item.nomor_anggota}
                      </span>
                      <span className="text-xs mt-1">
                        {getStatusBadge(item.status)}
                      </span>

                      {/* Tombol aksi muncul saat hover (khusus tersedia) */}
                      {item.status === "tersedia" && (
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(item.nomor_anggota)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={() => hapusNomor(item.id, item.nomor_anggota)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info footer */}
            <div className="mt-4 text-sm text-slate-500 border-t pt-4">
              Menampilkan {filteredStok.length} dari {stok.length} nomor
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}