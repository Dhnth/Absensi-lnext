"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "use-debounce";
import { Podium } from "./components/Podium";
import { TabelLeaderboard } from "./components/TabelLeaderboard";
import { FilterLeaderboard } from "./components/FilterLeaderboard";
import { AnggotaRank } from "./components/types";

export default function LeaderboardPage() {
  // State
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnggotaRank[]>([]);
  const [kelasList, setKelasList] = useState<string[]>([]);

  // Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [filterKelas, setFilterKelas] = useState("semua");

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    // Ambil semua anggota aktif, urutkan berdasarkan poin
    const { data: anggota } = await supabase
      .from("anggota")
      .select("id, nomor_anggota, nama, kelas, poin, streak, role, is_active")
      .eq("is_active", true)
      .order("poin", { ascending: false })
      .order("streak", { ascending: false });

    setData(anggota || []);

    const kelas = [
      ...new Set(anggota?.map((a) => a.kelas).filter(Boolean)),
    ] as string[];
    setKelasList(kelas.sort());
    setLoading(false);
  };

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Filter search
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.nama.toLowerCase().includes(term) ||
          item.nomor_anggota.toLowerCase().includes(term),
      );
    }

    // Filter kelas
    if (filterKelas !== "semua") {
      filtered = filtered.filter((item) => item.kelas === filterKelas);
    }

    return filtered;
  }, [data, debouncedSearchTerm, filterKelas]);

  // Ambil 3 besar
  const podiumData = useMemo(() => {
    return {
      pertama: filteredData[0] || null,
      kedua: filteredData[1] || null,
      ketiga: filteredData[2] || null,
    };
  }, [filteredData]);

  // Handlers
  const handleRefresh = useCallback(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Leaderboard</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Peringkat anggota berdasarkan poin dan streak
        </p>
      </div>

      {/* Podium 3 Besar */}
      {!loading && filteredData.length > 0 && (
        <Podium
          pertama={podiumData.pertama}
          kedua={podiumData.kedua}
          ketiga={podiumData.ketiga}
        />
      )}

      {/* Filter */}
      <FilterLeaderboard
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterKelas={filterKelas}
        onKelasChange={setFilterKelas}
        kelasList={kelasList}
        totalData={data.length}
        onRefresh={handleRefresh}
      />

      {/* Tabel Leaderboard */}
      <TabelLeaderboard
        data={filteredData}
        loading={loading}
        itemsPerPage={15}
      />

      {/* Info Tambahan */}
      {!loading && (
        <div className="text-sm text-slate-500 text-center">
          * Peringkat dihitung berdasarkan total poin dan streak kehadiran
        </div>
      )}
    </div>
  );
}
