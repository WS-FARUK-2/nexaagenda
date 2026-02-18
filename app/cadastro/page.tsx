'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Toast from '@/components/Toast'

export default function CadastroPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [success, setSuccess] = useState('')
  const [role, setRole] = useState<'admin' | 'professional'>('admin')
  const router = useRouter()

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validar se as senhas conferem
    if (password !== confirmPassword) {
      setToast({ message: 'As senhas não conferem', type: 'error' })
      setError('As senhas não conferem')
      setLoading(false)
      return
    }

    // Criar usuário no Supabase
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          role
        }
      }
    })


    if (error) {
      setToast({ message: error.message, type: 'error' })
      setError(error.message)
    } else if (data?.user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_role', role)
      }
      // Verifica se precisa confirmar email
      if (data.user.identities && data.user.identities.length === 0) {
        setToast({ message: 'Este email já está cadastrado. Faça login ou recupere sua senha.', type: 'error' })
        setError('Este email já está cadastrado. Faça login ou recupere sua senha.')
      } else if (data.user.confirmed_at) {
        setToast({ message: 'Cadastro realizado com sucesso! Redirecionando...', type: 'success' })
        setSuccess('Cadastro realizado com sucesso! Redirecionando...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setToast({ message: '✅ Cadastro realizado! IMPORTANTE: Verifique seu email para confirmar o cadastro. (Verifique também a pasta de SPAM)', type: 'success' })
        setSuccess('✅ Cadastro realizado! IMPORTANTE: Verifique seu email para confirmar o cadastro. (Verifique também a pasta de SPAM)')
        // Não redireciona automaticamente para dar tempo de ler a mensagem
      }
    }
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2C5F6F 0%, #1a3a47 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '50px 40px',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '420px',
        border: '2px solid #E87A3F',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '8px', color: '#2C5F6F', fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
            SuaAgenda
          </h1>
          <div
            style={{
              height: '3px',
              width: '60px',
              backgroundColor: '#E87A3F',
              margin: '0 auto 16px',
              borderRadius: '2px',
            }}
          />
          <p style={{ textAlign: 'center', marginBottom: '0', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
            Crie sua conta
          </p>
        </div>
        
        <form onSubmit={handleCadastro}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Eu sou
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRole('admin')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: role === 'admin' ? '2px solid #2C5F6F' : '1px solid #e5e7eb',
                  backgroundColor: role === 'admin' ? '#2C5F6F' : 'white',
                  color: role === 'admin' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
              >
                👨‍💼 Gerente
              </button>
              <button
                type="button"
                onClick={() => setRole('professional')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: role === 'professional' ? '2px solid #E87A3F' : '1px solid #e5e7eb',
                  backgroundColor: role === 'professional' ? '#E87A3F' : 'white',
                  color: role === 'professional' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
              >
                💼 Profissional
              </button>
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#374151' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#374151' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              required
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#374151' }}>
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              color: 'red',
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: '#fee2e2',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              color: 'green',
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: '#d1fae5',
              borderRadius: '4px'
            }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#E87A3F',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '15px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#d66b2f'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#E87A3F'
            }}
          >
            {loading ? '⏳ Cadastrando...' : '✨ Cadastrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ margin: '12px 0', color: '#6b7280', fontSize: '14px' }}>
            Já tem uma conta?
          </p>
          <Link href="/login" style={{ color: '#E87A3F', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
            ← Voltar ao Login
          </Link>
        </div>
      </div>
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
