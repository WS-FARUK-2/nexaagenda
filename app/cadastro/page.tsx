'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CadastroPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validar se as senhas conferem
    if (password !== confirmPassword) {
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
      }
    })

    console.log('Resultado do cadastro:', { data, error })

    if (error) {
      setError(error.message)
    } else if (data?.user) {
      // Verifica se precisa confirmar email
      if (data.user.identities && data.user.identities.length === 0) {
        setError('Este email já está cadastrado. Faça login ou recupere sua senha.')
      } else if (data.user.confirmed_at) {
        setSuccess('Cadastro realizado com sucesso! Redirecionando...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
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
      backgroundColor: '#f4f6f8',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', color: '#2563eb' }}>
          NexaAgenda
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#6b7280' }}>
          Criar nova conta
        </p>
        
        <form onSubmit={handleCadastro}>
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
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '15px'
            }}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link href="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>
            Já tem uma conta? Faça login
          </Link>
        </div>
      </div>
    </div>
  )
}
