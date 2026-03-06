export interface Anggota {
  id: number
  nomor_anggota: string
  nama: string
  kelas: string | null
  is_active: boolean
}

export interface Absensi {
  id: number
  anggota_id: number
  tanggal: string
  status: 'hadir' | 'izin' | 'sakit' | 'alpha'
  poin: number
  keterangan: string | null
  created_at: string
  updated_at: string
}

export interface AbsensiWithAnggota extends Absensi {
  anggota: Anggota
}

export interface DaftarAbsensiRow {
  anggota: Anggota
  absensi: Absensi | null // null berarti alpha
  status: 'hadir' | 'izin' | 'sakit' | 'alpha'
  poin: number
  jam?: string // jam absen jika hadir/izin/sakit
}

export interface FilterDaftar {
  tanggal: string
  kelas: string
  search: string
}