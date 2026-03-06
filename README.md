# 📚 Aplikasi Absensi Komunitas

Aplikasi absensi digital berbasis web untuk komunitas/kelas yang dibangun dengan **Next.js 15**, **TypeScript**, dan **Supabase**. Sistem ini dilengkapi dengan manajemen anggota, absensi digital, sistem poin & streak, leaderboard, serta QR Code untuk absen cepat.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview)

## ✨ Fitur Lengkap

### 👥 Manajemen Pengguna
- **3 Level Role**: Admin, Pengurus, Anggota
- Login menggunakan **Email + Password** atau **Google OAuth**
- Sistem pairing nomor anggota dengan akun

### 📅 Absensi Digital
- **Scan QR Code** - Absen cepat 1 detik
- **Input Nomor Anggota** - Absen manual untuk petugas
- **Ajukan Izin/Sakit** - Khusus untuk role anggota
- **Daftar Absensi** - Lihat semua anggota per tanggal
- **Edit Status** - Admin/pengurus bisa edit status kehadiran

### 🏆 Sistem Poin & Leaderboard
- **Hadir**: +10 poin
- **Izin/Sakit**: +5 poin
- **Alpha**: 0 poin
- **Bonus Streak**: +5 poin setiap 7 hari berturut-turut
- **Leaderboard Interaktif** - Peringkat 3 besar + tabel lengkap

### 📊 Dashboard & Laporan
- **Dashboard Interaktif** - Statistik real-time, grafik
- **Top 5 Anggota** - Peringkat poin
- **Acara Terdekat** - Jadwal kegiatan
- **Export Excel** - Laporan dengan styling profesional
- **Filter Periode & Kelas** - Rekap kehadiran

### 📱 QR Code
- QR unik untuk setiap anggota (berisi nomor anggota)
- Download QR untuk dicetak/disimpan
- Scan QR untuk absen langsung

### 📅 Manajemen Acara
- Buat, edit, hapus acara
- Kalender interaktif
- Konfirmasi kehadiran acara
- Multi-day events

### ⚙️ Pengaturan
- Manajemen kelas (CRUD)
- Stok nomor anggota
- Pengaturan hari libur
- Log aktivitas (admin)

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
|----------|-----------|
| Frontend | Next.js 15, TypeScript |
| Styling | TailwindCSS, shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| QR Code | html5-qrcode, qrcode.react |
| Excel | ExcelJS, file-saver |
| Animasi | Framer Motion |
| Date Handling | date-fns |
| Form | React Hook Form, Zod |

## 📋 Prasyarat Sistem

- Node.js >= 18.0
- npm atau yarn
- Akun Supabase (gratis)
- Git

## 🚀 Cara Installasi Lengkap

### 1. Clone Repository
```bash
git clone https://github.com/username/absensi-komunitas.git
cd absensi-komunitas
```

### 2. Install Dependencies
```bash
npm install
# atau
yarn install
```

### 3. Install Dependencies Tambahan
```bash
# Install shadcn/ui components
npx shadcn@latest init
# Pilih: Default, Slate, Yes

# Install komponen yang diperlukan
npx shadcn@latest add button card input label dialog alert
npx shadcn@latest add select table badge avatar dropdown-menu
npx shadcn@latest add textarea radio-group progress

# Install library tambahan
npm install @supabase/supabase-js @supabase/ssr
npm install @supabase/ssr
npm install date-fns
npm install lucide-react
npm install qrcode.react
npm install html5-qrcode
npm install bcryptjs
npm install @types/bcryptjs --save-dev
npm install use-debounce
npm install exceljs file-saver
npm install @types/file-saver --save-dev
npm install framer-motion
```

### 4. Setup Environment Variables
Buat file `.env.local` di root folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Setup Database di Supabase

#### a. Buat project di Supabase
1. Buka [supabase.com](https://supabase.com)
2. Klik "New Project"
3. Isi:
   - Name: `absensi-komunitas`
   - Database Password: (buat password kuat)
   - Region: `Singapore` (untuk Indonesia)
4. Tunggu sampai selesai (2-3 menit)

#### b. Jalankan SQL berikut di Supabase SQL Editor

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel anggota
CREATE TABLE anggota (
  id BIGSERIAL PRIMARY KEY,
  nomor_anggota VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  nama VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'anggota',
  kelas VARCHAR(50),
  poin INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  last_absen DATE,
  foto VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel stok nomor anggota
CREATE TABLE stok_nomor_anggota (
  id BIGSERIAL PRIMARY KEY,
  nomor_anggota VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'tersedia',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel kelas
CREATE TABLE kelas (
  id BIGSERIAL PRIMARY KEY,
  nama VARCHAR(50) UNIQUE NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel absensi
CREATE TABLE absensi (
  id BIGSERIAL PRIMARY KEY,
  anggota_id BIGINT REFERENCES anggota(id) ON DELETE CASCADE,
  tanggal DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL,
  poin INTEGER NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(anggota_id, tanggal)
);

-- 5. Tabel acara
CREATE TABLE acara (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  deskripsi TEXT,
  lokasi VARCHAR(255),
  tanggal_mulai TIMESTAMPTZ NOT NULL,
  tanggal_selesai TIMESTAMPTZ NOT NULL,
  tipe VARCHAR(50) DEFAULT 'umum',
  created_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel kehadiran_acara
CREATE TABLE kehadiran_acara (
  id BIGSERIAL PRIMARY KEY,
  acara_id BIGINT REFERENCES acara(id) ON DELETE CASCADE,
  anggota_id BIGINT REFERENCES anggota(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'hadir',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(acara_id, anggota_id)
);

-- 7. Tabel pengaturan_absen
CREATE TABLE pengaturan_absen (
  id BIGSERIAL PRIMARY KEY,
  tanggal DATE UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'buka',
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel log_aktivitas (opsional)
CREATE TABLE log_aktivitas (
  id BIGSERIAL PRIMARY KEY,
  anggota_id BIGINT REFERENCES anggota(id) ON DELETE SET NULL,
  aksi VARCHAR(100) NOT NULL,
  detail JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX idx_absensi_tanggal ON absensi(tanggal);
CREATE INDEX idx_absensi_anggota ON absensi(anggota_id);
CREATE INDEX idx_acara_tanggal ON acara(tanggal_mulai);
CREATE INDEX idx_log_created_at ON log_aktivitas(created_at);
```

#### c. Insert Data Awal

```sql
-- Insert data kelas
INSERT INTO kelas (nama, deskripsi) VALUES
('A', 'Kelas A'),
('B', 'Kelas B'),
('C', 'Kelas C'),
('X', 'Kelas X'),
('XI', 'Kelas XI'),
('XII', 'Kelas XII');

-- Generate stok nomor awal (100 nomor dari 2425001 - 2425100)
INSERT INTO stok_nomor_anggota (nomor_anggota, status)
SELECT '2425' || LPAD(gs::text, 3, '0'), 'tersedia'
FROM generate_series(1, 100) AS gs;

-- Buat admin pertama (ganti email & password dengan yang diinginkan)
-- Password: admin123 (hash dengan bcrypt)
-- Hash: $2a$10$YourHashedPasswordHere
INSERT INTO anggota (nomor_anggota, email, password, nama, role, is_active) 
VALUES ('2425001', 'admin@komunitas.com', '$2a$10$YourHashedPasswordHere', 'Administrator', 'admin', true);
```

### 6. Setup Authentication di Supabase

1. Buka dashboard Supabase → **Authentication** → **Providers**
2. **Email provider**:
   - Enable "Email"
   - Disable "Confirm email" (untuk development)

3. **Google provider** (opsional):
   - Enable "Google"
   - Masukkan Client ID & Secret dari Google Cloud Console

### 7. Generate Stok Nomor Awal (Alternatif)
Jika tidak ingin pakai SQL, setelah aplikasi jalan, login sebagai admin dan buka:
`/admin/stok-nomor` → klik "Generate 10"

### 8. Jalankan Aplikasi
```bash
npm run dev
# atau
yarn dev
```

Akses aplikasi di: **http://localhost:3000**

## 🔑 Akun Default

### Admin
| Email | Password | Nomor Anggota |
|-------|----------|---------------|
| admin@komunitas.com | admin123 | 2425001 |

### Pengurus
| Email | Password | Nomor Anggota |
|-------|----------|---------------|
| pengurus@komunitas.com | pengurus123 | 2425002 |

### Anggota
| Email | Password | Nomor Anggota |
|-------|----------|---------------|
| anggota@komunitas.com | anggota123 | 2425003 |

*Catatan: Buat akun-akun tersebut melalui halaman register, lalu ubah role di database.*

## 📁 Struktur Proyek

```
absensi-komunitas/
├── app/                          # Next.js App Router
│   ├── (auth)/                    # Halaman auth
│   │   ├── login/
│   │   ├── register/
│   │   ├── lupa-password/
│   │   └── reset-password/
│   ├── (dashboard)/                # Halaman dashboard
│   │   └── page.tsx
│   ├── absen/                      # Fitur absensi
│   │   ├── manual/
│   │   ├── qr/
│   │   ├── ajukan/
│   │   └── daftar/
│   ├── anggota/                    # Manajemen anggota
│   │   ├── page.tsx
│   │   └── components/
│   ├── acara/                      # Manajemen acara
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   └── components/
│   ├── admin/                      # Halaman admin
│   │   ├── kelas/
│   │   ├── stok-nomor/
│   │   └── pengaturan-absen/
│   ├── leaderboard/                 # Leaderboard
│   │   └── page.tsx
│   ├── laporan/                     # Laporan
│   │   └── page.tsx
│   └── qr-saya/                     # QR Code pribadi
│       └── page.tsx
├── components/                      # Komponen UI
│   └── ui/                          # shadcn/ui components
├── lib/                              # Utility functions
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── public/                           # Static files
├── styles/                           # Global styles
├── .env.local                        # Environment variables
├── next.config.js                     # Next.js config
├── tailwind.config.js                 # Tailwind config
├── tsconfig.json                      # TypeScript config
└── package.json                       # Dependencies
```

## 👥 Matriks Hak Akses

| Fitur | Admin | Pengurus | Anggota |
|-------|-------|----------|---------|
| Dashboard | ✅ | ✅ | ✅ |
| Absen QR | ✅ | ✅ | ✅ |
| QR Code Saya | ✅ | ✅ | ✅ |
| Absen Manual | ✅ | ✅ | ❌ |
| Daftar Absensi | ✅ | ✅ | ✅ |
| Ajukan Izin/Sakit | ✅ | ✅ | ✅ |
| Daftar Anggota | ✅ | ✅ | ❌ |
| Tambah Anggota | ✅ | ✅ | ❌ |
| Edit Anggota | ✅ | ✅ | ❌ |
| Stok Nomor | ✅ | ❌ | ❌ |
| Leaderboard | ✅ | ✅ | ✅ |
| Acara | ✅ | ✅ | ✅ |
| Laporan | ✅ | ✅ | ❌ |
| Pengaturan Absen | ✅ | ❌ | ❌ |
| Manajemen Kelas | ✅ | ❌ | ❌ |

## 🎯 Panduan Penggunaan

### Untuk Admin & Pengurus
1. **Absen Manual**: Buka menu `Absensi` → `Absen Manual`, input nomor anggota
2. **Absen QR**: Buka `Absensi` → `Absen QR`, arahkan kamera
3. **Kelola Anggota**: Buka `Manajemen Anggota` → `Daftar Anggota`
4. **Atur Libur**: Buka `Admin` → `Pengaturan Absen`
5. **Lihat Laporan**: Buka `Laporan`, pilih periode, export Excel

### Untuk Anggota
1. **QR Code Saya**: Buka `Absensi` → `QR Code Saya`, download QR
2. **Ajukan Izin/Sakit**: Buka `Absensi` → `Ajukan Izin/Sakit`
3. **Lihat Kehadiran**: Buka `Absensi` → `Daftar Absensi`
4. **Cek Peringkat**: Buka `Leaderboard`

## 📊 Demo Fitur

### Dashboard
- Statistik real-time
- Top 5 anggota berpoin
- Acara terdekat
- Aksi cepat

### Absensi via QR Code
- Scan otomatis
- Loading state saat proses
- Informasi detail setelah absen
- Kamera otomatis nyala lagi

### Leaderboard
- Podium 3 besar
- Tabel peringkat
- Filter kelas
- Info poin & streak

### Laporan Excel
- 2 sheet: Rekap & Detail Harian
- Warna berdasarkan status
- Total per kolom
- Format profesional

## 🐛 Troubleshooting

### Error: "duplicate key value violates unique constraint"
```sql
-- Cek duplikat di database
SELECT anggota_id, tanggal, COUNT(*) 
FROM absensi 
GROUP BY anggota_id, tanggal 
HAVING COUNT(*) > 1;

-- Hapus duplikat
DELETE FROM absensi 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY anggota_id, tanggal ORDER BY created_at DESC) as rn
    FROM absensi
  ) t
  WHERE rn > 1
);
```

### Error: Kamera tidak muncul
- Pastikan HTTPS di production
- Cek izin kamera di browser
- Coba browser lain (Chrome/Edge)

### Error: Module not found
```bash
# Install ulang dependencies
rm -rf node_modules package-lock.json
npm install
```

### Error: Supabase connection
- Cek `.env.local` sudah benar
- Cek di dashboard Supabase → Settings → API
- Pastikan project aktif

## 🚀 Deployment

### Deploy ke Vercel (Rekomendasi)

1. **Push ke GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
# Buat repo di GitHub, lalu:
git remote add origin https://github.com/username/absensi-komunitas.git
git push -u origin main
```

2. **Buka Vercel**
- Buka [vercel.com](https://vercel.com)
- Login dengan GitHub
- Klik "Add New" → "Project"
- Pilih repository `absensi-komunitas`

3. **Setting Environment Variables**
Tambahkan:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**
- Klik "Deploy"
- Tunggu hingga selesai
- Aplikasi live di `https://absensi-komunitas.vercel.app`

### Deploy ke Netlify

1. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment variables**:
   - Tambahkan seperti di Vercel

<!-- ## 📸 Screenshot

| Dashboard | Absen QR |
|-----------|----------|
| ![Dashboard](https://via.placeholder.com/400x200?text=Dashboard) | ![Absen QR](https://via.placeholder.com/400x200?text=Absen+QR) |

| Leaderboard | Laporan Excel |
|-------------|---------------|
| ![Leaderboard](https://via.placeholder.com/400x200?text=Leaderboard) | ![Laporan](https://via.placeholder.com/400x200?text=Laporan) | -->

## 🤝 Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -m 'Add feature'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

### Standar Commit
- `feat:` - Fitur baru
- `fix:` - Perbaikan bug
- `docs:` - Dokumentasi
- `style:` - Perubahan styling
- `refactor:` - Refaktor kode
- `test:` - Penambahan test
- `chore:` - Tugas rutin

## 📄 Lisensi

MIT License - Hak cipta © 2026

```
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Credit

Dibangun menggunakan:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [date-fns](https://date-fns.org/)

---

<!-- **Dibuat oleh Dhanis Fathan Gunawan** - [GitHub](https://github.com/username) | [LinkedIn](https://linkedin.com/in/username) -->

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.