"use client";

import { memo, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FilterLeaderboardProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterKelas: string;
  onKelasChange: (value: string) => void;
  totalData: number;
  onRefresh: () => void;
}

export const FilterLeaderboard = memo(function FilterLeaderboard({
  searchTerm,
  onSearchChange,
  filterKelas,
  onKelasChange,
  totalData,
  onRefresh,
}: FilterLeaderboardProps) {
  const [kelasOptions, setKelasOptions] = useState<string[]>([]);

  // Load kelas dari database
  useEffect(() => {
    const loadKelas = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("kelas")
        .select("nama")
        .order("nama");

      setKelasOptions(data?.map((k) => k.nama) || []);
    };
    loadKelas();
  }, []);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama atau nomor anggota..."
              className="pl-9 h-10"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Filter Kelas - DARI DATABASE */}
          <Select value={filterKelas} onValueChange={onKelasChange}>
            <SelectTrigger className="w-full sm:w-48 h-10">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Kelas</SelectItem>
              {kelasOptions.map((kelas) => (
                <SelectItem key={kelas} value={kelas}>
                  {kelas}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-10 w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="text-sm text-slate-500 mt-3">
          Total {totalData} anggota terdaftar
        </div>
      </CardContent>
    </Card>
  );
});
