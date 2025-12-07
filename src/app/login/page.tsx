'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Zap, Lock, Mail } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Tentando fazer login...')
      
      // 1. Fazer login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('❌ Erro de autenticação:', authError)
        throw new Error(`Erro de autenticação: ${authError.message}`)
      }

      if (!authData?.user) {
        throw new Error('Usuário não encontrado após login')
      }

      console.log('✅ Login bem-sucedido. User ID:', authData.user.id)

      // 2. Buscar perfil
      console.log('🔍 Buscando perfil do usuário...')
      
      const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .select('tipo_perfil, id_cliente')
        .eq('id_perfil', authData.user.id)
        .single()

      if (perfilError) {
        console.error('❌ Erro ao buscar perfil:', perfilError)
        
        // Se não encontrou perfil, criar um padrão
        if (perfilError.code === 'PGRST116') {
          console.log('⚠️ Perfil não encontrado. Criando perfil padrão...')
          
          const { error: insertError } = await supabase
            .from('perfis')
            .insert([{ id_perfil: authData.user.id, tipo_perfil: 'cliente' }])
          
          if (insertError) {
            throw new Error(`Erro ao criar perfil: ${insertError.message}`)
          }
          
          // Redirecionar para área do cliente
          router.push('/cliente/dashboard')
          return
        }
        
        throw new Error(`Erro ao buscar perfil: ${perfilError.message}`)
      }

      console.log('✅ Perfil encontrado:', perfil)

      // 3. Redirecionar baseado no tipo de perfil
      if (perfil?.tipo_perfil === 'admin') {
        console.log('🎯 Redirecionando para admin...')
        router.push('/admin/dashboard')
      } else {
        console.log('🎯 Redirecionando para cliente...')
        router.push('/cliente/dashboard')
      }

    } catch (error: any) {
      console.error('❌ Erro geral:', error)
      setError(error.message || 'Erro desconhecido ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Energia GP2P</h1>
          <p className="text-gray-600">Sistema de Gestão de Faturas</p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Entrar na Plataforma</h2>
          
          {/* Mostrar erro se houver */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 GP2P Cloud. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
