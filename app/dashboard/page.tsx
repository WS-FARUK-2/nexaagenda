
'use client'
import { useEffect, useState } from 'react'
    await supabase!.auth.signOut()
    router.push('/login')
  }

   if (loading) {
     return (
       <div style={{ display: 'flex', height: '100vh' }}>
        'use client';
        import { useEffect, useState } from 'react';
        import { supabase } from '@/lib/supabaseClient';
        import { useRouter } from 'next/navigation';
        import LoadingSpinner from '@/components/LoadingSpinner';
        import Sidebar from '@/components/Sidebar';

        export default function DashboardPage() {
          const [user, setUser] = useState<any>(null);
          const [loading, setLoading] = useState(true);
          const [counts, setCounts] = useState({
            clientes: 0,
            servicos: 0,
            agendamentos: 0,
            agendamentosPublicos: 0
          });
          const router = useRouter();
          const [sidebarVisible, setSidebarVisible] = useState(true);

          useEffect(() => {
            const getUser = async () => {
              try {
                const { data: { user } } = await supabase!.auth.getUser();
                if (!user) {
                  router.push('/login');
                } else {
                  setUser(user);
                  await loadCounts(user.id);
                }
              } catch (error) {
                setUser(null);
              } finally {
                setLoading(false);
              }
            };
            getUser();
          }, [router]);

          const loadCounts = async (userId: string) => {
            try {
              const results = await Promise.all([
                supabase.from('patients').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('services').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('agendamentos_publicos').select('*', { count: 'exact', head: true }).eq('user_id', userId)
              ]);
              setCounts({
                clientes: results[0]?.count || 0,
                servicos: results[1]?.count || 0,
                agendamentos: results[2]?.count || 0,
                agendamentosPublicos: results[3]?.count || 0
              });
            } catch {
              setCounts({ clientes: 0, servicos: 0, agendamentos: 0, agendamentosPublicos: 0 });
            }
          };

          if (loading) {
            return (
              <div style={{ display: 'flex', height: '100vh' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LoadingSpinner />
                </div>
              </div>
            );
          }

          return (
            <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
              <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                style={{ position: 'fixed', top: 20, left: sidebarVisible ? 320 : 20, zIndex: 1000, background: '#E87A3F', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', transition: 'left 0.3s ease' }}
              >
                {sidebarVisible ? '◀ Menu' : '▶ Menu'}
              </button>
              {sidebarVisible && <Sidebar user={user} />}
              <div style={{ flex: 1, padding: '30px 20px', marginLeft: sidebarVisible ? 0 : 0 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  <div style={{ backgroundImage: 'linear-gradient(135deg, #2C5F6F 0%, #1a3a47 100%)', padding: '40px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '2px solid #E87A3F', color: 'white' }}>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 'bold', color: 'white' }}>🎯 Bem-vindo!</h1>
                    <div style={{ height: '3px', width: '60px', backgroundColor: '#E87A3F', borderRadius: '2px', marginBottom: '12px' }} />
                    <p style={{ margin: '0', fontSize: '16px', opacity: 0.9, color: 'white' }}>Aqui você gerencia toda sua agenda e negócio</p>
                    <p style={{ margin: '8px 0 0', fontSize: '14px', opacity: 0.8, color: 'white' }}>Email: <strong>{user?.email}</strong></p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div onClick={() => router.push('/clientes')} style={{ backgroundColor: 'white', padding: '28px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s ease', borderLeft: '6px solid #2C5F6F', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, color: '#2C5F6F', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>👥 Clientes</h3>
                        <span style={{ fontSize: '24px' }}>👤</span>
                      </div>
                      <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 8px', color: '#2C5F6F' }}>{counts.clientes}</p>
                      <p style={{ margin: '0', color: '#E87A3F', fontSize: '13px', fontWeight: '600' }}>Clique para gerenciar →</p>
                    </div>
                    {/* Cards de serviços, agendamentos, etc. podem ser adicionados aqui */}
                  </div>
                </div>
              </div>
            </div>
          );
        }
                onClick={() => router.push('/dashboard/agendamentos-publicos')}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderTop: '3px solid #8b5cf6',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: '#8b5cf6', fontSize: '16px', fontWeight: '600' }}>📊</h3>
                <p style={{ margin: '0 0 4px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Públicos</p>
                <p style={{ margin: '0', color: '#9ca3af', fontSize: '12px' }}>{counts.agendamentosPublicos} agendamentos</p>
              </div>

              {/* Card Estatísticas */}
              <div 
                onClick={() => router.push('/dashboard/estatisticas')}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderTop: '3px solid #ec4899',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: '#ec4899', fontSize: '16px', fontWeight: '600' }}>📈</h3>
                <p style={{ margin: '0 0 4px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Relatório</p>
                <p style={{ margin: '0', color: '#9ca3af', fontSize: '12px' }}>Desempenho e análise</p>
              </div>

              {/* Card Profissionais */}
              <div 
                onClick={() => router.push('/dashboard/profissionais')}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderTop: '3px solid #06b6d4',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: '#06b6d4', fontSize: '16px', fontWeight: '600' }}>👥</h3>
                <p style={{ margin: '0 0 4px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Profissionais</p>
                <p style={{ margin: '0', color: '#9ca3af', fontSize: '12px' }}>Gerenciar equipe</p>
              </div>

              {/* Card Empresa */}
              <div 
                onClick={() => router.push('/dashboard/empresa')}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderTop: '3px solid #6366f1',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: '#6366f1', fontSize: '16px', fontWeight: '600' }}>🏢</h3>
                <p style={{ margin: '0 0 4px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Empresa</p>
                <p style={{ margin: '0', color: '#9ca3af', fontSize: '12px' }}>Dados da empresa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

