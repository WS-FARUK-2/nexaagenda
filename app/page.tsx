import { supabase } from '@/lib/supabaseClient'

export default async function Home() {
  const { data: profiles, error } = await supabase!.from('profiles').select('*')
  
  console.log('Dados:', profiles)
  console.log('Erro:', error)

  return (
    <div>
      <h1>NexaAgenda</h1>
      <p>Conectado ao Supabase ✅</p>
      <p>Verifique o console do navegador (F12) para ver os dados.</p>
    </div>
  )
}
