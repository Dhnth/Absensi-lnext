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
import { ChevronLeft, ChevronRight, Award, Zap, Medal, Loader2, Users } from 'lucide-react'
import { AnggotaRank } from './types'

interface TabelLeaderboardProps {
  data: AnggotaRank[]
  loading: boolean
  itemsPerPage?: number
}

const RankBadge = memo(({ rank }: { rank: number }) => {
  if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500" />
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />
  return <span className="font-mono text-sm text-slate-400">#{rank}</span>
})
RankBadge.displayName = 'RankBadge'

export const TabelLeaderboard = memo(function TabelLeaderboard({
  data,
  loading,
  itemsPerPage = 15,
}: TabelLeaderboardProps) {
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
              <TableHead className="px-4 py-3 w-20">Peringkat</TableHead>
              <TableHead className="px-4 py-3">Anggota</TableHead>
              <TableHead className="px-4 py-3 hidden md:table-cell">Kelas</TableHead>
              <TableHead className="px-4 py-3 text-right">Poin</TableHead>
              <TableHead className="px-4 py-3 text-right">Streak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Tidak ada data anggota</p>
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((anggota, index) => {
                const rank = (currentPage - 1) * itemsPerPage + index + 1
                return (
                  <TableRow key={anggota.id} className="hover:bg-slate-50">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <RankBadge rank={rank} />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(anggota.nama)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{anggota.nama}</p>
                          <p className="text-xs text-slate-500">{anggota.nomor_anggota}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 hidden md:table-cell">
                      {anggota.kelas || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-blue-600">{anggota.poin}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span>{anggota.streak}</span>
                      </div>
                    </TableCell>
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
