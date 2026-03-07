'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { FilterLaporan } from './components/FilterLaporan'
import { StatistikCard } from './components/StatistikCard'
import { TabelRekap } from './components/TabelRekap'
import { RekapAnggota, StatistikLaporan } from './components/types'
import { exportToExcel } from './utils/excelFormatter'

interface DataAbsensi {
  tanggal: string
  data: Array<{
    nomor_anggota: string
    nama: string
    kelas: string
    status: string
    poin: number
  }>
}

export default function LaporanPage() {
  const router = useRouter()

  // State
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [data, setData] = useState<RekapAnggota[]>([])
  const [detailData, setDetailData] = useState<DataAbsensi[]>([])
  const [statistik, setStatistik] = useState<StatistikLaporan>({
    total_anggota: 0,
    total_hadir: 0,
    total_izin: 0,
    total_sakit: 0,
    total_alpha: 0,
    total_poin: 0,
    rata_poin: 0,
    presensi_rate: 0,
  })

  // Filter
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterKelas, setFilterKelas] = useState('semua')

  // Message
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load data saat filter berubah
  useEffect(() => {
    if (startDate && endDate) {
      loadData()
    }
  }, [startDate, endDate, filterKelas])

  const loadData = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // ========== Generate semua tanggal dalam rentang ==========
      const generateDateRange = (start: string, end: string) => {
        const dates: string[] = []
        const currentDate = new Date(start)
        const endDate = new Date(end)
        
        while (currentDate <= endDate) {
          dates.push(format(currentDate, 'yyyy-MM-dd'))
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        return dates
      }

      const semuaTanggal = generateDateRange(startDate, endDate)
      // =========================================================

      // ========== LANGKAH 1: Ambil semua anggota aktif ==========
      let anggotaQuery = supabase
        .from('anggota')
        .select('id, nomor_anggota, nama, kelas, is_active')
        .eq('is_active', true)

      if (filterKelas !== 'semua') {
        anggotaQuery = anggotaQuery.eq('kelas', filterKelas)
      }

      const { data: semuaAnggota, error: anggotaError } = await anggotaQuery
      if (anggotaError) throw anggotaError

      // ========== LANGKAH 2: Ambil semua absensi dalam periode ==========
      const { data: absensi, error: absensiError } = await supabase
        .from('absensi')
        .select(
          `
          *,
          anggota:anggota_id (
            nomor_anggota,
            nama,
            kelas
          )
        `
        )
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)
        .order('tanggal', { ascending: true })

      if (absensiError) throw absensiError

      // ========== LANGKAH 3: Kelompokkan absensi per tanggal ==========
      const absensiPerTanggal = new Map()

      absensi?.forEach((item) => {
        if (!absensiPerTanggal.has(item.tanggal)) {
          absensiPerTanggal.set(item.tanggal, [])
        }
        absensiPerTanggal.get(item.tanggal).push({
          nomor_anggota: item.anggota?.nomor_anggota || '',
          nama: item.anggota?.nama || '',
          kelas: item.anggota?.kelas || '',
          status: item.status,
          poin: item.poin,
        })
      })

      const detailDataArray: DataAbsensi[] = Array.from(absensiPerTanggal.entries()).map(([tanggal, data]) => ({
        tanggal,
        data,
      }))

      setDetailData(detailDataArray)

      // ========== LANGKAH 4: Buat rekap per anggota (DENGAN SEMUA TANGGAL) ==========
      const rekapData: RekapAnggota[] = []
      
      // Buat map absensi per anggota per tanggal
      const absensiMapByDate = new Map()
      absensi?.forEach(item => {
        const key = `${item.anggota_id}-${item.tanggal}`
        absensiMapByDate.set(key, item)
      })

      // Loop setiap anggota
      semuaAnggota?.forEach((anggota) => {
        let totalHadir = 0
        let totalIzin = 0
        let totalSakit = 0
        let totalAlpha = 0
        let totalPoin = 0

        // Loop setiap tanggal dalam periode (SEMUA TANGGAL)
        semuaTanggal.forEach(tanggal => {
          const key = `${anggota.id}-${tanggal}`
          const absen = absensiMapByDate.get(key)
          
          if (absen) {
            // Ada absensi
            switch(absen.status) {
              case 'hadir':
                totalHadir++
                totalPoin += absen.poin
                break
              case 'izin':
                totalIzin++
                totalPoin += absen.poin
                break
              case 'sakit':
                totalSakit++
                totalPoin += absen.poin
                break
              case 'alpha':
                totalAlpha++
                break
            }
          } else {
            // Tidak ada absensi = ALPHA
            totalAlpha++
          }
        })

        rekapData.push({
          anggota_id: anggota.id,
          nomor_anggota: anggota.nomor_anggota,
          nama: anggota.nama,
          kelas: anggota.kelas,
          total_hadir: totalHadir,
          total_izin: totalIzin,
          total_sakit: totalSakit,
          total_alpha: totalAlpha,
          total_absen: totalHadir + totalIzin + totalSakit + totalAlpha,
          total_poin: totalPoin,
        })
      })
      // ===========================================================

      // ========== LANGKAH 5: Hitung statistik ==========
      const totalHadir = rekapData.reduce((sum, a) => sum + a.total_hadir, 0)
      const totalIzin = rekapData.reduce((sum, a) => sum + a.total_izin, 0)
      const totalSakit = rekapData.reduce((sum, a) => sum + a.total_sakit, 0)
      const totalAlpha = rekapData.reduce((sum, a) => sum + a.total_alpha, 0)
      const totalPoin = rekapData.reduce((sum, a) => sum + a.total_poin, 0)
      const totalAbsen = totalHadir + totalIzin + totalSakit + totalAlpha

      setData(rekapData)
      setStatistik({
        total_anggota: rekapData.length,
        total_hadir: totalHadir,
        total_izin: totalIzin,
        total_sakit: totalSakit,
        total_alpha: totalAlpha,
        total_poin: totalPoin,
        rata_poin: rekapData.length ? Math.round(totalPoin / rekapData.length) : 0,
        presensi_rate: totalAbsen ? Math.round((totalHadir / totalAbsen) * 100) : 0,
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error loading data:', error)
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'error', text: 'Gagal memuat data' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleExport = useCallback(() => {
    try {
      setExportLoading(true)

      const semuaAnggota = data.map((d) => ({
        nomor_anggota: d.nomor_anggota,
        nama: d.nama,
        kelas: d.kelas || '',
      }))

      exportToExcel(data, detailData, semuaAnggota, startDate, endDate)

      setMessage({ type: 'success', text: 'Export berhasil!' })
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'error', text: 'Gagal export' })
      }
    } finally {
      setExportLoading(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }, [data, detailData, startDate, endDate])

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Laporan Absensi</h1>
          <p className="text-sm sm:text-base text-slate-600">
            Rekap kehadiran semua anggota periode {startDate || '...'} s/d {endDate || '...'}
          </p>
        </div>
      </div>

      {/* Pesan */}
      {message && (
        <Alert
          className={
            message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription
            className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}
          >
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Filter */}
      <FilterLaporan
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        filterKelas={filterKelas}
        onKelasChange={setFilterKelas}
        onRefresh={loadData}
        onExport={handleExport}
        loading={loading || exportLoading}
      />

      {/* Statistik */}
      {!loading && data.length > 0 && <StatistikCard statistik={statistik} />}

      {/* Tabel Rekap */}
      <TabelRekap data={data} loading={loading} itemsPerPage={10} />

      {/* Info */}
      {!loading && data.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Tidak ada data untuk periode ini</p>
            <p className="text-sm">Pilih periode lain atau filter berbeda</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}