'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

// ============================================
// TIPOS/INTERFACES
// ============================================

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface Professional {
  id: string
  name: string
  photo_url?: string
  active: boolean
}

interface CompanyData {
  nome_empresa?: string
  telefone?: string
  endereco?: string
  cidade?: string
  estado?: string
  descricao?: string
  logo_url?: string
}

interface HorarioSemana {
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  horario_almoco_inicio?: string
  horario_almoco_fim?: string
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function AgendarPage() {
  const params = useParams()
  const slug = params.slug as string

  // Estados para dados carregados
  const [userId, setUserId] = useState<string>('')
  const [services, setServices] = useState<Service[]>([])
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [horariosSemana, setHorariosSemana] = useState<HorarioSemana[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Estados para seleção do agendamento
  const [expandedService, setExpandedService] = useState<string>('')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [selectedDateOption, setSelectedDateOption] = useState<'hoje' | 'amanha' | 'outro'>('hoje')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  // Estados para modal e formulário
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone_cliente: '',
    email_cliente: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  // Estados para "Meus Agendamentos"
  const [myAppointments, setMyAppointments] = useState<any[]>([])

  // ============================================
  // CARREGAR DADOS INICIAIS
  // ============================================

  useEffect(() => {
    loadInitialData()
  }, [slug])

  const loadInitialData = async () => {
    try {
      if (!supabase) {
        setError('Sistema não configurado')
        setLoading(false)
        return
      }

      // Buscar perfil público pelo slug
      const { data: profileData, error: profileError } = await supabase
        .from('profiles_public')
        .select('user_id')
        .eq('slug', slug)
        .eq('ativo', true)
        .single()

      if (profileError || !profileData) {
        setError('Página de agendamento não encontrada')
        setLoading(false)
        return
      }

      setUserId(profileData.user_id)

      // Buscar dados da empresa
      const { data: companyData } = await supabase
        .from('company_data')
        .select('nome_empresa, telefone, endereco, cidade, estado, descricao, logo_url')
        .eq('user_id', profileData.user_id)
        .single()

      if (companyData) {
        setCompany(companyData)
      }

      // Buscar horários de atendimento
      const { data: horariosData } = await supabase
        .from('horarios')
        .select('dia_semana, hora_inicio, hora_fim, horario_almoco_inicio, horario_almoco_fim')
        .eq('user_id', profileData.user_id)
        .eq('ativo', true)

      if (horariosData) {
        setHorariosSemana(horariosData)
      }

      // Buscar serviços
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name, price, duration')
        .eq('user_id', profileData.user_id)
        .order('name')

      if (servicesError) {
        console.error('Erro ao buscar serviços:', servicesError)
        setError('Erro ao carregar serviços')
        setLoading(false)
        return
      }

      setServices(servicesData || [])
      setLoading(false)

    } catch (err: any) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar página')
      setLoading(false)
    }
  }

  // ============================================
  // FUNÇÕES DE SELEÇÃO
  // ============================================

  const handleServiceClick = async (service: Service) => {
    if (expandedService === service.id) {
      // Fechar acordeão
      setExpandedService('')
      setSelectedService(null)
      setProfessionals([])
      setSelectedProfessional(null)
      setSelectedDate('')
      setSelectedTime('')
      setAvailableTimes([])
    } else {
      // Abrir acordeão e carregar profissionais
      setExpandedService(service.id)
      setSelectedService(service)
      setProfessionals([])
      setSelectedProfessional(null)
      setSelectedDate('')
      setSelectedTime('')
      setAvailableTimes([])

      // Buscar profissionais deste serviço
      const { data: profData } = await supabase!
        .from('service_professionals')
        .select(`
          professional_id,
          professionals:professional_id (
            id,
            name,
            photo_url,
            active
          )
        `)
        .eq('service_id', service.id)

      if (profData) {
        const profs = profData
          .map((sp: any) => sp.professionals)
          .filter((p: any) => p && p.active)
        setProfessionals(profs)
      }
    }
  }

  const handleProfessionalClick = (professional: Professional) => {
    setSelectedProfessional(professional)
    setSelectedDate('')
    setSelectedTime('')
    setAvailableTimes([])
    
    // Definir data de hoje como padrão
    const hoje = new Date()
    const dataHoje = hoje.toISOString().split('T')[0]
    setSelectedDate(dataHoje)
    setSelectedDateOption('hoje')
  }

  const handleDateOptionClick = (option: 'hoje' | 'amanha' | 'outro') => {
    setSelectedDateOption(option)
    setSelectedTime('')
    setAvailableTimes([])

    const hoje = new Date()
    
    if (option === 'hoje') {
      const dataHoje = hoje.toISOString().split('T')[0]
      setSelectedDate(dataHoje)
      loadAvailableTimes(dataHoje)
    } else if (option === 'amanha') {
      const amanha = new Date(hoje)
      amanha.setDate(amanha.getDate() + 1)
      const dataAmanha = amanha.toISOString().split('T')[0]
      setSelectedDate(dataAmanha)
      loadAvailableTimes(dataAmanha)
    }
    // Para 'outro', não carrega horários ainda
  }

  const handleCustomDateChange = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    loadAvailableTimes(date)
  }

  const loadAvailableTimes = async (date: string) => {
    if (!selectedService || !selectedProfessional) return

    const dayOfWeek = new Date(date + 'T12:00:00').getDay()
    const horarioDoDia = horariosSemana.find(h => h.dia_semana === dayOfWeek)

    if (!horarioDoDia) {
      setAvailableTimes([])
      return
    }

    // Gerar slots de horários baseado no intervalo de grade (15 min padrão)
    const slots: string[] = []
    const inicio = horarioDoDia.hora_inicio
    const fim = horarioDoDia.hora_fim
    const almocoInicio = horarioDoDia.horario_almoco_inicio
    const almocoFim = horarioDoDia.horario_almoco_fim

    let currentTime = timeToMinutes(inicio)
    const endTime = timeToMinutes(fim)

    while (currentTime < endTime) {
      const timeStr = minutesToTime(currentTime)
      
      // Verificar se não está no horário de almoço
      if (almocoInicio && almocoFim) {
        const almocoInicioMin = timeToMinutes(almocoInicio)
        const almocoFimMin = timeToMinutes(almocoFim)
        if (currentTime >= almocoInicioMin && currentTime < almocoFimMin) {
          currentTime += 15
          continue
        }
      }

      slots.push(timeStr)
      currentTime += 15
    }

    // Buscar agendamentos já existentes
    const { data: appointments } = await supabase!
      .from('appointments')
      .select('appointment_time')
      .eq('appointment_date', date)
      .eq('professional_id', selectedProfessional.id)

    const bookedTimes = appointments?.map(a => a.appointment_time.substring(0, 5)) || []

    // Filtrar horários disponíveis
    const available = slots.filter(slot => !bookedTimes.includes(slot))
    setAvailableTimes(available)
  }

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  // ============================================
  // FINALIZAR AGENDAMENTO
  // ============================================

  const handleFinalizarClick = () => {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime) {
      alert('Por favor, complete todas as seleções')
      return
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome_cliente || !formData.telefone_cliente) {
      alert('Nome e telefone são obrigatórios')
      return
    }

    setSubmitting(true)

    try {
      // Criar ou buscar paciente
      const { data: patientData, error: patientError } = await supabase!
        .from('patients')
        .upsert({
          name: formData.nome_cliente,
          phone: formData.telefone_cliente,
          email: formData.email_cliente || null,
          user_id: userId
        }, {
          onConflict: 'phone,user_id'
        })
        .select()
        .single()

      if (patientError) throw patientError

      // Criar agendamento
      const { error: appointmentError } = await supabase!
        .from('appointments')
        .insert({
          user_id: userId,
          patient_id: patientData.id,
          professional_id: selectedProfessional!.id,
          service_id: selectedService!.id,
          appointment_date: selectedDate,
          appointment_time: selectedTime + ':00',
          status: 'agendado'
        })

      if (appointmentError) throw appointmentError

      setSuccess('Agendamento realizado com sucesso!')
      setShowModal(false)
      setFormData({ nome_cliente: '', telefone_cliente: '', email_cliente: '' })
      
      // Recarregar "Meus Agendamentos"
      loadMyAppointments()
      
      // Resetar seleções
      setExpandedService('')
      setSelectedService(null)
      setSelectedProfessional(null)
      setSelectedDate('')
      setSelectedTime('')
      setAvailableTimes([])

    } catch (err: any) {
      console.error('Erro ao agendar:', err)
      alert('Erro ao criar agendamento: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const loadMyAppointments = async () => {
    if (!formData.telefone_cliente) return

    const { data } = await supabase!
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        services:service_id (name),
        professionals:professional_id (name)
      `)
      .eq('patients.phone', formData.telefone_cliente)
      .gte('appointment_date', new Date().toISOString().split('T')[0])
      .order('appointment_date')
      .order('appointment_time')

    if (data) {
      setMyAppointments(data)
    }
  }

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Carregando...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#ef4444'
      }}>
        {error}
      </div>
    )
  }

  const corPrimaria = '#E87A3F'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🕐</span>
          <span style={{ fontWeight: 600, fontSize: '18px' }}>Sua Agenda</span>
        </div>
        {formData.nome_cliente && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            <span style={{ marginRight: '8px' }}>👤</span>
            {formData.nome_cliente}
          </div>
        )}
      </div>

      {/* Nome da Empresa */}
      <div style={{
        backgroundColor: corPrimaria,
        padding: '16px 20px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
          {company?.nome_empresa || 'Estabelecimento'}
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
          {company?.cidade && company?.estado && `${company.cidade} - ${company.estado}`}
        </p>
      </div>

      {/* Conteúdo Principal */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
      }}>
        {/* Coluna Esquerda - Serviços */}
        <div>
          {/* Mensagem de Sucesso */}
          {success && (
            <div style={{
              backgroundColor: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              color: '#065f46'
            }}>
              ✓ {success}
            </div>
          )}

          {/* Seção de Serviços */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: corPrimaria, fontSize: '18px' }}>
              Serviços
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
              Selecione abaixo qual serviço deseja realizar o agendamento
            </p>

            {services.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                Nenhum serviço disponível
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {services.map((service) => (
                  <div key={service.id}>
                    {/* Acordeão Header */}
                    <button
                      onClick={() => handleServiceClick(service)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '15px',
                        fontWeight: 500
                      }}
                    >
                      {service.name}
                      <span style={{ fontSize: '18px' }}>
                        {expandedService === service.id ? '▲' : '▼'}
                      </span>
                    </button>

                    {/* Acordeão Content */}
                    {expandedService === service.id && (
                      <div style={{
                        padding: '16px',
                        border: '1px solid #e5e7eb',
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        backgroundColor: 'white'
                      }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
                          {service.name}
                        </h4>
                        <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                          <strong>Duração:</strong> {service.duration} minutos
                        </p>
                        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                          <strong>Valor:</strong> {formatCurrency(service.price)}
                        </p>

                        {/* Profissionais */}
                        {professionals.length > 0 && (
                          <>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 500 }}>
                              Selecione o profissional desejado para o agendamento
                            </p>
                            <div style={{
                              display: 'flex',
                              gap: '12px',
                              flexWrap: 'wrap'
                            }}>
                              {professionals.map((prof) => (
                                <div
                                  key={prof.id}
                                  onClick={() => handleProfessionalClick(prof)}
                                  style={{
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: selectedProfessional?.id === prof.id 
                                      ? `2px solid ${corPrimaria}` 
                                      : '2px solid transparent',
                                    backgroundColor: selectedProfessional?.id === prof.id 
                                      ? '#fef2f2' 
                                      : 'transparent'
                                  }}
                                >
                                  <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    backgroundColor: '#e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 8px'
                                  }}>
                                    <span style={{ fontSize: '24px' }}>👤</span>
                                  </div>
                                  <div style={{ fontSize: '13px', fontWeight: 500 }}>
                                    {prof.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {/* Seleção de Dia */}
                        {selectedProfessional && (
                          <div style={{ marginTop: '16px' }}>
                            <h5 style={{ 
                              margin: '0 0 8px 0', 
                              color: corPrimaria, 
                              fontSize: '16px' 
                            }}>
                              Selecione o dia
                            </h5>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              <button
                                onClick={() => handleDateOptionClick('hoje')}
                                style={{
                                  padding: '10px 16px',
                                  backgroundColor: selectedDateOption === 'hoje' ? corPrimaria : 'white',
                                  color: selectedDateOption === 'hoje' ? 'white' : '#333',
                                  border: `1px solid ${corPrimaria}`,
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: 500
                                }}
                              >
                                Hoje
                                <div style={{ fontSize: '12px', marginTop: '2px' }}>
                                  {new Date().toLocaleDateString('pt-BR')}
                                </div>
                              </button>

                              <button
                                onClick={() => handleDateOptionClick('amanha')}
                                style={{
                                  padding: '10px 16px',
                                  backgroundColor: selectedDateOption === 'amanha' ? corPrimaria : 'white',
                                  color: selectedDateOption === 'amanha' ? 'white' : '#333',
                                  border: `1px solid ${corPrimaria}`,
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: 500
                                }}
                              >
                                Amanhã
                                <div style={{ fontSize: '12px', marginTop: '2px' }}>
                                  {new Date(Date.now() + 86400000).toLocaleDateString('pt-BR')}
                                </div>
                              </button>

                              <button
                                onClick={() => handleDateOptionClick('outro')}
                                style={{
                                  padding: '10px 16px',
                                  backgroundColor: selectedDateOption === 'outro' ? corPrimaria : 'white',
                                  color: selectedDateOption === 'outro' ? 'white' : '#333',
                                  border: `1px solid ${corPrimaria}`,
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: 500
                                }}
                              >
                                Outro dia
                              </button>
                            </div>

                            {selectedDateOption === 'outro' && (
                              <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleCustomDateChange(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                style={{
                                  padding: '10px',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '6px',
                                  width: '100%',
                                  marginBottom: '12px'
                                }}
                              />
                            )}
                          </div>
                        )}

                        {/* Grade de Horários */}
                        {selectedDate && availableTimes.length > 0 && (
                          <div style={{ marginTop: '16px' }}>
                            <h5 style={{ 
                              margin: '0 0 8px 0', 
                              color: corPrimaria, 
                              fontSize: '16px' 
                            }}>
                              Selecione o horário
                            </h5>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                              gap: '8px'
                            }}>
                              {availableTimes.map((time) => (
                                <button
                                  key={time}
                                  onClick={() => setSelectedTime(time)}
                                  style={{
                                    padding: '10px',
                                    border: selectedTime === time 
                                      ? `2px solid ${corPrimaria}` 
                                      : '1px solid #e5e7eb',
                                    backgroundColor: selectedTime === time ? corPrimaria : 'white',
                                    color: selectedTime === time ? 'white' : '#374151',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                  }}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedDate && availableTimes.length === 0 && selectedProfessional && (
                          <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '12px' }}>
                            Não há horários disponíveis nesta data
                          </p>
                        )}

                        {/* Botão Finalizar */}
                        {selectedTime && (
                          <button
                            onClick={handleFinalizarClick}
                            style={{
                              width: '100%',
                              padding: '14px',
                              backgroundColor: '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              marginTop: '16px'
                            }}
                          >
                            Finalizar o agendamento
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita - Informações */}
        <div>
          {/* Descrição */}
          {company?.descricao && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '18px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              marginBottom: '16px'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                {company.descricao}
              </p>
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
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>
              Contato
            </h3>
            
            {company?.endereco && (
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                📍 {company.endereco}
                {company.cidade && `, ${company.cidade}`}
                {company.estado && ` - ${company.estado}`}
              </p>
            )}
            
            {company?.telefone && (
              <p style={{ margin: '0', color: '#111827', fontSize: '14px', fontWeight: 600 }}>
                📞 {company.telefone}
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
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>
              Horários de atendimento
            </h3>
            
            {horariosSemana.length === 0 ? (
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>
                Horários não configurados
              </p>
            ) : (
              <div style={{ fontSize: '14px', color: '#374151' }}>
                {['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'].map((dia, index) => {
                  const horarioDoDia = horariosSemana.filter(h => h.dia_semana === index)
                  const hoje = new Date().getDay()
                  const isHoje = index === hoje

                  if (horarioDoDia.length === 0) {
                    return (
                      <div key={dia} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderBottom: index < 6 ? '1px solid #f3f4f6' : 'none'
                      }}>
                        <span style={{ fontWeight: isHoje ? 600 : 400 }}>
                          {dia}
                        </span>
                        <span style={{
                          backgroundColor: '#f3f4f6',
                          color: '#9ca3af',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
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
                      padding: '6px 0',
                      borderBottom: index < 6 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <span style={{ fontWeight: isHoje ? 600 : 400 }}>
                        {dia}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: isHoje ? 600 : 400 }}>
                        {horarioDoDia.map(h => 
                          `${h.hora_inicio.substring(0, 5)} - ${h.hora_fim.substring(0, 5)}`
                        ).join(' / ')}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Dados do Cliente */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>
              Informe os dados abaixo
            </h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}>
              para finalizar seu agendamento
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Nome e sobrenome
                </label>
                <input
                  type="text"
                  value={formData.nome_cliente}
                  onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
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
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Celular
                </label>
                <input
                  type="tel"
                  value={formData.telefone_cliente}
                  onChange={(e) => setFormData({ ...formData, telefone_cliente: e.target.value })}
                  required
                  placeholder="(00) 00000-0000"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  E-mail (Opcional)
                </label>
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
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                  E-mail não obrigatório, somente necessário caso queira receber notificações do agendamento por e-mail.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Aguarde...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
