"use client"

import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, CheckCircle, Clock, AlertCircle, Award, TrendingUp } from "lucide-react"
import { StatistikLaporan } from "./types"

interface StatistikCardProps {
  statistik: StatistikLaporan
}

export const StatistikCard = memo(function StatistikCard({ statistik }: StatistikCardProps) {
  const cards = [
    {
      title: "Total Anggota",
      value: statistik.total_anggota,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
      text: "text-blue-600"
    },
    {
      title: "Total Hadir",
      value: statistik.total_hadir,
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      bg: "bg-green-50",
      text: "text-green-600"
    },
    {
      title: "Izin/Sakit",
      value: statistik.total_izin + statistik.total_sakit,
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      bg: "bg-yellow-50",
      text: "text-yellow-600"
    },
    {
      title: "Alpha",
      value: statistik.total_alpha,
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      bg: "bg-red-50",
      text: "text-red-600"
    },
    {
      title: "Total Poin",
      value: statistik.total_poin,
      icon: <Award className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-50",
      text: "text-purple-600"
    },
    {
      title: "Presensi Rate",
      value: `${statistik.presensi_rate}%`,
      icon: <TrendingUp className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50",
      text: "text-indigo-600"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, idx) => (
        <Card key={idx} className={`${card.bg} border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">{card.title}</span>
              {card.icon}
            </div>
            <p className={`text-xl font-bold ${card.text}`}>
              {card.value.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})