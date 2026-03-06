export interface RekapAnggota {
  anggota_id: number
  nomor_anggota: string
  nama: string
  kelas: string | null
  total_hadir: number
  total_izin: number
  total_sakit: number
  total_alpha: number
  total_absen: number
  total_poin: number
}

export interface StatistikLaporan {
  total_anggota: number
  total_hadir: number
  total_izin: number
  total_sakit: number
  total_alpha: number
  total_poin: number
  rata_poin: number
  presensi_rate: number
}