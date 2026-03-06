"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Acara, AcaraFormData } from "./types"

interface ModalAcaraProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'tambah' | 'edit'
  data?: Acara | null
  onSave: (data: AcaraFormData, id?: number) => Promise<void>
}

export default function ModalAcara({ open, onOpenChange, mode, data, onSave }: ModalAcaraProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState<AcaraFormData>({
    judul: "",
    deskripsi: "",
    lokasi: "",
    tanggal_mulai: formatDateForInput(new Date()),
    tanggal_selesai: formatDateForInput(new Date()),
    tipe: "umum"
  })

  // Helper: format date untuk input datetime-local
  function formatDateForInput(date: Date): string {
    const d = new Date(date)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  }

  useEffect(() => {
    if (data && mode === 'edit') {
      setFormData({
        judul: data.judul,
        deskripsi: data.deskripsi || "",
        lokasi: data.lokasi || "",
        tanggal_mulai: formatDateForInput(new Date(data.tanggal_mulai)),
        tanggal_selesai: formatDateForInput(new Date(data.tanggal_selesai)),
        tipe: data.tipe
      })
    } else {
      setFormData({
        judul: "",
        deskripsi: "",
        lokasi: "",
        tanggal_mulai: formatDateForInput(new Date()),
        tanggal_selesai: formatDateForInput(new Date()),
        tipe: "umum"
      })
    }
    setError("")
  }, [data, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.judul.trim()) {
      setError("Judul acara wajib diisi")
      return
    }

    const mulai = new Date(formData.tanggal_mulai)
    const selesai = new Date(formData.tanggal_selesai)

    if (selesai < mulai) {
      setError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      await onSave(formData, data?.id)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan acara")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'tambah' ? 'Buat Acara Baru' : 'Edit Acara'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'tambah' 
              ? 'Tambahkan acara baru ke kalender' 
              : 'Ubah detail acara yang sudah ada'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Judul */}
          <div className="space-y-2">
            <Label htmlFor="judul">Judul Acara <span className="text-red-500">*</span></Label>
            <Input
              id="judul"
              value={formData.judul}
              onChange={(e) => setFormData({...formData, judul: e.target.value})}
              placeholder="Contoh: Rapat Bulanan"
              required
            />
          </div>

          {/* Tipe */}
          <div className="space-y-2">
            <Label htmlFor="tipe">Tipe Acara</Label>
            <Select 
              value={formData.tipe} 
              onValueChange={(value: any) => setFormData({...formData, tipe: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="umum">Umum</SelectItem>
                <SelectItem value="rapat">Rapat</SelectItem>
                <SelectItem value="kegiatan">Kegiatan</SelectItem>
                <SelectItem value="libur">Libur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tanggal Mulai */}
          <div className="space-y-2">
            <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
            <Input
              id="tanggal_mulai"
              type="datetime-local"
              value={formData.tanggal_mulai}
              onChange={(e) => setFormData({...formData, tanggal_mulai: e.target.value})}
              required
            />
          </div>

          {/* Tanggal Selesai */}
          <div className="space-y-2">
            <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
            <Input
              id="tanggal_selesai"
              type="datetime-local"
              value={formData.tanggal_selesai}
              onChange={(e) => setFormData({...formData, tanggal_selesai: e.target.value})}
              required
            />
          </div>

          {/* Lokasi */}
          <div className="space-y-2">
            <Label htmlFor="lokasi">Lokasi (Opsional)</Label>
            <Input
              id="lokasi"
              value={formData.lokasi}
              onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
              placeholder="Contoh: Ruang A, Online, dll"
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
              placeholder="Detail acara..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}