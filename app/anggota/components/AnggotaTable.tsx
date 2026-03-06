'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Users, Loader2 } from 'lucide-react'
import { AnggotaRow } from './AnggotaRow'
import { Anggota } from './types'

interface AnggotaTableProps {
  data: Anggota[]
  loading: boolean
  userRole: string
  onEdit: (anggota: Anggota) => void
  onNonaktifkan: (anggota: Anggota) => void
  onAktifkan: (anggota: Anggota) => void
  onHapusPermanen: (anggota: Anggota) => void
  onDetail: (anggota: Anggota) => void
  itemsPerPage?: number
}

export function AnggotaTable({
  data,
  loading,
  userRole,
  onEdit,
  onNonaktifkan,
  onAktifkan,
  onHapusPermanen,
  onDetail,
  itemsPerPage = 10,
}: AnggotaTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const getCurrentPageData = () => {
    const start = (currentPage - 1) * itemsPerPage
    return data.slice(start, start + itemsPerPage)
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
              <TableHead className="px-6 py-4 w-[100px]">Nomor</TableHead>
              <TableHead className="px-6 py-4">Nama</TableHead>
              <TableHead className="px-6 py-4 hidden md:table-cell">Email</TableHead>
              <TableHead className="px-6 py-4 hidden lg:table-cell">Kelas</TableHead>
              <TableHead className="px-6 py-4">Role</TableHead>
              <TableHead className="px-6 py-4">Status</TableHead>
              <TableHead className="px-6 py-4 text-right">Poin</TableHead>
              <TableHead className="px-6 py-4 text-right">Streak</TableHead>
              <TableHead className="px-6 py-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Tidak ada data anggota</p>
                </TableCell>
              </TableRow>
            ) : (
              getCurrentPageData().map((anggota) => (
                <AnggotaRow
                  key={anggota.id}
                  anggota={anggota}
                  userRole={userRole}
                  onDetail={onDetail}
                  onEdit={onEdit}
                  onNonaktifkan={onNonaktifkan}
                  onAktifkan={onAktifkan}
                  onHapusPermanen={onHapusPermanen}
                />
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data.length > itemsPerPage && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
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
}
