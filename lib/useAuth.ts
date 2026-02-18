import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { Session } from '@supabase/supabase-js'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase!.auth.getSession()
        setSession(session)
        setLoading(false)
      } catch (error) {
        console.error('Erro ao recuperar sessão:', error)
        setLoading(false)
      }
    }

    getSession()

    // Inscrever-se em mudanças de autenticação
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return { session, loading }
}
