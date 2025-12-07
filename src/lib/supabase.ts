import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.gp2p.cloud'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MzUwNjc0MCwiZXhwIjo0OTE5MTgwMzQwLCJyb2xlIjoiYW5vbiJ9.tGlxvR6U5Oswot3PlIkL_jQd0O_Vt8dhKcg85kJyo'

// Debug
if (typeof window !== 'undefined') {
  console.log('🔧 Supabase URL:', supabaseUrl)
  console.log('🔧 Supabase Key existe?', supabaseAnonKey ? 'Sim ✅' : 'Não ❌')
  console.log('🔧 Supabase Key length:', supabaseAnonKey.length)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
})
// Tipos do banco de dados
export type Cliente = {
  id_cliente: string
  nome: string
  cpf_cnpj: string
  email: string
  telefone?: string
  nr_cliente: string
  data_nascimento?: string
  created_at: string
}

export type Fatura = {
  id_fatura: string
  id_cliente: string
  mes_ano: string
  consumo_kwh: number
  valor_fatura_atual: number
  data_vencimento: string
  status: 'ativa' | 'retificada' | 'cancelada'
  dados_validados: boolean
}

export type CalculoFatura = {
  id_calculo: string
  id_fatura: string
  nova_fatura_p2p: number
  fatura_enel_bruta: number
  economia_cliente: number
  economia_cliente_perc: number
  lucro_p2p: number
  reserva_creditos: number
}

export type Boleto = {
  id_boleto: string
  id_cliente: string
  id_fatura: string
  nome_cliente: string
  valor_fatura: number
  mes_referencia: string
  status: 'pendente' | 'aguardando_link' | 'enviado' | 'pago' | 'cancelado'
  link_pagamento?: string
  data_pagamento: string
  pago_em?: string
}



