'use client'

import { useState, useMemo, memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from 'date-fns'
import { id } from 'date-fns/locale/id'
import { Acara } from './types'
import ModalDaftarAcara from './ModalDaftarAcara'

interface CalendarViewProps {
  acara: Acara[]
  onSelectDate: (date: Date) => void
  onSelectAcara: (acara: Acara) => void
}

// Fungsi untuk mendapatkan warna berdasarkan tipe
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

export const CalendarView = memo(function CalendarView({
  acara,
  onSelectDate,
  onSelectAcara,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDaftarModal, setShowDaftarModal] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Group acara per tanggal (multi-day)
  const acaraByDate = useMemo(() => {
    const map = new Map()

    acara.forEach((a) => {
      const mulai = new Date(a.tanggal_mulai)
      const selesai = new Date(a.tanggal_selesai)

      // Loop setiap hari dalam rentang acara
      const currentDate = new Date(mulai)
      while (currentDate <= selesai) {
        const tgl = format(currentDate, 'yyyy-MM-dd')

        if (!map.has(tgl)) map.set(tgl, [])
        map.get(tgl).push(a)

        // Tambah 1 hari
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    return map
  }, [acara])

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // Handler untuk klik "+x lainnya"
  const handleShowMore = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDate(date)
    setShowDaftarModal(true)
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {/* Header Kalender */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </h2>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Nama Hari */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Tanggal */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, i) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayAcara = acaraByDate.get(dateStr) || []
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isTodayDate = isToday(day)

              return (
                <div
                  key={i}
                  onClick={() => onSelectDate(day)}
                  className={`
                    min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors
                    ${isCurrentMonth ? 'bg-white' : 'bg-slate-50 opacity-50'}
                    ${isTodayDate ? 'border-blue-500 border-2' : 'border-slate-200'}
                    hover:bg-blue-50 hover:border-blue-300
                  `}
                >
                  <div className="text-right text-sm p-1">
                    <span className={isTodayDate ? 'font-bold text-blue-600' : ''}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Acara di tanggal ini (max 2) */}
                  <div className="space-y-1">
                    {dayAcara.slice(0, 2).map((a: Acara) => (
                      <div
                        key={a.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectAcara(a)
                        }}
                        className={`
                          text-xs p-1 rounded truncate hover:opacity-80 cursor-pointer
                          ${getTipeColor(a.tipe)}
                        `}
                        title={a.judul}
                      >
                        {a.judul}
                      </div>
                    ))}
                    {dayAcara.length > 2 && (
                      <div
                        onClick={(e) => handleShowMore(day, e)}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline pl-1 cursor-pointer font-medium"
                      >
                        +{dayAcara.length - 2} lainnya
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend dengan warna */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded"></span>
              <span>Umum</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-purple-500 rounded"></span>
              <span>Rapat</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded"></span>
              <span>Kegiatan</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              <span>Libur</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Daftar Acara */}
      <ModalDaftarAcara
        open={showDaftarModal}
        onOpenChange={setShowDaftarModal}
        tanggal={selectedDate}
        acara={selectedDate ? acaraByDate.get(format(selectedDate, 'yyyy-MM-dd')) || [] : []}
        onSelectAcara={onSelectAcara}
      />
    </>
  )
})
