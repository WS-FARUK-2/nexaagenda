'use client'

import React, { useState, useMemo } from 'react'

interface TimeSlot {
  time: string
  hour: number
  minute: number
}

interface Professional {
  id: string
  name: string
  color: string
}

interface CalendarEvent {
  id: string
  professionalId: string
  time: string
  clientName: string
  serviceName: string
  duration: number
}

interface CalendarGridProps {
  professionals: Professional[]
  events: CalendarEvent[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onSlotClick: (professionalId: string, time: string, date: Date) => void
  onEventClick: (event: CalendarEvent) => void
  interval: number // minutos (15, 30, 60)
  startHour: number // 8
  endHour: number // 20
  isLoading?: boolean
}

export default function CalendarGrid({
  professionals,
  events,
  selectedDate,
  onDateChange,
  onSlotClick,
  onEventClick,
  interval = 15,
  startHour = 8,
  endHour = 20,
  isLoading = false
}: CalendarGridProps) {
  const [viewType, setViewType] = useState<'week' | 'day'>('week')

  // Gerar slots de tempo
  const timeSlots: TimeSlot[] = useMemo(() => {
    const slots: TimeSlot[] = []
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        slots.push({
          time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
          hour,
          minute
        })
      }
    }
    return slots
  }, [startHour, endHour, interval])

  // Gerar datas da semana
  const weekDates = useMemo(() => {
    const dates: Date[] = []
    const current = new Date(selectedDate)
    const dayOfWeek = current.getDay()
    const diff = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(current.setDate(diff))

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [selectedDate])

  // Verificar se há evento para um profissional em um horário
  const getEventForSlot = (professionalId: string, time: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.find(
      e => e.professionalId === professionalId && 
           e.time === time && 
           e.id.includes(dateStr) // simplificado, deveria comparar data real
    )
  }

  // Formatar data para exibição
  const formatDate = (date: Date) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
    return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`
  }

  const handlePrevWeek = () => {
    const prev = new Date(selectedDate)
    prev.setDate(prev.getDate() - 7)
    onDateChange(prev)
  }

  const handleNextWeek = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 7)
    onDateChange(next)
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      {/* Header com controles */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h2 style={{ margin: 0 }}>Agendamentos - Calendário</h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewType('day')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewType === 'day' ? '#2C5F6F' : '#e0e0e0',
              color: viewType === 'day' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Dia
          </button>
          <button
            onClick={() => setViewType('week')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewType === 'week' ? '#2C5F6F' : '#e0e0e0',
              color: viewType === 'week' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Semana
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handlePrevWeek}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Anterior
          </button>
          <button
            onClick={handleToday}
            style={{
              padding: '8px 12px',
              backgroundColor: '#2C5F6F',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Hoje
          </button>
          <button
            onClick={handleNextWeek}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Próximo →
          </button>
        </div>
      </div>

      {/* Calendário em Grade */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `80px repeat(${professionals.length}, 1fr)`,
        gap: '1px',
        backgroundColor: '#ddd',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {/* Header com profissionais */}
        <div style={{
          padding: '12px 8px',
          backgroundColor: '#2C5F6F',
          color: 'white',
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '12px'
        }}>
          Horário
        </div>

        {professionals.map(prof => (
          <div
            key={prof.id}
            style={{
              padding: '12px 8px',
              backgroundColor: '#2C5F6F',
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: '13px',
              borderLeft: `4px solid ${prof.color}`
            }}
          >
            {prof.name} 🏅
          </div>
        ))}

        {/* Cells com horários e agendamentos */}
        {timeSlots.map((slot, slotIndex) => (
          <React.Fragment key={`row-${slotIndex}`}>
            {/* Coluna de horário */}
            <div style={{
              padding: '12px 8px',
              backgroundColor: '#f9fafb',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: '#666',
              borderRight: '1px solid #ddd'
            }}>
              {slot.time}
            </div>

            {/* Colunas para cada profissional */}
            {professionals.map(prof => {
              const event = getEventForSlot(prof.id, slot.time, selectedDate)
              
              return (
                <div
                  key={`${prof.id}-${slot.time}`}
                  onClick={() => !event && onSlotClick(prof.id, slot.time, selectedDate)}
                  style={{
                    padding: '8px',
                    backgroundColor: event ? prof.color : 'white',
                    cursor: event ? 'pointer' : 'pointer',
                    minHeight: '50px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '11px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    borderRight: '1px solid #ddd',
                    color: event ? 'white' : '#999',
                    fontWeight: event ? 'bold' : 'normal',
                    pointerEvents: event ? 'auto' : 'auto'
                  }}
                  onMouseEnter={(e) => {
                    if (!event && !isLoading) {
                      e.currentTarget.style.backgroundColor = '#e8f4f8'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!event) {
                      e.currentTarget.style.backgroundColor = 'white'
                    }
                  }}
                >
                  {event ? (
                    <div style={{ cursor: 'pointer', width: '100%' }} onClick={() => onEventClick(event)}>
                      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{event.clientName}</div>
                      <div style={{ fontSize: '10px', opacity: 0.9 }}>{event.serviceName}</div>
                    </div>
                  ) : (
                    <div style={{ opacity: 0.5 }}>-</div>
                  )}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legenda */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#666'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Instruções:</strong>
        </div>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>Clique em um espaço vazio para criar novo agendamento</li>
          <li>Clique em um agendamento para editar ou deletar</li>
          <li>Use os botões para navegar entre semanas</li>
        </ul>
      </div>
    </div>
  )
}
