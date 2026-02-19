'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function LinkAgendamentoPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [linkAgendamento, setLinkAgendamento] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase!.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const storedRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null
      if (!storedRole) {
        router.push('/selecionar-perfil')
        return
      }

      setUser(user)
      
      // Buscar ou criar slug do perfil público
      const { data: profileData, error: profileError } = await supabase
        .from('profiles_public')
        .select('slug')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .single()

      let userSlug = ''
      
      if (!profileError && profileData && profileData.slug) {
        // Se existe perfil público ativo com slug, usa ele
        userSlug = profileData.slug
      } else {
        // Senão, cria um slug baseado no email do usuário
        const emailSlug = user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_')
        userSlug = emailSlug || user.id.substring(0, 8)
        
        // Tentar criar/atualizar perfil público
        const { data: existingProfile } = await supabase
          .from('profiles_public')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (existingProfile) {
          // Atualiza slug do perfil existente
          await supabase
            .from('profiles_public')
            .update({ slug: userSlug, ativo: true })
            .eq('user_id', user.id)
        } else {
          // Cria novo perfil público
          await supabase
            .from('profiles_public')
            .insert({
              user_id: user.id,
              slug: userSlug,
              nome_profissional: user.email?.split('@')[0] || 'Profissional',
              cor_primaria: '#E87A3F',
              ativo: true
            })
        }
      }
      
      // Gera o link baseado no slug
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const link = `${baseUrl}/agendar/${userSlug}`
      setLinkAgendamento(link)
      
      setLoading(false)
    }
    
    getUser()
  }, [router])

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(linkAgendamento)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const handleCompartilhar = () => {
    // Compartilhar via Web Share API ou WhatsApp
    if (navigator.share) {
      navigator.share({
        title: 'Link de Agendamento - NexaAgenda',
        text: 'Agende seu horário comigo através deste link:',
        url: linkAgendamento,
      }).catch(() => {
        // Se falhar, abre WhatsApp
        abrirWhatsApp()
      })
    } else {
      abrirWhatsApp()
    }
  }

  const abrirWhatsApp = () => {
    const texto = encodeURIComponent(`Agende seu horário comigo através deste link: ${linkAgendamento}`)
    window.open(`https://wa.me/?text=${texto}`, '_blank')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
        <Sidebar user={user} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      <Sidebar user={user} />
      
      <div style={{ flex: 1, padding: '30px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2C5F6F', margin: '0 0 8px 0' }}>
              🔗 LINK DE AGENDAMENTO
            </h1>
            <div style={{ height: '3px', width: '60px', backgroundColor: '#E87A3F', borderRadius: '2px' }} />
          </div>

          {/* Card Principal */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: '20px'
          }}>
            
            {/* Texto Explicativo */}
            <div style={{ marginBottom: '30px' }}>
              <p style={{ fontSize: '16px', color: '#333', lineHeight: '1.6', marginBottom: '20px' }}>
                Com este link o seu cliente poderá realizar agendamento online sem precisar baixar o aplicativo
              </p>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#2C5F6F', marginBottom: '10px' }}>
                  Você pode compartilhar como:
                </p>
                <ul style={{ marginLeft: '20px', color: '#555', lineHeight: '1.8' }}>
                  <li>Resposta Automática do WhatsApp Business</li>
                  <li>Na Bio do Facebook/Instagram</li>
                  <li>No Stories do WhatsApp/Facebook/Instagram</li>
                  <li>Nos demais Canais de divulgação</li>
                </ul>
              </div>
            </div>

            {/* Campo do Link */}
            <div style={{ marginBottom: '25px' }}>
              <input
                type="text"
                value={linkAgendamento}
                readOnly
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '15px',
                  border: '2px solid #E87A3F',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  color: '#2C5F6F',
                  fontFamily: 'monospace',
                  cursor: 'text'
                }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>

            {/* Botões de Ação */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <button
                onClick={handleCopiar}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: copied ? '#28a745' : '#2C5F6F',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!copied) e.currentTarget.style.backgroundColor = '#1a3a47'
                }}
                onMouseLeave={(e) => {
                  if (!copied) e.currentTarget.style.backgroundColor = '#2C5F6F'
                }}
              >
                {copied ? '✓ Copiado!' : '📋 Copiar'}
              </button>

              <button
                onClick={handleCompartilhar}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: '#25D366',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1da851'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#25D366'
                }}
              >
                🔗 Compartilhar
              </button>
            </div>

            {/* Observação */}
            <div style={{
              padding: '16px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <p style={{ fontSize: '14px', color: '#856404', margin: 0, lineHeight: '1.5' }}>
                <strong>💡 Obs:</strong> Lembrando que para os clientes fidelizados é mais interessante agendar pelo aplicativo, 
                pois com o aplicativo seu cliente não vai precisar procurar pelo link sempre que precisar agendar.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
