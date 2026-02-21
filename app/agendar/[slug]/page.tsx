'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { getCache, setCache } from '@/lib/cache'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string
}

interface Professional {
  id: string
  name: string
  email?: string
  phone?: string
  photo_url?: string
  color?: string
  active: boolean
}

interface ProfilePublic {
  id: string
  user_id: string
  slug: string
  nome_profissional: string
  cor_primaria: string
  ativo: boolean
  foto_url?: string
}

interface CompanyData {
  nome_empresa?: string
  telefone?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  descricao?: string
  website?: string
  logo_url?: string
  foto_fachada_url?: string
}

interface HorarioSemana {
  dia_semana: number
  hora_inicio: string
  hora_fim: string
}

const diasSemanaMap = [
  'Domingo',
  'Segunda-Feira',
  'Terça-Feira',
  'Quarta-Feira',
  'Quinta-Feira',
  'Sexta-Feira',
  'Sábado'
]

interface TimeSlot {
  hora: string
  disponivel: boolean
}

export default function AgendarPage() {
  const params = useParams()
  const slug = params.slug as string

  const [profile, setProfile] = useState<ProfilePublic | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Record<string, Professional[]>>({})
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [horariosSemana, setHorariosSemana] = useState<HorarioSemana[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [selectedService, setSelectedService] = useState('')
  const [selectedProfessional, setSelectedProfessional] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone_cliente: '',
    email_cliente: '',
    observacoes: ''
  })

  // Carregar perfil e serviços com cache
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!supabase) {
          setError('Configuração do sistema ausente. Tente novamente mais tarde.')
          setLoading(false)
          return
        }
        // Tentar cache primeiro
        const cachedProfile = getCache(`profile_${slug}`)
        const cachedServices = getCache(`services_${slug}`)

        if (cachedProfile && cachedServices) {
          setProfile(cachedProfile)
          setServices(cachedServices)
          setLoading(false)
          return
        }

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
        // Cache perfil por 1 hora
        setCache(`profile_${slug}`, profileData, { expiresIn: 3600 })

        // Buscar dados da empresa (opcional)
        const { data: companyData } = await supabase
          .from('company_data')
          .select('nome_empresa, telefone, endereco, cidade, estado, cep, descricao, website, logo_url, foto_fachada_url')
          .eq('user_id', profileData.user_id)
          .single()

        if (companyData) {
          setCompany(companyData)
        }

        // Buscar horários de atendimento
        const { data: horariosData } = await supabase
          .from('horarios')
          .select('dia_semana, hora_inicio, hora_fim')
          .eq('user_id', profileData.user_id)
          .eq('ativo', true)
          .order('dia_semana')
          .order('hora_inicio')

        setHorariosSemana(horariosData || [])

        // Buscar serviços do profissional
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', profileData.user_id)
          .order('name')

        if (!servicesError && servicesData) {
          setServices(servicesData)
          // Cache serviços por 1 hora
          setCache(`services_${slug}`, servicesData, { expiresIn: 3600 })

          // Buscar profissionais vinculados a cada serviço
          const professionalsMap: Record<string, Professional[]> = {}
          
          for (const service of servicesData) {
            const { data: serviceProfessionals } = await supabase
              .from('service_professionals')
              .select(`
                professionals!inner (
                  id,
                  name,
                  email,
                  phone,
                  photo_url,
                  color,
                  active
                )
              `)
              .eq('service_id', service.id)

            if (serviceProfessionals && serviceProfessionals.length > 0) {
              const profs = serviceProfessionals
                .map((sp: any) => sp.professionals)
                .filter((p: any) => p && p.active) as Professional[]
              
              professionalsMap[service.id] = profs
            } else {
              // Se não houver profissionais cadastrados, usa o dono do perfil
              professionalsMap[service.id] = []
            }
          }

          setProfessionals(professionalsMap)
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
      if (!selectedDate || !profile || !supabase) return

      try {
        const date = new Date(selectedDate + 'T00:00:00')
        const dayOfWeek = date.getDay()

        // Buscar horários configurados para este dia da semana
        const { data: horariosData, error: horariosError } = await supabase
          .from('horarios_disponiveis')
          .select('*')
          .eq('user_id', profile.user_id)
          .eq('dia_semana', dayOfWeek)

        if (horariosError || !horariosData || horariosData.length === 0) {
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

    if (!supabase) {
      setError('Configuração do sistema ausente. Tente novamente mais tarde.')
      setSubmitting(false)
      return
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      setError('Selecione serviço, data e horário')
      setSubmitting(false)
      return
    }

    if (!selectedProfessional) {
      setError('Selecione um profissional')
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
          professional_id: selectedProfessional,
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
      setSelectedProfessional('')
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

  const corPrimaria = profile?.cor_primaria || '#2563eb'
  const todayStr = getMinDate()
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto'
      }}>
        {/* Cabeçalho */}
        <div style={{
          backgroundColor: corPrimaria,
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '20px'
          }}>
            {profile?.foto_url ? (
              <img
                src={profile.foto_url}
                alt={profile.nome_profissional}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (profile?.nome_profissional || 'N')[0]
            )}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>{profile?.nome_profissional}</h1>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>Agende seu horário online</p>
          </div>
        </div>

        {/* Mensagens */}
        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
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
            padding: '16px',
            marginBottom: '16px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            border: '2px solid #10b981',
            fontSize: '15px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <div className="booking-layout" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px'
        }}>
          {/* Coluna principal */}
          <div>
            <form onSubmit={handleSubmit}>
              {/* Serviços */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                marginBottom: '16px'
              }}>
                <h2 style={{ margin: '0 0 8px 0', color: corPrimaria }}>Serviços</h2>
                <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
                  Selecione abaixo qual serviço deseja realizar o agendamento
                </p>

                {services.length === 0 ? (
                  <p style={{ color: '#9ca3af' }}>Nenhum serviço cadastrado.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {services.map(service => {
                      const isOpen = selectedService === service.id
                      return (
                        <div key={service.id} style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          overflow: 'hidden'
                        }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedService(service.id)
                              setSelectedProfessional('')
                              setSelectedDate('')
                              setSelectedTime('')
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '12px 14px',
                              backgroundColor: isOpen ? '#f8fafc' : 'white',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontWeight: 600
                            }}
                          >
                            <span>{service.name}</span>
                            <span style={{ color: '#9ca3af' }}>▾</span>
                          </button>

                          {isOpen && (
                            <div style={{ padding: '12px 14px', borderTop: '1px solid #e5e7eb' }}>
                              <p style={{ margin: '0 0 8px 0', color: '#374151' }}>
                                <strong>Duração:</strong> {service.duration} minutos
                              </p>
                              <p style={{ margin: '0 0 12px 0', color: '#374151' }}>
                                <strong>Valor:</strong> {formatCurrency(service.price)}
                              </p>

                              <div style={{ marginBottom: '16px' }}>
                                <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Selecione o profissional</p>
                                {(() => {
                                  const serviceProfessionals = professionals[service.id] || []
                                  
                                  return (
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                      {serviceProfessionals.map((prof: any) => {
                                        const isSelected = selectedProfessional === prof.id
                                        return (
                                          <div
                                            key={prof.id}
                                            onClick={() => {
                                              setSelectedProfessional(prof.id)
                                              setSelectedDate('')
                                              setSelectedTime('')
                                            }}
                                            style={{
                                              display: 'flex',
                                              flexDirection: 'column',
                                              alignItems: 'center',
                                              gap: '6px',
                                              cursor: 'pointer',
                                              padding: '8px',
                                              borderRadius: '8px',
                                              border: isSelected ? `2px solid ${corPrimaria}` : '2px solid transparent',
                                              backgroundColor: isSelected ? '#f0f9ff' : 'transparent'
                                            }}
                                          >
                                            <div style={{
                                              width: '56px',
                                              height: '56px',
                                              borderRadius: '50%',
                                              overflow: 'hidden',
                                              border: isSelected ? `3px solid ${corPrimaria}` : '2px solid #e5e7eb',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontWeight: 'bold',
                                              fontSize: '20px',
                                              backgroundColor: prof.color || '#f3f4f6',
                                              color: 'white'
                                            }}>
                                              {prof.photo_url ? (
                                                <img
                                                  src={prof.photo_url}
                                                  alt={prof.name}
                                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                              ) : (
                                                (prof.name || 'P')[0].toUpperCase()
                                              )}
                                            </div>
                                            <span style={{ 
                                              fontSize: '13px', 
                                              fontWeight: isSelected ? 600 : 400,
                                              color: isSelected ? corPrimaria : '#374151'
                                            }}>
                                              {prof.name}
                                            </span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )
                                })()}
                              </div>

                              <div style={{ marginBottom: '12px' }}>
                                <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: corPrimaria }}>Selecione o dia</p>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedDate(todayStr)
                                      setSelectedTime('')
                                    }}
                                    style={{
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      border: '1px solid #e5e7eb',
                                      backgroundColor: selectedDate === todayStr ? corPrimaria : 'white',
                                      color: selectedDate === todayStr ? 'white' : '#374151',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Hoje
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedDate(tomorrowStr)
                                      setSelectedTime('')
                                    }}
                                    style={{
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      border: '1px solid #e5e7eb',
                                      backgroundColor: selectedDate === tomorrowStr ? corPrimaria : 'white',
                                      color: selectedDate === tomorrowStr ? 'white' : '#374151',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Amanhã
                                  </button>
                                  <div style={{ flex: 1, minWidth: '160px' }}>
                                    <input
                                      type="date"
                                      value={selectedDate}
                                      onChange={(e) => {
                                        setSelectedDate(e.target.value)
                                        setSelectedTime('')
                                      }}
                                      min={getMinDate()}
                                      style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px'
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {selectedDate && (
                                <div style={{ marginBottom: '8px' }}>
                                  <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: corPrimaria }}>Selecione o horário</p>
                                  {availableTimes.length === 0 ? (
                                    <p style={{ color: '#dc2626' }}>Nenhum horário disponível para esta data</p>
                                  ) : (
                                    <div style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                                      gap: '8px'
                                    }}>
                                      {availableTimes.map(time => (
                                        <button
                                          key={time}
                                          type="button"
                                          onClick={() => setSelectedTime(time)}
                                          style={{
                                            padding: '10px',
                                            border: selectedTime === time ? `2px solid ${corPrimaria}` : '1px solid #e5e7eb',
                                            backgroundColor: selectedTime === time ? corPrimaria : 'white',
                                            color: selectedTime === time ? 'white' : '#374151',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '13px'
                                          }}
                                        >
                                          {time.substring(0, 5)}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Dados do cliente */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                marginBottom: '16px'
              }}>
                <h3 style={{ margin: '0 0 12px 0', color: corPrimaria }}>Informe seus dados</h3>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.nome_cliente}
                    onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
                    placeholder="Seu nome"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Telefone *</label>
                  <input
                    type="tel"
                    value={formData.telefone_cliente}
                    onChange={(e) => setFormData({ ...formData, telefone_cliente: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Email (opcional)</label>
                  <input
                    type="email"
                    value={formData.email_cliente}
                    onChange={(e) => setFormData({ ...formData, email_cliente: e.target.value })}
                    placeholder="seu@email.com"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Observações (opcional)</label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Alguma observação ou preferência?"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: corPrimaria,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Agendando...' : 'Finalizar o agendamento'}
              </button>
            </form>
          </div>

          {/* Coluna lateral */}
          <div>
            {/* Logo/Foto da Empresa */}
            {(company?.logo_url || company?.foto_fachada_url) && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '18px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <img
                  src={company.logo_url || company.foto_fachada_url}
                  alt={company.nome_empresa || 'Logo da empresa'}
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Contato */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '18px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              marginBottom: '16px'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Contato</h3>
              
              <p style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '14px', fontWeight: 600 }}>
                {company?.nome_empresa || profile?.nome_profissional}
              </p>
              
              {company?.endereco && (
                <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                  📍 {company.endereco}
                  {company.cidade && `, ${company.cidade}`}
                  {company.estado && ` - ${company.estado}`}
                  {company.cep && ` • CEP ${company.cep}`}
                </p>
              )}
              
              {company?.telefone && (
                <p style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '14px', fontWeight: 600 }}>
                  📞 {company.telefone}
                </p>
              )}
              
              {company?.website && (
                <p style={{ margin: 0, fontSize: '14px' }}>
                  <a 
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: corPrimaria, textDecoration: 'none' }}
                  >
                    🌐 Website
                  </a>
                </p>
              )}
            </div>

            {/* Horários de atendimento */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '18px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Horários de atendimento</h3>
                {horariosSemana.length === 0 && (
                  <span style={{
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    Fechado
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: '14px', color: '#374151' }}>
                {horariosSemana.length === 0 ? (
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>
                    Horários não configurados
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {diasSemanaMap.map((dia, index) => {
                      const horariosDoDia = horariosSemana.filter(h => h.dia_semana === index)
                      const hoje = new Date().getDay()
                      const isHoje = index === hoje
                      
                      if (horariosDoDia.length === 0) {
                        return (
                          <div key={dia} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 0',
                            borderBottom: index < 6 ? '1px solid #f3f4f6' : 'none'
                          }}>
                            <span style={{ 
                              fontWeight: isHoje ? 600 : 400,
                              color: isHoje ? corPrimaria : '#374151'
                            }}>
                              {dia}
                            </span>
                            <span style={{
                              backgroundColor: '#f3f4f6',
                              color: '#9ca3af',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 500
                            }}>
                              Fechado
                            </span>
                          </div>
                        )
                      }

                      return (
                        <div key={dia} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 0',
                          borderBottom: index < 6 ? '1px solid #f3f4f6' : 'none'
                        }}>
                          <span style={{ 
                            fontWeight: isHoje ? 600 : 400,
                            color: isHoje ? corPrimaria : '#374151'
                          }}>
                            {dia}
                          </span>
                          <span style={{ 
                            color: '#111827',
                            fontSize: '13px',
                            fontWeight: isHoje ? 600 : 400
                          }}>
                            {horariosDoDia
                              .map(h => `${h.hora_inicio.substring(0, 5)} - ${h.hora_fim.substring(0, 5)}`)
                              .join(' / ')}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          padding: '12px',
          color: '#6b7280',
          fontSize: '13px'
        }}>
          Powered by <strong style={{ color: corPrimaria }}>NexaAgenda</strong>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .booking-layout {
            grid-template-columns: 1.4fr 0.6fr;
          }
        }
      `}</style>
    </div>
  )
}
