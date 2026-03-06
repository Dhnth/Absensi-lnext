'use client'

import { useState, useMemo, memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChevronLeft, ChevronRight, Edit, Loader2, Users, Clock } from 'lucide-react'
import { DaftarAbsensiRow } from './types'

interface TabelDaftarAbsensiProps {
  data: DaftarAbsensiRow[]
  loading: boolean
  onEdit: (row: DaftarAbsensiRow) => void
  canManage: boolean
  itemsPerPage?: number
}

const StatusBadge = memo(({ status, jam }: { status: string; jam?: string }) => {
  switch (status) {
    case 'hadir':
      return (
        <div className="flex items-center gap-1">
          <Badge className="bg-green-100 text-green-700">Hadir</Badge>
          {jam && <span className="text-xs text-slate-500">{jam}</span>}
        </div>
      )
    case 'izin':
      return (
        <div className="flex items-center gap-1">
          <Badge className="bg-yellow-100 text-yellow-700">Izin</Badge>
          {jam && <span className="text-xs text-slate-500">{jam}</span>}
        </div>
      )
    case 'sakit':
      return (
        <div className="flex items-center gap-1">
          <Badge className="bg-orange-100 text-orange-700">Sakit</Badge>
          {jam && <span className="text-xs text-slate-500">{jam}</span>}
        </div>
      )
    case 'alpha':
      return <Badge className="bg-red-100 text-red-700">Alpha</Badge>
    default:
      return <Badge className="bg-slate-100 text-slate-700">-</Badge>
  }
})

StatusBadge.displayName = 'StatusBadge'

export const TabelDaftarAbsensi = memo(function TabelDaftarAbsensi({
  data,
  loading,
  onEdit,
  canManage,
  itemsPerPage = 20,
}: TabelDaftarAbsensiProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return data.slice(start, start + itemsPerPage)
  }, [data, currentPage, itemsPerPage])

  const getInitials = (nama: string) => {
    return nama
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3 w-16">No</TableHead>
              <TableHead className="px-4 py-3">Nomor</TableHead>
              <TableHead className="px-4 py-3">Nama</TableHead>
              <TableHead className="px-4 py-3">Kelas</TableHead>
              <TableHead className="px-4 py-3">Status</TableHead>
              <TableHead className="px-4 py-3 text-right">Poin</TableHead>
              {canManage && <TableHead className="px-4 py-3 text-center">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 7 : 6} className="text-center py-12 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Tidak ada data</p>
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row, index) => {
                const no = (currentPage - 1) * itemsPerPage + index + 1
                const jam = row.absensi?.created_at
                  ? new Date(row.absensi.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : undefined

                return (
                  <TableRow key={`${row.anggota.id}-${row.status}`} className="hover:bg-slate-50">
                    <TableCell className="px-4 py-3 font-mono">{no}</TableCell>
                    <TableCell className="px-4 py-3 font-mono">
                      {row.anggota.nomor_anggota}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(row.anggota.nama)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{row.anggota.nama}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">{row.anggota.kelas || '-'}</TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge status={row.status} jam={jam} />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-semibold text-blue-600">
                      {row.poin}
                    </TableCell>
                    {canManage && (
                      <TableCell className="px-4 py-3 text-center">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data.length > itemsPerPage && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-slate-500">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
