-- ==========================================
-- VINCULAR PROFISSIONAIS AOS SERVIÇOS
-- ==========================================

-- 1) Adicionar coluna "order" na tabela services
ALTER TABLE services
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- 2) Criar tabela de vínculo service_professionals
CREATE TABLE IF NOT EXISTS service_professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_service_professionals_service_id ON service_professionals(service_id);
CREATE INDEX IF NOT EXISTS idx_service_professionals_professional_id ON service_professionals(professional_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_professionals_unique ON service_professionals(service_id, professional_id);

-- RLS
ALTER TABLE service_professionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own service_professionals" ON service_professionals;
CREATE POLICY "Users can manage their own service_professionals"
  ON service_professionals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM services s
      WHERE s.id = service_id
      AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM services s
      WHERE s.id = service_id
      AND s.user_id = auth.uid()
    )
  );

-- Leitura pública (para agendamento público)
DROP POLICY IF EXISTS "Anyone can view service_professionals" ON service_professionals;
CREATE POLICY "Anyone can view service_professionals"
  ON service_professionals
  FOR SELECT
  USING (true);

COMMENT ON TABLE service_professionals IS 'Relaciona serviços com profissionais';
