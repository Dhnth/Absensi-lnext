'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ModalHapusProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  judul: string
  onConfirm: () => void
  loading?: boolean
}

export default function ModalHapus({
  open,
  onOpenChange,
  judul,
  onConfirm,
  loading = false,
}: ModalHapusProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Hapus Acara
          </DialogTitle>
          <DialogDescription>
            <p>Apakah Anda yakin ingin menghapus acara &quot;{judul}&quot;?</p>
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <p className="text-sm text-slate-500">
            Tindakan ini akan menghapus acara secara permanen dan tidak dapat dibatalkan. Semua data
            kehadiran terkait juga akan ikut terhapus.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              'Ya, Hapus'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
