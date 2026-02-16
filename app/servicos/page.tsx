'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

type Servico = {
  id: string
  name: string
  price: number
  duration: number
  created_at: string
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: ''
  })
  const router = useRouter()

  useEffect(() => {
    const fetchServicos = async () => {
      const { data: { user } } = await supabase!.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

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
      alert('Erro ao adicionar serviço: ' + error.message)
    } else {
      setShowForm(false)
      setFormData({ name: '', price: '', duration: '' })
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
    return <div style={{ padding: '20px' }}>Carregando...</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
                <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  Nenhum serviço cadastrado
                </td>
              </tr>
            ) : (
              servicos.map((servico) => (
                <tr key={servico.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>{servico.name}</td>
                  <td style={{ padding: '12px' }}>R$ {servico.price.toFixed(2)}</td>
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
    </div>
  )
}
