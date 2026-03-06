'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Anggota } from './types'

interface ModalDeleteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  anggota: Anggota | null
  onSuccess: () => void
}

export default function ModalDelete({ open, onOpenChange, anggota, onSuccess }: ModalDeleteProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!anggota) return

    setLoading(true)
    setError('')

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('anggota')
        .update({ is_active: false })
        .eq('id', anggota.id)

      if (error) throw error

      onSuccess()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Gagal menonaktifkan anggota')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!anggota) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nonaktifkan Anggota</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menonaktifkan {anggota.nama}? Anggota tidak akan bisa login.
            Nomor akan tetap disimpan.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              'Ya, Nonaktifkan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
