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

        // Sempre mostrar as duas opções: Administrator e Profissional
        const allOptions: Array<{ id: string; type: 'admin' | 'professional'; label: string }> = [
          { id: 'admin', type: 'admin', label: 'Administrator' },
          { id: 'professional', type: 'professional', label: 'Profissional' }
        ]

        setPerfis(allOptions)
        setSelectedRole('') // Deixar vazio por padrão para forçar onChange
        setLoading(false)
      } catch (error) {
        console.error('Erro ao carregar página:', error)
        setToast({ message: 'Erro ao carregar página', type: 'error' })
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value
    
    if (!role || role === '') {
      return
    }

    try {
      // Salvar role selecionado ANTES de redirecionar
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_role', role)
        sessionStorage.setItem('user_role', role)
      }

      // Pequeno delay para garantir que foi salvo
      await new Promise(resolve => setTimeout(resolve, 100))

      // Redirecionar imediatamente
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
        padding: '15px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: window.innerWidth < 600 ? '30px 20px' : '50px 40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '25px', fontSize: window.innerWidth < 600 ? '48px' : '60px' }}>
          🕐
        </div>

        {/* Texto */}
        <p style={{ 
          fontSize: window.innerWidth < 600 ? '14px' : '16px', 
          color: '#2C5F6F',
          marginBottom: '25px',
          fontWeight: '500',
          lineHeight: '1.5'
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
            padding: '14px 16px',
            fontSize: '16px',
            border: '2px solid #ccc',
            borderRadius: '8px',
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
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            minHeight: '48px', // Melhor para mobile
            touchAction: 'manipulation', // Evita zoom no iOS
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
