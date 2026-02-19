'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase!.auth.getUser()
        
        if (!user) {
          // Se não está logado, vai para login
          router.push('/login')
        } else {
          // Se está logado, vai para seleção de perfil (ou direto pro dashboard se já selecionou)
          const storedRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null
          
          if (!storedRole) {
            // Sem role selecionado, vai para seleção
            router.push('/selecionar-perfil')
          } else if (storedRole === 'professional') {
            // Se é profissional, vai pro dashboard profissional
            router.push('/dashboard/profissional')
          } else {
            // Se é admin, vai pro dashboard
            router.push('/dashboard')
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return <LoadingSpinner />
}

