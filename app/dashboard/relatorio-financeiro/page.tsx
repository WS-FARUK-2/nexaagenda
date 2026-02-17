'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'

interface FinancialStats {
  totalReceita: number
  agendamentosConfirmados: number
  servicosMaisLucrativos: Array<{ nome: string; receita: number; quantidade: number }>
  receitaUltimos30Dias: number
  ticketMedio: number
}

export default function RelatorioFinanceiroPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<FinancialStats>({
    totalReceita: 0,
    agendamentosConfirmados: 0,
    servicosMaisLucrativos: [],
    receitaUltimos30Dias: 0,
    ticketMedio: 0
  })
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase!.auth.getUser()
      if (!authUser) {
        router.push('/login')
      } else {
        setUser(authUser)
        loadFinancialData(authUser.id)
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const loadFinancialData = async (userId: string) => {
    try {
      // Total de receita
      const { data: agendamentos } = await supabase
        .from('agendamentos_publicos')
        .select('valor_servico, created_at, status')
        .eq('user_id', userId)
        .eq('status', 'Confirmado')

      const totalReceita = (agendamentos || []).reduce((sum, a) => sum + (a.valor_servico || 0), 0)
      const confirmados = agendamentos?.length || 0

      // Receita últimos 30 dias
      const data30DiasAtras = new Date()
      data30DiasAtras.setDate(data30DiasAtras.getDate() - 30)

      const receitaUltimos30 = (agendamentos || [])
        .filter(a => new Date(a.created_at) >= data30DiasAtras)
        .reduce((sum, a) => sum + (a.valor_servico || 0), 0)

      // Ticket médio
      const ticketMedio = confirmados > 0 ? totalReceita / confirmados : 0

      // Serviços mais lucrativos
      const { data: servicosData } = await supabase
        .from('agendamentos_publicos')
        .select('servico_nome, valor_servico')
        .eq('user_id', userId)
        .eq('status', 'Confirmado')

      const servicosMapa = new Map<string, { receita: number; quantidade: number }>()
      servicosData?.forEach(item => {
        const current = servicosMapa.get(item.servico_nome) || { receita: 0, quantidade: 0 }
        servicosMapa.set(item.servico_nome, {
          receita: current.receita + (item.valor_servico || 0),
          quantidade: current.quantidade + 1
        })
      })

      const servicosMaisLucrativos = Array.from(servicosMapa.entries())
        .map(([nome, data]) => ({
          nome,
          receita: data.receita,
          quantidade: data.quantidade
        }))
        .sort((a, b) => b.receita - a.receita)
        .slice(0, 5)

      setStats({
        totalReceita,
        agendamentosConfirmados: confirmados,
        servicosMaisLucrativos,
        receitaUltimos30Dias: receitaUltimos30,
        ticketMedio
      })
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar user={user} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar user={user} />
      
      <div style={{ flex: 1, padding: '20px' }}>
        <div style={{ maxWidth: '1000px' }}>
          {/* Header */}
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>💰 Relatório Financeiro</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              Análise detalhada de sua receita e performance financeira
            </p>
          </div>

          {/* Cards de resumo */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {/* Total Receita */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #10b981'
            }}>
              <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Total de Receita</p>
              <h3 style={{ margin: 0, fontSize: '28px', color: '#10b981' }}>
                {formatCurrency(stats.totalReceita)}
              </h3>
              <p style={{ margin: '10px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
                Todos os agendamentos confirmados
              </p>
            </div>

            {/* Receita Últimos 30 Dias */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #3b82f6'
            }}>
              <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Últimos 30 Dias</p>
              <h3 style={{ margin: 0, fontSize: '28px', color: '#3b82f6' }}>
                {formatCurrency(stats.receitaUltimos30Dias)}
              </h3>
              <p style={{ margin: '10px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
                {((stats.receitaUltimos30Dias / stats.totalReceita) * 100).toFixed(1)}% da receita total
              </p>
            </div>

            {/* Ticket Médio */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #f59e0b'
            }}>
              <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Ticket Médio</p>
              <h3 style={{ margin: 0, fontSize: '28px', color: '#f59e0b' }}>
                {formatCurrency(stats.ticketMedio)}
              </h3>
              <p style={{ margin: '10px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
                Por agendamento
              </p>
            </div>

            {/* Agendamentos Confirmados */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #8b5cf6'
            }}>
              <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Agendamentos Confirmados</p>
              <h3 style={{ margin: 0, fontSize: '28px', color: '#8b5cf6' }}>
                {stats.agendamentosConfirmados}
              </h3>
              <p style={{ margin: '10px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
                Total de transações
              </p>
            </div>
          </div>

          {/* Serviços Mais Lucrativos */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>🏆 Serviços Mais Lucrativos</h2>
            
            {stats.servicosMaisLucrativos.length > 0 ? (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontWeight: '600', fontSize: '14px' }}>
                      Serviço
                    </th>
                    <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280', fontWeight: '600', fontSize: '14px' }}>
                      Qtd.
                    </th>
                    <th style={{ textAlign: 'right', padding: '12px', color: '#6b7280', fontWeight: '600', fontSize: '14px' }}>
                      Receita
                    </th>
                    <th style={{ textAlign: 'right', padding: '12px', color: '#6b7280', fontWeight: '600', fontSize: '14px' }}>
                      % do Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.servicosMaisLucrativos.map((servico, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', color: '#1f2937', fontSize: '14px' }}>
                        {servico.nome}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#2563eb', fontWeight: '600' }}>
                        {servico.quantidade}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#10b981', fontWeight: '600' }}>
                        {formatCurrency(servico.receita)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '14px' }}>
                        {((servico.receita / stats.totalReceita) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center', margin: '20px 0' }}>
                Nenhum agendamento confirmado ainda
              </p>
            )}
          </div>

          {/* Info Box */}
          <div style={{
            backgroundColor: '#f0f9ff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #93c5fd'
          }}>
            <h3 style={{ marginTop: 0, color: '#1e40af' }}>📈 Dica:</h3>
            <p style={{ margin: 0, color: '#1e40af', fontSize: '14px' }}>
              Acompanhe regularmente esses números para identificar seus serviços mais populares e oportunidades de crescimento. 
              Considere aumentar o valor de serviços com alta demanda ou criar pacotes com seus serviços mais procurados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
