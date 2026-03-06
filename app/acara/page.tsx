"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, List, Calendar as CalendarIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import dynamic from "next/dynamic"
import { CalendarView } from "./components/CalendarView"
import { DaftarAcara } from "./components/DaftarAcara"
import { Acara, AcaraFormData } from "./components/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

// Dynamic import untuk modal
const ModalAcara = dynamic(() => import("./components/ModalAcara").then(mod => mod.default), {
  loading: () => null,
  ssr: false
})

const ModalDetailAcara = dynamic(() => import("./components/ModalDetailAcara").then(mod => mod.default), {
  loading: () => null,
  ssr: false
})

const ModalHapus = dynamic(() => import("./components/ModalHapus").then(mod => mod.default), {
  loading: () => null,
  ssr: false
})

export default function AcaraPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [acara, setAcara] = useState<Acara[]>([])
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showHapusModal, setShowHapusModal] = useState(false)
  const [modalMode, setModalMode] = useState<'tambah' | 'edit'>('tambah')
  const [selectedAcara, setSelectedAcara] = useState<Acara | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [hapusLoading, setHapusLoading] = useState(false)

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

  // Load data
  useEffect(() => {
    loadAcara()
  }, [])

  const loadAcara = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('acara')
      .select('*')
      .order('tanggal_mulai', { ascending: true })
    
    if (error) {
      console.error("Error:", error)
      setMessage({ type: 'error', text: 'Gagal memuat acara' })
    } else {
      console.log("Data acara:", data)
      setAcara(data || [])
    }
    
    setLoading(false)
  }

  const handleSave = async (formData: AcaraFormData, id?: number) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (id) {
      // Edit
      const { error } = await supabase
        .from('acara')
        .update({
          judul: formData.judul,
          deskripsi: formData.deskripsi,
          lokasi: formData.lokasi,
          tanggal_mulai: formData.tanggal_mulai,
          tanggal_selesai: formData.tanggal_selesai,
          tipe: formData.tipe
        })
        .eq('id', id)
      
      if (error) throw error

      // ========== LOG AKTIVITAS EDIT ACARA ==========
      await supabase.from("log_aktivitas").insert({
  anggota_id: user?.id,
  aksi: "update_acara",
  detail: {
    acara_id: id,
    judul: formData.judul,
    tanggal_mulai: formData.tanggal_mulai,
    tanggal_selesai: formData.tanggal_selesai,
    tipe: formData.tipe,
    lokasi: formData.lokasi
  }
});
      // =============================================

      setMessage({ type: 'success', text: 'Acara berhasil diupdate' })
    } else {
      // Tambah
      const { error } = await supabase
        .from('acara')
        .insert({
          judul: formData.judul,
          deskripsi: formData.deskripsi,
          lokasi: formData.lokasi,
          tanggal_mulai: formData.tanggal_mulai,
          tanggal_selesai: formData.tanggal_selesai,
          tipe: formData.tipe,
          created_by: user?.id
        })
      
      if (error) throw error

      // ========== LOG AKTIVITAS TAMBAH ACARA ==========
      await supabase.from("log_aktivitas").insert({
  anggota_id: user?.id,
  aksi: "create_acara",
  detail: {
    judul: formData.judul,
    tanggal_mulai: formData.tanggal_mulai,
    tanggal_selesai: formData.tanggal_selesai,
    tipe: formData.tipe,
    lokasi: formData.lokasi
  }
});
      // ===============================================

      setMessage({ type: 'success', text: 'Acara berhasil ditambahkan' })
    }
    
    loadAcara()
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDelete = async () => {
    if (!selectedAcara) return

    setHapusLoading(true)
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('acara')
        .delete()
        .eq('id', selectedAcara.id)
      
      if (error) throw error
      
      setMessage({ type: 'success', text: 'Acara berhasil dihapus' })
      loadAcara()
      setShowHapusModal(false)
      setShowDetailModal(false)
      setSelectedAcara(null)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus acara' })
    } finally {
      setHapusLoading(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleSelectDate = useCallback((date: Date) => {
    console.log("Selected date:", date)
  }, [])

  const handleSelectAcara = useCallback((acara: Acara) => {
    console.log("SELECTED ACARA:", acara)
    setSelectedAcara(acara)
    setShowDetailModal(true)
  }, [])

  const handleLihatDetail = useCallback((id: number) => {
    router.push(`/acara/${id}`)
  }, [router])

  const handleHapusClick = useCallback((acara: Acara) => {
    setSelectedAcara(acara)
    setShowDetailModal(false)
    setShowHapusModal(true)
  }, [])

  const canManage = userRole === 'admin' || userRole === 'pengurus'

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Acara</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Kelola jadwal kegiatan komunitas
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Toggle View */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
              className="rounded-none"
            >
              <CalendarIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Tombol Tambah */}
          {canManage && (
            <Button onClick={() => {
              setSelectedAcara(null)
              setModalMode('tambah')
              setShowModal(true)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Buat Acara
            </Button>
          )}
        </div>
      </div>

      {/* Pesan Notifikasi */}
      {message && (
        <Alert className={message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Konten Utama */}
      {view === 'calendar' ? (
        <CalendarView
          acara={acara}
          onSelectDate={handleSelectDate}
          onSelectAcara={handleSelectAcara}
        />
      ) : (
        <DaftarAcara
          acara={acara}
          onSelect={handleSelectAcara}
        />
      )}

      {/* Modal Tambah/Edit Acara */}
      {showModal && (
        <ModalAcara
          open={showModal}
          onOpenChange={setShowModal}
          mode={modalMode}
          data={selectedAcara}
          onSave={handleSave}
        />
      )}

      {/* Modal Detail Acara */}
      <ModalDetailAcara
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        acara={selectedAcara}
        onEdit={() => {
          setShowDetailModal(false)
          setModalMode('edit')
          setShowModal(true)
        }}
        onDelete={handleHapusClick}
        onLihatDetail={handleLihatDetail}
        canManage={canManage}
      />

      {/* Modal Hapus Acara */}
      <ModalHapus
        open={showHapusModal}
        onOpenChange={setShowHapusModal}
        judul={selectedAcara?.judul || ''}
        onConfirm={handleDelete}
        loading={hapusLoading}
      />
    </div>
  )
}