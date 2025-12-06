'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatMesAno } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react'

type ConsumoData = {
  mes: string
  consumo: number
  media: number
}

export default function ClienteConsumo() {
  const [loading, setLoading] = useState(true)
  const [consumoData, setConsumoData] = useState<ConsumoData[]>([])
  const [stats, setStats] = useState({
    consumoTotal: 0,
    mediaConsumo: 0,
    maiorConsumo: 0,
    menorConsumo: 0,
    tendencia: 'estável' as 'crescente' | 'decrescente' | 'estável'
  })

  useEffect(() => {
    loadConsumo()
  }, [])

  async function loadConsumo() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: perfil } = await supabase
        .from('perfis')
        .select('id_cliente')
        .eq('id_perfil', user.id)
        .single()

      if (!perfil?.id_cliente) return

      const { data: faturas } = await supabase
        .from('faturas')
        .select('mes_ano, consumo_kwh, media_consumo_12_meses')
        .eq('id_cliente', perfil.id_cliente)
        .eq('status', 'ativa')
        .order('mes_ano', { ascending: true })
        .limit(12)

      if (faturas && faturas.length > 0) {
        const dadosGrafico = faturas.map(f => ({
          mes: formatMesAno(f.mes_ano),
          consumo: f.consumo_kwh || 0,
          media: f.media_consumo_12_meses || 0
        }))

        const consumos = faturas.map(f => f.consumo_kwh || 0)
        const consumoTotal = consumos.reduce((a, b) => a + b, 0)
        const mediaConsumo = consumoTotal / consumos.length
        const maiorConsumo = Math.max(...consumos)
        const menorConsumo = Math.min(...consumos)

        // Calcular tendência (últimos 3 meses vs 3 anteriores)
        let tendencia: 'crescente' | 'decrescente' | 'estável' = 'estável'
        if (consumos.length >= 6) {
          const ultimos3 = consumos.slice(-3).reduce((a, b) => a + b, 0) / 3
          const anteriores3 = consumos.slice(-6, -3).reduce((a, b) => a + b, 0) / 3
          const diferenca = ((ultimos3 - anteriores3) / anteriores3) * 100
          
          if (diferenca > 5) tendencia = 'crescente'
          else if (diferenca < -5) tendencia = 'decrescente'
        }

        setConsumoData(dadosGrafico)
        setStats({
          consumoTotal,
          mediaConsumo,
          maiorConsumo,
          menorConsumo,
          tendencia
        })
      }
    } catch (error) {
      console.error('Erro ao carregar consumo:', error)
    } finally {
      setLoading(false)
    }
  }

  function getTendenciaIcon() {
    if (stats.tendencia === 'crescente') return <TrendingUp className="w-6 h-6 text-red-600" />
    if (stats.tendencia === 'decrescente') return <TrendingDown className="w-6 h-6 text-green-600" />
    return <Activity className="w-6 h-6 text-blue-600" />
  }

  function getTendenciaText() {
    if (stats.tendencia === 'crescente') return { text: 'Crescente', color: 'text-red-600' }
    if (stats.tendencia === 'decrescente') return { text: 'Decrescente', color: 'text-green-600' }
    return { text: 'Estável', color: 'text-blue-600' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const tendenciaInfo = getTendenciaText()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Análise de Consumo</h1>
          <p className="text-gray-600 mt-2">Acompanhe seu consumo de energia ao longo do tempo</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Consumo Total</h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats.consumoTotal.toFixed(0)} <span className="text-sm font-normal">kWh</span>
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Média Mensal</h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats.mediaConsumo.toFixed(0)} <span className="text-sm font-normal">kWh</span>
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Maior Consumo</h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats.maiorConsumo.toFixed(0)} <span className="text-sm font-normal">kWh</span>
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              {getTendenciaIcon()}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Tendência</h3>
            <p className={`text-2xl font-bold ${tendenciaInfo.color}`}>
              {tendenciaInfo.text}
            </p>
          </div>
        </div>

        {/* Gráfico de Consumo */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Consumo Mensal (kWh)</h2>
            <p className="text-sm text-gray-600">
              Acompanhe a evolução do seu consumo de energia elétrica
            </p>
          </div>

          {consumoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={consumoData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="mes" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [`${value.toFixed(0)} kWh`, '']}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Bar 
                  dataKey="consumo" 
                  name="Consumo do Mês"
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="media" 
                  name="Média 12 Meses"
                  fill="#94a3b8" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhum dado de consumo disponível</p>
            </div>
          )}
        </div>

        {/* Dicas de Economia */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Dicas para Reduzir o Consumo</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Desligue aparelhos da tomada quando não estiver usando</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Substitua lâmpadas comuns por LED (economia de até 80%)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Use o ar-condicionado em temperatura moderada (23-24°C)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Aproveite a luz natural durante o dia</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Evite abrir a geladeira desnecessariamente</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
