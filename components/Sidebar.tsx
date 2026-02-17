'use client'

import { useState } from 'react'
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
}

export default function Sidebar({ user }: { user: any }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard', section: 'main' },
    { id: 'perfil', label: 'Perfil', icon: '👤', href: '/dashboard/perfil', section: 'main' },
    { id: 'link-agendamento', label: 'Link de Agendamento', icon: '🔗', href: '/dashboard/configuracao', section: 'main' },
    { id: 'agendamentos', label: 'Agendamentos', icon: '📅', href: '/agendamentos', section: 'main' },
    { id: 'profissionais', label: 'Profissionais', icon: '👥', href: '/clientes', section: 'main' },
    { id: 'servicos', label: 'Serviços', icon: '✂️', href: '/servicos', section: 'main' },
    { id: 'dados-empresa', label: 'Dados da Empresa', icon: '🏢', href: '/dashboard/empresa', section: 'main' },
    { id: 'listagem-clientes', label: 'Listagem de Clientes', icon: '👫', href: '/clientes', section: 'main' },
    { id: 'relatorio-financeiro', label: 'Relatório Financeiro', icon: '💰', href: '/dashboard/relatorio-financeiro', section: 'main' },
    
    { id: 'divider1', divider: true, label: '', icon: '' },
    
    { id: 'indicar-app', label: 'Indicar o App', icon: '📣', href: '/dashboard/indicar', section: 'support' },
    { id: 'como-usar', label: 'Como Usar', icon: '📖', href: '/dashboard/guia', section: 'support' },
    { id: 'suporte', label: 'Suporte', icon: '🆘', href: '/dashboard/suporte', section: 'support' },
    { id: 'sobre', label: 'Sobre', icon: 'ℹ️', href: '/dashboard/sobre', section: 'support' },
    { id: 'rede-social', label: 'Rede Social', icon: '📱', href: 'https://instagram.com', section: 'support' },
    
    { id: 'divider2', divider: true, label: '', icon: '' },
    
    { id: 'sair', label: 'Sair', icon: '🚪', action: handleLogout, section: 'account' },
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
            background: '#d97706',
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
          width: isOpen ? '280px' : '80px',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #e0e0e0',
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
            backgroundColor: '#2d3e50',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1a1a1a'
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
            padding: '8px 0',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {menuItems.map((item) => {
            if (item.divider) {
              return (
                <div
                  key={item.id}
                  style={{
                    height: '1px',
                    backgroundColor: '#ddd',
                    margin: '8px 0'
                  }}
                />
              )
            }

            const isItemActive = isActive(item.href)

            return (
              <div key={item.id}>
                {item.href && !item.href.startsWith('http') ? (
                  <Link href={item.href} onClick={() => isMobile && setIsMobileOpen(false)}>
                    <div
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        backgroundColor: isItemActive ? '#e8e8e8' : 'transparent',
                        borderLeft: isItemActive ? '4px solid #d97706' : 'transparent',
                        color: isItemActive ? '#d97706' : '#666',
                        transition: 'all 0.2s ease',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isItemActive) {
                          e.currentTarget.style.backgroundColor = '#f0f0f0'
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
                ) : item.action ? (
                  <button
                    onClick={() => {
                      item.action?.()
                      isMobile && setIsMobileOpen(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#666',
                      transition: 'all 0.2s ease',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <span style={{ fontSize: '18px', minWidth: '24px' }}>{item.icon}</span>
                    {isOpen && <span>{item.label}</span>}
                  </button>
                ) : (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => isMobile && setIsMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      color: '#666',
                      transition: 'all 0.2s ease',
                      fontSize: '14px',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <span style={{ fontSize: '18px', minWidth: '24px' }}>{item.icon}</span>
                    {isOpen && <span>{item.label}</span>}
                  </a>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid #e0e0e0',
            fontSize: '11px',
            color: '#999',
            textAlign: 'center'
          }}
        >
          {isOpen && <div>NexaAgenda v1.0</div>}
        </div>
      </div>
    </>
  )
}
