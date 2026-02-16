'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import ConfirmModal from '@/components/ConfirmModal';

interface AgendamentoPublico {
  id: string;
  service_id: string;
  nome_cliente: string;
  telefone_cliente: string;
  email_cliente: string;
  data_agendamento: string;
  hora_agendamento: string;
  status: string;
  observacoes?: string;
  created_at: string;
  services?: {
    name: string;
    price: number;
    duration: number;
  };
}

export default function AgendamentosPublicos() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState<AgendamentoPublico[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; agendamentoId: string; clienteName: string }>({ isOpen: false, agendamentoId: '', clienteName: '' });

  useEffect(() => {
    checkUser();
    loadAgendamentos();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    }
  };

  const loadAgendamentos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('agendamentos_publicos')
        .select(`
          *,
          services:service_id (
            name,
            price,
            duration
          )
        `)
        .eq('user_id', user.id)
        .order('data_agendamento', { ascending: true })
        .order('hora_agendamento', { ascending: true });

      if (error) throw error;

      setAgendamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setToast({ message: 'Erro ao carregar agendamentos públicos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos_publicos')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setAgendamentos(agendamentos.map(agend =>
        agend.id === id ? { ...agend, status: newStatus } : agend
      ));

      setToast({ message: 'Status atualizado com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setToast({ message: 'Erro ao atualizar status do agendamento', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos_publicos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAgendamentos(agendamentos.filter(agend => agend.id !== id));
      setToast({ message: 'Agendamento excluído com sucesso!', type: 'success' });
      setConfirmModal({ isOpen: false, agendamentoId: '', clienteName: '' });
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      setToast({ message: 'Erro ao excluir agendamento', type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmado':
        return 'bg-blue-100 text-blue-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'confirmado':
        return 'Confirmado';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const filteredAgendamentos = agendamentos.filter(agend => {
    const matchStatus = filterStatus === 'all' || agend.status === filterStatus;
    const matchSearch = searchTerm === '' || 
      agend.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agend.email_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agend.telefone_cliente.includes(searchTerm);
    
    return matchStatus && matchSearch;
  });

  const agendamentosPorStatus = {
    pendente: agendamentos.filter(a => a.status === 'pendente').length,
    confirmado: agendamentos.filter(a => a.status === 'confirmado').length,
    concluido: agendamentos.filter(a => a.status === 'concluido').length,
    cancelado: agendamentos.filter(a => a.status === 'cancelado').length,
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '20px'
          }}
        >
          ← Voltar ao Dashboard
        </button>

        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          📅 Agendamentos Públicos
        </h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Gerencie os agendamentos recebidos através do seu link público
        </p>

        {/* Estatísticas */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e' }}>
              {agendamentosPorStatus.pendente}
            </div>
            <div style={{ fontSize: '14px', color: '#92400e', marginTop: '5px' }}>
              Pendentes
            </div>
          </div>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#dbeafe',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af' }}>
              {agendamentosPorStatus.confirmado}
            </div>
            <div style={{ fontSize: '14px', color: '#1e40af', marginTop: '5px' }}>
              Confirmados
            </div>
          </div>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#d1fae5',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#065f46' }}>
              {agendamentosPorStatus.concluido}
            </div>
            <div style={{ fontSize: '14px', color: '#065f46', marginTop: '5px' }}>
              Concluídos
            </div>
          </div>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#fee2e2',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#991b1b' }}>
              {agendamentosPorStatus.cancelado}
            </div>
            <div style={{ fontSize: '14px', color: '#991b1b', marginTop: '5px' }}>
              Cancelados
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ 
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="all">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="confirmado">Confirmado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      {filteredAgendamentos.length === 0 ? (
        <EmptyState
          icon="🌐"
          title={agendamentos.length === 0 ? 'Nenhum agendamento público recebido' : 'Nenhum resultado encontrado'}
          description={agendamentos.length === 0 
            ? 'Compartilhe seu link público para começar a receber agendamentos online.'
            : 'Tente ajustar os filtros de busca para encontrar agendamentos.'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredAgendamentos.map((agendamento) => (
            <div
              key={agendamento.id}
              style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                {/* Coluna 1: Cliente */}
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                    CLIENTE
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {agendamento.nome_cliente}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    📧 {agendamento.email_cliente}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    📱 {formatPhone(agendamento.telefone_cliente)}
                  </div>
                </div>

                {/* Coluna 2: Serviço e Data/Hora */}
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                    SERVIÇO
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {agendamento.services?.name || 'Serviço não encontrado'}
                  </div>
                  {agendamento.services && (
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      💰 R$ {agendamento.services.price.toFixed(2)} • ⏱️ {agendamento.services.duration} min
                    </div>
                  )}
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    📅 {formatDate(agendamento.data_agendamento)} às {agendamento.hora_agendamento}
                  </div>
                </div>

                {/* Coluna 3: Status e Ações */}
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                    STATUS
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '15px'
                    }}
                    className={getStatusColor(agendamento.status)}
                  >
                    {getStatusLabel(agendamento.status)}
                  </span>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {agendamento.status === 'pendente' && (
                      <button
                        onClick={() => handleStatusChange(agendamento.id, 'confirmado')}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        Confirmar
                      </button>
                    )}
                    {agendamento.status === 'confirmado' && (
                      <button
                        onClick={() => handleStatusChange(agendamento.id, 'concluido')}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        Concluir
                      </button>
                    )}
                    {(agendamento.status === 'pendente' || agendamento.status === 'confirmado') && (
                      <button
                        onClick={() => handleStatusChange(agendamento.id, 'cancelado')}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, agendamentoId: agendamento.id, clienteName: agendamento.nome_cliente })}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {agendamento.observacoes && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  borderLeft: '3px solid #6366f1'
                }}>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                    OBSERVAÇÕES
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {agendamento.observacoes}
                  </div>
                </div>
              )}

              {/* Data de criação */}
              <div style={{ 
                marginTop: '15px',
                fontSize: '12px',
                color: '#999'
              }}>
                Recebido em: {new Date(agendamento.created_at).toLocaleString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumo */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Mostrando <strong>{filteredAgendamentos.length}</strong> de <strong>{agendamentos.length}</strong> agendamentos
        </p>
      </div>
      
      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Excluir Agendamento"
        message={`Tem certeza que deseja excluir o agendamento de ${confirmModal.clienteName}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        onConfirm={() => handleDelete(confirmModal.agendamentoId)}
        onCancel={() => setConfirmModal({ isOpen: false, agendamentoId: '', clienteName: '' })}
      />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
