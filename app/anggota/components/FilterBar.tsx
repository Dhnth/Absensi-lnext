'use client'

import { memo, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filterRole: string
  onRoleChange: (value: string) => void
  filterStatus: string
  onStatusChange: (value: string) => void
  filterKelas: string
  onKelasChange: (value: string) => void
  totalData: number
  filteredCount: number
  onRefresh: () => void
}

export const FilterBar = memo(function FilterBar({
  searchTerm,
  onSearchChange,
  filterRole,
  onRoleChange,
  filterStatus,
  onStatusChange,
  filterKelas,
  onKelasChange,
  totalData,
  filteredCount,
  onRefresh,
}: FilterBarProps) {
  const [kelasOptions, setKelasOptions] = useState<string[]>([])

  // Load kelas dari database
  useEffect(() => {
    const loadKelas = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('kelas').select('nama').order('nama')

      setKelasOptions(data?.map((k) => k.nama) || [])
    }
    loadKelas()
  }, [])

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nomor/nama/email..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Filter Role */}
          <Select value={filterRole} onValueChange={onRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Role</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="pengurus">Pengurus</SelectItem>
              <SelectItem value="anggota">Anggota</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Status */}
          <Select value={filterStatus} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Kelas - AMBIL DARI DATABASE */}
          <Select value={filterKelas} onValueChange={onKelasChange}>
            <SelectTrigger>
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
        </div>

        {/* Info & Refresh */}
        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
          <div>
            Menampilkan {filteredCount} dari {totalData} anggota
          </div>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})
