'use client'

import { useState, useMemo, memo, useRef, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Search, ChevronLeft, ChevronRight, Users, Loader2 } from 'lucide-react'
import { RekapAnggota } from './types'

interface TabelRekapProps {
  data: RekapAnggota[]
  loading: boolean
  itemsPerPage?: number
}

export const TabelRekap = memo(function TabelRekap({
  data,
  loading,
  itemsPerPage = 10,
}: TabelRekapProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const prevDataLengthRef = useRef(data.length)

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data
    const term = searchTerm.toLowerCase()
    return data.filter(
      (item) =>
        item.nomor_anggota.toLowerCase().includes(term) ||
        item.nama.toLowerCase().includes(term) ||
        item.kelas?.toLowerCase().includes(term)
    )
  }, [data, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredData.slice(start, start + itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])

  // Reset page when filter changes - dengan useRef untuk menghindari warning
  useEffect(() => {
    if (prevDataLengthRef.current !== filteredData.length) {
      setCurrentPage(1)
      prevDataLengthRef.current = filteredData.length
    }
  }, [filteredData])

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
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nomor atau nama anggota..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3">No</TableHead>
              <TableHead className="px-4 py-3">Nomor</TableHead>
              <TableHead className="px-4 py-3">Nama</TableHead>
              <TableHead className="px-4 py-3">Kelas</TableHead>
              <TableHead className="px-4 py-3 text-center">Hadir</TableHead>
              <TableHead className="px-4 py-3 text-center">Izin</TableHead>
              <TableHead className="px-4 py-3 text-center">Sakit</TableHead>
              <TableHead className="px-4 py-3 text-center">Alpha</TableHead>
              <TableHead className="px-4 py-3 text-right">Total Poin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Tidak ada data</p>
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item, index) => {
                const no = (currentPage - 1) * itemsPerPage + index + 1
                return (
                  <TableRow key={item.anggota_id} className="hover:bg-slate-50">
                    <TableCell className="px-4 py-3 font-mono">{no}</TableCell>
                    <TableCell className="px-4 py-3 font-mono">{item.nomor_anggota}</TableCell>
                    <TableCell className="px-4 py-3 font-medium">{item.nama}</TableCell>
                    <TableCell className="px-4 py-3">{item.kelas || '-'}</TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Badge className="bg-green-100 text-green-700">{item.total_hadir}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Badge className="bg-yellow-100 text-yellow-700">{item.total_izin}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Badge className="bg-orange-100 text-orange-700">{item.total_sakit}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Badge className="bg-red-100 text-red-700">{item.total_alpha}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-semibold text-blue-600">
                      {item.total_poin}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filteredData.length > itemsPerPage && (
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

TabelRekap.displayName = 'TabelRekap'
