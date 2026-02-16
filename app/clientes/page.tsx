'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import Toast from '@/components/Toast'
import EmptyState from '@/components/EmptyState'

type Cliente = {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()

  // Buscar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      const { data: { user } } = await supabase!.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase!
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar clientes:', error)
      } else {
        setClientes(data || [])
      }
      setLoading(false)
    }

    fetchClientes()
  }, [router])

  // Adicionar cliente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data: { user } } = await supabase!.auth.getUser()
    if (!user) return

    const { error } = await supabase!
      .from('patients')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          user_id: user.id
        }
      ])

    if (error) {
      setToast({ message: 'Erro ao adicionar cliente: ' + error.message, type: 'error' })
    } else {
      setShowForm(false)
      setFormData({ name: '', email: '', phone: '' })
      setToast({ message: 'Cliente cadastrado com sucesso!', type: 'success' })
      // Recarregar lista
      const { data: { user: currentUser } } = await supabase!.auth.getUser()
      if (currentUser) {
        const { data } = await supabase!
          .from('patients')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
        setClientes(data || [])
      }
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <LoadingSpinner size={50} />
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Cabeçalho */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>Clientes</h1>
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
          {showForm ? 'Cancelar' : '+ Novo Cliente'}
        </button>
      </div>

      {/* Formulário de novo cliente */}
      {showForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px' }}>Adicionar Cliente</h2>
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
              <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
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

      {/* Lista de clientes */}
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
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Telefone</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '0' }}>
                  <EmptyState
                    icon="👥"
                    title="Nenhum cliente cadastrado"
                    description="Clique no botão '+ Novo Cliente' para começar"
                  />
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>{cliente.name}</td>
                  <td style={{ padding: '12px' }}>{cliente.email || '-'}</td>
                  <td style={{ padding: '12px' }}>{cliente.phone}</td>
                  <td style={{ padding: '12px' }}>
                    {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
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
  )
}
