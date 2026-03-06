'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale/id'
import { Acara } from './types'

interface ModalDaftarAcaraProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tanggal: Date | null
  acara: Acara[]
  onSelectAcara: (acara: Acara) => void
}

export default function ModalDaftarAcara({
  open,
  onOpenChange,
  tanggal,
  acara,
  onSelectAcara,
}: ModalDaftarAcaraProps) {
  if (!tanggal) return null

  const getTipeColor = (tipe: string) => {
    switch (tipe) {
      case 'umum':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'rapat':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'kegiatan':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'libur':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const formatWaktu = (tanggal: string) => {
    return format(new Date(tanggal), 'HH:mm')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Acara {format(tanggal, 'EEEE, dd MMMM yyyy', { locale: id })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {acara.length === 0 ? (
            <p className="text-center py-8 text-slate-400">Tidak ada acara pada tanggal ini</p>
          ) : (
            acara.map((a) => (
              <div
                key={a.id}
                onClick={() => {
                  onSelectAcara(a)
                  onOpenChange(false)
                }}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all
                  hover:shadow-md hover:scale-[1.02]
                  ${getTipeColor(a.tipe)}
                `}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-base">{a.judul}</h3>
                  <Badge className={getTipeColor(a.tipe)}>{a.tipe}</Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>
                      {formatWaktu(a.tanggal_mulai)} - {formatWaktu(a.tanggal_selesai)}
                    </span>
                  </div>

                  {a.lokasi && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span>{a.lokasi}</span>
                    </div>
                  )}

                  {a.deskripsi && (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{a.deskripsi}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
