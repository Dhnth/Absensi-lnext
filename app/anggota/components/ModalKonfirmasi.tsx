"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCcw, Trash2, UserX, Loader2 } from "lucide-react"
import { Anggota } from "../types"

interface ModalKonfirmasiProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'aktifkan' | 'nonaktifkan' | 'hapus'
  anggota: Anggota | null
  onConfirm: () => void
  loading?: boolean
}

export default function ModalKonfirmasi({
  open,
  onOpenChange,
  mode,
  anggota,
  onConfirm,
  loading = false
}: ModalKonfirmasiProps) {
  if (!anggota) return null

  const getTitle = () => {
    switch(mode) {
      case 'aktifkan': return 'Aktifkan Anggota'
      case 'nonaktifkan': return 'Nonaktifkan Anggota'
      case 'hapus': return 'Hapus Permanen Anggota'
    }
  }

  const getDescription = () => {
    switch(mode) {
      case 'aktifkan':
        return `Anggota ${anggota.nama} akan dapat login kembali dan mengakses aplikasi.`
      case 'nonaktifkan':
        return `Anggota ${anggota.nama} tidak akan bisa login sampai diaktifkan kembali. Data absensi tetap tersimpan.`
      case 'hapus':
        return `ANDA YAKIN? Tindakan ini akan menghapus PERMANEN semua data ${anggota.nama} termasuk riwayat absensi. NOMOR ${anggota.nomor_anggota} akan kembali ke stok.`
    }
  }

  const getIcon = () => {
    switch(mode) {
      case 'aktifkan': return <RotateCcw className="w-6 h-6 text-green-600" />
      case 'nonaktifkan': return <UserX className="w-6 h-6 text-orange-600" />
      case 'hapus': return <Trash2 className="w-6 h-6 text-red-600" />
    }
  }

  const getButtonColor = () => {
    switch(mode) {
      case 'aktifkan': return 'bg-green-600 hover:bg-green-700'
      case 'nonaktifkan': return 'bg-orange-600 hover:bg-orange-700'
      case 'hapus': return 'bg-red-600 hover:bg-red-700'
    }
  }

  const getButtonText = () => {
    switch(mode) {
      case 'aktifkan': return 'Ya, Aktifkan'
      case 'nonaktifkan': return 'Ya, Nonaktifkan'
      case 'hapus': return 'Ya, Hapus Permanen'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <DialogTitle className="text-xl">{getTitle()}</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {mode === 'hapus' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-semibold">PERHATIAN:</span> Tindakan ini tidak dapat dibatalkan!
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="button"
            className={getButtonColor()}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              getButtonText()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}