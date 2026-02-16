'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import Toast from '@/components/Toast'
import EmptyState from '@/components/EmptyState'

interface Patient {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
  price: number
}

interface Appointment {
  id: string
  patient_id: string
  service_id: string
  appointment_date: string
  appointment_time: string
  status: string
  patient?: Patient
  service?: Service
}

export default function AgendamentosPage() {
  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const [formData, setFormData] = useState({
    patient_id: '',
    service_id: '',
    appointment_date: '',
    appointment_time: '',
    status: 'Pendente',
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
        loadData(authUser.id)
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  // Carregar dados
  const loadData = async (userId: string) => {
    try {
      // Buscar agendamentos
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patient_id(id, name),
          service:service_id(id, name, price)
        `)
        .eq('user_id', userId)
        .order('appointment_date', { ascending: true })

      setAppointments(appointmentsData || [])

      // Buscar clientes
      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, name')
        .eq('user_id', userId)

      setPatients(patientsData || [])

      // Buscar serviços
      const { data: servicesData } = await supabase
        .from('services')
        .select('id, name, price')
        .eq('user_id', userId)

      setServices(servicesData || [])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados')
    }
  }

  // Validar data e hora
  const isValidDateTime = (date: string, time: string): boolean => {
    const appointmentDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    return appointmentDateTime > now
  }

  // Salvar agendamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    if (!formData.patient_id || !formData.service_id || !formData.appointment_date || !formData.appointment_time) {
      setError('Preencha todos os campos')
      setSubmitting(false)
      return
    }

    if (!isValidDateTime(formData.appointment_date, formData.appointment_time)) {
      setError('A data e hora devem ser no futuro')
      setSubmitting(false)
      return
    }

    try {
      if (editingId) {
        // Atualizar
        const { error: updateError } = await supabase
          .from('appointments')
          .update({
            patient_id: formData.patient_id,
            service_id: formData.service_id,
            appointment_date: formData.appointment_date,
            appointment_time: formData.appointment_time,
            status: formData.status,
          })
          .eq('id', editingId)

        if (updateError) throw updateError
        setToast({ message: 'Agendamento atualizado com sucesso!', type: 'success' })
        setSuccess('Agendamento atualizado com sucesso!')
        setEditingId(null)
      } else {
        // Criar novo
        const { error: insertError } = await supabase
          .from('appointments')
          .insert([
            {
              user_id: user.id,
              patient_id: formData.patient_id,
              service_id: formData.service_id,
              appointment_date: formData.appointment_date,
              appointment_time: formData.appointment_time,
              status: formData.status,
            },
          ])

        if (insertError) throw insertError
        setToast({ message: 'Agendamento criado com sucesso!', type: 'success' })
        setSuccess('Agendamento criado com sucesso!')
      }

      setFormData({
        patient_id: '',
        service_id: '',
        appointment_date: '',
        appointment_time: '',
        status: 'Pendente',
      })

      loadData(user.id)
    } catch (err: any) {
      console.error('Erro:', err)
      setToast({ message: err.message || 'Erro ao salvar agendamento', type: 'error' })
      setError(err.message || 'Erro ao salvar agendamento')
    } finally {
      setSubmitting(false)
    }
  }

  // Editar
  const handleEdit = (appointment: Appointment) => {
    setEditingId(appointment.id)
    setFormData({
      patient_id: appointment.patient_id,
      service_id: appointment.service_id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      status: appointment.status,
    })
  }

  // Deletar
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este agendamento?')) return

    try {
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setToast({ message: 'Agendamento deletado com sucesso!', type: 'success' })
      setSuccess('Agendamento deletado com sucesso!')
      loadData(user.id)
    } catch (err: any) {
      setToast({ message: err.message || 'Erro ao deletar agendamento', type: 'error' })
      setError(err.message || 'Erro ao deletar agendamento')
    }
  }

  // Cancelar edição
  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      patient_id: '',
      service_id: '',
      appointment_date: '',
      appointment_time: '',
      status: 'Pendente',
    })
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Agendamentos</h1>

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
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #ddd'
      }}>
        <h2>{editingId ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
        
        {/* Avisos se não há dados */}
        {patients.length === 0 && (
          <div style={{
            padding: '12px',
            marginBottom: '15px',
            backgroundColor: '#fff3cd',
            color: '#856404',
            borderRadius: '4px',
            border: '1px solid #ffeaa7'
          }}>
            ⚠️ Nenhum cliente cadastrado. <a href="/clientes" style={{ color: '#856404', fontWeight: 'bold', textDecoration: 'underline' }}>Clique aqui para criar</a>
          </div>
        )}

        {services.length === 0 && (
          <div style={{
            padding: '12px',
            marginBottom: '15px',
            backgroundColor: '#fff3cd',
            color: '#856404',
            borderRadius: '4px',
            border: '1px solid #ffeaa7'
          }}>
            ⚠️ Nenhum serviço cadastrado. <a href="/servicos" style={{ color: '#856404', fontWeight: 'bold', textDecoration: 'underline' }}>Clique aqui para criar</a>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            {/* Cliente */}
            <div>
              <label htmlFor="patient" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Cliente
              </label>
              <select
                id="patient"
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">Selecione um cliente</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Serviço */}
            <div>
              <label htmlFor="service" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Serviço
              </label>
              <select
                id="service"
                value={formData.service_id}
                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">Selecione um serviço</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div>
              <label htmlFor="date" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Data
              </label>
              <input
                id="date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Hora */}
            <div>
              <label htmlFor="time" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Hora
              </label>
              <input
                id="time"
                type="time"
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="Pendente">Pendente</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={submitting || patients.length === 0 || services.length === 0}
              style={{
                padding: '10px 20px',
                backgroundColor: (patients.length === 0 || services.length === 0) ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (patients.length === 0 || services.length === 0) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {submitting ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar Agendamento'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Listagem */}
      <div>
        <h2>Agendamentos ({appointments.length})</h2>
        {appointments.length === 0 ? (
          <EmptyState
            icon="📅"
            title="Nenhum agendamento"
            description="Você ainda não criou nenhum agendamento. Use o formulário acima para criar o primeiro!"
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Cliente</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Serviço</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Data</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Hora</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>{apt.patient?.name || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{apt.service?.name || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      {new Date(apt.appointment_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '12px' }}>{apt.appointment_time}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor:
                          apt.status === 'Confirmado' ? '#d4edda' :
                          apt.status === 'Cancelado' ? '#f8d7da' :
                          '#fff3cd',
                        color:
                          apt.status === 'Confirmado' ? '#155724' :
                          apt.status === 'Cancelado' ? '#721c24' :
                          '#856404'
                      }}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleEdit(apt)}
                        style={{
                          padding: '6px 12px',
                          marginRight: '8px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(apt.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
