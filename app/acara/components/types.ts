export interface Acara {
  id: number
  judul: string
  deskripsi: string | null
  lokasi: string | null
  tanggal_mulai: string
  tanggal_selesai: string
  tipe: 'umum' | 'rapat' | 'kegiatan' | 'libur'
  created_by: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  creator?: {
    nama: string
    nomor_anggota: string
  }
}

export interface KehadiranAcara {
  id: number
  acara_id: number
  anggota_id: number
  status: 'hadir' | 'tidak' | 'izin'
  created_at: string
  anggota?: {
    nama: string
    nomor_anggota: string
  }
}

export interface AcaraFormData {
  judul: string
  deskripsi: string
  lokasi: string
  tanggal_mulai: string
  tanggal_selesai: string
  tipe: 'umum' | 'rapat' | 'kegiatan' | 'libur'
}
