-- ==========================================
-- CRIAR TABELA PROFESSIONALS
-- ==========================================

CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  birth_date DATE,
  commission DECIMAL(5, 2) DEFAULT 0,
  color VARCHAR(7) DEFAULT '#E87A3F',
  photo_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_professionals_user_id ON professionals(user_id);
CREATE INDEX idx_professionals_email ON professionals(email);

-- RLS
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own professionals" ON professionals;
CREATE POLICY "Users can manage their own professionals"
  ON professionals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Leitura pública para agendamento
DROP POLICY IF EXISTS "Anyone can view active professionals" ON professionals;
CREATE POLICY "Anyone can view active professionals"
  ON professionals
  FOR SELECT
  USING (active = true);

COMMENT ON TABLE professionals IS 'Profissionais que atendem (para multi-profissional)';
