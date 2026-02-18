'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import Toast from '@/components/Toast'
import EmptyState from '@/components/EmptyState'
import { formatCurrency } from '@/lib/utils'
import Sidebar from '@/components/Sidebar'
import { requireAdminRole } from '@/lib/role'

type Servico = {
  id: string
  name: string
  price: number
  duration: number
  created_at: string
  order?: number | null
  professionals_count?: number
}

type Professional = {
  id: string
  name: string
  active: boolean
}

export default function ServicosPage() {
  const [user, setUser] = useState<any>(null)
  const [servicos, setServicos] = useState<Servico[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingServico, setEditingServico] = useState<Servico | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: ''
  })
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchServicos = async () => {
      const { data: { user } } = await supabase!.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      if (requireAdminRole(router)) {
        setLoading(false)
        return
      }

      setUser(user)

      await Promise.all([
        loadServicos(user.id),
        loadProfessionals(user.id)
      ])

      setLoading(false)
    }

    fetchServicos()
  }, [router])

  const loadServicos = async (userId: string) => {
    const { data, error } = await supabase!
      .from('services')
      .select('id, name, price, duration, created_at, "order", service_professionals(count)')
      .eq('user_id', userId)
      .order('order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar serviços:', error)
      return
    }

    const formatted = (data || []).map((service: any) => ({
      ...service,
      professionals_count: service.service_professionals?.[0]?.count ?? 0
    }))

    setServicos(formatted)
  }

  const loadProfessionals = async (userId: string) => {
    const { data, error } = await supabase!
      .from('professionals')
      .select('id, name, active')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar profissionais:', error)
      return
    }

    setProfessionals(data || [])
  }

  const handleNew = () => {
    setShowForm(true)
    setEditingServico(null)
    setFormData({ name: '', price: '', duration: '' })
    setSelectedProfessionals([])
  }

  const handleEdit = async (servico: Servico) => {
    console.log('=== EDITANDO SERVIÇO ===')
    console.log('Serviço:', servico)
    
    setShowForm(true)
    setEditingServico(servico)
    setFormData({
      name: servico.name,
      price: String(servico.price ?? ''),
      duration: String(servico.duration ?? '')
    })

    console.log('Buscando profissionais vinculados ao serviço:', servico.id)
    
    const { data, error } = await supabase!
      .from('service_professionals')
      .select('professional_id')
      .eq('service_id', servico.id)

    console.log('Resultado da busca:', { data, error })

    if (error) {
      console.error('Erro ao buscar vínculos:', error)
      setSelectedProfessionals([])
      return
    }

    const professionalIds = (data || []).map((item) => item.professional_id)
    console.log('IDs dos profissionais carregados:', professionalIds)
    
    setSelectedProfessionals(professionalIds)
    
    console.log('selectedProfessionals setado para:', professionalIds)
  }

  const saveServiceProfessionals = async (serviceId: string) => {
    console.log('=== INICIANDO saveServiceProfessionals ===')
    console.log('Service ID:', serviceId)
    console.log('Profissionais selecionados:', selectedProfessionals)
    
    const { error: deleteError } = await supabase!
      .from('service_professionals')
      .delete()
      .eq('service_id', serviceId)

    if (deleteError) {
      console.error('Erro ao deletar vínculos antigos:', deleteError)
      throw deleteError
    }
    
    console.log('Vínculos antigos deletados com sucesso')

    if (selectedProfessionals.length === 0) {
      console.log('Nenhum profissional selecionado, encerrando')
      return
    }

    const rows = selectedProfessionals.map((professionalId) => ({
      service_id: serviceId,
      professional_id: professionalId
    }))

    console.log('Tentando inserir rows:', rows)

    const { error: insertError } = await supabase!
      .from('service_professionals')
      .insert(rows)

    if (insertError) {
      console.error('Erro ao inserir vínculos:', insertError)
      throw insertError
    }
    
    console.log('Vínculos inseridos com sucesso')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('=== INICIANDO HANDLESUBMIT ===')
    console.log('Editando?', !!editingServico)
    console.log('Profissionais selecionados:', selectedProfessionals)
    
    const { data: { user } } = await supabase!.auth.getUser()
    if (!user) return

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      user_id: user.id,
      order: editingServico?.order ?? 0
    }

    if (editingServico) {
      console.log('Atualizando serviço:', editingServico.id)
      const { error } = await supabase!
        .from('services')
        .update(payload)
        .eq('id', editingServico.id)

      if (error) {
        console.error('Erro ao atualizar serviço:', error)
        setToast({ message: 'Erro ao atualizar serviço: ' + error.message, type: 'error' })
        return
      }

      console.log('Serviço atualizado, agora salvando profissionais')
      try {
        await saveServiceProfessionals(editingServico.id)
      } catch (error: any) {
        console.error('Erro ao salvar profissionais:', error)
        setToast({ message: 'Erro ao salvar profissionais: ' + error.message, type: 'error' })
        return
      }

      setToast({ message: 'Serviço atualizado com sucesso!', type: 'success' })
    } else {
      console.log('Criando novo serviço')
      const { data, error } = await supabase!
        .from('services')
        .insert([payload])
        .select('id')
        .single()

      if (error) {
        console.error('Erro ao adicionar serviço:', error)
        setToast({ message: 'Erro ao adicionar serviço: ' + error.message, type: 'error' })
        return
      }

      if (data?.id) {
        console.log('Novo serviço criado com ID:', data.id)
        try {
          await saveServiceProfessionals(data.id)
        } catch (error: any) {
          console.error('Erro ao salvar profissionais:', error)
          setToast({ message: 'Erro ao salvar profissionais: ' + error.message, type: 'error' })
          return
        }
      }

      setToast({ message: 'Serviço cadastrado com sucesso!', type: 'success' })
    }

    console.log('Finalizando, limpando form e recarregando')
    setShowForm(false)
    setEditingServico(null)
    setFormData({ name: '', price: '', duration: '' })
    setSelectedProfessionals([])
    const { data: { user: currentUser } } = await supabase!.auth.getUser()
    if (currentUser) {
      await loadServicos(currentUser.id)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar user={user} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingSpinner size={50} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar user={user} />
      <div style={{ flex: 1, padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>Serviços</h1>
        <button
          onClick={() => (showForm ? setShowForm(false) : handleNew())}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancelar' : '+ Novo Serviço'}
        </button>
      </div>

      {showForm && (
        <div 
          key={editingServico ? editingServico.id : 'new'}
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <h2 style={{ marginBottom: '20px' }}>{editingServico ? 'Editar Serviço' : 'Adicionar Serviço'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Duração (minutos)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Profissionais</label>
              {professionals.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: '14px' }}>Nenhum profissional cadastrado</div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '12px'
                }}>
                  {professionals.map((professional) => {
                    const isChecked = selectedProfessionals.includes(professional.id)
                    console.log(`Renderizando checkbox: ${professional.name}, ID: ${professional.id}, isChecked: ${isChecked}, selectedProfessionals:`, selectedProfessionals)
                    return (
                      <label key={professional.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            console.log(`Toggling ${professional.name}, checked: ${e.target.checked}`)
                            if (e.target.checked) {
                              setSelectedProfessionals(prev => [...prev, professional.id])
                            } else {
                              setSelectedProfessionals(prev => prev.filter((id) => id !== professional.id))
                            }
                          }}
                          style={{ width: '16px', height: '16px', accentColor: '#E87A3F', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px' }}>{professional.name}{!professional.active ? ' (inativo)' : ''}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Salvar
            </button>
          </form>
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Preço</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Duração</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Profissionais</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Cadastro</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '0' }}>
                  <EmptyState
                    icon="💼"
                    title="Nenhum serviço cadastrado"
                    description="Clique no botão '+ Novo Serviço' para começar"
                  />
                </td>
              </tr>
            ) : (
              servicos.map((servico) => (
                <tr key={servico.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>{servico.name}</td>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#059669' }}>{formatCurrency(servico.price)}</td>
                  <td style={{ padding: '12px' }}>{servico.duration} min</td>
                  <td style={{ padding: '12px' }}>{servico.professionals_count ?? 0}</td>
                  <td style={{ padding: '12px' }}>
                    {new Date(servico.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(servico)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#E87A3F',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Toast de notificação */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
        </div>
      </div>
    </div>
  )
}
