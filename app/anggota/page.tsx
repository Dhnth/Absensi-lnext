"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useDebounce } from "use-debounce"
import dynamic from "next/dynamic"
import { Anggota } from "./components/types"

// COMPONENT BIASA
import { FilterBar } from "./components/FilterBar"
import { AnggotaTable } from "./components/AnggotaTable"

// DYNAMIC IMPORT
const ModalTambah = dynamic(() => import("./components/ModalTambah").then(mod => mod.default), {
  loading: () => null,
  ssr: false
})

const ModalEdit = dynamic(() => import("./components/ModalEdit").then(mod => mod.default), {
  loading: () => null,
  ssr: false
})

const ModalDetail = dynamic(() => import("./components/ModalDetail").then(mod => mod.default), {
  loading: () => null,
  ssr: false
})

const ModalKonfirmasi = dynamic(() => import("./components/ModalKonfirmasi").then(mod => mod.default), {
  loading: () => null,
  ssr: false
})

const ModalPassword = dynamic(() => import("./components/ModalPassword").then(mod => mod.default), {
  loading: () => null,
  ssr: false
})

export default function DaftarAnggotaPage() {
  // Data
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Anggota[]>([])
  const [userRole, setUserRole] = useState('')
  
  // Filter
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300)
  const [filterRole, setFilterRole] = useState("semua")
  const [filterStatus, setFilterStatus] = useState("semua")
  const [filterKelas, setFilterKelas] = useState("semua")
  const [kelasList, setKelasList] = useState<string[]>([])
  
  // Modal state
  const [selectedAnggota, setSelectedAnggota] = useState<Anggota | null>(null)
  const [showTambah, setShowTambah] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showKonfirmasi, setShowKonfirmasi] = useState(false)
  const [konfirmasiMode, setKonfirmasiMode] = useState<'nonaktifkan' | 'aktifkan' | 'hapus'>('nonaktifkan')
  const [showPassword, setShowPassword] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [passwordEmail, setPasswordEmail] = useState("")
  
  // State untuk stok nomor
  const [stokNomor, setStokNomor] = useState<string[]>([])
  
  // Pesan
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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
  }, [])

  // Load data
  useEffect(() => {
    loadData()
    loadStokNomor()
  }, [])

  // Filter data
  useEffect(() => {
    filterData()
  }, [debouncedSearchTerm, filterRole, filterStatus, filterKelas, data])

  const loadData = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const { data: anggota } = await supabase
      .from('anggota')
      .select('*')
      .order('nomor_anggota')
    
    setData(anggota || [])
    
    const kelas = [...new Set(anggota?.map(a => a.kelas).filter(Boolean))] as string[]
    setKelasList(kelas.sort())
    setLoading(false)
  }

  const loadStokNomor = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('stok_nomor_anggota')
      .select('nomor_anggota')
      .eq('status', 'tersedia')
      .order('nomor_anggota')

    setStokNomor(data?.map(s => s.nomor_anggota) || [])
  }

  const filterData = useCallback(() => {
    let filtered = [...data]

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        item.nomor_anggota.toLowerCase().includes(term) ||
        item.nama.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term)
      )
    }

    if (filterRole !== "semua") {
      filtered = filtered.filter(item => item.role === filterRole)
    }

    if (filterStatus !== "semua") {
      const isActive = filterStatus === "aktif"
      filtered = filtered.filter(item => item.is_active === isActive)
    }

    if (filterKelas !== "semua") {
      filtered = filtered.filter(item => item.kelas === filterKelas)
    }

    return filtered
  }, [data, debouncedSearchTerm, filterRole, filterStatus, filterKelas])

  // ========== HANDLERS ==========
  const handleAktifkan = async () => {
  if (!selectedAnggota) return

  setLoading(true)
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('anggota')
      .update({ is_active: true })
      .eq('id', selectedAnggota.id)

    if (error) throw error


    setMessage({ type: 'success', text: 'Anggota berhasil diaktifkan' })
    loadData()
  } catch (error: any) {
    setMessage({ type: 'error', text: error.message || 'Gagal mengaktifkan anggota' })
  } finally {
    setLoading(false)
    setShowKonfirmasi(false)
    setSelectedAnggota(null)
    setTimeout(() => setMessage(null), 3000)
  }
}

  const handleNonaktifkan = async () => {
  if (!selectedAnggota) return

  setLoading(true)
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('anggota')
      .update({ is_active: false })
      .eq('id', selectedAnggota.id)

    if (error) throw error


    setMessage({ type: 'success', text: 'Anggota berhasil dinonaktifkan' })
    loadData()
  } catch (error: any) {
    setMessage({ type: 'error', text: error.message || 'Gagal menonaktifkan anggota' })
  } finally {
    setLoading(false)
    setShowKonfirmasi(false)
    setSelectedAnggota(null)
    setTimeout(() => setMessage(null), 3000)
  }
}

  const handleHapusPermanen = async () => {
  if (!selectedAnggota) return

  setLoading(true)
  const supabase = createClient()

  try {
    // Kembalikan nomor ke stok
    await supabase
      .from('stok_nomor_anggota')
      .update({ status: 'tersedia' })
      .eq('nomor_anggota', selectedAnggota.nomor_anggota)


    // Hapus anggota
    const { error } = await supabase
      .from('anggota')
      .delete()
      .eq('id', selectedAnggota.id)

    if (error) throw error

    setMessage({ type: 'success', text: 'Anggota berhasil dihapus permanen' })
    loadData()
    loadStokNomor()
  } catch (error: any) {
    setMessage({ type: 'error', text: error.message || 'Gagal menghapus anggota' })
  } finally {
    setLoading(false)
    setShowKonfirmasi(false)
    setSelectedAnggota(null)
    setTimeout(() => setMessage(null), 3000)
  }
}

  // ========== RENDER ==========
  const filteredData = filterData()

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Daftar Anggota</h1>
          <p className="text-slate-600 mt-1">Kelola data anggota komunitas</p>
        </div>
        <Button onClick={() => setShowTambah(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Anggota
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterRole={filterRole}
        onRoleChange={setFilterRole}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterKelas={filterKelas}
        onKelasChange={setFilterKelas}
        kelasList={kelasList}
        totalData={data.length}
        filteredCount={filteredData.length}
        onRefresh={loadData}
      />

      {/* Table */}
      <AnggotaTable
        data={filteredData}
        loading={loading}
        userRole={userRole}
        onEdit={(a) => {
          setSelectedAnggota(a)
          setShowEdit(true)
        }}
        onNonaktifkan={(a) => {
          setSelectedAnggota(a)
          setKonfirmasiMode('nonaktifkan')
          setShowKonfirmasi(true)
        }}
        onAktifkan={(a) => {
          setSelectedAnggota(a)
          setKonfirmasiMode('aktifkan')
          setShowKonfirmasi(true)
        }}
        onHapusPermanen={(a) => {
          setSelectedAnggota(a)
          setKonfirmasiMode('hapus')
          setShowKonfirmasi(true)
        }}
        onDetail={(a) => {
          setSelectedAnggota(a)
          setShowDetail(true)
        }}
      />

      {/* Modals */}
      {showTambah && (
        <ModalTambah
          open={showTambah}
          onOpenChange={setShowTambah}
          onSuccess={(password, email) => {
            setGeneratedPassword(password)
            setPasswordEmail(email)
            setShowPassword(true)
            loadData()
          }}
        />
      )}

      {showEdit && selectedAnggota && (
        <ModalEdit
          open={showEdit}
          onOpenChange={setShowEdit}
          anggota={selectedAnggota}
          onSuccess={() => {
            loadData()
            setShowEdit(false)
            setSelectedAnggota(null)
          }}
          onResetPassword={(password, email) => {
            setGeneratedPassword(password)
            setPasswordEmail(email)
            setShowPassword(true)
          }}
        />
      )}

      {showDetail && selectedAnggota && (
        <ModalDetail
          open={showDetail}
          onOpenChange={setShowDetail}
          anggota={selectedAnggota}
        />
      )}

      {showKonfirmasi && selectedAnggota && (
        <ModalKonfirmasi
          open={showKonfirmasi}
          onOpenChange={setShowKonfirmasi}
          mode={konfirmasiMode}
          anggota={selectedAnggota}
          onConfirm={() => {
            if (konfirmasiMode === 'aktifkan') {
              handleAktifkan()
            } else if (konfirmasiMode === 'nonaktifkan') {
              handleNonaktifkan()
            } else {
              handleHapusPermanen()
            }
          }}
        />
      )}

      {showPassword && (
        <ModalPassword
          open={showPassword}
          onOpenChange={setShowPassword}
          email={passwordEmail}
          password={generatedPassword}
        />
      )}
    </div>
  )
}