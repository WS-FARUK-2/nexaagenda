'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProfilePublic {
  id: string
  user_id: string
  slug: string
  nome_profissional: string
  cor_primaria: string
  ativo: boolean
}

export default function ConfiguracaoPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<ProfilePublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [linkGerado, setLinkGerado] = useState('')

  const [formData, setFormData] = useState({
    nome_profissional: '',
    slug: '',
    cor_primaria: '#2563eb',
    ativo: true
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
        loadProfile(authUser.id)
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  // Carregar perfil existente
  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles_public')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data) {
        setProfile(data)
        setFormData({
          nome_profissional: data.nome_profissional,
          slug: data.slug,
          cor_primaria: data.cor_primaria,
          ativo: data.ativo
        })
        setLinkGerado(`${window.location.origin}/agendar/${data.slug}`)
      }
    } catch (err) {
      console.log('Nenhum perfil encontrado ainda')
    }
  }

  // Gerar slug a partir do nome
  const generateSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim()
  }

  // Atualizar slug quando nome mudar
  const handleNomeChange = (nome: string) => {
    const slug = generateSlug(nome)
    setFormData({
      ...formData,
      nome_profissional: nome,
      slug: slug
    })
  }

  // Verificar se slug está disponível
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug === profile?.slug) return true

    const { data } = await supabase
      .from('profiles_public')
      .select('id')
      .eq('slug', slug)
      .single()

    return !data
  }

  // Salvar configuração
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    if (!formData.nome_profissional || !formData.slug) {
      setError('Preencha todos os campos obrigatórios')
      setSubmitting(false)
      return
    }

    try {
      // Verificar disponibilidade do slug
      const slugDisponivel = await checkSlugAvailability(formData.slug)
      if (!slugDisponivel) {
        setError('Este slug já está em uso. Escolha outro nome.')
        setSubmitting(false)
        return
      }

      if (profile) {
        // Atualizar perfil existente
        const { error: updateError } = await supabase
          .from('profiles_public')
          .update({
            nome_profissional: formData.nome_profissional,
            slug: formData.slug,
            cor_primaria: formData.cor_primaria,
            ativo: formData.ativo,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)

        if (updateError) throw updateError
        setSuccess('Configuração atualizada com sucesso!')
      } else {
        // Criar novo perfil
        const { error: insertError } = await supabase
          .from('profiles_public')
          .insert([{
            user_id: user.id,
            nome_profissional: formData.nome_profissional,
            slug: formData.slug,
            cor_primaria: formData.cor_primaria,
            ativo: formData.ativo
          }])

        if (insertError) throw insertError
        setSuccess('Configuração criada com sucesso!')
      }

      // Gerar link público
      const link = `${window.location.origin}/agendar/${formData.slug}`
      setLinkGerado(link)

      // Recarregar perfil
      loadProfile(user.id)
    } catch (err: any) {
      console.error('Erro:', err)
      setError(err.message || 'Erro ao salvar configuração')
    } finally {
      setSubmitting(false)
    }
  }

  // Copiar link
  const copyLink = () => {
    navigator.clipboard.writeText(linkGerado)
    alert('Link copiado para a área de transferência!')
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <Link href="/dashboard" style={{ color: '#2563eb', textDecoration: 'none' }}>
          ← Voltar ao Dashboard
        </Link>
      </div>

      <h1>Configuração do Agendamento Público</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Configure seu link personalizado para receber agendamentos online.
      </p>

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

      {linkGerado && (
        <div style={{
          padding: '20px',
          marginBottom: '30px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '2px solid #2563eb'
        }}>
          <h3 style={{ marginTop: 0 }}>🎉 Seu Link Público:</h3>
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <input
              type="text"
              value={linkGerado}
              readOnly
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                color: '#2563eb',
                fontWeight: 'bold'
              }}
            />
            <button
              onClick={copyLink}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Copiar
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: 0, marginTop: '10px' }}>
            Compartilhe este link com seus clientes para que eles possam agendar online!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#f9f9f9',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        {/* Nome Profissional */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="nome" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Nome do Profissional *
          </label>
          <input
            id="nome"
            type="text"
            value={formData.nome_profissional}
            onChange={(e) => handleNomeChange(e.target.value)}
            placeholder="Ex: João Silva"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            required
          />
        </div>

        {/* Slug */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="slug" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Slug (URL Personalizada) *
          </label>
          <input
            id="slug"
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="joao-silva"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}
            required
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            Gerado automaticamente a partir do nome. Você pode editar se desejar.
          </small>
        </div>

        {/* Cor Primária */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="cor" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Cor Principal
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              id="cor"
              type="color"
              value={formData.cor_primaria}
              onChange={(e) => setFormData({ ...formData, cor_primaria: e.target.value })}
              style={{
                width: '60px',
                height: '40px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
            <input
              type="text"
              value={formData.cor_primaria}
              onChange={(e) => setFormData({ ...formData, cor_primaria: e.target.value })}
              placeholder="#2563eb"
              style={{
                width: '120px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            />
            <span style={{ color: '#666', fontSize: '14px' }}>
              Esta cor será usada na página pública de agendamento
            </span>
          </div>
        </div>

        {/* Ativo */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              style={{ marginRight: '8px', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: 'bold' }}>Ativar página de agendamento público</span>
          </label>
          <small style={{ color: '#666', fontSize: '12px', marginLeft: '24px', display: 'block', marginTop: '4px' }}>
            Desmarque para desativar temporariamente o link público
          </small>
        </div>

        {/* Botão Salvar */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '12px 24px',
            backgroundColor: formData.cor_primaria,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          {submitting ? 'Salvando...' : profile ? 'Atualizar Configuração' : 'Criar Configuração'}
        </button>
      </form>
    </div>
  )
}
