export interface Anggota {
  id: number
  nomor_anggota: string
  nama: string
  email: string
  role: 'admin' | 'pengurus' | 'anggota'
  kelas: string | null
  poin: number
  streak: number
  is_active: boolean
  last_absen: string | null
  created_at: string
}
