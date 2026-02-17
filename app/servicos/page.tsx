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
}

export default function ServicosPage() {
  const [user, setUser] = useState<any>(null)
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: ''
  })
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

      const { data, error } = await supabase!
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar serviços:', error)
      } else {
        setServicos(data || [])
      }
      setLoading(false)
    }

    fetchServicos()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data: { user } } = await supabase!.auth.getUser()
    if (!user) return

    const { error } = await supabase!
      .from('services')
      .insert([
        {
          name: formData.name,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
          user_id: user.id
        }
      ])

    if (error) {
      setToast({ message: 'Erro ao adicionar serviço: ' + error.message, type: 'error' })
    } else {
      setShowForm(false)
      setFormData({ name: '', price: '', duration: '' })
      setToast({ message: 'Serviço cadastrado com sucesso!', type: 'success' })
      const { data: { user: currentUser } } = await supabase!.auth.getUser()
      if (currentUser) {
        const { data } = await supabase!
          .from('services')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
        setServicos(data || [])
      }
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
          onClick={() => setShowForm(!showForm)}
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
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px' }}>Adicionar Serviço</h2>
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
              <th style={{ padding: '12px', textAlign: 'left' }}>Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {servicos.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '0' }}>
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
                  <td style={{ padding: '12px' }}>
                    {new Date(servico.created_at).toLocaleDateString('pt-BR')}
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
