export interface Kelas {
  id: number
  nama: string
  deskripsi: string | null
  created_at: string
  updated_at: string
}

export interface KelasFormData {
  nama: string
  deskripsi: string
}
