-- Criar tabela de horários de funcionamento
CREATE TABLE IF NOT EXISTS horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0 = segunda, 6 = domingo
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  horario_almoco_inicio TIME,
  horario_almoco_fim TIME,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, dia_semana)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_horarios_user_id ON horarios(user_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia_semana ON horarios(dia_semana);

-- RLS Policy: Usuários só podem ver seus próprios horários
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY horarios_select_own ON horarios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY horarios_insert_own ON horarios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY horarios_update_own ON horarios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY horarios_delete_own ON horarios FOR DELETE
  USING (auth.uid() = user_id);
