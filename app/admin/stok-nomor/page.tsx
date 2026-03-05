"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Copy, Download } from "lucide-react"

export default function AdminStokNomor() {
  const [stok, setStok] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newNomor, setNewNomor] = useState("")

  useEffect(() => {
    loadStok()
  }, [])

  const loadStok = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('stok_nomor_anggota')
      .select('*')
      .order('nomor_anggota')
    
    setStok(data || [])
    setLoading(false)
  }

  const tambahNomor = async () => {
    if (!newNomor) return
    
    const supabase = createClient()
    await supabase
      .from('stok_nomor_anggota')
      .insert({ nomor_anggota: newNomor, status: 'tersedia' })
    
    setNewNomor("")
    loadStok()
  }

  const hapusNomor = async (id: number) => {
    const supabase = createClient()
    await supabase
      .from('stok_nomor_anggota')
      .delete()
      .eq('id', id)
    
    loadStok()
  }

  const generateBanyak = async () => {
    // Generate 10 nomor sekaligus
    const supabase = createClient()
    const lastNomor = stok.length > 0 
      ? parseInt(stok[stok.length-1].nomor_anggota) 
      : 2425000
    
    const newNomors = []
    for (let i = 1; i <= 10; i++) {
      newNomors.push({
        nomor_anggota: (lastNomor + i).toString(),
        status: 'tersedia'
      })
    }
    
    await supabase.from('stok_nomor_anggota').insert(newNomors)
    loadStok()
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Stok Nomor Anggota</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="2425001"
              value={newNomor}
              onChange={(e) => setNewNomor(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={tambahNomor}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah
            </Button>
            <Button variant="outline" onClick={generateBanyak}>
              <Copy className="w-4 h-4 mr-2" />
              Generate 10
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {stok.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border flex justify-between items-center ${
                  item.status === 'tersedia' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-slate-50 border-slate-200 opacity-50'
                }`}
              >
                <span className="font-mono">{item.nomor_anggota}</span>
                {item.status === 'tersedia' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => hapusNomor(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-slate-500">
            Total: {stok.length} | Tersedia: {stok.filter(s => s.status === 'tersedia').length} | Terpakai: {stok.filter(s => s.status !== 'tersedia').length}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}