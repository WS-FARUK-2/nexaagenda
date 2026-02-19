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
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    ger: true,
    cadastros: false,
    relatorios: false,
    suporte: false
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('user_role') as 'admin' | 'professional' | null
      if (storedRole) setRole(storedRole)
    }
  }, [])

  const handleLogout = async () => {
    await supabase!.auth.signOut()
    router.push('/login')
  }

  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const menuSections: { id: string; label: string; items: MenuItem[] }[] = [
    {
      id: 'ger',
      label: 'Gerenciamento',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', href: role === 'professional' ? '/dashboard/profissional' : '/dashboard', roles: ['admin', 'professional'] },
        { id: 'perfil', label: 'Perfil', icon: '👤', href: '/dashboard/perfil', roles: ['admin', 'professional'] },
        { id: 'agendamentos', label: 'Agendamentos', icon: '📅', href: '/agendamentos', roles: ['admin', 'professional'] }
      ]
    },
    {
      id: 'cadastros',
      label: 'Cadastros',
      items: [
        { id: 'profissionais', label: 'Profissionais', icon: '👥', href: '/dashboard/profissionais', roles: ['admin'] },
        { id: 'servicos', label: 'Serviços', icon: '✂️', href: '/servicos', roles: ['admin'] },
        { id: 'clientes', label: 'Clientes', icon: '👫', href: '/clientes', roles: ['admin'] },
        { id: 'empresa', label: 'Dados da Empresa', icon: '🏢', href: '/dashboard/empresa', roles: ['admin'] },
        { id: 'link-agendamento', label: 'Link de Agendamento', icon: '🔗', href: '/dashboard/link-agendamento', roles: ['admin'] }
      ]
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      items: [
        { id: 'relatorio-financeiro', label: 'Financeiro', icon: '💰', href: '/dashboard/relatorio-financeiro', roles: ['admin'] },
        { id: 'dashboard-agendamentos', label: 'Agendamentos Públicos', icon: '📈', href: '/dashboard/agendamentos-publicos', roles: ['admin'] },
        { id: 'estatisticas', label: 'Estatísticas', icon: '📊', href: '/dashboard/estatisticas', roles: ['admin'] }
      ]
    },
    {
      id: 'suporte',
      label: 'Suporte',
      items: [
        { id: 'como-usar', label: 'Como Usar', icon: '📖', href: '/dashboard/guia', roles: ['admin', 'professional'] },
        { id: 'indicar-app', label: 'Indicar o App', icon: '📣', href: '/dashboard/indicar', roles: ['admin', 'professional'] },
        { id: 'suporte', label: 'Suporte', icon: '🆘', href: '/dashboard/suporte', roles: ['admin', 'professional'] },
        { id: 'sobre', label: 'Sobre', icon: 'ℹ️', href: '/dashboard/sobre', roles: ['admin', 'professional'] }
      ]
    }
  ]

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
            fontSize: '18px',
            fontWeight: 'bold'
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
          width: isOpen ? '300px' : '0px',
          height: '100vh',
          backgroundColor: '#2C5F6F',
          borderRight: '2px solid #1a3a47',
          overflowY: 'auto',
          transition: 'width 0.3s ease',
          zIndex: isMobileOpen ? 999 : 'auto',
          transform: isMobile ? (isMobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 16px',
            backgroundColor: '#1a3a47',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #E87A3F'
          }}
        >
          {isOpen && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#E87A3F' }}>
                {user?.email?.split('@')[0] || 'Usuário'}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8, color: 'rgba(255,255,255,0.7)' }}>
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
                color: '#E87A3F',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
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
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {menuSections.map((section) => {
            const filteredItems = section.items.filter(item => !item.roles || item.roles.includes(role))
            if (filteredItems.length === 0) return null

            const isExpanded = expandedSections[section.id]

            return (
              <div key={section.id} style={{ marginBottom: '8px' }}>
                {/* Section Header */}
                <div
                  onClick={() => isOpen && toggleSection(section.id)}
                  style={{
                    padding: '12px 16px',
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#E87A3F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isOpen ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (isOpen) {
                      e.currentTarget.style.backgroundColor = 'rgba(232, 122, 63, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {isOpen && (
                    <>
                      <span>{section.label}</span>
                      <span style={{ fontSize: '10px', transition: 'transform 0.2s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                    </>
                  )}
                </div>

                {/* Section Items */}
                {isOpen && isExpanded && (
                  <div style={{ borderLeft: '2px solid rgba(232, 122, 63, 0.3)' }}>
                    {filteredItems.map((item) => {
                      const isItemActive = isActive(item.href)

                      const baseStyle = {
                        padding: '10px 16px 10px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        backgroundColor: isItemActive ? 'rgba(232, 122, 63, 0.15)' : 'transparent',
                        borderRight: isItemActive ? '3px solid #E87A3F' : '3px solid transparent',
                        color: isItemActive ? '#E87A3F' : 'rgba(255,255,255,0.8)',
                        transition: 'all 0.2s ease',
                        fontSize: '13px',
                        fontWeight: isItemActive ? '600' : '500'
                      }

                      if (item.href && !item.href.startsWith('http')) {
                        return (
                          <div key={item.id}>
                            <Link href={item.href} onClick={() => isMobile && setIsMobileOpen(false)}>
                              <div
                                style={baseStyle}
                                onMouseEnter={(e) => {
                                  if (!isItemActive) {
                                    e.currentTarget.style.backgroundColor = 'rgba(232, 122, 63, 0.08)'
                                    e.currentTarget.style.color = '#FFFFFF'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isItemActive) {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                                  }
                                }}
                              >
                                <span style={{ fontSize: '16px', minWidth: '20px' }}>{item.icon}</span>
                                <span>{item.label}</span>
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
                                border: 'none',
                                textAlign: 'left',
                                fontFamily: 'inherit'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(232, 122, 63, 0.08)'
                                e.currentTarget.style.color = '#FFFFFF'
                              }}
                              onMouseLeave={(e) => {
                                if (!isItemActive) {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                                }
                              }}
                            >
                              <span style={{ fontSize: '16px', minWidth: '20px' }}>{item.icon}</span>
                              <span>{item.label}</span>
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
                              e.currentTarget.style.backgroundColor = 'rgba(232, 122, 63, 0.08)'
                              e.currentTarget.style.color = '#FFFFFF'
                            }}
                            onMouseLeave={(e) => {
                              if (!isItemActive) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                                e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                              }
                            }}
                          >
                            <span style={{ fontSize: '16px', minWidth: '20px' }}>{item.icon}</span>
                            <span>{item.label}</span>
                          </a>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Collapsed view - show icons only */}
                {isOpen && !isExpanded && filteredItems.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px' }}>
                    {filteredItems.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          opacity: 0.5,
                          cursor: 'pointer'
                        }}
                        title={item.label}
                      >
                        {item.icon}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Logout Button */}
        {isOpen && (
          <div style={{ padding: '12px 16px', borderTop: '2px solid rgba(232, 122, 63, 0.2)' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#E87A3F',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d66b2f'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E87A3F'
              }}
            >
              🚪 Sair
            </button>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            display: isOpen ? 'block' : 'none'
          }}
        >
          <div>NexaAgenda v1.0</div>
        </div>
      </div>
    </>
  )
}
