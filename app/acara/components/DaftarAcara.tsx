"use client"

import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale/id"
import { Acara } from "./types"

interface DaftarAcaraProps {
  acara: Acara[]
  onSelect: (acara: Acara) => void
}

const TipeBadge = memo(({ tipe }: { tipe: string }) => {
  const colors = {
    umum: "bg-blue-100 text-blue-700",
    rapat: "bg-purple-100 text-purple-700",
    kegiatan: "bg-green-100 text-green-700",
    libur: "bg-red-100 text-red-700"
  }
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${colors[tipe as keyof typeof colors] || colors.umum}`}>
      {tipe}
    </span>
  )
})

export const DaftarAcara = memo(function DaftarAcara({ acara, onSelect }: DaftarAcaraProps) {
  if (acara.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Tidak ada acara</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {acara.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(item)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{item.judul}</h3>
                  <TipeBadge tipe={item.tipe} />
                </div>

                <div className="space-y-1 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      {format(new Date(item.tanggal_mulai), 'EEEE, dd MMM yyyy HH:mm', { locale: id })} - 
                      {format(new Date(item.tanggal_selesai), ' HH:mm', { locale: id })}
                    </span>
                  </div>

                  {item.lokasi && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{item.lokasi}</span>
                    </div>
                  )}

                  {item.deskripsi && (
                    <p className="mt-2 text-slate-500 line-clamp-2">
                      {item.deskripsi}
                    </p>
                  )}
                </div>
              </div>

              <Button variant="ghost" size="sm">
                Detail
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})