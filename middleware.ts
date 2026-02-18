import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verificar se há uma sessão válida
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Se não houver sessão e estiver tentando acessar uma página protegida
    const protectedRoutes = ['/dashboard', '/servicos', '/agendamentos', '/clientes', '/cadastro/clientes', '/cadastro/servicos']
    const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

    if (!session && isProtectedRoute) {
      // Redirecionar para login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Se há sessão mas está tentando acessar login
    if (session && request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (error) {
    console.error('Erro no middleware:', error)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|api).*)',
  ],
}
