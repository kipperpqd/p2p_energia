import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ADICIONAR OPÇÕES DE CONFIGURAÇÃO
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'  // IMPORTANTE: especificar o schema
  }
})
// Tipos do banco de dados
export type Cliente = {
  id_cliente: string
  nome: string
  cpf_cnpj: string
  email: string
  telefone?: string
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

