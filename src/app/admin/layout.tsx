'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calculator,
  DollarSign,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({
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

    // Verificar se é admin
    const { data: perfil } = await supabase
      .from('perfis')
      .select('tipo_perfil')
      .eq('id_perfil', user.id)
      .single()

    if (perfil?.tipo_perfil !== 'admin') {
      router.push('/cliente/dashboard')
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">GP2P Admin</h1>
              <p className="text-xs text-gray-500">Painel de Controle</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/admin/clientes"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5" />
            Clientes
          </Link>
          <Link
            href="/admin/faturas"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5" />
            Validar Faturas
          </Link>
          <Link
            href="/admin/calculos"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
          >
            <Calculator className="w-5 h-5" />
            Realizar Cálculos
          </Link>
          <Link
            href="/admin/boletos"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            Gerar Boletos
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">GP2P Admin</h1>
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 p-4">
            <nav className="flex flex-col gap-2">
              <Link href="/admin/dashboard" className="px-4 py-2 text-gray-700 hover:bg-green-50 rounded-lg">
                Dashboard
              </Link>
              <Link href="/admin/clientes" className="px-4 py-2 text-gray-700 hover:bg-green-50 rounded-lg">
                Clientes
              </Link>
              <Link href="/admin/faturas" className="px-4 py-2 text-gray-700 hover:bg-green-50 rounded-lg">
                Validar Faturas
              </Link>
              <Link href="/admin/calculos" className="px-4 py-2 text-gray-700 hover:bg-green-50 rounded-lg">
                Realizar Cálculos
              </Link>
              <Link href="/admin/boletos" className="px-4 py-2 text-gray-700 hover:bg-green-50 rounded-lg">
                Gerar Boletos
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg"
              >
                Sair
              </button>
            </nav>
          </div>
        )}

        <main>{children}</main>
      </div>
    </div>
  )
}
