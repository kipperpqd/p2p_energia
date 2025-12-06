'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CheckCircle, Clock, AlertCircle, Download, FileText } from 'lucide-react'

type Boleto = {
  id_boleto: string
  mes_referencia: string
  valor_fatura: number
  data_pagamento: string
  status: string
  link_pagamento?: string
  pago_em?: string
  descricao: string
}

export default function ClienteHistorico() {
  const [boletos, setBoletos] = useState<Boleto[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todos' | 'pago' | 'pendente'>('todos')

  useEffect(() => {
    loadBoletos()
  }, [])

  async function loadBoletos() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: perfil } = await supabase
        .from('perfis')
        .select('id_cliente')
        .eq('id_perfil', user.id)
        .single()

      if (!perfil?.id_cliente) return

      const { data } = await supabase
        .from('boletos')
        .select('*')
        .eq('id_cliente', perfil.id_cliente)
        .order('mes_referencia', { ascending: false })

      if (data) setBoletos(data)
    } catch (error) {
      console.error('Erro ao carregar boletos:', error)
    } finally {
      setLoading(false)
    }
  }

  const boletosFiltrados = boletos.filter(b => {
    if (filtro === 'todos') return true
    if (filtro === 'pago') return b.status === 'pago'
    if (filtro === 'pendente') return b.status === 'pendente' || b.status === 'enviado'
    return true
  })

  function getStatusBadge(status: string) {
    const badges = {
      pago: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Pago' },
      pendente: { color: 'bg-orange-100 text-orange-800', icon: Clock, text: 'Pendente' },
      enviado: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Enviado' },
      aguardando_link: { color: 'bg-gray-100 text-gray-800', icon: Clock, text: 'Processando' },
      cancelado: { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Cancelado' },
    }

    const badge = badges[status as keyof typeof badges] || badges.pendente
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Pagamentos</h1>
          <p className="text-gray-600 mt-2">Acompanhe todas as suas faturas e pagamentos</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFiltro('todos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'todos'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({boletos.length})
            </button>
            <button
              onClick={() => setFiltro('pago')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'pago'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pagos ({boletos.filter(b => b.status === 'pago').length})
            </button>
            <button
              onClick={() => setFiltro('pendente')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'pendente'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes ({boletos.filter(b => b.status === 'pendente' || b.status === 'enviado').length})
            </button>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Pago</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(
                boletos
                  .filter(b => b.status === 'pago')
                  .reduce((sum, b) => sum + b.valor_fatura, 0)
              )}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Pendente</h3>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(
                boletos
                  .filter(b => b.status !== 'pago' && b.status !== 'cancelado')
                  .reduce((sum, b) => sum + b.valor_fatura, 0)
              )}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Número de Faturas</h3>
            <p className="text-2xl font-bold text-gray-900">{boletos.length}</p>
          </div>
        </div>

        {/* Lista de Boletos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {boletosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhum boleto encontrado</p>
              <p className="text-sm text-gray-400 mt-1">
                {filtro !== 'todos' ? 'Tente alterar o filtro' : 'Seus boletos aparecerão aqui'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mês/Ano
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {boletosFiltrados.map((boleto) => (
                    <tr key={boleto.id_boleto} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{boleto.mes_referencia}</div>
                        <div className="text-xs text-gray-500">{boleto.descricao?.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(boleto.valor_fatura)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(boleto.data_pagamento)}</div>
                        {boleto.pago_em && (
                          <div className="text-xs text-gray-500">
                            Pago em: {formatDate(boleto.pago_em)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(boleto.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {boleto.link_pagamento && boleto.status !== 'pago' && (
                          <a
                            href={boleto.link_pagamento}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Pagar
                          </a>
                        )}
                        {boleto.status === 'pago' && (
                          <span className="text-green-600 font-medium">✓ Quitado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
