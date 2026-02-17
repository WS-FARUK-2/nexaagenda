'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'

interface StatData {
  totalAgendamentos: number
  agendamentosConfirmados: number
  agendamentosCancelados: number
  receitaTotal: number
  servicosMaisVendidos: Array<{ nome: string; quantidade: number; receita: number }>
  agendamentosUltimos7Dias: Array<{ data: string; quantidade: number }>
}

export default function EstatisticasPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatData>({
    totalAgendamentos: 0,
    agendamentosConfirmados: 0,
    agendamentosCancelados: 0,
    receitaTotal: 0,
    servicosMaisVendidos: [],
    agendamentosUltimos7Dias: []
  })

  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase!.auth.getUser()
      
      if (!authUser) {
        router.push('/login')
      } else {
        setUser(authUser)
        loadStatistics(authUser.id)
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [router])

  const loadStatistics = async (userId: string) => {
    try {
      // 1. Total de agendamentos (públicos + internos)
      const { count: totalPublicos } = await supabase
        .from('agendamentos_publicos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { count: totalInternos } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const totalAgendamentos = (totalPublicos || 0) + (totalInternos || 0)

      // 2. Agendamentos confirmados
      const { count: confirmados } = await supabase
        .from('agendamentos_publicos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'Confirmado')

      // 3. Agendamentos cancelados
      const { count: cancelados } = await supabase
        .from('agendamentos_publicos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'Cancelado')

      // 4. Receita total
      const { data: agendamentosComReceita } = await supabase
        .from('agendamentos_publicos')
        .select('valor_servico')
        .eq('user_id', userId)
        .eq('status', 'Confirmado')

      const receitaTotal = (agendamentosComReceita || []).reduce(
        (acc, item) => acc + (item.valor_servico || 0),
        0
      )

      // 5. Serviços mais vendidos
      const { data: servicesData } = await supabase
        .from('agendamentos_publicos')
        .select('servico_nome, valor_servico')
        .eq('user_id', userId)
        .eq('status', 'Confirmado')

      const servicosMapa = new Map<string, { quantidade: number; receita: number }>()
      servicesData?.forEach(item => {
        const current = servicosMapa.get(item.servico_nome) || { quantidade: 0, receita: 0 }
        servicosMapa.set(item.servico_nome, {
          quantidade: current.quantidade + 1,
          receita: current.receita + (item.valor_servico || 0)
        })
      })

      const servicosMaisVendidos = Array.from(servicosMapa.entries())
        .map(([nome, data]) => ({
          nome,
          quantidade: data.quantidade,
          receita: data.receita
        }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5)

      // 6. Agendamentos últimos 7 dias
      const dataAtual = new Date()
      const data7DiasAtras = new Date(dataAtual.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const { data: agendamentos7Dias } = await supabase
        .from('agendamentos_publicos')
        .select('data_agendamento')
        .eq('user_id', userId)
        .gte('created_at', data7DiasAtras.toISOString())

      const agendamentosPorDia = new Map<string, number>()
      for (let i = 6; i >= 0; i--) {
        const data = new Date(dataAtual.getTime() - i * 24 * 60 * 60 * 1000)
        const dataStr = data.toISOString().split('T')[0]
        agendamentosPorDia.set(dataStr, 0)
      }

      agendamentos7Dias?.forEach(item => {
        const data = item.data_agendamento || ''
        const count = agendamentosPorDia.get(data) || 0
        agendamentosPorDia.set(data, count + 1)
      })

      const agendamentosUltimos7Dias = Array.from(agendamentosPorDia.entries())
        .map(([data, quantidade]) => ({ data, quantidade }))

      setStats({
        totalAgendamentos,
        agendamentosConfirmados: confirmados || 0,
        agendamentosCancelados: cancelados || 0,
        receitaTotal,
        servicosMaisVendidos,
        agendamentosUltimos7Dias
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Navegação */}
        <div style={{ marginBottom: '30px' }}>
          <Link href="/dashboard" style={{
            color: '#2563eb',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            ← Voltar ao Dashboard
          </Link>
        </div>

        {/* Título */}
        <h1 style={{ marginBottom: '30px', color: '#1f2937' }}>📊 Estatísticas & Desempenho</h1>

        {/* Cards principais */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Total de Agendamentos */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #2563eb'
          }}>
            <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Total de Agendamentos</p>
            <h3 style={{ margin: 0, fontSize: '32px', color: '#2563eb' }}>
              {stats.totalAgendamentos}
            </h3>
            <p style={{ margin: '10px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
              Públicos + Internos
            </p>
          </div>

          {/* Agendamentos Confirmados */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #10b981'
          }}>
            <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Confirmados</p>
            <h3 style={{ margin: 0, fontSize: '32px', color: '#10b981' }}>
              {stats.agendamentosConfirmados}
            </h3>
            <p style={{ margin: '10px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
              {stats.totalAgendamentos > 0 
                ? `${Math.round((stats.agendamentosConfirmados / stats.totalAgendamentos) * 100)}% de conversão`
                : 'N/A'
              }
            </p>
          </div>

          {/* Agendamentos Cancelados */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #ef4444'
          }}>
            <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Cancelados</p>
            <h3 style={{ margin: 0, fontSize: '32px', color: '#ef4444' }}>
              {stats.agendamentosCancelados}
            </h3>
            <p style={{ margin: '10px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
              {stats.totalAgendamentos > 0 
                ? `${Math.round((stats.agendamentosCancelados / stats.totalAgendamentos) * 100)}% de cancelamento`
                : 'N/A'
              }
            </p>
          </div>

          {/* Receita Total */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #f59e0b'
          }}>
            <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Receita Total</p>
            <h3 style={{ margin: 0, fontSize: '32px', color: '#f59e0b' }}>
              {formatCurrency(stats.receitaTotal)}
            </h3>
            <p style={{ margin: '10px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
              De agendamentos confirmados
            </p>
          </div>
        </div>

        {/* Serviços mais vendidos */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>🎯 Serviços Mais Vendidos</h2>
          
          {stats.servicosMaisVendidos.length > 0 ? (
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
                    Quantidade
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#6b7280', fontWeight: '600', fontSize: '14px' }}>
                    Receita
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.servicosMaisVendidos.map((servico, index) => (
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

        {/* Gráfico de agendamentos últimos 7 dias */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>📈 Agendamentos (Últimos 7 Dias)</h2>
          
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            height: '200px',
            padding: '20px 0'
          }}>
            {stats.agendamentosUltimos7Dias.map((dia, index) => {
              const maxValue = Math.max(...stats.agendamentosUltimos7Dias.map(d => d.quantidade), 1)
              const altura = (dia.quantidade / maxValue) * 100
              const data = new Date(dia.data)
              const diaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][data.getDay()]
              
              return (
                <div key={index} style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    height: `${altura}%`,
                    width: '100%',
                    backgroundColor: '#2563eb',
                    borderRadius: '4px 4px 0 0',
                    minHeight: altura > 0 ? '4px' : '0'
                  }} />
                  <div style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    <div style={{ fontWeight: '600' }}>{dia.quantidade}</div>
                    <div>{diaSemana}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dicas */}
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #93c5fd',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, color: '#1e40af' }}>💡 Dicas para Aumentar Seus Agendamentos:</h3>
          <ul style={{ color: '#1e40af', paddingLeft: '20px', margin: '0' }}>
            <li>Mantenha seus serviços e horários atualizados</li>
            <li>Responda rapidamente aos clientes públicos</li>
            <li>Envie lembretes via WhatsApp antes dos agendamentos</li>
            <li>Solicite avaliações após cada agendamento</li>
            <li>Ofereça descontos para clientes frequentes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
