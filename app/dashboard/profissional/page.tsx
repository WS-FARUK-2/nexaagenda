'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import LoadingSpinner from '@/components/LoadingSpinner'

interface AppointmentItem {
  id: string
  date: string
  time: string
  name: string
  type: 'publico' | 'interno'
}

export default function DashboardProfissionalPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<AppointmentItem[]>([])
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase!.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await loadAgenda(user.id)
      setLoading(false)
    }
    getUser()
  }, [router])

  const loadAgenda = async (userId: string) => {
    const [publicos, internos] = await Promise.all([
      supabase
        .from('agendamentos_publicos')
        .select('id, data_agendamento, hora_agendamento, nome_cliente')
        .eq('user_id', userId)
        .order('data_agendamento', { ascending: true })
        .order('hora_agendamento', { ascending: true }),
      supabase
        .from('appointments')
        .select('id, appointment_date, appointment_time, patients(name)')
        .eq('user_id', userId)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
    ])

    const lista: AppointmentItem[] = []

    if (publicos.data) {
      publicos.data.forEach((item) => {
        lista.push({
          id: item.id,
          date: item.data_agendamento,
          time: item.hora_agendamento,
          name: item.nome_cliente,
          type: 'publico'
        })
      })
    }

    if (internos.data) {
      internos.data.forEach((item: any) => {
        lista.push({
          id: item.id,
          date: item.appointment_date,
          time: item.appointment_time,
          name: item.patients?.name || 'Cliente',
          type: 'interno'
        })
      })
    }

    setItems(lista.slice(0, 20))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
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
        <div style={{ maxWidth: '900px' }}>
          <h1 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Minha Agenda</h1>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {items.length === 0 ? (
              <p style={{ color: '#6b7280' }}>Nenhum agendamento encontrado.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Data</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Hora</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Cliente</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px' }}>{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '10px' }}>{item.time?.substring(0, 5)}</td>
                      <td style={{ padding: '10px' }}>{item.name}</td>
                      <td style={{ padding: '10px' }}>{item.type === 'publico' ? 'Público' : 'Interno'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
