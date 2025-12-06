'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatMesAno } from '@/lib/utils'
import { TrendingDown, Zap, Calendar, Award } from 'lucide-react'

type DashboardData = {
  ultimaFatura: {
    mes_ano: string
    consumo_kwh: number
    valor_original: number
    valor_p2p: number
    economia: number
    economia_perc: number
    status_boleto: string
  }
  economiaAcumuladaAno: number
  graficoEconomia: Array<{
    mes: string
    fatura_enel: number
    fatura_p2p: number
    economia: number
  }>
  estatisticas: {
    total_faturas: number
    media_consumo: number
    media_economia: number
    boletos_pendentes: number
  }
}

export default function ClienteDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      // Pegar usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      // Buscar perfil para pegar id_cliente
      const { data: perfil } = await supabase
        .from('perfis')
        .select('id_cliente')
        .eq('id_perfil', user.id)
        .single()

      if (!perfil?.id_cliente) return

      // Buscar dados do dashboard usando a função
      const { data: dashboardData } = await supabase
        .rpc('dashboard_cliente', { p_id_cliente: perfil.id_cliente })

      if (dashboardData) {
        // Processar dados para o gráfico (últimos 12 meses)
        const { data: faturas } = await supabase
          .from('view_faturas_completas')
          .select('*')
          .eq('id_cliente', perfil.id_cliente)
          .eq('status_fatura', 'ativa')
          .order('mes_ano', { ascending: true })
          .limit(12)

        const graficoData = faturas?.map(f => ({
          mes: formatMesAno(f.mes_ano),
          fatura_enel: f.fatura_enel_bruta || 0,
          fatura_p2p: f.nova_fatura_p2p || 0,
          economia: f.economia_cliente || 0,
        })) || []

        // Calcular economia acumulada do ano atual
        const anoAtual = new Date().getFullYear().toString()
        const faturasAno = faturas?.filter(f => f.mes_ano.includes(anoAtual)) || []
        const economiaAcumulada = faturasAno.reduce((sum, f) => sum + (f.economia_cliente || 0), 0)

        // Última fatura
        const ultimaFatura = dashboardData.ultimas_faturas?.[0] || null

        setData({
          ultimaFatura: {
            mes_ano: ultimaFatura?.mes_ano || '-',
            consumo_kwh: ultimaFatura?.consumo_kwh || 0,
            valor_original: ultimaFatura?.valor_original || 0,
            valor_p2p: ultimaFatura?.nova_fatura || 0,
            economia: ultimaFatura?.economia || 0,
            economia_perc: ((ultimaFatura?.economia || 0) / (ultimaFatura?.valor_original || 1)) * 100,
            status_boleto: ultimaFatura?.status || 'pendente'
          },
          economiaAcumuladaAno: economiaAcumulada,
          graficoEconomia: graficoData,
          estatisticas: dashboardData.estatisticas || {
            total_faturas: 0,
            media_consumo: 0,
            media_economia: 0,
            boletos_pendentes: 0
          }
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-2">
            Confira o resumo da sua última fatura e economia
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Última Fatura */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {data.ultimaFatura.mes_ano}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Última Fatura</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.ultimaFatura.valor_p2p)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Valor original: {formatCurrency(data.ultimaFatura.valor_original)}
            </p>
          </div>

          {/* Economia Mensal */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingDown className="w-8 h-8" />
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                {data.ultimaFatura.economia_perc.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Economia do Mês</h3>
            <p className="text-2xl font-bold">
              {formatCurrency(data.ultimaFatura.economia)}
            </p>
            <p className="text-xs opacity-75 mt-2">
              vs. valor sem desconto
            </p>
          </div>

          {/* Consumo */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Consumo</h3>
            <p className="text-2xl font-bold text-gray-900">
              {data.ultimaFatura.consumo_kwh.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500 mt-2">kWh no mês</p>
          </div>

          {/* Economia Acumulada Ano */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8" />
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                {new Date().getFullYear()}
              </span>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Economia Acumulada</h3>
            <p className="text-2xl font-bold">
              {formatCurrency(data.economiaAcumuladaAno)}
            </p>
            <p className="text-xs opacity-75 mt-2">
              Economia total no ano
            </p>
          </div>
        </div>

        {/* Gráfico de Economia - 12 Meses */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Comparação de Valores - Últimos 12 Meses
            </h2>
            <p className="text-sm text-gray-600">
              Valor cobrado pela concessionária (vermelho) vs. Valor com desconto GP2P (verde)
            </p>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.graficoEconomia} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="mes" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="fatura_enel" 
                name="Sem Desconto (ENEL)"
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line 
                type="monotone" 
                dataKey="fatura_p2p" 
                name="Com Desconto GP2P"
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Legenda adicional */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Você economiza todos os meses com a GP2P!
                </p>
                <p className="text-xs text-green-700 mt-1">
                  A linha verde sempre abaixo da vermelha representa sua economia mensal consistente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Total de Faturas</h3>
            <p className="text-3xl font-bold text-gray-900">{data.estatisticas.total_faturas}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Média de Economia</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(data.estatisticas.media_economia)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Boletos Pendentes</h3>
            <p className="text-3xl font-bold text-orange-600">{data.estatisticas.boletos_pendentes}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
