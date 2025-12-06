'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { 
  Users, 
  FileText, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar
} from 'lucide-react'

type Metrica = {
  metrica: string
  valor: number
}

type FaturaPendente = {
  id_fatura: string
  nome_cliente: string
  mes_ano: string
  valor_fatura_atual: number
  created_at: string
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [metricas, setMetricas] = useState<Metrica[]>([])
  const [faturasPendentes, setFaturasPendentes] = useState<FaturaPendente[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      // Buscar métricas do dashboard
      const { data: metricasData } = await supabase
        .from('view_dashboard_admin')
        .select('*')

      if (metricasData) {
        setMetricas(metricasData)
      }

      // Buscar faturas pendentes de validação
      const { data: faturas } = await supabase
        .from('view_faturas_completas')
        .select('id_fatura, nome_cliente, mes_ano, valor_fatura_atual, created_at')
        .eq('dados_validados', false)
        .eq('status_fatura', 'ativa')
        .order('created_at', { ascending: false })
        .limit(5)

      if (faturas) {
        setFaturasPendentes(faturas)
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  function getMetricaValue(nome: string): number {
    return metricas.find(m => m.metrica === nome)?.valor || 0
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-2">Visão geral do sistema GP2P</p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Clientes */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total de Clientes</h3>
            <p className="text-3xl font-bold text-gray-900">
              {getMetricaValue('total_clientes')}
            </p>
          </div>

          {/* Faturas Pendentes */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="w-8 h-8" />
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                Ação Necessária
              </span>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Faturas Pendentes</h3>
            <p className="text-3xl font-bold">
              {getMetricaValue('faturas_pendentes')}
            </p>
            <p className="text-xs opacity-75 mt-2">Aguardando validação</p>
          </div>

          {/* Faturas Calculadas */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Faturas Calculadas</h3>
            <p className="text-3xl font-bold text-gray-900">
              {getMetricaValue('faturas_calculadas')}
            </p>
          </div>

          {/* Boletos Pendentes */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Boletos Pendentes</h3>
            <p className="text-3xl font-bold">
              {getMetricaValue('boletos_pendentes')}
            </p>
            <p className="text-xs opacity-75 mt-2">Aguardando pagamento</p>
          </div>
        </div>

        {/* Métricas Financeiras */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Economia Total do Mês */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10" />
              <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded">
                Mês Atual
              </span>
            </div>
            <h3 className="text-lg font-medium opacity-90 mb-2">Economia Total Gerada</h3>
            <p className="text-4xl font-bold mb-4">
              {formatCurrency(getMetricaValue('economia_total_mes'))}
            </p>
            <p className="text-sm opacity-75">
              Total de economia proporcionada aos clientes este mês
            </p>
          </div>

          {/* Boletos Pagos */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-10 h-10" />
              <CheckCircle className="w-8 h-8 opacity-75" />
            </div>
            <h3 className="text-lg font-medium opacity-90 mb-2">Boletos Pagos</h3>
            <p className="text-4xl font-bold mb-4">
              {getMetricaValue('boletos_pagos')}
            </p>
            <p className="text-sm opacity-75">
              Total de boletos quitados pelos clientes
            </p>
          </div>
        </div>

        {/* Faturas Pendentes de Validação */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Faturas Aguardando Validação</h2>
                <p className="text-sm text-gray-600 mt-1">Faturas extraídas que precisam ser revisadas</p>
              </div>
              <a 
                href="/admin/faturas"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Ver Todas
              </a>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mês/Ano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recebida em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {faturasPendentes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">Nenhuma fatura pendente</p>
                      <p className="text-sm mt-1">Todas as faturas foram validadas</p>
                    </td>
                  </tr>
                ) : (
                  faturasPendentes.map((fatura) => (
                    <tr key={fatura.id_fatura} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{fatura.nome_cliente}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {fatura.mes_ano}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(fatura.valor_fatura_atual)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(fatura.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => window.location.href = `/admin/faturas?id=${fatura.id_fatura}`}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          Validar →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/admin/clientes"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <Users className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              Cadastrar Cliente
            </h3>
            <p className="text-sm text-gray-600">
              Adicione novos clientes ao sistema
            </p>
          </a>

          <a
            href="/admin/calculos"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <FileText className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              Realizar Cálculos
            </h3>
            <p className="text-sm text-gray-600">
              Calcule e aprove faturas validadas
            </p>
          </a>

          <a
            href="/admin/boletos"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <DollarSign className="w-10 h-10 text-orange-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              Gerar Links
            </h3>
            <p className="text-sm text-gray-600">
              Crie links de pagamento Asaas
            </p>
          </a>
        </div>
      </div>
    </div>
  )
}
