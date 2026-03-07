'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Edit,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface StokNomor {
  id: number
  nomor_anggota: string
  status: 'tersedia' | 'terpakai'
}

export default function AdminStokNomor() {
  const [stok, setStok] = useState<StokNomor[]>([])
  const [filteredStok, setFilteredStok] = useState<StokNomor[]>([])
  const [loading, setLoading] = useState(true)
  const [newNomor, setNewNomor] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'semua' | 'tersedia' | 'terpakai'>('semua')
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // State untuk modal edit
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<StokNomor | null>(null)
  const [editStatus, setEditStatus] = useState<'tersedia' | 'terpakai'>('tersedia')
  const [editLoading, setEditLoading] = useState(false)
  const [isAnggotaExist, setIsAnggotaExist] = useState(false)
  const [anggotaName, setAnggotaName] = useState<string | null>(null)
  const [editDisabled, setEditDisabled] = useState(false)

  const loadStok = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('stok_nomor_anggota').select('*').order('nomor_anggota')

    setStok(data || [])
    setLoading(false)
  }

  const filterStok = () => {
    let filtered = [...stok]

    if (searchTerm) {
      filtered = filtered.filter((item) => item.nomor_anggota.includes(searchTerm))
    }

    if (filterStatus !== 'semua') {
      filtered = filtered.filter((item) => item.status === filterStatus)
    }

    setFilteredStok(filtered)
  }

  useEffect(() => {
    const fetchStok = async () => {
      await loadStok()
    }
    fetchStok()
  }, [])

  useEffect(() => {
    filterStok()
  }, [searchTerm, filterStatus, stok])

  const tambahNomor = async () => {
    if (!newNomor) {
      setMessage({ type: 'error', text: 'Masukkan nomor anggota' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    const supabase = createClient()

    const { error } = await supabase
      .from('stok_nomor_anggota')
      .insert({ nomor_anggota: newNomor, status: 'tersedia' })

    if (error) {
      setMessage({
        type: 'error',
        text: 'Nomor sudah ada atau gagal ditambahkan',
      })
    } else {
      setMessage({ type: 'success', text: 'Nomor berhasil ditambahkan' })
      setNewNomor('')
      loadStok()
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const hapusNomor = async (id: number) => {
    const supabase = createClient()

    const { error } = await supabase.from('stok_nomor_anggota').delete().eq('id', id)

    if (!error) {
      setMessage({ type: 'success', text: 'Nomor berhasil dihapus' })
      loadStok()
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const openEditModal = async (item: StokNomor) => {
    setEditingItem(item)
    setEditStatus(item.status)

    // Cek apakah nomor ini dipakai di tabel anggota
    const supabase = createClient()
    const { data: anggota } = await supabase
      .from('anggota')
      .select('id, nama')
      .eq('nomor_anggota', item.nomor_anggota)
      .maybeSingle()

    const exists = !!anggota
    setIsAnggotaExist(exists)
    setAnggotaName(anggota?.nama || null)

    // Jika nomor dipakai anggota, disable edit
    setEditDisabled(exists)

    setShowEditModal(true)
  }

  const handleEditSave = async () => {
    if (!editingItem) return

    setEditLoading(true)
    const supabase = createClient()

    try {
      // Update status (hanya jika tidak didisable)
      const { error } = await supabase
        .from('stok_nomor_anggota')
        .update({ status: editStatus })
        .eq('id', editingItem.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Status berhasil diupdate' })
      setShowEditModal(false)
      loadStok()
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengupdate status' })
    } finally {
      setEditLoading(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const generateBanyak = async () => {
    setLoading(true)
    const supabase = createClient()

    const lastNomor =
      stok.length > 0 ? Math.max(...stok.map((s) => parseInt(s.nomor_anggota))) : 2425000

    const newNomors = []
    for (let i = 1; i <= 10; i++) {
      newNomors.push({
        nomor_anggota: (lastNomor + i).toString(),
        status: 'tersedia',
      })
    }

    const { error } = await supabase.from('stok_nomor_anggota').insert(newNomors)

    if (!error) {
      setMessage({ type: 'success', text: '10 nomor berhasil digenerate' })
      loadStok()
    }
    setLoading(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const copyToClipboard = (nomor: string) => {
    navigator.clipboard.writeText(nomor)
    setMessage({ type: 'success', text: 'Nomor disalin!' })
    setTimeout(() => setMessage(null), 2000)
  }

  const getStatusBadge = (status: string) => {
    if (status === 'tersedia') {
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Tersedia</span>
      )
    } else {
      return (
        <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-full">Terpakai</span>
      )
    }
  }

  const tersedia = stok.filter((s) => s.status === 'tersedia').length
  const terpakai = stok.filter((s) => s.status !== 'tersedia').length

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Stok Nomor Anggota</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Kelola stok nomor anggota yang tersedia
        </p>
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

      {/* Statistik Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-500">Total Stok</p>
                <p className="text-xl sm:text-3xl font-bold">{stok.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                <Hash className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-500">Tersedia</p>
                <p className="text-xl sm:text-3xl font-bold text-green-600">{tersedia}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-500">Terpakai</p>
                <p className="text-xl sm:text-3xl font-bold text-slate-600">{terpakai}</p>
              </div>
              <div className="p-2 sm:p-3 bg-slate-100 rounded-full">
                <Hash className="w-4 h-4 sm:w-6 sm:h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Tambah */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Tambah Nomor Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="2425001"
              value={newNomor}
              onChange={(e) => setNewNomor(e.target.value)}
              className="sm:max-w-xs w-full"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <Button onClick={tambahNomor} disabled={loading} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah
              </Button>
              <Button
                variant="outline"
                onClick={generateBanyak}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <Copy className="w-4 h-4 mr-2" />
                Generate 10
              </Button>
              <Button variant="outline" disabled={loading} className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter & Search */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nomor..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              <Button
                variant={filterStatus === 'semua' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('semua')}
                className="flex-1 sm:flex-none"
              >
                Semua
              </Button>
              <Button
                variant={filterStatus === 'tersedia' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('tersedia')}
                className="flex-1 sm:flex-none text-green-600"
              >
                Tersedia
              </Button>
              <Button
                variant={filterStatus === 'terpakai' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('terpakai')}
                className="flex-1 sm:flex-none text-slate-600"
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
          <CardContent className="p-4 sm:p-6">
            {filteredStok.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-slate-400">
                <Hash className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm sm:text-base">Tidak ada nomor ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                {filteredStok.map((item) => (
                  <div
                    key={item.id}
                    className={`
                      relative p-2 sm:p-3 rounded-lg border transition-all
                      ${
                        item.status === 'tersedia'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-slate-50 border-slate-200 opacity-70'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-xs sm:text-sm font-medium">
                        {item.nomor_anggota}
                      </span>
                      <span className="text-[10px] sm:text-xs mt-1">
                        {getStatusBadge(item.status)}
                      </span>

                      {/* Tombol aksi */}
                      <div className="flex gap-1 mt-2">
                        {item.status === 'tersedia' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => copyToClipboard(item.nomor_anggota)}
                            title="Salin nomor"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-blue-500"
                          onClick={() => openEditModal(item)}
                          title="Edit status"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-500"
                          onClick={() => hapusNomor(item.id)}
                          title="Hapus nomor"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info footer */}
            <div className="mt-4 text-xs sm:text-sm text-slate-500 border-t pt-4">
              Menampilkan {filteredStok.length} dari {stok.length} nomor
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL EDIT STATUS - DENGAN DISABLE */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Status Nomor</DialogTitle>
            <DialogDescription>
              Ubah status nomor anggota {editingItem?.nomor_anggota}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nomor Anggota</Label>
              <Input value={editingItem?.nomor_anggota} disabled className="bg-slate-50" />
            </div>

            {/* Alert jika nomor dipakai anggota */}
            {isAnggotaExist && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 text-sm">
                  Nomor ini sedang digunakan oleh <strong>{anggotaName}</strong>. 
                  Tidak dapat mengubah status karena data anggota masih aktif.
                  {editStatus === 'terpakai' && (
                    <span className="block mt-1">Status sudah sesuai (Terpakai).</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Alert jika nomor tidak dipakai */}
            {!isAnggotaExist && editingItem?.status === 'terpakai' && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700 text-sm">
                  Nomor ini terdaftar sebagai &quot;Terpakai&quot; tapi tidak ada anggota yang menggunakan.
                  Anda dapat mengubah ke &quot;Tersedia&quot;.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editStatus}
                onValueChange={(value: 'tersedia' | 'terpakai') => setEditStatus(value)}
                disabled={editDisabled} // DISABLE jika nomor dipakai anggota
              >
                <SelectTrigger className={editDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tersedia">Tersedia</SelectItem>
                  <SelectItem value="terpakai">Terpakai</SelectItem>
                </SelectContent>
              </Select>
              
              {editDisabled ? (
                <p className="text-xs text-red-500">
                  * Tidak dapat diubah karena nomor masih digunakan oleh anggota aktif.
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  * Ubah ke &quot;Tersedia&quot; jika nomor tidak dipakai anggota.
                  <br />* Ubah ke &quot;Terpakai&quot; jika ingin menandai nomor sedang digunakan.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleEditSave} 
              disabled={editLoading || editDisabled} // DISABLE juga di tombol simpan
            >
              {editLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : editDisabled ? (
                'Tidak Dapat Diubah'
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}