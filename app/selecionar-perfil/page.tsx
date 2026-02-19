'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import Toast from '@/components/Toast'

export default function SelecionarPerfilPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [perfis, setPerfis] = useState<Array<{ id: string; type: 'admin' | 'professional'; label: string }>>([])
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

        const availablePerfis: Array<{ id: string; type: 'admin' | 'professional'; label: string }> = []

        // Verificar se é admin (tem empresa)
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
              label: 'Administrator'
            })
          }
        } catch (error) {
          console.error('Erro ao verificar perfil admin:', error)
        }

        // Verificar se é profissional
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
              label: 'Profissional'
            })
          }
        } catch (error) {
          console.error('Erro ao verificar perfil professional:', error)
        }

        // Se tem NENHUM ou APENAS 1 perfil encontrado no banco
        // Mostrar opções: Administrator e Profissional
        // Deixar usuário escolher
        const allOptions: Array<{ id: string; type: 'admin' | 'professional'; label: string }> = [
          { id: 'admin', type: 'admin', label: 'Administrator' },
          { id: 'professional', type: 'professional', label: 'Profissional' }
        ]

        setPerfis(allOptions)
        setSelectedRole('') // Deixar vazio por padrão para forçar onChange
      } catch (error) {
        console.error('Erro ao verificar perfis:', error)
        setToast({ message: 'Erro ao carregar perfis', type: 'error' })
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('handleSelectChange disparado com evento:', e)
    console.log('event.target.value:', e.target.value)
    
    const role = e.target.value
    
    console.log('Valor do dropdown:', e.target.value)
    console.log('Role extraído:', role)
    console.log('Tipo de role:', typeof role)
    console.log('Role vazio?:', role === '')
    
    if (!role || role === '') {
      console.log('Nenhum perfil selecionado - retornando')
      return
    }

    try {
      console.log('Perfil selecionado válido:', role)
      
      // Salvar role selecionado ANTES de redirecionar
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_role', role)
        sessionStorage.setItem('user_role', role)
        console.log('Role salvo no localStorage:', localStorage.getItem('user_role'))
      }

      // Pequeno delay para garantir que foi salvo
      await new Promise(resolve => setTimeout(resolve, 100))

      // Redirecionar imediatamente
      console.log('Iniciando redirecionamento para:', role === 'professional' ? '/dashboard/profissional' : '/dashboard')
      if (role === 'professional') {
        router.push('/dashboard/profissional')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro ao selecionar perfil:', error)
    }
  }

  if (loading) {
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
        background: '#e8e8e8',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '50px 40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '30px', fontSize: '60px' }}>
          🕐
        </div>

        {/* Texto */}
        <p style={{ 
          fontSize: '16px', 
          color: '#2C5F6F',
          marginBottom: '30px',
          fontWeight: '500'
        }}>
          Olá bem vindo de volta, agora selecione qual perfil deseja acessar
        </p>

        {/* Select Dropdown */}
        <select
          value={selectedRole}
          onChange={handleSelectChange}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            backgroundColor: 'white',
            color: '#333',
            cursor: submitting ? 'not-allowed' : 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '20px',
            paddingRight: '40px',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          <option value="">Selecione um perfil...</option>
          {perfis.map((perfil) => (
            <option key={perfil.id} value={perfil.type}>
              {perfil.label}
            </option>
          ))}
        </select>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
