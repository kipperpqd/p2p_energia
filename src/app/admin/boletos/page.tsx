'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { FileText, Link as LinkIcon, Send } from 'lucide-react'

export default function AdminBoletos() {
  const [faturas, setFaturas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFaturas()
  }, [])

  async function loadFaturas() {
    // Faturas calculadas mas sem boleto ainda
    const { data } = await supabase
      .from('faturas')
      .select(`
        *,
        clientes (nome, email),
        calculos_faturas (*),
        boletos (id_boleto)
      `)
      .eq('dados_validados', true)
      .eq('status', 'ativa')
      .not('calculos_faturas', 'is', null)
      .is('boletos.id_boleto', null)
      .order('mes_ano', { ascending: false })
    
    if (data) setFaturas(data)
    setLoading(false)
  }

  async function gerarBoleto(id_fatura: string) {
    const { data, error } = await supabase.rpc('gerar_boleto', {
      p_id_fatura: id_fatura
    })

    if (data?.success) {
      alert('Boleto gerado! Agora você pode criar o link de pagamento no Asaas.')
      loadFaturas()
    } else {
      alert('Erro: ' + (data?.error || error?.message))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gerar Boletos</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mês/Ano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor P2P</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Economia</th>
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
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    {formatCurrency(fatura.calculos_faturas?.[0]?.nova_fatura_p2p || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    {formatCurrency(fatura.calculos_faturas?.[0]?.economia_cliente || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => gerarBoleto(fatura.id_fatura)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Emitir Boleto
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
