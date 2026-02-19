'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import Sidebar from '@/components/Sidebar'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({
    clientes: 0,
    servicos: 0,
    agendamentos: 0,
    agendamentosPublicos: 0
  })
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase!.auth.getUser()
        
        if (!user) {
          // Se não estiver logado, redireciona para login
          router.push('/login')
        } else {
          // Verificar se o usuário já selecionou um perfil
          const storedRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null
          
          // Se não tem role selecionado, precisa passar pela página de seleção
          if (!storedRole) {
            router.push('/selecionar-perfil')
            setLoading(false)
            return
          }

          // Se é profissional, redireciona para dashboard profissional
          if (storedRole === 'professional') {
            router.push('/dashboard/profissional')
            setLoading(false)
            return
          }
          
          setUser(user)
          // Carregar contadores com timeout
          const timeoutId = setTimeout(() => {
            // Se não carregar em 5 segundos, parar o loading mesmo assim
            setLoading(false)
          }, 5000)
          
          await loadCounts(user.id)
          clearTimeout(timeoutId)
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
  }, [router])

  const loadCounts = async (userId: string) => {
    try {
      // Fazer todas as queries em paralelo com timeout
      const results = await Promise.all([
        (async () => {
          try {
            const { count } = await supabase
              .from('patients')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
            return count || 0
          } catch {
            return 0
          }
        })(),
        (async () => {
          try {
            const { count } = await supabase
              .from('services')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
            return count || 0
          } catch {
            return 0
          }
        })(),
        (async () => {
          try {
            const { count } = await supabase
              .from('appointments')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
            return count || 0
          } catch {
            return 0
          }
        })(),
        (async () => {
          try {
            const { count } = await supabase
              .from('agendamentos_publicos')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
            return count || 0
          } catch {
            return 0
          }
        })()
      ])

      setCounts({
        clientes: results[0],
        servicos: results[1],
        agendamentos: results[2],
        agendamentosPublicos: results[3]
      })
    } catch (error) {
      console.error('Erro ao carregar contadores:', error)
      // Manter os valores padrão se houver erro
    }
  }

  const handleLogout = async () => {
    await supabase!.auth.signOut()
    router.push('/login')
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      <Sidebar user={user} />
      
      <div style={{ flex: 1, padding: '30px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {/* Header com Boas-vindas */}
          <div style={{
            backgroundColor: 'linear-gradient(135deg, #2C5F6F 0%, #1a3a47 100%)',
            padding: '40px',
            borderRadius: '12px',
            marginBottom: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '2px solid #E87A3F',
            color: 'white'
          }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 'bold' }}>
              🎯 Bem-vindo!
            </h1>
            <div style={{ height: '3px', width: '60px', backgroundColor: '#E87A3F', borderRadius: '2px', marginBottom: '12px' }} />
            <p style={{ margin: '0', fontSize: '16px', opacity: 0.9 }}>
              Aqui você gerencia toda sua agenda e negócio
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '14px', opacity: 0.8 }}>
              Email: <strong>{user?.email}</strong>
            </p>
          </div>

          {/* Cards de Estatísticas Principais */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {/* Card Clientes */}
            <div 
              onClick={() => router.push('/clientes')}
              style={{
                backgroundColor: 'white',
                padding: '28px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderLeft: '6px solid #2C5F6F',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#2C5F6F', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  👥 Clientes
                </h3>
                <span style={{ fontSize: '24px' }}>👤</span>
              </div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 8px', color: '#2C5F6F' }}>
                {counts.clientes}
              </p>
              <p style={{ margin: '0', color: '#E87A3F', fontSize: '13px', fontWeight: '600' }}>
                Clique para gerenciar →
              </p>
            </div>

            {/* Card Serviços */}
            <div 
              onClick={() => router.push('/servicos')}
              style={{
                backgroundColor: 'white',
                padding: '28px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderLeft: '6px solid #E87A3F',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#E87A3F', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ✂️ Serviços
                </h3>
                <span style={{ fontSize: '24px' }}>🛠️</span>
              </div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 8px', color: '#E87A3F' }}>
                {counts.servicos}
              </p>
              <p style={{ margin: '0', color: '#2C5F6F', fontSize: '13px', fontWeight: '600' }}>
                Clique para gerenciar →
              </p>
            </div>

            {/* Card Agendamentos */}
            <div 
              onClick={() => router.push('/agendamentos')}
              style={{
                backgroundColor: 'white',
                padding: '28px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderLeft: '6px solid #8b5cf6',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#8b5cf6', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📅 Agendamentos
                </h3>
                <span style={{ fontSize: '24px' }}>📆</span>
              </div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 8px', color: '#8b5cf6' }}>
                {counts.agendamentos}
              </p>
              <p style={{ margin: '0', color: '#8b5cf6', fontSize: '13px', fontWeight: '600' }}>
                Clique para gerenciar →
              </p>
            </div>
          </div>

          {/* Seção de Ações Rápidas */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 16px 0', color: '#2C5F6F', fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              ⚡ Ações Rápidas
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {/* Card Configuração */}
              <div 
                onClick={() => router.push('/dashboard/configuracao')}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderTop: '3px solid #10b981',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '16px', fontWeight: '600' }}>⚙️</h3>
                <p style={{ margin: '0 0 4px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Link Público</p>
                <p style={{ margin: '0', color: '#9ca3af', fontSize: '12px' }}>Configure seu agendamento</p>
              </div>

              {/* Card Horários */}
              <div 
                onClick={() => router.push('/dashboard/horarios')}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderTop: '3px solid #f59e0b',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: '#f59e0b', fontSize: '16px', fontWeight: '600' }}>⏰</h3>
                <p style={{ margin: '0 0 4px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Horários</p>
                <p style={{ margin: '0', color: '#9ca3af', fontSize: '12px' }}>Configure disponibilidade</p>
              </div>

              {/* Card Agendamentos Públicos */}
              <div 
                onClick={() => router.push('/dashboard/agendamentos-publicos')}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderTop: '3px solid #8b5cf6',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: '#8b5cf6', fontSize: '16px', fontWeight: '600' }}>📊</h3>
                <p style={{ margin: '0 0 4px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Públicos</p>
                <p style={{ margin: '0', color: '#9ca3af', fontSize: '12px' }}>{counts.agendamentosPublicos} agendamentos</p>
              </div>

              {/* Card Estatísticas */}
              <div 
                onClick={() => router.push('/dashboard/estatisticas')}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderTop: '3px solid #ec4899',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: '#ec4899', fontSize: '16px', fontWeight: '600' }}>📈</h3>
                <p style={{ margin: '0 0 4px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Relatório</p>
                <p style={{ margin: '0', color: '#9ca3af', fontSize: '12px' }}>Desempenho e análise</p>
              </div>

              {/* Card Profissionais */}
              <div 
                onClick={() => router.push('/dashboard/profissionais')}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderTop: '3px solid #06b6d4',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: '#06b6d4', fontSize: '16px', fontWeight: '600' }}>👥</h3>
                <p style={{ margin: '0 0 4px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Profissionais</p>
                <p style={{ margin: '0', color: '#9ca3af', fontSize: '12px' }}>Gerenciar equipe</p>
              </div>

              {/* Card Empresa */}
              <div 
                onClick={() => router.push('/dashboard/empresa')}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderTop: '3px solid #6366f1',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: '#6366f1', fontSize: '16px', fontWeight: '600' }}>🏢</h3>
                <p style={{ margin: '0 0 4px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Empresa</p>
                <p style={{ margin: '0', color: '#9ca3af', fontSize: '12px' }}>Dados da empresa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

