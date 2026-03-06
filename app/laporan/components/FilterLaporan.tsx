"use client"

import { memo, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, RefreshCw, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"

interface FilterLaporanProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  filterKelas: string
  onKelasChange: (kelas: string) => void
  onRefresh: () => void
  onExport: () => void
  loading?: boolean
}

export const FilterLaporan = memo(function FilterLaporan({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  filterKelas,
  onKelasChange,
  onRefresh,
  onExport,
  loading = false
}: FilterLaporanProps) {
  const [kelasOptions, setKelasOptions] = useState<string[]>([])

  // Load kelas dari database
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

  // Set default tanggal (30 hari terakhir)
  useEffect(() => {
    if (!startDate) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      onStartDateChange(format(thirtyDaysAgo, 'yyyy-MM-dd'))
    }
    if (!endDate) {
      onEndDateChange(format(new Date(), 'yyyy-MM-dd'))
    }
  }, [])

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tanggal Mulai */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm">Tanggal Mulai</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Tanggal Selesai */}
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm">Tanggal Selesai</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
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

          {/* Tombol Aksi */}
          <div className="space-y-2">
            <Label className="text-sm invisible">Aksi</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={loading}
                className="flex-1"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={onExport}
                disabled={loading}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})