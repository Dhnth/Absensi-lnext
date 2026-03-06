'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Clock3,
  HelpCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale/id'
import { DaftarAbsensiRow } from './types'

interface ModalEditAbsensiProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: DaftarAbsensiRow | null
  tanggal: string
  onSave: (status: string, keterangan: string) => Promise<void>
  loading?: boolean
}

// ========== DEFINE UNION TYPE ==========
type StatusType = 'hadir' | 'izin' | 'sakit' | 'alpha'

interface StatusOption {
  value: StatusType
  label: string
  icon: JSX.Element
  bgColor: string
  borderColor: string
  activeColor: string
  textColor: string
}
// =======================================

export default function ModalEditAbsensi({
  open,
  onOpenChange,
  data,
  tanggal,
  onSave,
  loading = false,
}: ModalEditAbsensiProps) {
  const [status, setStatus] = useState<StatusType>(data?.status as StatusType || 'alpha')
  const [keterangan, setKeterangan] = useState(data?.absensi?.keterangan || '')

  const [error, setError] = useState('')

  if (!data) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((status === 'izin' || status === 'sakit') && !keterangan.trim()) {
      setError('Keterangan wajib diisi untuk Izin/Sakit')
      return
    }

    setError('')
    await onSave(status, keterangan)
  }

  const statusOptions: StatusOption[] = [
    {
      value: 'hadir',
      label: 'Hadir',
      icon: <CheckCircle2 className="w-5 h-5" />,
      bgColor: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200',
      activeColor: 'bg-green-500 text-white border-green-600',
      textColor: 'text-green-700',
    },
    {
      value: 'izin',
      label: 'Izin',
      icon: <Clock3 className="w-5 h-5" />,
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
      borderColor: 'border-yellow-200',
      activeColor: 'bg-yellow-500 text-white border-yellow-600',
      textColor: 'text-yellow-700',
    },
    {
      value: 'sakit',
      label: 'Sakit',
      icon: <HelpCircle className="w-5 h-5" />,
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      borderColor: 'border-orange-200',
      activeColor: 'bg-orange-500 text-white border-orange-600',
      textColor: 'text-orange-700',
    },
    {
      value: 'alpha',
      label: 'Alpha',
      icon: <XCircle className="w-5 h-5" />,
      bgColor: 'bg-red-50 hover:bg-red-100',
      borderColor: 'border-red-200',
      activeColor: 'bg-red-500 text-white border-red-600',
      textColor: 'text-red-700',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Kehadiran</DialogTitle>
          <DialogDescription className="text-base">
            <span className="font-semibold">{data.anggota.nama}</span> •{' '}
            {data.anggota.nomor_anggota} • {data.anggota.kelas || '-'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Info Tanggal */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-medium">
                Tanggal: {format(new Date(tanggal), 'EEEE, dd MMMM yyyy', { locale: id })}
              </span>
            </div>
            {data.absensi && (
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-2 pt-2 border-t border-slate-200">
                <Clock className="w-4 h-4" />
                <span>
                  Absen sebelumnya: {format(new Date(data.absensi.created_at), 'HH:mm')} WIB
                </span>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Status Options */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Pilih Status Kehadiran</Label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => {
                const isActive = status === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    className={`
                      relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                      ${
                        isActive
                          ? option.activeColor + ' shadow-lg scale-[1.02]'
                          : `${option.bgColor} ${option.borderColor} hover:scale-[1.01]`
                      }
                    `}
                  >
                    <div
                      className={`
                      mb-2 transition-colors duration-200
                      ${isActive ? 'text-white' : option.textColor}
                    `}
                    >
                      {option.icon}
                    </div>
                    <span
                      className={`
                      font-semibold text-sm transition-colors duration-200
                      ${isActive ? 'text-white' : 'text-slate-700'}
                    `}
                    >
                      {option.label}
                    </span>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Keterangan untuk Izin/Sakit */}
          {(status === 'izin' || status === 'sakit') && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="keterangan" className="text-base">
                {status === 'izin' ? '📝 Alasan Izin' : '🏥 Alasan Sakit'}
              </Label>
              <Textarea
                id="keterangan"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder={`Tuliskan alasan ${status}...`}
                rows={4}
                className="resize-none border-2 focus:border-blue-500 transition-colors"
                required
              />
              <p className="text-xs text-slate-500">
                * Keterangan akan tercatat di riwayat absensi
              </p>
            </div>
          )}

          {/* Poin Info */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <span className="font-semibold">Informasi Poin:</span>
              {status === 'hadir' && 'Hadir = +10 poin'}
              {(status === 'izin' || status === 'sakit') &&
                `${status === 'izin' ? 'Izin' : 'Sakit'} = +5 poin`}
              {status === 'alpha' && 'Alpha = 0 poin'}
            </p>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}