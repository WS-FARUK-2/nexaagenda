'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function GuiaPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase!.auth.getUser()
      if (!authUser) {
        router.push('/login')
      } else {
        setUser(authUser)
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar user={user} />
      
      <div style={{ flex: 1, padding: '20px' }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>📖 Como Usar</h1>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            lineHeight: '1.6'
          }}>
            <h2 style={{ color: '#2563eb', marginTop: 0 }}>Bem-vindo ao NexaAgenda!</h2>
            
            <section style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#1f2937' }}>1️⃣ Configurar seu Perfil</h3>
              <p style={{ color: '#6b7280' }}>
                Comece acessando a seção "Link de Agendamento" para configurar seu perfil público,
                adicionar sua foto e escolher a cor do tema.
              </p>
            </section>

            <section style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#1f2937' }}>2️⃣ Cadastrar Serviços</h3>
              <p style={{ color: '#6b7280' }}>
                Vá em "Serviços" e adicione todos os serviços que você oferece com preço e duração.
              </p>
            </section>

            <section style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#1f2937' }}>3️⃣ Definir Horários</h3>
              <p style={{ color: '#6b7280' }}>
                Acesse "Link de Agendamento" ou "Horários" para definir seus horários disponíveis
                por dia da semana.
              </p>
            </section>

            <section style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#1f2937' }}>4️⃣ Compartilhar seu Link</h3>
              <p style={{ color: '#6b7280' }}>
                Copie seu link de agendamento público e compartilhe com seus clientes
                via WhatsApp, email ou redes sociais.
              </p>
            </section>

            <section style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#1f2937' }}>5️⃣ Gerenciar Agendamentos</h3>
              <p style={{ color: '#6b7280' }}>
                Acompanhe todos os agendamentos em "Agendamentos" e utilize o
                WhatsApp para enviar lembretes aos clientes.
              </p>
            </section>

            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '15px',
              borderRadius: '8px',
              borderLeft: '4px solid #3b82f6',
              marginTop: '20px'
            }}>
              <p style={{ margin: '0', color: '#1e40af', fontSize: '14px' }}>
                💡 <strong>Dica:</strong> Use a seção "Relatório Financeiro" para acompanhar
                sua receita e identificar seus serviços mais populares!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
