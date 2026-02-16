import { supabase } from '@/lib/supabaseClient'
import { redirect } from 'next/navigation'

export default async function Home() {
  // Verifica se supabase existe
  if (!supabase) {
    return <div>Erro de conexão com banco de dados</div>
  }
  
  const { data: profiles, error } = await supabase.from('profiles').select('*')
  
  // Se deu erro na conexão
  if (error) {
    console.error('Erro:', error)
    return <div>Erro ao conectar: {error.message}</div>
  }
  
  // Se tudo ok, redireciona para login
  redirect('/login')
}
