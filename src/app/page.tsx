'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Verificar tipo de perfil
      const { data: perfil } = await supabase
        .from('perfis')
        .select('tipo_perfil')
        .eq('id_perfil', user.id)
        .single()

      if (perfil?.tipo_perfil === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/cliente/dashboard')
      }
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Carregando...</p>
      </div>
    </div>
  )
}
