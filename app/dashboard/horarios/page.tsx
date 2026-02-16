'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Horario {
  id: string
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  intervalo: number
}

const diasSemana = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
]

export default function HorariosPage() {
  const [user, setUser] = useState<any>(null)
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    dia_semana: 1,
    hora_inicio: '09:00',
    hora_fim: '18:00',
    intervalo: 30
  })

  const router = useRouter()

  // Autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase!.auth.getUser()
      if (!authUser) {
        router.push('/login')
      } else {
        setUser(authUser)
        loadHorarios(authUser.id)
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  // Carregar horários
  const loadHorarios = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('horarios_disponiveis')
        .select('*')
        .eq('user_id', userId)
        .order('dia_semana')
        .order('hora_inicio')

      if (!error) {
        setHorarios(data || [])
      }
    } catch (err) {
      console.error('Erro ao carregar horários:', err)
    }
  }

  // Adicionar horário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    if (formData.hora_inicio >= formData.hora_fim) {
      setError('Horário de término deve ser maior que horário de início')
      setSubmitting(false)
      return
    }

    try {
      const { error: insertError } = await supabase
        .from('horarios_disponiveis')
        .insert([{
          user_id: user.id,
          dia_semana: formData.dia_semana,
          hora_inicio: formData.hora_inicio + ':00',
          hora_fim: formData.hora_fim + ':00',
          intervalo: formData.intervalo
        }])

      if (insertError) throw insertError

      setSuccess('Horário adicionado com sucesso!')
      setShowForm(false)
      setFormData({
        dia_semana: 1,
        hora_inicio: '09:00',
        hora_fim: '18:00',
        intervalo: 30
      })
      loadHorarios(user.id)
    } catch (err: any) {
      console.error('Erro:', err)
      setError(err.message || 'Erro ao adicionar horário')
    } finally {
      setSubmitting(false)
    }
  }

  // Deletar horário
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este horário?')) return

    try {
      const { error: deleteError } = await supabase
        .from('horarios_disponiveis')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setSuccess('Horário deletado com sucesso!')
      loadHorarios(user.id)
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar horário')
    }
  }

  // Agrupar por dia da semana
  const horariosPorDia = diasSemana.map(dia => ({
    ...dia,
    horarios: horarios.filter(h => h.dia_semana === dia.value)
  }))

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <Link href="/dashboard" style={{ color: '#2563eb', textDecoration: 'none' }}>
          ← Voltar ao Dashboard
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0 0 10px 0' }}>Horários Disponíveis</h1>
          <p style={{ margin: 0, color: '#666' }}>
            Configure seus horários de atendimento por dia da semana
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {showForm ? 'Cancelar' : '+ Adicionar Horário'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '4px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#efe',
          color: '#3c3',
          borderRadius: '4px',
          border: '1px solid #cfc'
        }}>
          {success}
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ marginTop: 0 }}>Adicionar Novo Horário</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            {/* Dia da Semana */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Dia da Semana
              </label>
              <select
                value={formData.dia_semana}
                onChange={(e) => setFormData({ ...formData, dia_semana: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {diasSemana.map(dia => (
                  <option key={dia.value} value={dia.value}>{dia.label}</option>
                ))}
              </select>
            </div>

            {/* Intervalo */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Intervalo (minutos)
              </label>
              <select
                value={formData.intervalo}
                onChange={(e) => setFormData({ ...formData, intervalo: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
              </select>
            </div>

            {/* Hora Início */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Horário de Início
              </label>
              <input
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Hora Fim */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Horário de Término
              </label>
              <input
                type="time"
                value={formData.hora_fim}
                onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {submitting ? 'Salvando...' : 'Salvar Horário'}
          </button>
        </form>
      )}

      {/* Lista de Horários por Dia */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {horariosPorDia.map(dia => (
          <div key={dia.value} style={{ borderBottom: '1px solid #e5e7eb' }}>
            <div style={{
              padding: '15px 20px',
              backgroundColor: dia.horarios.length > 0 ? '#f0f9ff' : '#f9fafb',
              fontWeight: 'bold',
              color: dia.horarios.length > 0 ? '#2563eb' : '#6b7280'
            }}>
              {dia.label}
              {dia.horarios.length === 0 && (
                <span style={{ fontWeight: 'normal', fontSize: '14px', marginLeft: '10px' }}>
                  (Sem horários configurados)
                </span>
              )}
            </div>
            
            {dia.horarios.length > 0 && (
              <div style={{ padding: '10px 20px' }}>
                {dia.horarios.map(horario => (
                  <div key={horario.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    marginBottom: '5px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '4px'
                  }}>
                    <div>
                      <span style={{ fontWeight: 'bold' }}>
                        {horario.hora_inicio.substring(0, 5)} - {horario.hora_fim.substring(0, 5)}
                      </span>
                      <span style={{ marginLeft: '15px', color: '#6b7280', fontSize: '14px' }}>
                        Intervalo: {horario.intervalo} min
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(horario.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Deletar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {horarios.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6b7280'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>📅 Nenhum horário configurado ainda</p>
          <p style={{ margin: 0 }}>Adicione seus horários de atendimento para começar a receber agendamentos online.</p>
        </div>
      )}
    </div>
  )
}
