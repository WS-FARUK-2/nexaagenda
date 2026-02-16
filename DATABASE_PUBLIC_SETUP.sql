-- ==========================================
-- NEXAAGENDA - SISTEMA DE AGENDAMENTO PÚBLICO
-- Execute este arquivo no Supabase SQL Editor
-- ==========================================
-- Data: 16 de fevereiro de 2026
-- Objetivo: Criar tabelas para agendamento público com links personalizados

-- ==========================================
-- 1. PROFILES_PUBLIC - Links Personalizados
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles_public (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  nome_profissional TEXT NOT NULL,
  cor_primaria TEXT DEFAULT '#2563eb',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para profiles_public
CREATE INDEX IF NOT EXISTS idx_profiles_public_user_id ON profiles_public(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_public_slug ON profiles_public(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_public_ativo ON profiles_public(ativo);

-- RLS para profiles_public
ALTER TABLE profiles_public ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem gerenciar seus próprios perfis
DROP POLICY IF EXISTS "Users can manage their own public profiles" ON profiles_public;
CREATE POLICY "Users can manage their own public profiles"
  ON profiles_public
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Qualquer pessoa pode VER perfis ativos (para agendamento público)
DROP POLICY IF EXISTS "Anyone can view active profiles" ON profiles_public;
CREATE POLICY "Anyone can view active profiles"
  ON profiles_public
  FOR SELECT
  USING (ativo = true);

-- ==========================================
-- 2. HORARIOS_DISPONIVEIS - Disponibilidade
-- ==========================================
CREATE TABLE IF NOT EXISTS horarios_disponiveis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  intervalo INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_time_range CHECK (hora_fim > hora_inicio)
);

-- Índices para horarios_disponiveis
CREATE INDEX IF NOT EXISTS idx_horarios_user_id ON horarios_disponiveis(user_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia_semana ON horarios_disponiveis(dia_semana);

-- RLS para horarios_disponiveis
ALTER TABLE horarios_disponiveis ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem gerenciar seus próprios horários
DROP POLICY IF EXISTS "Users can manage their own schedules" ON horarios_disponiveis;
CREATE POLICY "Users can manage their own schedules"
  ON horarios_disponiveis
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Qualquer pessoa pode VER horários (para consulta pública)
DROP POLICY IF EXISTS "Anyone can view schedules" ON horarios_disponiveis;
CREATE POLICY "Anyone can view schedules"
  ON horarios_disponiveis
  FOR SELECT
  USING (true);

-- ==========================================
-- 3. AGENDAMENTOS_PUBLICOS - Agendamentos de Clientes
-- ==========================================
CREATE TABLE IF NOT EXISTS agendamentos_publicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  nome_cliente TEXT NOT NULL,
  telefone_cliente TEXT NOT NULL,
  email_cliente TEXT,
  data_agendamento DATE NOT NULL,
  hora_agendamento TIME NOT NULL,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Confirmado', 'Cancelado', 'Concluído')),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para agendamentos_publicos
CREATE INDEX IF NOT EXISTS idx_agendamentos_publicos_user_id ON agendamentos_publicos(user_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_publicos_service_id ON agendamentos_publicos(service_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_publicos_data ON agendamentos_publicos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_publicos_status ON agendamentos_publicos(status);

-- RLS para agendamentos_publicos
ALTER TABLE agendamentos_publicos ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem VER e GERENCIAR seus próprios agendamentos
DROP POLICY IF EXISTS "Users can manage their own public appointments" ON agendamentos_publicos;
CREATE POLICY "Users can manage their own public appointments"
  ON agendamentos_publicos
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Qualquer pessoa pode CRIAR agendamentos (clientes públicos)
DROP POLICY IF EXISTS "Anyone can create public appointments" ON agendamentos_publicos;
CREATE POLICY "Anyone can create public appointments"
  ON agendamentos_publicos
  FOR INSERT
  WITH CHECK (true);

-- ==========================================
-- FUNÇÕES ÚTEIS
-- ==========================================

-- Função: Verificar slug disponível
CREATE OR REPLACE FUNCTION is_slug_available(check_slug TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles_public WHERE slug = check_slug
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Gerar horários disponíveis para um dia
CREATE OR REPLACE FUNCTION get_available_times(
  profissional_user_id UUID,
  target_date DATE
)
RETURNS TABLE (
  hora TIME,
  disponivel BOOLEAN
) AS $$
DECLARE
  dia_semana_alvo INTEGER;
BEGIN
  -- Calcular dia da semana (0 = domingo, 6 = sábado)
  dia_semana_alvo := EXTRACT(DOW FROM target_date);
  
  RETURN QUERY
  SELECT 
    h.hora_inicio + (intervalo_num * (h.intervalo || ' minutes')::INTERVAL)::TIME AS hora,
    NOT EXISTS (
      SELECT 1 
      FROM agendamentos_publicos ap
      WHERE ap.user_id = profissional_user_id
        AND ap.data_agendamento = target_date
        AND ap.hora_agendamento = h.hora_inicio + (intervalo_num * (h.intervalo || ' minutes')::INTERVAL)::TIME
        AND ap.status != 'Cancelado'
    ) AS disponivel
  FROM 
    horarios_disponiveis h,
    generate_series(
      0, 
      EXTRACT(EPOCH FROM (h.hora_fim - h.hora_inicio)) / 60 / h.intervalo - 1
    ) AS intervalo_num
  WHERE 
    h.user_id = profissional_user_id
    AND h.dia_semana = dia_semana_alvo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- VERIFICAÇÃO
-- ==========================================
-- Rodar após executar o script:
-- SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%public%';
-- SELECT * FROM profiles_public LIMIT 1;
-- SELECT * FROM horarios_disponiveis LIMIT 1;
-- SELECT * FROM agendamentos_publicos LIMIT 1;
