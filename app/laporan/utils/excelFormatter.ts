import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { RekapAnggota } from '../components/types'

interface DataAbsensi {
  tanggal: string
  data: Array<{
    nomor_anggota: string
    nama: string
    kelas: string
    status: string
    poin: number
  }>
}

// ========== TAMBAHKAN PARAMETER semuaAnggota ==========
export async function exportToExcel(
  rekapData: RekapAnggota[],
  detailData: DataAbsensi[],
  semuaAnggota: Array<{ nomor_anggota: string; nama: string; kelas: string }>, // ← TAMBAHKAN
  startDate: string,
  endDate: string
) {
  const workbook = new ExcelJS.Workbook()

  // Sheet: Detail Harian
  await createDetailSheet(workbook, detailData, semuaAnggota, startDate, endDate) // ← KIRIM

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `laporan-absensi-${startDate}-to-${endDate}.xlsx`)
}

async function createDetailSheet(
  workbook: ExcelJS.Workbook,
  data: DataAbsensi[],
  semuaAnggota: Array<{ nomor_anggota: string; nama: string; kelas: string }>, // ← TERIMA
  startDate: string,
  endDate: string
) {
  const sheet = workbook.addWorksheet('Laporan Absensi')

  const start = new Date(startDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const end = new Date(endDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // ========== GANTI: Ambil dari semuaAnggota, BUKAN dari data ==========
  const anggotaList = [...semuaAnggota].sort((a, b) =>
    a.nomor_anggota.localeCompare(b.nomor_anggota)
  )

  // Urutkan tanggal
  const sortedData = [...data].sort(
    (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
  )

  // ========== BUAT RENTANG TANGGAL LENGKAP ==========
  const tanggalList: Date[] = []
  const startDateObj = new Date(startDate)
  const endDateObj = new Date(endDate)

  for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
    tanggalList.push(new Date(d))
  }

  const titleRow = sheet.addRow(['LAPORAN ABSENSI KOMUNITAS'])

  sheet.mergeCells(`A${titleRow.number}:F${titleRow.number}`)

  for (let i = 1; i <= 6; i++) {
    const cell = titleRow.getCell(i)

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    }

    cell.font = {
      bold: true,
      size: 16,
      color: { argb: 'FFFFFFFF' },
    }

    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }
  }
  // Periode
  const periodeRow = sheet.addRow([`Periode: ${start} - ${end}`])

  sheet.mergeCells(`A${periodeRow.number}:F${periodeRow.number}`)

  for (let i = 1; i <= 6; i++) {
    const cell = periodeRow.getCell(i)

    cell.font = {
      bold: true,
      size: 12,
      color: { argb: 'FF4F46E5' },
    }

    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }
  }

  // Empty row
  sheet.addRow([])

  // ========== HEADER UTAMA ==========
  const headerRow = sheet.addRow([
    'No',
    'Nomor Anggota',
    'Nama',
    'Kelas',
    'Kehadiran',
    'Total Poin',
  ])

  for (let i = 1; i <= 6; i++) {
    const cell = headerRow.getCell(i)

    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
    }

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF97316' },
    }

    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }

    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    }
  }

  // ========== DATA PER TANGGAL ==========
  tanggalList.forEach((tanggal, tanggalIdx) => {
    // ← GUNAKAN tanggalList
    const dayName = tanggal.toLocaleDateString('id-ID', { weekday: 'long' })
    const dateStr = tanggal.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Cari data absensi untuk tanggal ini
    const tanggalStr = tanggal.toISOString().split('T')[0]
    const item = sortedData.find((d) => d.tanggal.split('T')[0] === tanggalStr)

    // Header Tanggal
    const dateHeaderRow = sheet.addRow([`${dayName}, ${dateStr}`])

    sheet.mergeCells(`A${dateHeaderRow.number}:F${dateHeaderRow.number}`)

    for (let i = 1; i <= 6; i++) {
      const cell = dateHeaderRow.getCell(i)

      cell.font = {
        bold: true,
        italic: true,
        size: 12,
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F0FA' },
      }

      cell.alignment = {
        vertical: 'middle',
      }
    }

    // Buat Map untuk absensi di tanggal ini (jika ada)
    const absensiMap = new Map()
    if (item) {
      item.data.forEach((absen) => {
        absensiMap.set(absen.nomor_anggota, absen)
      })
    }

    // ========== LOOP SEMUA ANGGOTA (setiap tanggal) ==========
    anggotaList.forEach((anggota, idx) => {
      const absen = absensiMap.get(anggota.nomor_anggota)

      let status = 'Alpha'
      let poin = 0

      if (absen) {
        status =
          absen.status === 'hadir'
            ? 'Hadir'
            : absen.status === 'izin'
              ? 'Izin'
              : absen.status === 'sakit'
                ? 'Sakit'
                : 'Alpha'
        poin = absen.poin
      }

      const row = sheet.addRow([
        idx + 1,
        anggota.nomor_anggota,
        anggota.nama,
        anggota.kelas || '-',
        status,
        poin,
      ])

      // Style berdasarkan status
      const statusCell = row.getCell(5)
      if (status === 'Hadir') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22C55E' } } // Hijau
        statusCell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      } else if (status === 'Izin' || status === 'Sakit') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAB308' } } // Kuning
        statusCell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      } else if (status === 'Alpha') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } } // Merah
        statusCell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      }

      // Border untuk semua cell
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
        cell.alignment = { vertical: 'middle' }
      })

      // Alignment
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' }
      row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' }
      row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' }

      // Warna selang-seling untuk kolom kiri
      if (idx % 2 === 1) {
        for (let i = 1; i <= 4; i++) {
          const cell = row.getCell(i)
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' },
          }
        }
      }
    })

    // Empty row setelah setiap tanggal
    sheet.addRow([])
  })

  // ========== RINGKASAN DI BAWAH ==========
  const summaryStartRow = (sheet.lastRow?.number ?? 0) + 2

  // Hitung total dari SEMUA DATA (termasuk yang alpha otomatis)
  let totalHadir = 0,
    totalIzin = 0,
    totalSakit = 0,
    totalAlpha = 0,
    totalPoin = 0

  // Loop setiap tanggal dan setiap anggota
  tanggalList.forEach((tanggal) => {
    const tanggalStr = tanggal.toISOString().split('T')[0]
    const item = sortedData.find((d) => d.tanggal.split('T')[0] === tanggalStr)

    const absensiMap = new Map()
    if (item) {
      item.data.forEach((absen) => {
        absensiMap.set(absen.nomor_anggota, absen)
      })
    }

    anggotaList.forEach((anggota) => {
      const absen = absensiMap.get(anggota.nomor_anggota)

      if (absen) {
        switch (absen.status) {
          case 'hadir':
            totalHadir++
            totalPoin += absen.poin
            break
          case 'izin':
            totalIzin++
            totalPoin += absen.poin
            break
          case 'sakit':
            totalSakit++
            totalPoin += absen.poin
            break
          case 'alpha':
            totalAlpha++
            break
        }
      } else {
        totalAlpha++ // Tidak ada absen = Alpha
      }
    })
  })

  // Buat tabel ringkasan dengan style
  const summaryTitle = sheet.addRow(['RINGKASAN'])

  sheet.mergeCells(`A${summaryTitle.number}:D${summaryTitle.number}`)

  for (let i = 1; i <= 4; i++) {
    const cell = summaryTitle.getCell(i)

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    }

    cell.font = {
      bold: true,
      size: 14,
      color: { argb: 'FFFFFFFF' },
    }

    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }
  }

  // Data ringkasan
  const summaryData = [
    ['Total Anggota', anggotaList.length],
    ['Total Hadir', totalHadir],
    ['Total Izin', totalIzin],
    ['Total Sakit', totalSakit],
    ['Total Alpha', totalAlpha],
    ['Total Poin', totalPoin],
    [],
    [
      'Rata-rata Poin per Anggota',
      anggotaList.length ? Math.round(totalPoin / anggotaList.length) : 0,
    ],
  ]

  summaryData.forEach(([label, value]) => {
    const row = sheet.addRow([label, '', '', value])

    sheet.mergeCells(`A${row.number}:C${row.number}`)

    row.getCell(1).font = { bold: true }

    row.getCell(1).alignment = {
      horizontal: 'left',
      vertical: 'middle',
    }

    row.getCell(4).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }
  })

  // Border untuk ringkasan
  for (let i = summaryStartRow; i <= sheet.lastRow?.number; i++) {
    const row = sheet.getRow(i)
    for (let c = 1; c <= 4; c++) {
      const cell = row.getCell(c)

      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    }
  }

  // Set column widths
  sheet.columns = [
    { width: 5 }, // No
    { width: 15 }, // Nomor Anggota
    { width: 30 }, // Nama
    { width: 10 }, // Kelas
    { width: 12 }, // Kehadiran
    { width: 10 }, // Total Poin
  ]
}
