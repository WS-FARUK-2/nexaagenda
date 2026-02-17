'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

interface MenuItem {
  id: string
  label: string
  icon: string
  href?: string
  action?: () => void
  section?: string
  divider?: boolean
  roles?: Array<'admin' | 'professional'>
}

export default function Sidebar({ user }: { user: any }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [role, setRole] = useState<'admin' | 'professional'>('admin')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('user_role') as 'admin' | 'professional' | null
      if (storedRole) setRole(storedRole)
    }
  }, [])

  const menuSections: { id: string; label: string; items: MenuItem[] }[] = [
    {
      id: 'ger',
      label: 'Ger',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', href: role === 'professional' ? '/dashboard/profissional' : '/dashboard', roles: ['admin', 'professional'] },
        { id: 'perfil', label: 'Perfil', icon: '👤', href: '/dashboard/perfil', roles: ['admin', 'professional'] },
        { id: 'link-agendamento', label: 'Link de Agendamento', icon: '🔗', href: '/dashboard/configuracao', roles: ['admin'] },
        { id: 'agendamentos', label: 'Agendamentos', icon: '📅', href: '/agendamentos', roles: ['admin', 'professional'] }
      ]
    },
    {
      id: 'cadastros',
      label: 'Cadastros',
      items: [
        { id: 'profissionais', label: 'Profissionais', icon: '👥', href: '/dashboard/profissionais', roles: ['admin'] },
        { id: 'servicos', label: 'Serviços', icon: '✂️', href: '/servicos', roles: ['admin'] },
        { id: 'listagem-clientes', label: 'Listagem de Clientes', icon: '👫', href: '/clientes', roles: ['admin'] },
        { id: 'dados-empresa', label: 'Dados da Empresa', icon: '🏢', href: '/dashboard/empresa', roles: ['admin'] }
      ]
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      items: [
        { id: 'relatorio-financeiro', label: 'Relatório Financeiro', icon: '💰', href: '/dashboard/relatorio-financeiro', roles: ['admin'] }
      ]
    },
    {
      id: 'suporte',
      label: 'Suporte',
      items: [
        { id: 'indicar-app', label: 'Indicar o App', icon: '📣', href: '/dashboard/indicar', roles: ['admin', 'professional'] },
        { id: 'como-usar', label: 'Como Usar', icon: '📖', href: '/dashboard/guia', roles: ['admin', 'professional'] },
        { id: 'suporte', label: 'Suporte', icon: '🆘', href: '/dashboard/suporte', roles: ['admin', 'professional'] },
        { id: 'sobre', label: 'Sobre', icon: 'ℹ️', href: '/dashboard/sobre', roles: ['admin', 'professional'] },
        { id: 'rede-social', label: 'Rede Social', icon: '📱', href: 'https://instagram.com', roles: ['admin', 'professional'] }
      ]
    },
    {
      id: 'conta',
      label: 'Conta',
      items: [
        { id: 'sair', label: 'Sair', icon: '🚪', action: handleLogout, roles: ['admin', 'professional'] }
      ]
    }
  ]

  async function handleLogout() {
    await supabase!.auth.signOut()
    router.push('/login')
  }

  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <>
      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 998,
            display: isMobile ? 'block' : 'none'
          }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Toggle button mobile */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 999,
            background: '#E87A3F',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <div
        style={{
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          width: isOpen ? '280px' : '86px',
          height: '100vh',
          backgroundColor: '#2C5F6F',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          overflowY: 'auto',
          transition: 'width 0.3s ease',
          zIndex: isMobileOpen ? 999 : 'auto',
          transform: isMobile ? (isMobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            backgroundColor: '#244B57',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {isOpen && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                {user?.email?.split('@')[0] || 'Usuário'}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>
                {user?.email}
              </div>
            </div>
          )}
          {!isMobile && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              {isOpen ? '◀' : '▶'}
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav
          style={{
            flex: 1,
            padding: '12px 0',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {menuSections.map((section) => {
            const filteredItems = section.items.filter(item => !item.roles || item.roles.includes(role))
            if (filteredItems.length === 0) return null

            return (
              <div key={section.id} style={{ marginBottom: '8px' }}>
                {isOpen && (
                  <div
                    style={{
                      padding: '10px 16px 6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.6)'
                    }}
                  >
                    {section.label}
                  </div>
                )}

                {filteredItems.map((item) => {
                  const isItemActive = isActive(item.href)

                  const baseStyle = {
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    backgroundColor: isItemActive ? 'rgba(232, 122, 63, 0.18)' : 'transparent',
                    borderLeft: isItemActive ? '4px solid #E87A3F' : '4px solid transparent',
                    color: isItemActive ? '#FFFFFF' : 'rgba(255,255,255,0.86)',
                    transition: 'all 0.2s ease',
                    fontSize: '14px'
                  }

                  if (item.href && !item.href.startsWith('http')) {
                    return (
                      <div key={item.id}>
                        <Link href={item.href} onClick={() => isMobile && setIsMobileOpen(false)}>
                          <div
                            style={baseStyle}
                            onMouseEnter={(e) => {
                              if (!isItemActive) {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isItemActive) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }
                            }}
                          >
                            <span style={{ fontSize: '18px', minWidth: '24px' }}>{item.icon}</span>
                            {isOpen && <span>{item.label}</span>}
                          </div>
                        </Link>
                      </div>
                    )
                  }

                  if (item.action) {
                    return (
                      <div key={item.id}>
                        <button
                          onClick={() => {
                            item.action?.()
                            isMobile && setIsMobileOpen(false)
                          }}
                          style={{
                            ...baseStyle,
                            width: '100%',
                            border: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
                          }}
                          onMouseLeave={(e) => {
                            if (!isItemActive) {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }
                          }}
                        >
                          <span style={{ fontSize: '18px', minWidth: '24px' }}>{item.icon}</span>
                          {isOpen && <span>{item.label}</span>}
                        </button>
                      </div>
                    )
                  }

                  return (
                    <div key={item.id}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => isMobile && setIsMobileOpen(false)}
                        style={{
                          ...baseStyle,
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
                        }}
                        onMouseLeave={(e) => {
                          if (!isItemActive) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        <span style={{ fontSize: '18px', minWidth: '24px' }}>{item.icon}</span>
                        {isOpen && <span>{item.label}</span>}
                      </a>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center'
          }}
        >
          {isOpen && <div>NexaAgenda v1.0</div>}
        </div>
      </div>
    </>
  )
}
