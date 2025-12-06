'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { Calculator, CheckCircle } from 'lucide-react'

export default function AdminCalculos() {
  const [faturas, setFaturas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFaturas()
  }, [])

  async function loadFaturas() {
    // Faturas validadas mas sem cálculo ainda
    const { data } = await supabase
      .from('faturas')
      .select(`
        *,
        clientes (nome),
        calculos_faturas (id_calculo)
      `)
      .eq('dados_validados', true)
      .eq('status', 'ativa')
      .is('calculos_faturas.id_calculo', null)
      .order('mes_ano', { ascending: false })
    
    if (data) setFaturas(data)
    setLoading(false)
  }

  async function calcularFatura(id_fatura: string) {
    const { data, error } = await supabase.rpc('calcular_fatura', {
      p_id_fatura: id_fatura
    })

    if (data?.success) {
      alert(`Cálculo realizado!\n\nEconomia: ${formatCurrency(data.calculos.economia_cliente)}\nNova fatura: ${formatCurrency(data.calculos.nova_fatura_p2p)}`)
      loadFaturas()
    } else {
      alert('Erro: ' + (data?.error || error?.message))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Realizar Cálculos</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mês/Ano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Original</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {faturas.map((fatura) => (
                <tr key={fatura.id_fatura} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {fatura.clientes?.nome}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{fatura.mes_ano}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(fatura.valor_fatura_atual)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => calcularFatura(fatura.id_fatura)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Calculator className="w-4 h-4" />
                      Calcular
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
