import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export default async function Home() {
  // Criar cliente Supabase diretamente aqui
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Testar conexão
  const { error } = await supabase.from('profiles').select('*')
  
  if (error) {
    console.error('Erro de conexão:', error)
    return (
      <div style={{ padding: '20px' }}>
        <h1>Erro de conexão</h1>
        <p>{error.message}</p>
      </div>
    )
  }
  
  // Se tudo ok, vai para login
  redirect('/login')
}
