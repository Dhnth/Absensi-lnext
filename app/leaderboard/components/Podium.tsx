'use client'

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Medal, Trophy, Zap } from 'lucide-react'

interface PodiumProps {
  pertama: {
    nama: string
    nomor_anggota: string
    poin: number
    streak: number
  } | null
  kedua: {
    nama: string
    nomor_anggota: string
    poin: number
    streak: number
  } | null
  ketiga: {
    nama: string
    nomor_anggota: string
    poin: number
    streak: number
  } | null
}

export const Podium = memo(function Podium({ pertama, kedua, ketiga }: PodiumProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      {/* Juara 2 (kiri) */}
      <Card className="order-2 md:order-1 bg-gradient-to-b from-slate-50 to-white">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <Medal className="w-12 h-12 text-slate-400" />
          </div>
          {kedua ? (
            <>
              <p className="text-sm text-slate-500 mb-1">#{kedua.nomor_anggota}</p>
              <p className="font-bold text-lg truncate">{kedua.nama}</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{kedua.poin}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>{kedua.streak}</span>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-2">Juara 2</p>
            </>
          ) : (
            <p className="text-slate-300">-</p>
          )}
        </CardContent>
      </Card>

      {/* Juara 1 (tengah) */}
      <Card className="order-1 md:order-2 bg-gradient-to-b from-yellow-50 to-white border-yellow-200 -mt-4 md:mt-0">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>
          {pertama ? (
            <>
              <p className="text-sm text-yellow-600 mb-1">#{pertama.nomor_anggota}</p>
              <p className="font-bold text-xl truncate">{pertama.nama}</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-lg">{pertama.poin}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">{pertama.streak}</span>
                </div>
              </div>
              <p className="text-xs font-medium text-yellow-600 mt-2">Juara 1</p>
            </>
          ) : (
            <p className="text-slate-300">-</p>
          )}
        </CardContent>
      </Card>

      {/* Juara 3 (kanan) */}
      <Card className="order-3 bg-gradient-to-b from-amber-50 to-white">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <Medal className="w-12 h-12 text-amber-700" />
          </div>
          {ketiga ? (
            <>
              <p className="text-sm text-slate-500 mb-1">#{ketiga.nomor_anggota}</p>
              <p className="font-bold text-lg truncate">{ketiga.nama}</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{ketiga.poin}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>{ketiga.streak}</span>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-2">Juara 3</p>
            </>
          ) : (
            <p className="text-slate-300">-</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
})
