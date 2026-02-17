'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string
}

interface ProfilePublic {
  id: string
  user_id: string
  slug: string
  nome_profissional: string
  cor_primaria: string
  ativo: boolean
}

interface TimeSlot {
  hora: string
  disponivel: boolean
}

export default function AgendarPage() {
  const params = useParams()
  const slug = params.slug as string

  const [profile, setProfile] = useState<ProfilePublic | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone_cliente: '',
    email_cliente: '',
    observacoes: ''
  })

  // Carregar perfil e serviços
  useEffect(() => {
    const loadData = async () => {
      try {
        // Buscar perfil pelo slug
        const { data: profileData, error: profileError } = await supabase
          .from('profiles_public')
          .select('*')
          .eq('slug', slug)
          .eq('ativo', true)
          .single()

        if (profileError || !profileData) {
          setError('Página de agendamento não encontrada ou desativada.')
          setLoading(false)
          return
        }

        setProfile(profileData)

        // Buscar serviços do profissional
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', profileData.user_id)
          .order('name')

        console.log('Serviços encontrados:', servicesData)
        console.log('Erro ao buscar serviços:', servicesError)
        console.log('User ID do perfil:', profileData.user_id)

        if (!servicesError) {
          setServices(servicesData || [])
        }

        setLoading(false)
      } catch (err) {
        console.error('Erro:', err)
        setError('Erro ao carregar dados')
        setLoading(false)
      }
    }

    if (slug) {
      loadData()
    }
  }, [slug])

  // Gerar horários disponíveis quando data for selecionada
  useEffect(() => {
    const loadAvailableTimes = async () => {
      if (!selectedDate || !profile) return

      try {
        const date = new Date(selectedDate + 'T00:00:00')
        const dayOfWeek = date.getDay()

        // Buscar horários configurados para este dia da semana
        const { data: horariosData, error: horariosError } = await supabase
          .from('horarios_disponiveis')
          .select('*')
          .eq('user_id', profile.user_id)
          .eq('dia_semana', dayOfWeek)

        console.log('Data selecionada:', selectedDate)
        console.log('Dia da semana:', dayOfWeek)
        console.log('Horários encontrados:', horariosData)
        console.log('Erro ao buscar horários:', horariosError)

        if (horariosError || !horariosData || horariosData.length === 0) {
          console.log('Nenhum horário configurado para este dia')
          setAvailableTimes([])
          return
        }

        // Buscar agendamentos já existentes para esta data (públicos E internos)
        const [publicBookings, privateAppointments] = await Promise.all([
          supabase
            .from('agendamentos_publicos')
            .select('hora_agendamento')
            .eq('user_id', profile.user_id)
            .eq('data_agendamento', selectedDate)
            .neq('status', 'Cancelado'),
          supabase
            .from('appointments')
            .select('appointment_time')
            .eq('user_id', profile.user_id)
            .eq('appointment_date', selectedDate)
            .neq('status', 'Cancelado')
        ])

        const horariosOcupados = [
          ...(publicBookings.data?.map(a => a.hora_agendamento) || []),
          ...(privateAppointments.data?.map(a => a.appointment_time) || [])
        ]

        // Gerar horários disponíveis
        const times: string[] = []
        horariosData.forEach(horario => {
          // Normalizar formato de hora (remover segundos se houver)
          const inicio = horario.hora_inicio.substring(0, 5) // HH:MM
          const fim = horario.hora_fim.substring(0, 5)
          const intervalo = horario.intervalo || 30

          console.log('Processando horário:', { inicio, fim, intervalo })

          let currentTime = inicio + ':00'
          while (currentTime < fim + ':00') {
            const timeWithoutSeconds = currentTime.substring(0, 5)
            if (!horariosOcupados.includes(currentTime) && !horariosOcupados.includes(timeWithoutSeconds)) {
              times.push(timeWithoutSeconds)
            }
            // Adicionar intervalo
            const [h, m] = currentTime.split(':').map(Number)
            const totalMinutes = h * 60 + m + intervalo
            const newH = Math.floor(totalMinutes / 60)
            const newM = totalMinutes % 60
            currentTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}:00`
          }
        })

        console.log('Horários gerados:', times)
        console.log('Horários ocupados:', horariosOcupados)
        setAvailableTimes(times.sort())
      } catch (err) {
        console.error('Erro ao carregar horários:', err)
      }
    }

    loadAvailableTimes()
  }, [selectedDate, profile])

  // Agendar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    if (!selectedService || !selectedDate || !selectedTime) {
      setError('Selecione serviço, data e horário')
      setSubmitting(false)
      return
    }

    if (!formData.nome_cliente || !formData.telefone_cliente) {
      setError('Preencha nome e telefone')
      setSubmitting(false)
      return
    }

    try {
      // 1. Verificar se já existe um cliente com este email ou telefone
      let patientId = null
      
      if (formData.email_cliente) {
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', profile!.user_id)
          .eq('email', formData.email_cliente)
          .single()
        
        patientId = existingPatient?.id
      }

      // 2. Se não existir, criar o cliente automaticamente
      if (!patientId) {
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert([{
            user_id: profile!.user_id,
            name: formData.nome_cliente,
            phone: formData.telefone_cliente,
            email: formData.email_cliente || null
          }])
          .select()
          .single()

        if (patientError) {
          console.error('Erro ao criar cliente:', patientError)
          // Continua mesmo se não conseguir criar o cliente
        } else {
          patientId = newPatient?.id
          console.log('Cliente criado automaticamente:', patientId)
        }
      }

      // 3. Verificar conflito de horário antes de inserir (públicos E internos)
      const [publicConflicts, privateConflicts] = await Promise.all([
        supabase
          .from('agendamentos_publicos')
          .select('id')
          .eq('user_id', profile!.user_id)
          .eq('data_agendamento', selectedDate)
          .eq('hora_agendamento', selectedTime)
          .neq('status', 'Cancelado'),
        supabase
          .from('appointments')
          .select('id')
          .eq('user_id', profile!.user_id)
          .eq('appointment_date', selectedDate)
          .eq('appointment_time', selectedTime)
          .neq('status', 'Cancelado')
      ])

      const hasConflict = (publicConflicts.data && publicConflicts.data.length > 0) || 
                         (privateConflicts.data && privateConflicts.data.length > 0)

      if (hasConflict) {
        setError('⚠️ Este horário acabou de ser reservado. Por favor, escolha outro horário.')
        setSubmitting(false)
        return
      }

      // 4. Criar agendamento público
      const { error: insertError } = await supabase
        .from('agendamentos_publicos')
        .insert([{
          user_id: profile!.user_id,
          service_id: selectedService,
          nome_cliente: formData.nome_cliente,
          telefone_cliente: formData.telefone_cliente,
          email_cliente: formData.email_cliente,
          data_agendamento: selectedDate,
          hora_agendamento: selectedTime,
          observacoes: formData.observacoes,
          status: 'Pendente'
        }])

      if (insertError) throw insertError

      setSuccess('🎉 Agendamento realizado com sucesso! Entraremos em contato em breve.')
      
      // Limpar formulário
      setSelectedService('')
      setSelectedDate('')
      setSelectedTime('')
      setFormData({
        nome_cliente: '',
        telefone_cliente: '',
        email_cliente: '',
        observacoes: ''
      })
    } catch (err: any) {
      console.error('Erro:', err)
      setError(err.message || 'Erro ao agendar')
    } finally {
      setSubmitting(false)
    }
  }

  // Obter data mínima (hoje)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <p>Carregando...</p>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <h1 style={{ color: '#dc2626', marginBottom: '10px' }}>❌ Página não encontrada</h1>
        <p style={{ color: '#6b7280' }}>{error}</p>
      </div>
    )
  }

  const corPrimaria = profile?.cor_primaria || '#2563eb'

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Cabeçalho */}
        <div style={{
          backgroundColor: corPrimaria,
          color: 'white',
          padding: '40px',
          borderRadius: '12px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>
            {profile?.nome_profissional}
          </h1>
          <p style={{ margin: 0, fontSize: '18px', opacity: 0.9 }}>
            Agende seu horário online
          </p>
        </div>

        {/* Mensagens */}
        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            border: '2px solid #10b981',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, color: corPrimaria }}>Dados do Agendamento</h2>

          {/* Serviço */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Selecione o Serviço *
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">Escolha um serviço</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - {formatCurrency(service.price)} ({service.duration} min)
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Data *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setSelectedTime('')
              }}
              min={getMinDate()}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Horário */}
          {selectedDate && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Horário *
              </label>
              {availableTimes.length === 0 ? (
                <p style={{ color: '#dc2626' }}>
                  Nenhum horário disponível para esta data
                </p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '10px'
                }}>
                  {availableTimes.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      style={{
                        padding: '12px',
                        border: selectedTime === time ? `2px solid ${corPrimaria}` : '2px solid #e5e7eb',
                        backgroundColor: selectedTime === time ? corPrimaria : 'white',
                        color: selectedTime === time ? 'white' : '#374151',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: selectedTime === time ? 'bold' : 'normal'
                      }}
                    >
                      {time.substring(0, 5)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h3 style={{ color: corPrimaria }}>Seus Dados</h3>

          {/* Nome */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.nome_cliente}
              onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
              placeholder="Seu nome"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Telefone */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Telefone *
            </label>
            <input
              type="tel"
              value={formData.telefone_cliente}
              onChange={(e) => setFormData({ ...formData, telefone_cliente: e.target.value })}
              placeholder="(00) 00000-0000"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Email (opcional)
            </label>
            <input
              type="email"
              value={formData.email_cliente}
              onChange={(e) => setFormData({ ...formData, email_cliente: e.target.value })}
              placeholder="seu@email.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Observações */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Observações (opcional)
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Alguma observação ou preferência?"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: corPrimaria,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Agendando...' : '✓ Confirmar Agendamento'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          padding: '20px',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <p style={{ margin: 0 }}>
            Powered by <strong style={{ color: corPrimaria }}>NexaAgenda</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
