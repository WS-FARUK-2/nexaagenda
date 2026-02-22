'use client'

import { useParams } from 'next/navigation'

export default function LoginClientePage() {
  const params = useParams()
  const slug = params.slug as string

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '520px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ margin: 0, fontSize: '22px', color: '#111827' }}>Login do Cliente</h1>
        <p style={{ margin: '6px 0 20px 0', color: '#6b7280' }}>
          Acesse sua conta para agendar com esta empresa.
        </p>

        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px' }}>
              E-mail
            </label>
            <input
              type="email"
              placeholder="seuemail@exemplo.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px' }}>
              Senha
            </label>
            <input
              type="password"
              placeholder="Sua senha"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            />
          </div>
          <button
            type="button"
            style={{
              marginTop: '6px',
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#111827',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Entrar
          </button>
        </div>

        <div style={{ marginTop: '16px', fontSize: '13px', color: '#6b7280' }}>
          Ainda não tem conta? Em breve teremos cadastro por aqui.
        </div>

        <a
          href={`/agendar/${slug}`}
          style={{
            display: 'inline-block',
            marginTop: '16px',
            color: '#2563eb',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '13px'
          }}
        >
          Voltar ao agendamento
        </a>
      </div>
    </div>
  )
}
