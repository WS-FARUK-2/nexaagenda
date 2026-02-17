'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import LoadingSpinner from '@/components/LoadingSpinner'
import { requireAdminRole } from '@/lib/role'

interface Professional {
  id: string
  name: string
  email: string
  phone: string
  birth_date: string
  commission: number
  color: string
  photo_url: string
  active: boolean
  created_at: string
}

export default function ProfissionaisPage() {
  const [user, setUser] = useState<any>(null)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase!.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      requireAdminRole(router)
      setUser(user)
      await loadProfessionals(user.id)
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadProfessionals = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) throw error

      setProfessionals(data || [])
      setFilteredProfessionals(data || [])
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const filtered = professionals.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProfessionals(filtered)
    } else {
      setFilteredProfessionals(professionals)
    }
  }, [searchTerm, professionals])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) return

    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProfessionals(prev => prev.filter(p => p.id !== id))
      alert('Profissional excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir profissional')
    }
  }

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional)
    setShowForm(true)
  }

  const handleNew = () => {
    setEditingProfessional(null)
    setShowForm(true)
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

  if (showForm) {
    return (
      <ProfessionalForm
        user={user}
        professional={editingProfessional}
        onClose={() => {
          setShowForm(false)
          setEditingProfessional(null)
          if (user) loadProfessionals(user.id)
        }}
      />
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar user={user} />
      
      <div style={{ flex: 1, padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ margin: '0 0 10px 0', color: '#2C5F6F' }}>Profissionais</h1>
            <p style={{ margin: 0, color: '#6b7280' }}>Gerencie os profissionais que atendem</p>
          </div>

          {/* Busca */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Consulta</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Informe o nome do profissional"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ✓ Limpar
              </button>
              <button
                onClick={() => {}}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                🔍 Pesquisar
              </button>
            </div>
          </div>

          {/* Botão Novo */}
          <div style={{ marginBottom: '20px', textAlign: 'right' }}>
            <button
              onClick={handleNew}
              style={{
                padding: '12px 24px',
                backgroundColor: '#E87A3F',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              + Novo Profissional
            </button>
          </div>

          {/* Tabela */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#2C5F6F', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>NOME</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>E-MAIL</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>TELEFONE</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>DATA NASCIMENTO</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', width: '100px' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfessionals.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                      Nenhum profissional encontrado
                    </td>
                  </tr>
                ) : (
                  filteredProfessionals.map(professional => (
                    <tr key={professional.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: professional.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}>
                          {professional.name[0].toUpperCase()}
                        </div>
                        <span>{professional.name}</span>
                      </td>
                      <td style={{ padding: '12px' }}>{professional.email || '-'}</td>
                      <td style={{ padding: '12px' }}>{professional.phone || '-'}</td>
                      <td style={{ padding: '12px' }}>
                        {professional.birth_date ? new Date(professional.birth_date).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleEdit(professional)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#2C5F6F',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '5px',
                            fontSize: '12px'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(professional.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// FORMULÁRIO
// ==========================================

function ProfessionalForm({ user, professional, onClose }: {
  user: any
  professional: Professional | null
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: professional?.name || '',
    email: professional?.email || '',
    phone: professional?.phone || '',
    birth_date: professional?.birth_date || '',
    commission: professional?.commission || 0,
    color: professional?.color || '#E87A3F',
    photo_url: professional?.photo_url || '',
    active: professional?.active ?? true
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Preparar dados - converter strings vazias em null
      const dataToSave = {
        ...formData,
        birth_date: formData.birth_date || null,
        email: formData.email || null,
        phone: formData.phone || null
      }

      if (professional) {
        // Editar
        const { error } = await supabase
          .from('professionals')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString()
          })
          .eq('id', professional.id)

        if (error) throw error
        alert('Profissional atualizado com sucesso!')
      } else {
        // Criar
        const { error } = await supabase
          .from('professionals')
          .insert([{
            user_id: user.id,
            ...dataToSave
          }])

        if (error) throw error
        alert('Profissional criado com sucesso!')
      }

      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar profissional: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar user={user} />
      
      <div style={{ flex: 1, padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#2C5F6F',
            color: 'white',
            padding: '20px',
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ margin: 0 }}>
              {professional ? 'Editando ' + professional.name : 'Novo Profissional'}
            </h2>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                padding: '10px 24px',
                backgroundColor: '#E87A3F',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Salvando...' : 'SALVAR'}
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {/* Foto */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                margin: '0 auto 10px',
                backgroundColor: formData.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold',
                border: '4px solid #e5e7eb'
              }}>
                {formData.name ? formData.name[0].toUpperCase() : '?'}
              </div>
              <label style={{ color: '#6b7280', fontSize: '14px' }}>
                Selecione a foto
              </label>
            </div>

            {/* Nome */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
            </div>

            {/* E-mail */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
            </div>

            {/* Telefone e Data */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Data Nascimento</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>
            </div>

            {/* Comissão */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                Comissão (%)
                <span style={{ color: '#6b7280', fontWeight: 'normal', fontSize: '12px', marginLeft: '8px' }}>
                  Deixe 0 para desconsiderar o cálculo de comissão
                </span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
            </div>

            {/* Cor */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Cor</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>
            </div>

            {/* Ativo */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#E87A3F' }}
                />
                <span style={{ fontWeight: '600' }}>Profissional ativo?</span>
              </label>
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
