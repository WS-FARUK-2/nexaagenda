'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import Toast from '@/components/Toast'

export default function SelecionarPerfilPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'professional' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [perfis, setPerfis] = useState<Array<{ id: string; type: 'admin' | 'professional'; label: string; icon: string }>>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase!.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)

        // Verificar quais perfis o usuário tem acesso
        // Admin: se tem uma linha na tabela 'empresas' como owner
        // Professional: se tem uma linha na tabela 'profissionais'
        
        const availablePerfis: Array<{ id: string; type: 'admin' | 'professional'; label: string; icon: string }> = []

        // Verificar se é admin
        try {
          const { data: empresas, error: empresasError } = await supabase!
            .from('empresas')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)

          if (!empresasError && empresas && empresas.length > 0) {
            availablePerfis.push({
              id: 'admin',
              type: 'admin',
              label: 'Administrador',
              icon: '👔'
            })
          }
        } catch (error) {
          console.error('Erro ao verificar perfil admin:', error)
        }

        // Verificar se é professional
        try {
          const { data: professionals, error: profsError } = await supabase!
            .from('profissionais')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)

          if (!profsError && professionals && professionals.length > 0) {
            availablePerfis.push({
              id: 'professional',
              type: 'professional',
              label: 'Profissional',
              icon: '💼'
            })
          }
        } catch (error) {
          console.error('Erro ao verificar perfil professional:', error)
        }

        // Se não tem nenhum perfil, redireciona para dashboard admin (padrão)
        if (availablePerfis.length === 0) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_role', 'admin')
            sessionStorage.setItem('user_role', 'admin')
          }
          router.push('/dashboard')
          return
        }

        // Se tem apenas um perfil, redireciona automaticamente
        if (availablePerfis.length === 1) {
          const role = availablePerfis[0].type
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_role', role)
            sessionStorage.setItem('user_role', role)
          }
          
          if (role === 'professional') {
            router.push('/dashboard/profissional')
          } else {
            router.push('/dashboard')
          }
          return
        }

        // Tem múltiplos perfis, mostrar seleção
        setPerfis(availablePerfis)
      } catch (error) {
        console.error('Erro ao verificar perfis:', error)
        setToast({ message: 'Erro ao carregar perfis', type: 'error' })
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const handleSelectPerfil = async (role: 'admin' | 'professional') => {
    try {
      setSubmitting(true)
      setSelectedRole(role)

      // Salvar role selecionado
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_role', role)
        sessionStorage.setItem('user_role', role)
      }

      // Aguardar um pouco para garantir que o storage foi atualizado
      setTimeout(() => {
        if (role === 'professional') {
          router.push('/dashboard/profissional')
        } else {
          router.push('/dashboard')
        }
      }, 300)
    } catch (error) {
      console.error('Erro ao selecionar perfil:', error)
      setToast({ message: 'Erro ao selecionar perfil', type: 'error' })
      setSubmitting(false)
      setSelectedRole(null)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  // Se chegou aqui sem perfis múltiplos, algo deu errado
  if (perfis.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2C5F6F 0%, #1a3a47 100%)',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '600px',
          width: '100%',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '600', 
            color: '#1a3a47',
            margin: '0 0 10px 0'
          }}>
            Selecione seu Perfil
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            margin: '0'
          }}>
            Você tem acesso a múltiplos perfis
          </p>
        </div>

        {/* Perfis Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '40px',
        }}>
          {perfis.map((perfil) => (
            <button
              key={perfil.id}
              onClick={() => handleSelectPerfil(perfil.type)}
              disabled={submitting && selectedRole !== perfil.type}
              className={`perfil-button ${selectedRole === perfil.type ? 'selected' : ''} ${submitting && selectedRole !== perfil.type ? 'disabled' : ''}`}
              style={{
                background: selectedRole === perfil.type 
                  ? '#2C5F6F' 
                  : 'white',
                border: '2px solid #2C5F6F',
                borderRadius: '12px',
                padding: '30px',
                cursor: submitting && selectedRole !== perfil.type ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: submitting && selectedRole !== perfil.type ? 0.5 : 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
              }}
            >
              <div style={{ fontSize: '40px' }}>
                {perfil.icon}
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: selectedRole === perfil.type ? 'white' : '#1a3a47',
              }}>
                {perfil.label}
              </div>
              <div style={{
                fontSize: '13px',
                color: selectedRole === perfil.type ? 'rgba(255,255,255,0.8)' : '#999',
              }}>
                {perfil.type === 'admin' 
                  ? 'Gerenciar empresas e agendamentos'
                  : 'Visualizar seus agendamentos'
                }
              </div>

              {selectedRole === perfil.type && (
                <div style={{
                  marginTop: '10px',
                  fontSize: '12px',
                  color: 'white',
                }}>
                  ✓ Selecionado
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#999',
        }}>
          <p style={{ margin: '0' }}>
            Você pode mudar seu perfil a qualquer momento nas configurações
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .perfil-button:hover:not(.disabled) {
          background: #f5f5f5 !important;
          transform: translateY(-2px);
        }

        .perfil-button.selected {
          background: #2C5F6F;
          color: white;
        }

        .perfil-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          div[style*="padding: 40px"] {
            padding: 30px 20px !important;
          }

          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
