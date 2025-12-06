'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  History, 
  Zap, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    // Verificar se é cliente
    const { data: perfil } = await supabase
      .from('perfis')
      .select('tipo_perfil')
      .eq('id_perfil', user.id)
      .single()

    if (perfil?.tipo_perfil !== 'cliente') {
      router.push('/admin/dashboard')
      return
    }

    setUser(user)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GP2P</h1>
                <p className="text-xs text-gray-500">Área do Cliente</p>
              </div>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>

            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/cliente/dashboard" className="text-gray-600 hover:text-green-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/cliente/historico" className="text-gray-600 hover:text-green-600 transition-colors">
                Histórico
              </Link>
              <Link href="/cliente/consumo" className="text-gray-600 hover:text-green-600 transition-colors">
                Consumo
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <nav className="flex flex-col gap-4">
            <Link href="/cliente/dashboard" className="text-gray-600 hover:text-green-600">
              Dashboard
            </Link>
            <Link href="/cliente/historico" className="text-gray-600 hover:text-green-600">
              Histórico
            </Link>
            <Link href="/cliente/consumo" className="text-gray-600 hover:text-green-600">
              Consumo
            </Link>
            <button
              onClick={handleLogout}
              className="text-left text-red-600 hover:text-red-700"
            >
              Sair
            </button>
          </nav>
        </div>
      )}

      {/* Content */}
      <main>{children}</main>
    </div>
  )
}
