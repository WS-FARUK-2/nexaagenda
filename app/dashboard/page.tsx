'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase!.auth.getUser()
      
      if (!user) {
        // Se não estiver logado, redireciona para login
        router.push('/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    
    getUser()
  }, [router])

  const handleLogout = async () => {
    await supabase!.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'Arial'
      }}>
        Carregando...
      </div>
    )
  }

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial'
    }}>
      {/* Cabeçalho */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{ 
          color: '#2563eb',
          fontSize: '24px',
          margin: 0
        }}>
          NexaAgenda
        </h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Sair
        </button>
      </div>

      {/* Boas-vindas */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>
          Bem-vindo, {user?.email}!
        </h2>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Sistema funcionando corretamente.
        </p>
      </div>

      {/* Cards de resumo (placeholders) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#4b5563' }}>Clientes</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>0</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#4b5563' }}>Serviços</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>0</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#4b5563' }}>Agendamentos</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>0</p>
        </div>
      </div>
    </div>
  )
}
