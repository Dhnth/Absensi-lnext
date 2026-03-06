"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award, Zap, Calendar, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { Anggota } from "../types";

interface ModalDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anggota: Anggota | null;
}

export default function ModalDetail({
  open,
  onOpenChange,
  anggota,
}: ModalDetailProps) {
  if (!anggota) return null;

  const getInitials = (nama: string) => {
    return nama
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-700">Admin</Badge>;
      case "pengurus":
        return <Badge className="bg-blue-100 text-blue-700">Pengurus</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700">Anggota</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Anggota</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Avatar & Nama */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 flex-shrink-0">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {getInitials(anggota.nama)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-semibold truncate">{anggota.nama}</h3>
              <p className="text-sm text-slate-500">{anggota.nomor_anggota}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg col-span-1 sm:col-span-2">
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-medium break-all">{anggota.email || "-"}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Role</p>
              <div className="mt-1">{getRoleBadge(anggota.role)}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Kelas</p>
              <p className="font-medium truncate">{anggota.kelas || "-"}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Status</p>
              <p className="font-medium">
                {anggota.is_active ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <UserCheck className="w-4 h-4" /> Aktif
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <UserX className="w-4 h-4" /> Tidak Aktif
                  </span>
                )}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Terdaftar</p>
              <p className="font-medium truncate">
                {format(new Date(anggota.created_at), "dd MMM yyyy", {
                  locale: id,
                })}
              </p>
            </div>
          </div>

          {/* Statistik */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Award className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <p className="text-xl font-bold text-blue-600 truncate">
                {anggota.poin}
              </p>
              <p className="text-xs text-slate-500">Total Poin</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
              <p className="text-xl font-bold text-yellow-600 truncate">
                {anggota.streak}
              </p>
              <p className="text-xs text-slate-500">Streak</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Calendar className="w-5 h-5 mx-auto mb-1 text-green-600" />
              <p className="text-sm font-medium text-green-600 truncate">
                {anggota.last_absen
                  ? format(new Date(anggota.last_absen), "dd MMM", {
                      locale: id,
                    })
                  : "-"}
              </p>
              <p className="text-xs text-slate-500">Terakhir</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
