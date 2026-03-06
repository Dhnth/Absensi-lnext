'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { id } from 'date-fns/locale/id'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface PengaturanAbsen {
  id: number
  tanggal: string
  status: 'buka' | 'tutup'
  keterangan: string | null
}

export default function PengaturanAbsenPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PengaturanAbsen[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    tanggal: format(new Date(), 'yyyy-MM-dd'),
    status: 'tutup',
    keterangan: '',
  })
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // State untuk modal hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{
    id: number
    tanggal: string
    keterangan: string
  } | null>(null)

  const loadData = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('pengaturan_absen')
      .select('*')
      .order('tanggal', { ascending: false })
      .limit(30)

    setData(data || [])
  }

  useEffect(() => {
    const fetchData = async () => {
      await loadData()
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from('pengaturan_absen')
          .update({
            status: formData.status,
            keterangan: formData.keterangan,
          })
          .eq('id', editingId)

        if (error) throw error
        setMessage({ type: 'success', text: 'Berhasil diupdate' })
      } else {
        // Insert
        const { error } = await supabase.from('pengaturan_absen').insert({
          tanggal: formData.tanggal,
          status: formData.status,
          keterangan: formData.keterangan,
        })

        if (error) {
          if (error.code === '23505') {
            setMessage({ type: 'error', text: 'Tanggal sudah diatur' })
          } else {
            throw error
          }
        } else {
          setMessage({ type: 'success', text: 'Berhasil disimpan' })
        }
      }

      loadData()
      setShowForm(false)
      setEditingId(null)
      setFormData({
        tanggal: format(new Date(), 'yyyy-MM-dd'),
        status: 'tutup',
        keterangan: '',
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'error', text: 'Gagal menyimpan' })
      }
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleDeleteClick = (id: number, tanggal: string, keterangan: string) => {
    setItemToDelete({ id, tanggal, keterangan })
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    setDeleteLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from('pengaturan_absen').delete().eq('id', itemToDelete.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Berhasil dihapus' })
      loadData()
      setShowDeleteModal(false)
      setItemToDelete(null)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'error', text: 'Gagal menghapus' })
      }
    } finally {
      setDeleteLoading(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleEdit = (item: PengaturanAbsen) => {
    setEditingId(item.id)
    setFormData({
      tanggal: item.tanggal,
      status: item.status,
      keterangan: item.keterangan || '',
    })
    setShowForm(true)
  }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    const supabase = createClient()
    const newStatus = currentStatus === 'buka' ? 'tutup' : 'buka'

    try {
      const { error } = await supabase
        .from('pengaturan_absen')
        .update({ status: newStatus })
        .eq('id', id)

      if (!error) {
        loadData()
      }
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Pengaturan Absensi</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Atur hari libur atau tutup absensi
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Jadwal Libur
        </Button>
      </div>

      {/* Pesan Notifikasi */}
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

      {/* Form Tambah/Edit */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Tambah'} Jadwal Libur</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  disabled={!!editingId}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="tutup">🔒 Tutup (Libur)</option>
                  <option value="buka">🔓 Buka (Aktif)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  placeholder="Contoh: Libur Nasional, Hari Raya, dll"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Daftar Jadwal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            Jadwal Tutup Absensi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-slate-400">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm sm:text-base">Belum ada jadwal libur</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  {/* Versi Mobile */}
                  <div className="block sm:hidden">
                    <div
                      className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer"
                      onClick={() => toggleExpand(item.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-1.5 h-8 rounded-full ${
                            item.status === 'buka' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {format(new Date(item.tanggal), 'dd/MM/yyyy')}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                item.status === 'buka'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {item.status === 'buka' ? 'Buka' : 'Tutup'}
                            </span>
                          </div>
                          {item.keterangan && (
                            <p className="text-xs text-slate-500 truncate mt-1">
                              {item.keterangan}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {expandedId === item.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Actions */}
                    {expandedId === item.id && (
                      <div className="flex items-center justify-end gap-2 p-3 bg-white border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(item.id, item.status)}
                          className="h-8 px-2"
                        >
                          {item.status === 'buka' ? (
                            <Lock className="w-4 h-4 text-red-500" />
                          ) : (
                            <Unlock className="w-4 h-4 text-green-500" />
                          )}
                          <span className="ml-1 text-xs">
                            {item.status === 'buka' ? 'Tutup' : 'Buka'}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="h-8 px-2"
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                          <span className="ml-1 text-xs">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(item.id, item.tanggal, item.keterangan || '')}
                          className="h-8 px-2"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                          <span className="ml-1 text-xs">Hapus</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Versi Desktop */}
                  <div className="hidden sm:flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-2 h-10 rounded-full ${
                          item.status === 'buka' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {format(new Date(item.tanggal), 'EEEE, dd MMMM yyyy', {
                              locale: id,
                            })}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              item.status === 'buka'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {item.status === 'buka' ? '🔓 Buka' : '🔒 Tutup'}
                          </span>
                        </div>
                        {item.keterangan && (
                          <p className="text-sm text-slate-600">{item.keterangan}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(item.id, item.status)}
                      >
                        {item.status === 'buka' ? (
                          <Lock className="w-4 h-4 text-red-500" />
                        ) : (
                          <Unlock className="w-4 h-4 text-green-500" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(item.id, item.tanggal, item.keterangan || '')}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Konfirmasi Hapus */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Hapus Jadwal Libur
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus jadwal libur ini?
            </DialogDescription>
          </DialogHeader>

          {itemToDelete && (
            <div className="py-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Tanggal</span>
                  <span className="font-medium">
                    {format(new Date(itemToDelete.tanggal), 'EEEE, dd MMMM yyyy', { locale: id })}
                  </span>
                </div>
                {itemToDelete.keterangan && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Keterangan</span>
                    <span className="font-medium">{itemToDelete.keterangan}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-4">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Menghapus...
                </>
              ) : (
                'Ya, Hapus'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
