"use client"

import { memo } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Zap,
  RotateCcw,
  AlertTriangle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Anggota } from "../types"

interface AnggotaRowProps {
  anggota: Anggota
  onDetail: (anggota: Anggota) => void
  onEdit: (anggota: Anggota) => void
  onNonaktifkan: (anggota: Anggota) => void
  onAktifkan: (anggota: Anggota) => void
  onHapusPermanen: (anggota: Anggota) => void
  userRole: string
}

export const AnggotaRow = memo(function AnggotaRow({ 
  anggota, 
  onDetail, 
  onEdit, 
  onNonaktifkan,
  onAktifkan,
  onHapusPermanen,
  userRole
}: AnggotaRowProps) {
  
  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-700">Admin</Badge>
      case 'pengurus':
        return <Badge className="bg-blue-100 text-blue-700">Pengurus</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-700">Anggota</Badge>
    }
  }

  const getInitials = (nama: string) => {
    return nama
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isAdmin = userRole === 'admin'

  return (
    <TableRow className="hover:bg-slate-50">
      {/* Nomor */}
      <TableCell className="px-6 py-4 font-mono font-medium">
        {anggota.nomor_anggota}
      </TableCell>

      {/* Nama + Avatar */}
      <TableCell className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(anggota.nama)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{anggota.nama}</p>
            <p className="text-xs text-slate-500 md:hidden">
              {anggota.email || '-'}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Email (hidden di mobile) */}
      <TableCell className="px-6 py-4 hidden md:table-cell">
        {anggota.email || '-'}
      </TableCell>

      {/* Kelas (hidden di tablet) */}
      <TableCell className="px-6 py-4 hidden lg:table-cell">
        {anggota.kelas || '-'}
      </TableCell>

      {/* Role */}
      <TableCell className="px-6 py-4">
        {getRoleBadge(anggota.role)}
      </TableCell>

      {/* Status */}
      <TableCell className="px-6 py-4">
        {anggota.is_active ? (
          <Badge className="bg-green-100 text-green-700">
            <UserCheck className="w-3 h-3 mr-1" />
            Aktif
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700">
            <UserX className="w-3 h-3 mr-1" />
            Nonaktif
          </Badge>
        )}
      </TableCell>

      {/* Poin */}
      <TableCell className="px-6 py-4 text-right font-semibold text-blue-600">
        {anggota.poin}
      </TableCell>

      {/* Streak */}
      <TableCell className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>{anggota.streak}</span>
        </div>
      </TableCell>

      {/* Aksi */}
      <TableCell className="px-6 py-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            
            {/* Detail - untuk semua */}
            <DropdownMenuItem onClick={() => onDetail(anggota)}>
              <Eye className="w-4 h-4 mr-2" />
              Detail
            </DropdownMenuItem>

            {/* Edit - untuk semua */}
            <DropdownMenuItem onClick={() => onEdit(anggota)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Aktifkan/Nonaktifkan */}
            {anggota.is_active ? (
              <DropdownMenuItem 
                onClick={() => onNonaktifkan(anggota)}
                className="text-orange-600"
              >
                <UserX className="w-4 h-4 mr-2" />
                Nonaktifkan
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => onAktifkan(anggota)}
                className="text-green-600"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Aktifkan
              </DropdownMenuItem>
            )}

            {/* Hapus Permanen (hanya admin) */}
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onHapusPermanen(anggota)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Permanen
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
})