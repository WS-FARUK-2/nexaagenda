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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        // Cadastro
        const { error } = await supabase!.auth.signUp({
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
        const { error } = await supabase!.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error

        const { data: { user } } = await supabase!.auth.getUser()
        const metaRole = user?.user_metadata?.role as 'admin' | 'professional' | undefined
        if (metaRole) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_role', metaRole)
            sessionStorage.setItem('user_role', metaRole)
          }
        } else if (typeof window !== 'undefined') {
          localStorage.setItem('user_role', role)
          sessionStorage.setItem('user_role', role)
        }
        
        // Aguardar um pouco antes de redirecionar para garantir que a sessão está pronta
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      }
    } catch (error: any) {
      console.error("Erro de autenticação:", error)
      setToast({ message: error.message || 'Erro ao fazer login', type: 'error' })
      setError(error.message || 'Erro ao autenticar')
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
        backgroundColor: '#f3f4f6',
        fontFamily: 'Arial',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#2563eb',
            marginBottom: '10px',
            fontSize: '28px',
          }}
        >
          NexaAgenda
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: '30px',
          }}
        >
          {isSignUp ? 'Criar nova conta' : 'Entre na sua conta'}
        </p>

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
                    border: role === 'admin' ? '2px solid #2563eb' : '1px solid #d1d5db',
                    backgroundColor: role === 'admin' ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    fontWeight: role === 'admin' ? 'bold' : 'normal'
                  }}
                >
                  Administrador
                </button>
                <button
                  type="button"
                  onClick={() => setRole('professional')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: role === 'professional' ? '2px solid #2563eb' : '1px solid #d1d5db',
                    backgroundColor: role === 'professional' ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    fontWeight: role === 'professional' ? 'bold' : 'normal'
                  }}
                >
                  Profissional
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
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Carregando...' : isSignUp ? 'Cadastrar' : 'Entrar'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link href="/cadastro" style={{ color: '#2563eb', textDecoration: 'none' }}>
              Não tem uma conta? Cadastre-se
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
