'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import Toast from '@/components/Toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import { requireAdminRole } from '@/lib/role'

interface CompanyData {
  id: string
  user_id: string
  nome_empresa?: string
  cnpj?: string
  telefone?: string
  email?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  descricao?: string
  website?: string
}

interface Horario {
  id: string
  user_id: string
  dia_semana: number // 0 = segunda, 6 = domingo
  hora_inicio: string
  hora_fim: string
  horario_almoco_inicio?: string
  horario_almoco_fim?: string
  ativo: boolean
  created_at: string
}

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export default function DadosEmpresaPage() {
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null)
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    nome_empresa: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    descricao: '',
    website: ''
  })

  const [modalFormData, setModalFormData] = useState({
    dia_semana: 1,
    hora_inicio: '08:00',
    hora_fim: '18:00',
    horario_almoco_inicio: '12:00',
    horario_almoco_fim: '13:00',
    ativo: true
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase!.auth.getUser()
      if (!authUser) {
        router.push('/login')
      } else {
        if (requireAdminRole(router)) {
          setLoading(false)
          return
        }
        setUser(authUser)
        loadCompanyData(authUser.id)
        loadHorarios(authUser.id)
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const loadCompanyData = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('company_data')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data) {
        setCompany(data)
        setFormData(data)
      }
    } catch (error) {
    }
  }

  const loadHorarios = async (userId: string) => {
    try {
      setLoadingHorarios(true)
      const { data } = await supabase
        .from('horarios')
        .select('*')
        .eq('user_id', userId)
        .order('dia_semana', { ascending: true })

      if (data) {
        setHorarios(data as Horario[])
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
    } finally {
      setLoadingHorarios(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (company?.id) {
        // Atualizar
        const { error } = await supabase
          .from('company_data')
          .update(formData)
          .eq('id', company.id)

        if (error) throw error
      } else {
        // Criar
        const { error } = await supabase
          .from('company_data')
          .insert([{ ...formData, user_id: user.id }])

        if (error) throw error
      }

      setToast({ message: 'Dados da empresa salvos com sucesso!', type: 'success' })
    } catch (error: any) {
      setToast({ message: error.message || 'Erro ao salvar', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveHorario = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingHorario?.id) {
        // Atualizar
        const { error } = await supabase
          .from('horarios')
          .update(modalFormData)
          .eq('id', editingHorario.id)

        if (error) throw error
        setToast({ message: 'Horário atualizado com sucesso!', type: 'success' })
      } else {
        // Criar
        const { error } = await supabase
          .from('horarios')
          .insert([{ ...modalFormData, user_id: user.id }])

        if (error) throw error
        setToast({ message: 'Horário criado com sucesso!', type: 'success' })
      }

      setShowModal(false)
      setEditingHorario(null)
      setModalFormData({
        dia_semana: 1,
        hora_inicio: '08:00',
        hora_fim: '18:00',
        horario_almoco_inicio: '12:00',
        horario_almoco_fim: '13:00',
        ativo: true
      })
      loadHorarios(user.id)
    } catch (error: any) {
      setToast({ message: error.message || 'Erro ao salvar horário', type: 'error' })
    }
  }

  const handleDeleteHorario = async (horarioId: string) => {
    if (!confirm('Tem certeza que deseja deletar este horário?')) return

    try {
      const { error } = await supabase
        .from('horarios')
        .delete()
        .eq('id', horarioId)

      if (error) throw error
      setToast({ message: 'Horário deletado com sucesso!', type: 'success' })
      loadHorarios(user.id)
    } catch (error: any) {
      setToast({ message: error.message || 'Erro ao deletar', type: 'error' })
    }
  }

  const openEditModal = (horario: Horario) => {
    setEditingHorario(horario)
    setModalFormData({
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fim: horario.hora_fim,
      horario_almoco_inicio: horario.horario_almoco_inicio || '12:00',
      horario_almoco_fim: horario.horario_almoco_fim || '13:00',
      ativo: horario.ativo
    })
    setShowModal(true)
  }

  const openNewModal = () => {
    setEditingHorario(null)
    setModalFormData({
      dia_semana: 1,
      hora_inicio: '08:00',
      hora_fim: '18:00',
      horario_almoco_inicio: '12:00',
      horario_almoco_fim: '13:00',
      ativo: true
    })
    setShowModal(true)
  }

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
          {/* Header */}
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Dados da Empresa</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              Informações da sua empresa ou consultório
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Nome Empresa */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={formData.nome_empresa}
                  onChange={(e) => setFormData({ ...formData, nome_empresa: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* CNPJ */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  CNPJ
                </label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Telefone */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Telefone
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Website */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Website
                </label>
                <input
                  type="url"
                  placeholder="https://seusite.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Endereço */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Endereço
                </label>
                <input
                  type="text"
                  placeholder="Rua, número, complemento"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Cidade */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Estado */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Estado
                </label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="SP"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* CEP */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  CEP
                </label>
                <input
                  type="text"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Descrição */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Descrição
                </label>
                <textarea
                  placeholder="Descreva sua empresa..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    minHeight: '120px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Botão Salvar */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Salvando...' : 'Salvar Dados'}
            </button>
          </form>

          {/* Seção de Horários */}
          <div style={{ marginTop: '50px' }}>
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Horários de Funcionamento</h2>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                  Configure os horários de atendimento da sua empresa
                </p>
              </div>
              <button
                onClick={openNewModal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2C5F6F',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}
              >
                ➕ Novo Horário
              </button>
            </div>

            {loadingHorarios ? (
              <LoadingSpinner />
            ) : horarios.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <p style={{ margin: '0' }}>Nenhum horário cadastrado ainda</p>
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>Dia</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>Horário</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>Almoço</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#374151' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horarios.map((horario, idx) => (
                      <tr key={horario.id} style={{ 
                        borderBottom: idx < horarios.length - 1 ? '1px solid #e5e7eb' : 'none' 
                      }}>
                        <td style={{ padding: '12px', color: '#1f2937' }}>
                          {DIAS_SEMANA[horario.dia_semana] || 'N/A'}
                        </td>
                        <td style={{ padding: '12px', color: '#1f2937' }}>
                          {horario.hora_inicio} às {horario.hora_fim}
                        </td>
                        <td style={{ padding: '12px', color: '#1f2937' }}>
                          {horario.horario_almoco_inicio} às {horario.horario_almoco_fim}
                        </td>
                        <td style={{ padding: '12px', color: '#1f2937' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: horario.ativo ? '#d1fae5' : '#fee2e2',
                            color: horario.ativo ? '#065f46' : '#991b1b'
                          }}>
                            {horario.ativo ? '✓ Ativo' : '✗ Inativo'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => openEditModal(horario)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              cursor: 'pointer',
                              marginRight: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDeleteHorario(horario.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc2626',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}
                          >
                            🗑️ Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Novo/Editar Horário */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
              {editingHorario ? '✏️ Editar Horário' : '➕ Novo Horário'}
            </h2>

            <form onSubmit={handleSaveHorario} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Dia da Semana */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Dia da Semana
                </label>
                <select
                  value={modalFormData.dia_semana}
                  onChange={(e) => setModalFormData({ ...modalFormData, dia_semana: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  {DIAS_SEMANA.map((dia, idx) => (
                    <option key={idx} value={idx}>
                      {dia}
                    </option>
                  ))}
                </select>
              </div>

              {/* Horário de Início */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Horário de Início
                </label>
                <input
                  type="time"
                  value={modalFormData.hora_inicio}
                  onChange={(e) => setModalFormData({ ...modalFormData, hora_inicio: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Horário de Fim */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Horário de Fim
                </label>
                <input
                  type="time"
                  value={modalFormData.hora_fim}
                  onChange={(e) => setModalFormData({ ...modalFormData, hora_fim: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Almoço - Início */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151', fontSize: '13px' }}>
                    Almoço - Início
                  </label>
                  <input
                    type="time"
                    value={modalFormData.horario_almoco_inicio}
                    onChange={(e) => setModalFormData({ ...modalFormData, horario_almoco_inicio: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Almoço - Fim */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151', fontSize: '13px' }}>
                    Almoço - Fim
                  </label>
                  <input
                    type="time"
                    value={modalFormData.horario_almoco_fim}
                    onChange={(e) => setModalFormData({ ...modalFormData, horario_almoco_fim: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Checkbox Ativo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={modalFormData.ativo}
                  onChange={(e) => setModalFormData({ ...modalFormData, ativo: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label style={{ cursor: 'pointer', fontWeight: '500', color: '#374151' }}>
                  Horário Ativo
                </label>
              </div>

              {/* Botões */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingHorario(null)
                  }}
                  style={{
                    padding: '12px',
                    backgroundColor: '#e5e7eb',
                    color: '#1f2937',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px',
                    backgroundColor: '#2C5F6F',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  {editingHorario ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
