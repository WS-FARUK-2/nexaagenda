import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export default async function Home() {
  // Criar cliente Supabase diretamente aqui
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Tentar obter a sessão atual
    const { data: { session } } = await supabase.auth.getSession()
    
    // Se houver sessão, ir para dashboard
    if (session) {
      redirect('/dashboard')
    }
  } catch (error) {
    console.error('Erro ao verificar sessão:', error)
  }
  
  // Se não há sessão, ir para login
  redirect('/login')
}
