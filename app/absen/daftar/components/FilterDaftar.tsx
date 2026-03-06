"use client"

import { memo, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"

interface FilterDaftarProps {
  tanggal: string
  onTanggalChange: (tanggal: string) => void
  filterKelas: string
  onKelasChange: (kelas: string) => void
  searchTerm: string
  onSearchChange: (search: string) => void
  onRefresh: () => void
  loading?: boolean
}

export const FilterDaftar = memo(function FilterDaftar({
  tanggal,
  onTanggalChange,
  filterKelas,
  onKelasChange,
  searchTerm,
  onSearchChange,
  onRefresh,
  loading
}: FilterDaftarProps) {
  const [kelasOptions, setKelasOptions] = useState<string[]>([])

  useEffect(() => {
    const loadKelas = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('kelas')
        .select('nama')
        .order('nama')
      
      setKelasOptions(data?.map(k => k.nama) || [])
    }
    loadKelas()
  }, [])

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tanggal */}
          <div className="space-y-2">
            <Label htmlFor="tanggal" className="text-sm">Tanggal</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="tanggal"
                type="date"
                value={tanggal}
                onChange={(e) => onTanggalChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Filter Kelas */}
          <div className="space-y-2">
            <Label htmlFor="kelas" className="text-sm">Kelas</Label>
            <Select value={filterKelas} onValueChange={onKelasChange}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Kelas</SelectItem>
                {kelasOptions.map((kelas) => (
                  <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="search" className="text-sm">Cari Anggota</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="search"
                placeholder="Nama atau nomor anggota..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tombol Refresh */}
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onRefresh} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})