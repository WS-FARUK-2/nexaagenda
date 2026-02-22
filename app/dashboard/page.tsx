"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Sidebar from "@/components/Sidebar";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    clientes: 0,
    servicos: 0,
    agendamentos: 0,
        }
        {/* Cards extras agrupados */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          {/* Card Agendamentos Públicos */}
          <div
            onClick={() => router.push('/dashboard/agendamentos-publicos')}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderTop: '3px solid #8b5cf6',
              textAlign: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
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
              textAlign: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
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
              textAlign: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', color: '#06b6d4', fontSize: '16px', fontWeight: '600' }}>👨‍⚕️</h3>
            <p style={{ margin: '0 0 4px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Profissionais</p>
            <p style={{ margin: '0', color: '#9ca3af', fontSize: '12px' }}>Equipe e agenda</p>
          </div>
        </div>
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

