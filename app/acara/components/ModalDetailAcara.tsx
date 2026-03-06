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
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Edit, Trash2, ExternalLink, Clock } from "lucide-react"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale/id"
import { Acara } from "./types"

interface ModalDetailAcaraProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  acara: Acara | null
  onEdit: () => void
  onDelete: (acara: Acara) => void
  onLihatDetail: (id: number) => void
  canManage: boolean
}

export default function ModalDetailAcara({
  open,
  onOpenChange,
  acara,
  onEdit,
  onDelete,
  onLihatDetail,
  canManage
}: ModalDetailAcaraProps) {
  // Jika acara null, jangan render apa-apa
  if (!acara) return null

  const getTipeColor = (tipe: string) => {
    switch(tipe) {
      case 'umum': return 'bg-blue-100 text-blue-700'
      case 'rapat': return 'bg-purple-100 text-purple-700'
      case 'kegiatan': return 'bg-green-100 text-green-700'
      case 'libur': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  // ========== FORMAT TANGGAL AMAN ==========
  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return '-'
    
    try {
      const date = new Date(tanggal)
      if (isNaN(date.getTime())) return '-'
      
      return format(date, 'EEEE, dd MMMM yyyy HH:mm', { locale: localeID })
    } catch {
      return '-'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{acara.judul}</span>
            <Badge className={getTipeColor(acara.tipe)}>
              {acara.tipe}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detail lengkap acara
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Waktu */}
          <div className="flex gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-slate-500">Mulai</p>
              <p className="font-medium">{formatTanggal(acara.tanggal_mulai)}</p>
              <p className="text-sm text-slate-500 mt-2">Selesai</p>
              <p className="font-medium">{formatTanggal(acara.tanggal_selesai)}</p>
            </div>
          </div>

          {/* Lokasi */}
          {acara.lokasi && (
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-500">Lokasi</p>
                <p className="font-medium">{acara.lokasi}</p>
              </div>
            </div>
          )}

          {/* Deskripsi */}
          {acara.deskripsi && (
            <div className="mt-2">
              <p className="text-sm text-slate-500 mb-1">Deskripsi</p>
              <p className="text-slate-700 whitespace-pre-line">{acara.deskripsi}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onLihatDetail(acara.id)}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Lihat Detail Lengkap
          </Button>
          
          {canManage && (
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onEdit} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => onDelete(acara)} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Hapus
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}