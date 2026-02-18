'use client'

import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Toast from '@/components/Toast'

function RecuperarSenhaContent() {
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Detectar se é um reset token
  const resetToken = searchParams?.get('code')

  // Se tem reset token, já vem neste passo
  if (resetToken && step === 'email') {
    setStep('reset')
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!email) {
        throw new Error('Por favor, insira seu email')
      }

      const { error } = await supabase!.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/recuperar-senha`,
      })

      if (error) throw error

      setToast({ 
        message: 'Email de recuperação enviado! Verifique sua caixa de entrada e spam.', 
        type: 'success' 
      })
      
      // Limpar email após sucesso
      setTimeout(() => {
        setEmail('')
      }, 500)
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao solicitar recuperação'
      setError(errorMsg)
      setToast({ message: errorMsg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!password) {
        throw new Error('Por favor, insira a nova senha')
      }

      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres')
      }

      if (password !== confirmPassword) {
        throw new Error('As senhas não coincidem')
      }

      const { error } = await supabase!.auth.updateUser({ password })

      if (error) throw error

      setToast({ 
        message: 'Senha alterada com sucesso! Redirecionando para login...', 
        type: 'success' 
      })

      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao alterar senha'
      setError(errorMsg)
      setToast({ message: errorMsg, type: 'error' })
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
        padding: '20px',
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
            🔑 Recuperar Senha
          </h1>
          <p
            style={{
              textAlign: 'center',
              color: '#6b7280',
              marginBottom: '0',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {step === 'email'
              ? 'Digite seu email para receber um link de recuperação'
              : 'Digite sua nova senha'
            }
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleRequestReset}>
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
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
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
                required
                placeholder="seu@email.com"
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '6px',
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
            >
              {loading ? '⏳ Enviando...' : '📧 Enviar Link de Recuperação'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: '500',
                }}
              >
                Nova Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
                required
                placeholder="••••••••"
                minLength={6}
              />
              <p style={{ fontSize: '12px', color: '#999', margin: '6px 0 0 0' }}>
                Mínimo 6 caracteres
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: '500',
                }}
              >
                Confirmar Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '6px',
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
            >
              {loading ? '⏳ Atualizando...' : '✅ Atualizar Senha'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
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

export default function RecuperarSenhaPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Carregando...</div>}>
      <RecuperarSenhaContent />
    </Suspense>
  )
}
