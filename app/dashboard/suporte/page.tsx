'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
// import Sidebar from '@/components/Sidebar'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function SuportePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase!.auth.getUser()
      if (!authUser) {
        router.push('/login')
      } else {
        setUser(authUser)
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar removido */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar removido */}
      <div style={{ flex: 1, padding: '20px' }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>🆘 Suporte</h1>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#6b7280', marginTop: 0 }}>
              Precisa de ajuda? Fale conosco pelo WhatsApp.
            </p>
            <a
              href="https://wa.me/55"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '10px 16px',
                backgroundColor: '#25d366',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              WhatsApp do Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
