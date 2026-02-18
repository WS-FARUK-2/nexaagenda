'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Toast from '@/components/Toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [role, setRole] = useState<'admin' | 'professional'>('admin')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()

  // Debug: Log quando o cliente Supabase está pronto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Verificar se supabase está inicializado
      if (!supabase) {
        throw new Error('Supabase não foi inicializado. Verifique as variáveis de ambiente.')
      }

      if (isSignUp) {
        // Cadastro
        console.log('Iniciando signup com email:', email)
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) throw error

        if (typeof window !== 'undefined') {
          localStorage.setItem('user_role', role)
          sessionStorage.setItem('user_role', role)
        }
        
        setToast({ message: 'Cadastro realizado! Verifique seu email para confirmar.', type: 'success' })
        setIsSignUp(false)
      } else {
        // Login
        console.log('Iniciando signin com email:', email)
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        console.log('Resultado do signin:', { data, error })
        
        if (error) {
          console.error('Erro de autenticação:', error)
          throw error
        }

        if (data?.user) {
          console.log('Login bem-sucedido, usuário:', data.user.email)
          const metaRole = data.user.user_metadata?.role as 'admin' | 'professional' | undefined
          if (metaRole) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('user_role', metaRole)
              sessionStorage.setItem('user_role', metaRole)
            }
          } else if (typeof window !== 'undefined') {
            localStorage.setItem('user_role', role)
            sessionStorage.setItem('user_role', role)
          }
        }
        
        console.log('Redirecionando para dashboard...')
        // Aguardar um pouco antes de redirecionar para garantir que a sessão está pronta
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      }
    } catch (error: any) {
      console.error("Erro de autenticação:", error)
      const errorMsg = error.message || 'Erro ao fazer login'
      setToast({ message: errorMsg, type: 'error' })
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2C5F6F 0%, #1a3a47 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '50px 40px',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '420px',
          border: '2px solid #E87A3F',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1
            style={{
              textAlign: 'center',
              color: '#2C5F6F',
              marginBottom: '8px',
              fontSize: '32px',
              fontWeight: 'bold',
              letterSpacing: '-0.5px',
            }}
          >
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
          <p
            style={{
              textAlign: 'center',
              color: '#6b7280',
              marginBottom: '0',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {isSignUp ? 'Crie sua conta' : 'Bem-vindo de volta'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isSignUp && (
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: '500',
                }}
              >
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
          )}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                color: '#374151',
                fontWeight: '500',
              }}
            >
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
                fontSize: '14px',
              }}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                color: '#374151',
                fontWeight: '500',
              }}
            >
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
                fontSize: '14px',
              }}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '10px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                borderRadius: '4px',
                marginBottom: '20px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#d1d5db' : '#E87A3F',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#d66b2f'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#E87A3F'
            }}
          >
            {loading ? '⏳ Processando...' : isSignUp ? '✨ Cadastrar' : '🔓 Entrar'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '14px' }}>
              {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            </p>
            <Link href={isSignUp ? '/login' : '/cadastro'} style={{ color: '#E87A3F', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
              {isSignUp ? '← Voltar ao Login' : 'Cadastre-se Agora →'}
            </Link>
          </div>
        </form>
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
