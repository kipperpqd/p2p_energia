'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminFaturas() {
  const [faturas, setFaturas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFaturas()
  }, [])

  async function loadFaturas() {
    const { data } = await supabase
      .from('view_faturas_completas')
      .select('*')
      .eq('dados_validados', false)
      .eq('status_fatura', 'ativa')
      .order('created_at', { ascending: false })
    
    if (data) setFaturas(data)
    setLoading(false)
  }

  async function validarFatura(id_fatura: string) {
    const { data, error } = await supabase.rpc('validar_fatura', {
      p_id_fatura: id_fatura
    })

    if (data?.success) {
      alert('Fatura validada com sucesso!')
      loadFaturas()
    } else {
      alert('Erro ao validar: ' + (data?.error || error?.message))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Validar Faturas</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mês/Ano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumo (kWh)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {faturas.map((fatura) => (
                <tr key={fatura.id_fatura} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{fatura.nome_cliente}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{fatura.mes_ano}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{fatura.consumo_kwh}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(fatura.valor_fatura_atual)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => validarFatura(fatura.id_fatura)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Validar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
