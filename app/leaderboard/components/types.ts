export interface AnggotaRank {
  id: number
  nomor_anggota: string
  nama: string
  kelas: string | null
  poin: number
  streak: number
  role: string
  is_active: boolean
}

export interface PodiumData {
  id: number
  nomor_anggota: string
  nama: string
  poin: number
  streak: number
}
