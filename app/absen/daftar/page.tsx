"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarDays, AlertCircle, CheckCircle2 } from "lucide-react"
import { FilterDaftar } from "./components/FilterDaftar"
import { TabelDaftarAbsensi } from "./components/TabelDaftarAbsensi"
import ModalEditAbsensi from "./components/ModalEditAbsensi"
import { Anggota, Absensi, DaftarAbsensiRow } from "./components/types"

export default function DaftarAbsensiPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DaftarAbsensiRow[]>([])
  const [filteredData, setFilteredData] = useState<DaftarAbsensiRow[]>([])
  const [selectedRow, setSelectedRow] = useState<DaftarAbsensiRow | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Filter
  const [tanggal, setTanggal] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [filterKelas, setFilterKelas] = useState("semua")
  const [searchTerm, setSearchTerm] = useState("")

  // Cek role user
  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: anggota } = await supabase
        .from('anggota')
        .select('role')
        .eq('email', user.email)
        .single()

      setUserRole(anggota?.role || 'anggota')
    }

    checkRole()
  }, [router])

  // Load data saat tanggal berubah
  useEffect(() => {
    loadData()
  }, [tanggal])

  const loadData = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Ambil semua anggota aktif
      let queryAnggota = supabase
        .from('anggota')
        .select('id, nomor_anggota, nama, kelas, is_active')
        .eq('is_active', true)

      if (filterKelas !== "semua") {
        queryAnggota = queryAnggota.eq('kelas', filterKelas)
      }

      const { data: semuaAnggota, error: errAnggota } = await queryAnggota
      if (errAnggota) throw errAnggota

      // Ambil absensi untuk tanggal ini
      const { data: absensi, error: errAbsensi } = await supabase
        .from('absensi')
        .select('*')
        .eq('tanggal', tanggal)

      if (errAbsensi) throw errAbsensi

      // Buat map absensi per anggota
      const absensiMap = new Map()
      absensi?.forEach(a => {
        absensiMap.set(a.anggota_id, a)
      })

      // Gabungkan data
      const daftar: DaftarAbsensiRow[] = (semuaAnggota || []).map(anggota => {
        const absen = absensiMap.get(anggota.id)
        
        if (absen) {
          return {
            anggota,
            absensi: absen,
            status: absen.status,
            poin: absen.poin
          }
        } else {
          return {
            anggota,
            absensi: null,
            status: 'alpha',
            poin: 0
          }
        }
      })

      setData(daftar)
      applySearch(daftar)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal memuat data' })
    } finally {
      setLoading(false)
    }
  }

  const applySearch = useCallback((daftar: DaftarAbsensiRow[]) => {
    if (!searchTerm) {
      setFilteredData(daftar)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = daftar.filter(item =>
      item.anggota.nama.toLowerCase().includes(term) ||
      item.anggota.nomor_anggota.toLowerCase().includes(term)
    )
    setFilteredData(filtered)
  }, [searchTerm])

  useEffect(() => {
    applySearch(data)
  }, [searchTerm, data, applySearch])

  const handleSave = async (status: string, keterangan: string) => {
  if (!selectedRow) return

  setLoading(true)
  const supabase = createClient()

  try {
    const tanggalObj = new Date(tanggal)
    const poin = status === 'hadir' ? 10 : (status === 'izin' || status === 'sakit') ? 5 : 0
    const poinLama = selectedRow.poin

    // ========== 1. UPDATE/INSERT/DELETE ABSENSI ==========
    if (status === 'alpha') {
      // Jika alpha, HAPUS data absensi (jika ada)
      if (selectedRow.absensi) {
        await supabase
          .from('absensi')
          .delete()
          .eq('id', selectedRow.absensi.id)
      }
    } else {
      // Jika hadir/izin/sakit, INSERT atau UPDATE
      const absensiData = {
        anggota_id: selectedRow.anggota.id,
        tanggal,
        status,
        poin,
        keterangan: keterangan || null,
        updated_at: new Date().toISOString()
      }

      if (selectedRow.absensi) {
        // UPDATE
        await supabase
          .from('absensi')
          .update(absensiData)
          .eq('id', selectedRow.absensi.id)
      } else {
        // INSERT
        await supabase
          .from('absensi')
          .insert({
            ...absensiData,
            created_at: new Date().toISOString()
          })
      }
    }

    // ========== 2. UPDATE TOTAL POIN DI TABEL ANGGOTA ==========
    // Ambil semua absensi anggota ini
    const { data: semuaAbsensi } = await supabase
      .from('absensi')
      .select('poin')
      .eq('anggota_id', selectedRow.anggota.id)

    // Hitung ulang total poin
    const totalPoinBaru = semuaAbsensi?.reduce((sum, a) => sum + a.poin, 0) || 0

    // Update tabel anggota
    await supabase
      .from('anggota')
      .update({ poin: totalPoinBaru })
      .eq('id', selectedRow.anggota.id)

    // ========== 3. CATAT LOG ==========
    await supabase
      .from('log_aktivitas')
      .insert({
        anggota_id: selectedRow.anggota.id,
        aksi: 'edit_absensi',
        detail: {
          tanggal,
          status_lama: selectedRow.status,
          status_baru: status,
          poin_lama: poinLama,
          poin_baru: poin,
          metode: 'manual'
        }
      })

    setMessage({ type: 'success', text: 'Data berhasil disimpan' })
    setShowEditModal(false)
    loadData() // Reload data
  } catch (error: any) {
    setMessage({ type: 'error', text: error.message || 'Gagal menyimpan' })
  } finally {
    setLoading(false)
    setTimeout(() => setMessage(null), 3000)
  }
}

  const canManage = userRole === 'admin' || userRole === 'pengurus'

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CalendarDays className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Daftar Absensi</h1>
          <p className="text-sm sm:text-base text-slate-600">
            Kelola kehadiran semua anggota per tanggal
          </p>
        </div>
      </div>

      {/* Pesan */}
      {message && (
        <Alert className={message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Filter */}
      <FilterDaftar
        tanggal={tanggal}
        onTanggalChange={setTanggal}
        filterKelas={filterKelas}
        onKelasChange={setFilterKelas}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={loadData}
        loading={loading}
      />

      {/* Info */}
      <div className="text-sm text-slate-500">
        Menampilkan {filteredData.length} anggota
      </div>

      {/* Tabel */}
      <TabelDaftarAbsensi
        data={filteredData}
        loading={loading}
        onEdit={(row) => {
          setSelectedRow(row)
          setShowEditModal(true)
        }}
        canManage={canManage}
      />

      {/* Modal Edit */}
      <ModalEditAbsensi
        open={showEditModal}
        onOpenChange={setShowEditModal}
        data={selectedRow}
        tanggal={tanggal}
        onSave={handleSave}
        loading={loading}
      />
    </div>
  )
}